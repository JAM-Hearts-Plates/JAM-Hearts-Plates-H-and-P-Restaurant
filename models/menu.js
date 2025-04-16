import { Schema, Types, model } from "mongoose";
import normalize from "normalize-mongoose";

const menuSchema = new Schema(
  {
    name: { type: String, required: [true, "Please add a name"], unique: true },
    description: { type: String, required: [true, "Please add a description"] },
    category: { type: String, required: true },
    price: { type: Number, required: [true, "Please add a price"] },
    pictures: { type: [String], required: [true, "Please add pictures"] },
    ingredients: [{ type: Types.ObjectId, ref: 'Inventory' }],
    isAvailable: { type: Boolean, default: true },
    prepTime: Number
  },
  { timestamps: true }
);

menuSchema.plugin(normalize);
export const MenuModel = model("Menu", menuSchema);
