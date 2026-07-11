import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import admin from "firebase-admin";
import fs from "fs";
import mongoose from "mongoose";
import Order from "./models/Order.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 💳 Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ 1. Create Razorpay Order + Save to Firestore
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "order_" + crypto.randomBytes(6).toString("hex"),
    });

     // Save to MongoDB
    const newOrder = new Order({
      orderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    });

    await newOrder.save();

    console.log("✅ Order saved to MongoDB:", order.id);

    res.json(order);
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ 2. Verify Payment Signature (security check)
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === signature) {

      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const isValid = expectedSignature === signature;
      // Update MongoDB document
      order.paymentId = paymentId;
      order.signature = signature;
      order.verified = isValid;
      order.status = isValid ? "paid" : "failed";
      order.updatedAt = new Date();

      await order.save();
      
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      // ❌ Invalid signature
      await db.collection("orders").doc(orderId).update({
        paymentId,
        signature,
        status: "failed",
        verified: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ✅ 3. Fetch all orders (optional, for dashboard)
app.get("/api/orders", async (req, res) => {
  const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(orders);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
