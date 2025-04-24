import { UserModel } from '../models/user.js';
import { evaluateVIPStatus } from '../services/vipServices.js';
import { vipValidator } from '../validators/vipVal.js';


export const checkVIPStatus = async (req, res, next) => {
    try {
        const result = await evaluateVIPStatus(req.auth.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// admin manual upgrade
export const manualVIPUpgrade = async (req, res, next) => {
    try {
// Validate request first
const { error } = vipValidator.statusChange.validate(req.body);
if (error) throw new Error(error.details[0].message);

        const { userId, level, durationMonths } = req.body;
        
        const update = {
            isVIP: true,
            vipLevel: level,
            vipSince: new Date(),
            ...(durationMonths && { 
              vipExpiresAt: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000) 
            })
          };

        const user = await UserModel.findByIdAndUpdate(
            userId,
            update, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Get VIP benefits for a user
export const getVIPBenefits = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) throw new Error('User not found');
        
        res.status(200).json({
            success: true,
            benefits: user.isVIP ? getVIPBenefits(user.vipLevel) : null
        });
    } catch (error) {
        next(error);
    }
};

// Extend VIP duration
export const updateVIPExpiry = async (req, res, next) => {
    try {
        const { userId, months } = req.body;
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { 
                vipExpiresAt: new Date(new Date().setMonth(new Date().getMonth() + months)) 
            },
            { new: true }
        );
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Revoke VIP status
export const revokeVIPStatus = async (req, res, next) => {
    try {
        const user = await UserModel.findByIdAndUpdate(
            req.params.userId,
            { 
                isVIP: false,
                vipLevel: null,
                vipSince: null,
                vipExpiresAt: null 
            },
            { new: true }
        );
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
