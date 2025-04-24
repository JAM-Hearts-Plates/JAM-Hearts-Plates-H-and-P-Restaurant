import { UserModel } from '../models/user.js';
import { vipValidator } from '../validators/vipVal.js';

export const evaluateVIPStatus = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    
  // Validate against qualification rules
  const { error } = vipValidator.qualifyVIP.validate({
    pointsEarned: user.loyaltyPoints,
    orderCount: await OrderModel.countDocuments({ user: userId }),
    totalSpent: user.totalSpent || 0
  });
  if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

    
    // Qualification criteria
    const MIN_POINTS = 1000;
    const MIN_ORDERS = 5;
    const MIN_SPEND = 500;

    
    if (user.loyaltyPoints >= MIN_POINTS && !user.isVIP) {
        // Determine VIP level based on points
        let vipLevel = 'silver';
        if (user.loyaltyPoints >= 2500) vipLevel = 'gold';
        if (user.loyaltyPoints >= 5000) vipLevel = 'platinum';
        
        user.isVIP = true;
        user.vipLevel = vipLevel;
        user.vipSince = new Date();
        await user.save();
        
        return {
            success: true,
            newStatus: {
                isVIP: true,
                level: vipLevel,
                benefits: getVIPBenefits(vipLevel)
            }
        };
    }
    
    return { success: false };
};

const getVIPBenefits = (level) => {
    const benefits = {
        silver: { discount: 5, freeDelivery: false },
        gold: { discount: 10, freeDelivery: true },
        platinum: { discount: 15, freeDelivery: true }
    };
    return benefits[level] || null;
};