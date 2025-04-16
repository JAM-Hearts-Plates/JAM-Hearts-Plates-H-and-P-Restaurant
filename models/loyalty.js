import { Schema, model } from "mongoose";

const loyaltySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Links to the User
    pointsEarned: { type: Number, default: 0 }, // Total points earned
    pointsRedeemed: { type: Number, default: 0 }, // Total points redeemed
    currentPoints: { type: Number, default: 0 }, // Points available to use
    transactionHistory: [
        {
            actionType: {
                type: String, enum: ['earn', 'redeem'], required: true
            }, // Action type: 'earn' or 'redeem'  
            points: { type: Number, required: true }, // Points involved in the transaction       
            description: { type: String } // Optional: e.g., "Order #12345"
        }
    ]
}, {
    timestamps: true
})



export const LoyaltyModel = model("LoyaltyPoint", loyaltySchema)