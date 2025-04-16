import { LoyaltyModel } from "../models/loyalty.js";
import { loyaltyValidator } from "../validators/loyaltyVal.js";


export const earnPoints = async (req, res, next) => {
    try {
        const { error, value } = loyaltyValidator.validate(req.body)
        if (error) {
            return res.status(422).json(error);
        }
        // Find or create the user's loyalty record
        const loyalty = await LoyaltyModel.findOne({ userId })
        if (!loyalty) {
            loyalty = await LoyaltyModel.create({ userId })
        }

        // Update points and transaction history
        loyalty.pointsEarned += points;
        loyalty.currentPoints += points;
        loyalty.transactionHistory.push({
            actionType: 'earn',
            points,
            description
        });
        res.status(200).json({ message: 'Points earned', data: loyalty });
    } catch (error) {
        next(error)
    }
}


export const redeemPoints = async (req, res, next) => {
    try {
        const { error, value } = loyaltyValidator.validate(req.body)
        if (error) {
            return res.status(422).json(error);
        }
        // Find or create the user's loyalty record
        const loyalty = await LoyaltyModel.findOne({ userId })
        if (!loyalty || loyalty.currentPoints < 0) {
            return res.status(400).json({ error: 'Insufficient points' });
        }
          // Update points and transaction history
    loyalty.pointsRedeemed += points;
    loyalty.currentPoints -= points;
    loyalty.transactionHistory.push({
      actionType: 'redeem',
      points,
      description
    });
    res.status(200).json({ message: 'Points redeemed', data: loyalty });
    } catch (error) {
        next(error)
    }
}


export const viewPoints = (req, res, next) => {
    try {
        const { userId } = req.params

        const loyalty = LoyaltyModel.findOne({ userId })
        if(!loyalty) {
            return res.status(404).json({ error: 'Loyalty record not found' });
        }
        res.status(200).json({ message: 'Loyalty points retrieved successfully', data: loyalty });
    } catch (error) {
        next(error)
    }
}