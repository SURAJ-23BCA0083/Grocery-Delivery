import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderRazorpay,
  verifyRazorpayPayment,
} from "../controller/order.controller.js";
import { authSeller } from "../middlewares/authSeller.js";

const router = express.Router();
router.post("/cod", authUser, placeOrderCOD);
router.post("/razorpay", authUser, placeOrderRazorpay);
router.post("/verify", authUser, verifyRazorpayPayment);
router.get("/user", authUser, getUserOrders);
router.get("/seller", authSeller, getAllOrders);

export default router;
