import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";

const inventorySchema = new Schema(
  {
    name: { type: String, required: [true, "Please add a name"], unique: true },
    category: { type: String, required: [true, "Please add category"] },
    quantity: { type: Number, required: [true, "Please add quantity"], min: 0 },
    unit: { type: String, required: [true, "Please add unit"] },
    threshold: {
      type: Number,
      required: [true, "Please add threshold"],
      min: 0,
    },
    lastRestocked: Date,
    supplier: String,
    costPerUnit: Number,
  },
  { timestamps: true }
);

inventorySchema.plugin(normalize);
export const InventoryModel = model("Inventory", inventorySchema);
