import { OrderModel } from "../models/order.js";
import { MenuModel } from "../models/menu.js";
import { LoyaltyModel } from "../models/loyalty.js";
import { UserModel } from "../models/user.js";
import appError from "../utils/appError.js";
import {getDistance} from "../utils/distanceCalculator.js"
import {getCookingTime} from "../utils/cookingTime.js"
import {sendKitchenAlert} from '../services/kitchen.js'
import { processPayment } from "../services/payment.js";
import {sendOrderConfirmation, sendOrderCompletionNotification} from '../services/notification.js'
import { orderValidator } from "../validators/orderVal.js";

// get all orders
export const getOrders = async (req, res, next) => {
  try {
    const { filter = "{}", sort = "{}" } = req.query;
    const orders = await OrderModel.find(JSON.parse(filter))
      .sort(JSON.parse(sort))
      .populate("user", "name email")
      .populate("items.menuItem", "name price");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// get a single order
export const getOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.id).populate(
      "user",
      "name email phone"
    )
    .populate("items.menuItem", "name price description");

    if (!order) {
      return next(new appError(`No order found with id ${req.params.id}`, 404));
    }
    // make sure user is order owner or admin
    if (
      order.user._id.toString() !== req.auth.id &&
      req.auth.role !== "admin"
    ) {
      return next(new appError("Not authorized to access this order", 401));
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// get current users orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ user: req.auth.id })
    .sort({ createdAt: -1 })
    .populate("items.menuItem", "name price");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// create a new order
export const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, deliveryType, deliveryAddress, notes } = req.body;

    // calculate total price and validate items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuModel.findById(item.menuItem);

      if (!menuItem) {
        return next(
          new appError(`No menu item found with id ${item.menuItem}`, 404)
        );
      }

      if (!menuItem.isAvailable) {
        return next(
          new appError(`Menu item ${menuItem.name} is not available`, 400)
        );
      }

      totalPrice += menuItem.price * item.quantity;

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
         specialInstructions: item.specialInstructions || ''
      });
    }

    // // VIP benefits: Add free items based on VIP level
    // if (user.isVIP) {
    //   // Add complimentary items based on VIP level
    //   if (user.vipLevel === 'platinum') {
    //     // Find garlic bread menu item
    //     const garlicBread = await MenuModel.findOne({ name: /garlic bread/i });
    //     if (garlicBread) {
    //       orderItems.push({
    //         menuItem: garlicBread._id,
    //         quantity: 1,
    //         price: 0, // Free for VIP
    //         specialInstructions: 'Complimentary - VIP Platinum',
    //         isComplimentary: true
    //       });
    //     }
    //   } else if (user.vipLevel === 'gold') {
    //     // Find a free drink
    //     const drink = await MenuModel.findOne({ category: 'drinks', price: { $lt: 5 } });
    //     if (drink) {
    //       orderItems.push({
    //         menuItem: drink._id,
    //         quantity: 1,
    //         price: 0, // Free for VIP
    //         specialInstructions: 'Complimentary - VIP Gold',
    //         isComplimentary: true
    //       });
    //     }
    //   }

    //   // VIP discount (10% for platinum, 5% for gold)
    //   if (user.vipLevel === 'platinum') {
    //     const discount = totalPrice * 0.1;
    //     totalPrice -= discount;
    //   } else if (user.vipLevel === 'gold') {
    //     const discount = totalPrice * 0.05;
    //     totalPrice -= discount;
    //   }
    // }

     //  Estimate cooking time
    //  const cookingItems = await Promise.all(
    //   orderItems.map(async (item) => {
    //     const menu = await MenuModel.findById(item.menuItem);
    //     return { name: menu.name };
    //   })
    // );
    // const { totalTime: estimatedCookingTime, estimatedTime, itemDetails: cookingBreakdown } = getCookingTime(cookingItems);


    //  //  Add delivery fee based on distance
    //  let deliveryFee = 0;
    //  let distanceInfo = null;
 
    //  if (deliveryType === 'delivery') {
    //    if (!deliveryAddress) {
    //      return next(new appError('Delivery address is required for delivery orders', 400));
    //    }
 
    //    distanceInfo = await getDistance(deliveryAddress);
 
    //    if (!distanceInfo.distance) {
    //      return next(new appError('Could not calculate delivery distance', 400));
    //    }
 
    //    // parse distance (e.g., "5.2 km") and extract numeric value
    //    const distanceInKm = parseFloat(distanceInfo.distance.replace(' km', ''));

    // VIPs get extended delivery radius
    const maxDistance = user.isVIP ? 15 : 10;
 
    //    //  Reject if distance is too far (e.g., over 10 km)
    //    if (distanceInKm > maxDistance) {
    //      return next(new appError(`Delivery address is outside our service area (${maxDistance}km max)`, 400));
      // }

     // Calculate delivery fee (waived for platinum VIPs)
    //  if (!(user.isVIP && user.vipLevel === 'platinum')) {
    //   deliveryFee = distanceInKm * 1.5; // e.g., GH₵1.5 per km
      
    //   // Gold VIPs get 50% off delivery
    //   if (user.isVIP && user.vipLevel === 'gold') {
    //     deliveryFee *= 0.5;
    //   }
 
   
    //    totalPrice += deliveryFee;
    //  }
      // Store delivery estimate
    //   deliveryEstimate = distanceInfo.duration;
    // }

      // // Priority orders for VIPs
      // const isPriority = user.isVIP;
 

    // validate order details
    const { error, value } = orderValidator.validate({
      user: req.auth.id,
      items: orderItems,
      totalPrice,
      paymentMethod,
      deliveryType,
      deliveryAddress:
        deliveryType === "delivery" ? deliveryAddress : undefined,
        notes,
        // deliveryFee: deliveryType === "delivery" ? deliveryFee : 0,
        // estimatedCookingTime: estimatedTime,
        // cookingBreakdown: itemDetails,
        // estimatedDeliveryTime: deliveryEstimate, isPriority,
      // vipDiscount: user.isVIP ? (user.vipLevel === 'platinum' ? 10 : 5) : 0
    });

    if (error) {
      return next(new appError(error.details.map(d => d.message).join(', '), 422));
    }

    // create order
    const order = await OrderModel.create(value);

    //  // Handle table reservation for dine-in VIPs
    //  if (deliveryType === 'dine-in' && user.isVIP) {
    //   const tableType = user.vipLevel === 'platinum' ? 'premium_window_seat' : 'vip_section';
    //   const reservation = await reserveTable(user.id, tableType, order._id);
      
    //   // Add reservation info to order
    //   order.tableReservation = {
    //     tableId: reservation.tableId,
    //     tableType: reservation.tableType,
    //     time: reservation.time
    //   };
    //   await order.save();
    // }

    // processing payment
    if (paymentMethod === "online") {
      const paymentResult = await processPayment(
        order.totalPrice,
        req.body.paymentDetails
      );

      if (paymentResult.success) {
        order.paymentStatus = "paid";
        order.transactionId = paymentResult.transactionId;
        await order.save();
      } else {
        return next(new appError(paymentResult.message, 400));
      }
    }

      // // VIPs get double loyalty points
      // const loyaltyMultiplier = user.isVIP ? 2 : 1;

    // update loyalty points
    if (order.paymentStatus === "paid") {
      await updateLoyaltyPoints(req.auth.id, order.totalPrice, order._id, 
        // loyaltyMultiplier
      );
    }

    // send order confirmation
    await sendOrderConfirmation(req.auth, order,
      // user.isVIP
    );

    // // Notify kitchen with VIP priority if applicable
    // if (user.isVIP) {
    //   await sendKitchenAlert(`VIP ORDER #${order._id}! Priority preparation required.`, true);
    // }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.name === "MongooseError"&& error.code === 11000) {
      return next(new appError('Duplicate order detected', 409));
    }
    next(error);
  }
};

 // export const prepareForCustomer = async (req, res, next) => {
    //   try {
    //     const { orderItems, userAddress } = req.body;
    
    //     if (!orderItems || !userAddress) {
    //       return next(new appError("Missing order items or user address", 400));
    //     }
    
    // VIPs get instant cooking, no matter the distance!
    // if (user.isVIP) {
    //   // VIP-specific enhancements
    logger.info(`Processing VIP order preparation for user ${user.id}`);
    //   // Add free appetizer for platinum VIPs
    //   if (user.vipLevel === 'platinum') {

    // find appropriate appetizer
    //   const freeAppetizer = await MenuModel.findOne({ category: 'appetizers' }).sort({ price: -1 }).limit(1);
    //   if (freeAppetizer) {
    //     orderItems.push({ 
    //       name: freeAppetizer.name, 
    //       price: 0,
    //       isComplimentary: true 
    //     });
    //   }
    // }
    
      
    //   // Reserve premium table for dine in orders
    // if (req.body.deliveryType === 'dine-in') {
    //   const tableType = user.vipLevel === 'platinum' ? 'premium_window_seat' : 'vip_section';
    //   await reserveTable(user.id, tableType);
    // }
      
    //   // Immediately notify kitchen about VIP order with priority flag
    //   await sendKitchenAlert("VIP ORDER! Start cooking NOW!", true);
      
    //   return res.status(200).json({ 
    //     success: true, 
    //     message: "VIP treatment activated!",
    //     orderItems,
    // vipBenefits: {
    //   priorityCooking: true,
    //   complimentaryItems: orderItems.filter(item => item.isComplimentary),
    //   reservedTable: req.body.deliveryType === 'dine-in' ? true : false
    // }
    //   });
    // }
    
    //     // 1. Get travel time
    //     const { duration } = await getDistance(userAddress);
    //     const travelTime = parseInt(duration.replace('mins', '')); // "15 mins" → 15
    
    //     // 2. Get cooking time
    //     const cookingTime = getCookingTime(orderItems);
    
    //     // 3. Determine cooking start time
    //     let message;
    //     if (travelTime <= cookingTime) {
    //       message = "Start cooking NOW! Customer arriving soon.";
    //     } else {
    //       const delayMinutes = travelTime - cookingTime;
    //       message = `Start cooking in ${delayMinutes} mins.`;
    //     }
    
    //     // 4. Notify kitchen
    //     await sendKitchenAlert(message, false);
    
    //     res.status(200).json({
    //       success: true,
    //       message,
    // estimatedTravelTime: travelTime,
    //   estimatedCookingTime: cookingTime
    //     });
    //   } catch (error) {
     // logger.error('Error in prepareForCustomer:', error);
    //     next(error);
    //   }
    // };




