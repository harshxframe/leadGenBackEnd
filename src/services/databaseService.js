import PlatformSettings from "../models/admin.js";
import LeadJobs from "../models/Jobs.js";
import User from "../models/user.js";
import { serviceResponse } from "../utils/serviceResponseBody.js";
import Leads from "../models/Leads.js";

export const getPlatformSettingService = async () => {
  try {
    const isDataSettingsExist = await PlatformSettings.findOneAndUpdate(
      {},
      { $setOnInsert: {} },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    return serviceResponse(true, "Platform settings retrieved successfully", {
      platformSettings: isDataSettingsExist,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const createAccountService = async (payload) => {
  try {
    const isUserExist = await User.findOne({ email: payload.email });
    if (isUserExist) {
      return serviceResponse(false, "User already exsit", {});
    }

    const createUser = await User.create(payload);
    if (!createUser) {
      return serviceResponse(false, "User to create account", {});
    }
    return serviceResponse(true, "User account created", { user: createUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const loginAccountService = async (payload) => {
  try {
    const isUserExist = await User.findOneAndUpdate(
      { email: payload.email },
      { $set: { lastLoginAt: new Date().toISOString() } },
      { new: true },
    );
    if (!isUserExist) {
      return serviceResponse(false, "User does not exsit", {});
    }
    return serviceResponse(true, "User exsit", { user: isUserExist });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const getUserService = async (id) => {
  try {
    const getUser = await User.findById(id);
    if (!getUser) {
      return serviceResponse(false, "User does not exsit", {});
    }
    return serviceResponse(true, "User exsit", { user: getUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const updateUserService = async (id, payload) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true },
    );
    if (!updateUser) {
      return serviceResponse(false, "Failed to update user", {});
    }
    return serviceResponse(true, "User updated successfull", {
      user: updateUser,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const toggleBlockUserService = async (email, isBlocked) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isBlocked },
      { new: true },
    );
    if (!updatedUser) {
      return serviceResponse(false, "User not found", {});
    }
    return serviceResponse(true, "Block status updated successfully", {
      user: updatedUser,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const incrementSearchesService = async (id) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $inc: { totalSearches: 1 } },
      { new: true },
    );
    if (!updatedUser) {
      return serviceResponse(false, "User not found", {});
    }
    return serviceResponse(true, "Search incremented successfully", {
      user: updatedUser,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const createLeadJobService = async (payload) => {
  try {
    const isJobCreated = await LeadJobs.create(payload);
    if (!isJobCreated) {
      return serviceResponse(false, "Failed to create job", {});
    }
    return serviceResponse(true, "Job Created successfully", {
      job: isJobCreated,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const reserveJobCreditService = async (id, credits) => {
  try {
    const creditOperation = await User.findByIdAndUpdate(id, {
      $inc: { credits: -credits, lockedCredits: credits },
    });

    if (!creditOperation) {
      return serviceResponse(false, "Failed to update credits", {});
    }

    return serviceResponse(true, "Credit updated successfully", {});
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const updateLeadsStatus = async (
  id,
  status,
  isError = false,
  errorMessage = "",
) => {
  try {
    const payload = { status: status };
    if (isError) {
      payload["errorMessage"] = errorMessage;
    }
    const updateStatus = await LeadJobs.findByIdAndUpdate(id, payload, {
      new: true,
    });

    if (!updateStatus) {
      return serviceResponse(false, "Failed to update status", {});
    }

    return serviceResponse(true, "Status updated successfully", {});
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const leadsSavingService = async (userId, jobDBId, leads = []) => {
  try {
    /**
     * ================================
     * VALIDATIONS
     * ================================
     */

    if (!userId) {
      return serviceResponse(false, "User ID is required", {});
    }

    if (!jobDBId) {
      return serviceResponse(false, "Job ID is required", {});
    }

    if (!Array.isArray(leads)) {
      return serviceResponse(false, "Invalid leads array", {});
    }

    if (leads.length === 0) {
      return serviceResponse(true, "No leads to save", {
        totalSaved: 0,
      });
    }

    /**
     * ================================
     * NORMALIZE LEADS
     * ================================
     */

    const normalizedLeads = leads
      .filter((lead) => lead && typeof lead === "object" && lead.placeId)
      .map((lead) => {
        /**
         * ============================
         * LIMIT REVIEWS
         * ONLY LAST 2
         * ============================
         */

        const optimizedReviews = Array.isArray(lead.reviews)
          ? lead.reviews.slice(-2).map((review) => ({
              reviewerName: review.Name || null,

              reviewerPhoto: review.ProfilePicture || null,

              rating: review.Rating || null,

              description: review.Description || null,

              images: Array.isArray(review.Images)
                ? review.Images.slice(0, 2)
                : [],

              when: review.When || null,
            }))
          : [];

        /**
         * ============================
         * LIMIT IMAGES
         * ONLY FIRST 2
         * ============================
         */

        const optimizedImages = Array.isArray(lead.images)
          ? lead.images.slice(0, 2).map((image) => ({
              title: image.title || null,

              image: image.image || null,
            }))
          : [];

        /**
         * ============================
         * QUICK FLAGS
         * ============================
         */

        const flags = {
          hasPhone: !!lead.contactInfo?.phone,

          hasWebsite: !!lead.contactInfo?.website,

          hasEmails: Array.isArray(lead.emails) && lead.emails.length > 0,

          hasReviews: optimizedReviews.length > 0,

          hasImages: optimizedImages.length > 0,

          hasOwnerInfo: !!lead.ownerInfo?.ownerName,
        };

        /**
         * ============================
         * FINAL LEAD
         * ============================
         */

        return {
          userId,
          jobId: jobDBId,

          placeId: lead.placeId || null,

          cid: lead.cid || null,

          meta: {
            source: lead.meta?.source || "google_maps",

            processedAt: lead.meta?.processedAt || new Date(),
          },

          basicInfo: {
            name: lead.basicInfo?.name || null,

            category: lead.basicInfo?.category || null,

            categories: lead.basicInfo?.categories || [],

            description: lead.basicInfo?.description || null,

            rating: lead.basicInfo?.rating || 0,

            reviewsCount: lead.basicInfo?.reviewsCount || 0,

            status: lead.basicInfo?.status || null,

            priceRange: lead.basicInfo?.priceRange || null,
          },

          contactInfo: {
            phone: lead.contactInfo?.phone || null,

            whatsappNumber: lead.whatsappNumber || null,

            website: lead.contactInfo?.website || null,

            emails: Array.isArray(lead.emails)
              ? [...new Set(lead.emails.filter(Boolean))]
              : [],
          },

          locationData: {
            address: lead.locationData?.address || null,

            street: lead.locationData?.street || null,

            borough: lead.locationData?.borough || null,

            city: lead.locationData?.city || null,

            state: lead.locationData?.state || null,

            country: lead.locationData?.country || null,

            postalCode: lead.locationData?.postalCode || null,

            latitude: lead.locationData?.latitude || null,

            longitude: lead.locationData?.longitude || null,

            plusCode: lead.locationData?.plusCode || null,

            timezone: lead.locationData?.timezone || null,
          },

          reviews: optimizedReviews,

          reviewAnalytics: {
            totalReviews: lead.reviewAnalytics?.totalReviews || 0,

            reviewsPerRating: lead.reviewAnalytics?.reviewsPerRating || {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
          },

          images: optimizedImages,

          ownerInfo: {
            ownerId: lead.ownerInfo?.ownerId || null,

            ownerName: lead.ownerInfo?.ownerName || null,

            ownerLink: lead.ownerInfo?.ownerLink || null,
          },

          socialLinks: {
            instagram: lead.socialLinks?.instagram || null,

            facebook: lead.socialLinks?.facebook || null,

            linkedin: lead.socialLinks?.linkedin || null,

            twitter: lead.socialLinks?.twitter || null,

            youtube: lead.socialLinks?.youtube || null,
          },

          bookingPlatforms: {
            bookingCom: lead.bookingPlatforms?.bookingCom || null,

            airbnb: lead.bookingPlatforms?.airbnb || null,

            agoda: lead.bookingPlatforms?.agoda || null,

            makemytrip: lead.bookingPlatforms?.makemytrip || null,
          },

          seoData: {
            hasWebsite: lead.seoData?.hasWebsite || false,

            hasSSL: lead.seoData?.hasSSL || false,
          },

          techStack: Array.isArray(lead.techStack) ? lead.techStack : [],

          adsRunning: {
            googleAds: lead.adsRunning?.googleAds || false,

            metaAds: lead.adsRunning?.metaAds || false,
          },

          aiInsights: {
            growthPotential: lead.aiInsights?.growthPotential || null,

            businessWeakness: lead.aiInsights?.businessWeakness || null,

            outreachAngle: lead.aiInsights?.outreachAngle || null,
          },

          aiOutreach: {
            businessSummary: lead.aiOutreach?.businessSummary || null,

            outreachMessage: lead.aiOutreach?.outreachMessage || null,
          },

          leadScoring: {
            score: lead.leadScoring?.score || 0,

            quality: lead.leadScoring?.quality || "low",
          },

          flags,
        };
      });

    /**
     * ================================
     * REMOVE DUPLICATES
     * ================================
     */

    const uniqueLeadsMap = new Map();

    for (const lead of normalizedLeads) {
      uniqueLeadsMap.set(lead.placeId, lead);
    }

    const uniqueLeads = Array.from(uniqueLeadsMap.values());

    /**
     * ================================
     * SAVE TO DB
     * ================================
     */

    const saved = await Leads.insertMany(uniqueLeads, {
      ordered: false,
    });

    /**
     * ================================
     * RESPONSE
     * ================================
     */

    return serviceResponse(true, "Leads saved successfully", {
      totalReceived: leads.length,

      totalProcessed: normalizedLeads.length,

      totalSaved: saved.length,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const detuctCreditService = async (
  userId,
  jobDbId,
  credits,
  totalLeads,
) => {
  try {
    await User.findOneAndUpdate(
      {
        _id: userId,
        lockedCredits: { $gte: credits },
      },
      {
        $inc: { lockedCredits: -credits, totalSearches: 1 },
      },
      {
        new: true,
      },
    );

    const jobData = await LeadJobs.findByIdAndUpdate(
      jobDbId,
      {
        totalLeadsFound: totalLeads,
        creditsUsed: credits,
      },
      {
        new: true,
      },
    );

    return serviceResponse(true, "Status updated successfully", {
      jobData: jobData || {},
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const releaseCreditService = async (userId, credits) => {
  try {
    if (!userId || typeof credits !== "number" || credits <= 0) {
      return serviceResponse(false, "Invalid user ID or credit amount", {});
    }

    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId, 
        lockedCredits: { $gte: credits } 
      },
      {
        $inc: { credits: credits, lockedCredits: -credits },
      },
      { new: true }
    );

    if (!updatedUser) {
      return serviceResponse(false, "User not found or insufficient locked credits", {});
    }

    return serviceResponse(true, "Credit updated successfully", {});
  } catch (e) {
    // 4. Secure logging (avoids leaking raw DB errors to the client)
    console.error("Database Error in releaseCreditService:", e);
    return serviceResponse(false, "Database operation failed", {});
  }
};
