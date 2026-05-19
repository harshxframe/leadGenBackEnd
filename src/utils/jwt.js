import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function generateToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "360h" });
}

export function readToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null; // Returns null if token is expired, invalid, or altered
  }
}