// updating order status (admin access)
export const updateOrderStatus = async (req, res, next) => {
  try {
    if (req.auth.role !== 'admin') {
      return next(new appError('Only admins can update order status', 403));
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true,
      }
    )

   // .populate('user', 'email name isVIP vipLevel');

    if (!order) {
      return next(new appError(`No order found with id ${req.params.id}`, 404));
    }

     // VIPs get priority notifications
     //const isPriority = order.user.isVIP;

      // Send notification if status changed to completed
      if (req.body.status === 'completed') {
        await sendOrderCompletionNotification(order);
      }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
   // logger.error(`Error updating order status for ${req.params.id}:`, error);
    next(error);
  }
};

const updateLoyaltyPoints = async (userId, amount, orderId,
 // multiplier = 1
) => {
  const pointsEarned = Math.floor((amount / 10) 
//* multiplier
);

  let loyalty = await LoyaltyModel.findOne({ user: userId });

  if (!loyalty) {
    loyalty = await LoyaltyModel.create({ user: userId });
  }

  loyalty.points += pointsEarned;
  loyalty.transactions.push({
    type: "earn",
    points: pointsEarned,
    order: orderId,
    //multiplier
  });

  // Update tier based on points
  if (loyalty.points >= 500) {
    loyalty.tier = 'gold';
  } else if (loyalty.points >= 200) {
    loyalty.tier = 'silver';
  }

  await loyalty.save();

  // updating user's loyalty points
  await UserModel.findByIdAndUpdate(userId, {
    $inc: { loyaltyPoints: pointsEarned },
  });

  // // Check if user qualifies for VIP status upgrade
  // const user = await UserModel.findById(userId);
  // if (loyalty.points >= 1000 && !user.isVIP) {
  //   user.isVIP = true;
  //   user.vipLevel = 'gold';
  //   await user.save();
    
  //   // Notify user about VIP upgrade
  //   // Implementation  notification service
  // }
};
