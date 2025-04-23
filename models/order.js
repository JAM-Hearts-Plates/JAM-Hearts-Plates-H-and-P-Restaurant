import { Schema, Types, model } from "mongoose";
import normalize from "normalize-mongoose";

const orderItemSchema = new Schema({
  menuItem: { type: Types.ObjectId, ref: "Menu", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  specialInstructions: String,
});

const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    deliveryAddress: {
      type: String,
      required: function () {
        return this.deliveryType === "delivery";
      },
    },
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    estimatedCookingTime: { type: Number },
    cookingBreakdown: [
      {
        name: String,
        prepTime: Number,
      },
    ],
  
    estimatedDeliveryTime: Date,
    transactionId: String,
    notes: String,
  },
  { timestamps: true }
);

orderSchema.plugin(normalize);
export const OrderModel = model("Order", orderSchema);
