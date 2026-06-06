import {
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import { responseBody } from "../utils/responseBody.js";


const VARIANTS = {
  50: process.env.LEMON_VARIANT_50,
  150: process.env.LEMON_VARIANT_150,
  500: process.env.LEMON_VARIANT_500,
};



export const createLemonSqeezeCheckOut = async (req, res) => {
  try {






  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const createRazorpayCheckOut = async (req, res) => {
  res.send("Comming soon");
};
