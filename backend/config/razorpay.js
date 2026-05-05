import Razorpay from "razorpay";

// Validate environment variables
if (!process.env.RZP_KEY_ID || !process.env.RZP_KEY_SECRET) {
  throw new Error("Razorpay environment variables (RZP_KEY_ID, RZP_KEY_SECRET) are required");
}

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

export default razorpay;
