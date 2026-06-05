import {
  getJobsInPaginationService,
  getJobStatusbyIdService,
  getLeadsByJobIdService,
  getRunningJobsService,
} from "../services/databaseService.js";
import { responseBody } from "../utils/responseBody.js";

export const getLeadsJobsPag = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.body || {};
    const finalPage = Number(page) || 1;
    const finalLimit = Number(limit) || 10;
    const skip = (finalPage - 1) * finalLimit;

    const isSuccess = await getJobsInPaginationService(
      userId,
      finalPage,
      finalLimit,
      skip,
    );
    if (isSuccess.success) {
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, isSuccess.message, isSuccess.data),
        );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to get jobs",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};
export const getRunningJobs = async (req, res) => {
  try {
    const { userId } = req.body || {};

    const isSuccess = await getRunningJobsService(userId);
    if (isSuccess.success) {
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, isSuccess.message, isSuccess.data),
        );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to get jobs",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};
export const getJobsStatus = async (req, res) => {
  try {
    const { userId, jobId } = req.body || {};

    const isSuccess = await getJobStatusbyIdService(userId, jobId);
    if (isSuccess.success) {
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, isSuccess.message, isSuccess.data),
        );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to get jobs",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};
export const getLeadsByJob = async (req, res) => {
  try {
 const { userId, jobId } = req.body || {};

    const isSuccess = await getLeadsByJobIdService(userId, jobId);
    if (isSuccess.success) {
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, isSuccess.message, isSuccess.data),
        );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to get Leads",
          {},
        ),
      );

  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};
