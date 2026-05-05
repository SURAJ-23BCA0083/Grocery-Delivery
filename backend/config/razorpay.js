import Razorpay from "razorpay";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug: Log environment variables
console.log("Razorpay Environment Variables:");
console.log("RZP_KEY_ID:", process.env.RZP_KEY_ID ? "Found" : "Not found");
console.log("RZP_KEY_SECRET:", process.env.RZP_KEY_SECRET ? "Found" : "Not found");

// Validate environment variables
if (!process.env.RZP_KEY_ID || !process.env.RZP_KEY_SECRET) {
  console.error("Missing Razorpay environment variables");
  throw new Error("Razorpay environment variables (RZP_KEY_ID, RZP_KEY_SECRET) are required");
}

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

export default razorpay;
