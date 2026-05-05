import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

// Place order COD: /api/order/place
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;
    if (!address || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order details", success: false });
    }
    // calculate amount using items;
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tex charfe 2%
    amount += Math.floor((amount * 2) / 100);
    await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "COD",
      isPaid: false,
    });
    res
      .status(201)
      .json({ message: "Order placed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// oredr details for individual user :/api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create Razorpay order: /api/order/razorpay
export const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;
    if (!address || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order details", success: false });
    }

    // Calculate amount using items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tax charge 2%
    amount += Math.floor((amount * 2) / 100);
    
    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = amount * 100;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    });

    // Create order in database with pending payment
    const order = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "Razorpay",
      isPaid: false,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      order,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verify Razorpay payment: /api/order/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify payment signature
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed" 
      });
    }

    // Update order status
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        isPaid: true, 
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    ).populate("items.product address");

    res.status(200).json({ 
      success: true, 
      message: "Payment verified successfully",
      order 
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all orders for admin :/api/order/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
