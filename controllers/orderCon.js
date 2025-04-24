import { OrderModel } from "../models/order.js";
import { MenuModel } from "../models/menu.js";
import { LoyaltyModel } from "../models/loyalty.js";
import { UserModel } from "../models/user.js";
import { TableModel } from "../models/table.js";
import appError from "../utils/appError.js";
import { getDistance } from "../utils/distanceCalculator.js";
import { getCookingTime } from "../utils/cookingTime.js";
// import { sendKitchenAlert } from "../services/kitchen.js";
import { processPayment } from "../services/payment.js";
import {
  sendOrderConfirmation,
  sendOrderCompletionNotification,
} from "../services/notification.js";
import {
  cancelOrderValidator,
  orderItemValidator,
  orderValidator,
} from "../validators/orderVal.js";
import { evaluateVIPStatus } from "../services/vipServices.js";

// Helper: Calculate order total and validate items
const validateAndCalculateOrder = async (items) => {
  let totalPrice = 0;
  const validatedItems = [];

  for (const item of items) {
    const menuItem = await MenuModel.findById(item.menuItem);
    if (!menuItem) {
      throw new appError(`Menu item ${item.menuItem} not found`, 404);
    }
    if (!menuItem.isAvailable) {
      throw new appError(`${menuItem.name} is currently unavailable`, 400);
    }

    totalPrice += menuItem.price * item.quantity;
    validatedItems.push({
      menuItem: item.menuItem,
      quantity: item.quantity,
      price: menuItem.price,
      specialInstructions: item.specialInstructions || "",
    });
  }

  return { items: validatedItems, totalPrice };
};

// Helper: Apply VIP benefits to order
const applyVipBenefits = async (user, items, totalPrice) => {
  if (!user.isVIP) return { items, totalPrice, vipDiscount: 0 };

  const updatedItems = [...items];
  let discountPercentage = 0;

  // Platinum VIP benefits
  if (user.vipLevel === "platinum") {
    discountPercentage = 10;
    const appetizer = await MenuModel.findOne({ category: "appetizers" }).sort({
      price: -1,
    });
    if (appetizer) {
      updatedItems.push({
        menuItem: appetizer._id,
        quantity: 1,
        price: 0,
        specialInstructions: "Complimentary - VIP Platinum",
        isComplimentary: true,
      });
    }
  }
  // Gold VIP benefits
  else if (user.vipLevel === "gold") {
    discountPercentage = 5;
    const drink = await MenuModel.findOne({
      category: "drinks",
      price: { $lt: 5 },
    });
    if (drink) {
      updatedItems.push({
        menuItem: drink._id,
        quantity: 1,
        price: 0,
        specialInstructions: "Complimentary - VIP Gold",
        isComplimentary: true,
      });
    }
  }

  const discountAmount = totalPrice * (discountPercentage / 100);
  return {
    items: updatedItems,
    totalPrice: totalPrice - discountAmount,
    vipDiscount: discountPercentage,
  };
};

// Helper: Calculate delivery details
const calculateDeliveryDetails = async (user, deliveryAddress) => {
  const distanceInfo = await getDistance(deliveryAddress);
  if (!distanceInfo.distance) {
    throw new appError("Could not calculate delivery distance", 400);
  }

  const distanceKm = parseFloat(distanceInfo.distance.replace(" km", ""));
  const maxDistance = user.isVIP ? 15 : 10;

  if (distanceKm > maxDistance) {
    throw new appError(
      `Delivery beyond our ${maxDistance}km service area`,
      400
    );
  }

  let fee = 0;
  // Platinum VIPs get free delivery
  if (!(user.isVIP && user.vipLevel === "platinum")) {
    fee = distanceKm * 1.5;
    // Gold VIPs get 50% off delivery
    if (user.isVIP && user.vipLevel === "gold") fee *= 0.5;
  }

  return {
    fee,
    estimate: distanceInfo.duration,
    distance: distanceInfo.distance,
  };
};

// Helper: Reserve table for dine-in orders
const handleTableReservation = async (userId, partySize, vipLevel) => {
  if (!vipLevel) return null;

  const tableType =
    vipLevel === "platinum" ? "premium_window_seat" : "vip_section";

  try {
    const table = await TableModel.findOneAndUpdate(
      {
        capacity: { $gte: partySize },
        tableType,
        isAvailable: true,
      },
      { isAvailable: false, reservedBy: userId },
      { new: true }
    );

    if (!table) {
      console.warn("No available tables matching VIP requirements");
      return null;
    }

    return {
      tableId: table._id,
      tableNumber: table.tableNumber,
      tableType: table.tableType,
    };
  } catch (error) {
    console.error("Table reservation failed:", error);
    return null;
  }
};

export const validateOrderItems = async (req, res, next) => {
  try {
    const { error } = orderItemValidator.validate(req.body.items);
    if (error) throw new appError(error.details[0].message, 422);

    res.status(200).json({
      success: true,
      message: "Items are valid",
    });
  } catch (error) {
    next(error);
  }
};

// Main order creation controller
export const createOrder = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.auth.id);
    if (!user) throw new appError("User not found", 404);

    const { items, paymentMethod, deliveryType, deliveryAddress, notes } =
      req.body;

    // 1. Validate items and calculate base total
    const { items: validItems, totalPrice } = await validateAndCalculateOrder(
      items
    );

    // 2. Apply VIP benefits if applicable
    const {
      items: finalItems,
      totalPrice: discountedTotal,
      vipDiscount,
    } = await applyVipBenefits(user, validItems, totalPrice);

    // 3. Calculate delivery if needed
    let delivery = { fee: 0, estimate: null };
    if (deliveryType === "delivery") {
      if (!deliveryAddress)
        throw new appError("Delivery address required", 400);
      delivery = await calculateDeliveryDetails(user, deliveryAddress);
    }

    // 4. Calculate cooking time
    const cookingDetails = getCookingTime(
      finalItems.map((item) => ({ name: item.menuItem.name }))
    );

    // 5. Handle table reservation for dine-in VIPs
    let tableReservation;
    if (deliveryType === "dine-in" && user.isVIP) {
      tableReservation = await handleTableReservation(
        user._id,
        items.length + 1, // Estimate party size
        user.vipLevel
      );
    }

    // 6. Validate complete order
    const orderData = {
      user: user._id,
      items: finalItems,
      totalPrice: discountedTotal + delivery.fee,
      paymentMethod,
      deliveryType,
      deliveryAddress:
        deliveryType === "delivery" ? deliveryAddress : undefined,
      notes,
      deliveryFee: delivery.fee,
      estimatedCookingTime: cookingDetails.estimatedTime,
      estimatedDeliveryTime: delivery.estimate,
      isPriority: user.isVIP,
      vipDiscount,
      ...(tableReservation && { tableReservation }),
    };

    const { error } = orderValidator.validate(orderData);
    if (error) throw new appError(error.details[0].message, 422);

    // 7. Create order
    const order = await OrderModel.create(orderData);

    // 8. Process payment if online
    if (paymentMethod === "online") {
      const paymentResult = await processPayment(
        order.totalPrice,
        req.body.paymentDetails
      );
      if (!paymentResult.success)
        throw new appError(paymentResult.message, 400);

      order.paymentStatus = "paid";
      order.transactionId = paymentResult.transactionId;
      await order.save();
    }

    // VIP upgrade
    if (order.paymentStatus === "paid") {
      // Update loyalty points
      const pointsEarned = Math.floor(order.totalPrice / 10);
      user.loyaltyPoints += pointsEarned;
      await user.save();

      // Check VIP qualification
      const result = await evaluateVIPStatus(userId);
      if (result.success) {
        console.log(`New VIP: ${result.newStatus.level}`);
      }
    }

    // 9. Update loyalty points
    if (order.paymentStatus === "paid") {
      const pointsMultiplier = user.isVIP ? 2 : 1;
      const pointsEarned = Math.floor(
        (order.totalPrice / 10) * pointsMultiplier
      );

      await LoyaltyModel.findOneAndUpdate(
        { user: user._id },
        {
          $inc: { points: pointsEarned },
          $push: {
            transactions: {
              type: "earn",
              points: pointsEarned,
              order: order._id,
              multiplier: pointsMultiplier,
            },
          },
        },
        { upsert: true, new: true }
      );

      // Check for VIP status upgrade
      if (pointsEarned >= 1000 && !user.isVIP) {
        await UserModel.findByIdAndUpdate(user._id, {
          isVIP: true,
          vipLevel: "gold",
        });
      }
    }

    // 10. Send notifications
    await sendOrderConfirmation(user, order);
    if (user.isVIP) {
      await sendKitchenAlert(`VIP ORDER #${order._id} - Priority!`, true);
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
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

// Get single order
export const getOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name price description");

    if (!order) {
      throw new appError(`Order not found with id ${req.params.id}`, 404);
    }

    // Authorization check
    if (
      order.user._id.toString() !== req.auth.id &&
      req.auth.role !== "admin"
    ) {
      throw new appError("Not authorized to access this order", 403);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's orders
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

// Update order status (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    if (req.auth.role !== "admin") {
      throw new appError("Only admins can update order status", 403);
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("user", "email name isVIP vipLevel");

    if (!order) {
      throw new appError(`Order not found with id ${req.params.id}`, 404);
    }

    // Send completion notification if status changed to completed
    if (req.body.status === "completed") {
      await sendOrderCompletionNotification(order);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Prepare order for customer (VIP priority handling)
export const prepareForCustomer = async (req, res, next) => {
  try {
    const { orderItems, userAddress } = req.body;
    const user = await UserModel.findById(req.auth.id);

    if (!orderItems || !userAddress) {
      throw new appError("Missing order items or delivery address", 400);
    }

    // Handle VIP priority
    if (user?.isVIP) {
      const enhancedItems = [...orderItems];

      // Platinum VIP gets free high-value appetizer
      if (user.vipLevel === "platinum") {
        const appetizer = await MenuModel.findOne({ category: "appetizers" })
          .sort({ price: -1 })
          .limit(1);

        if (appetizer) {
          enhancedItems.push({
            name: appetizer.name,
            price: 0,
            isComplimentary: true,
          });
        }
      }

      // Immediate kitchen alert for VIP orders
      await sendKitchenAlert(`VIP ORDER! Start preparation immediately`, true);

      return res.status(200).json({
        success: true,
        message: "VIP priority processing activated",
        orderItems: enhancedItems,
        benefits: {
          priority: true,
          complimentaryItems: enhancedItems.filter((i) => i.isComplimentary),
        },
      });
    }

    // Standard order processing
    const { duration } = await getDistance(userAddress);
    const travelTime = parseInt(duration.replace(" mins", ""));
    const cookingTime = getCookingTime(orderItems);

    const message =
      travelTime <= cookingTime
        ? "Start cooking now! Customer arriving soon."
        : `Start cooking in ${travelTime - cookingTime} minutes`;

    await sendKitchenAlert(message, false);

    res.status(200).json({
      success: true,
      message,
      timing: {
        travelTime,
        cookingTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { error, value } = cancelOrderValidator.validate(req.body);
    if (error) throw new appError(error.details[0].message, 422);

    const { orderId } = req.params;
    const { reason, refundRequested } = value;
    const userId = req.auth.id;

    const order = await OrderModel.findById(orderId);
    if (!order) throw new appError("Order not found", 404);

    // Authorization: Owner, admin, or kitchen can cancel
    const isOwner = order.user.equals(userId);
    const isStaff = ["admin", "kitchen"].includes(req.auth.role);
    if (!isOwner && !isStaff) throw new appError("Unauthorized", 403);

    // Business rules
    if (order.status === "completed") {
      throw new appError("Completed orders cannot be cancelled", 400);
    }

    // Update order
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = userId;

    // Handle refund if applicable
    if (refundRequested && order.paymentStatus === "paid") {
      await processRefund(order.transactionId); // Your refund service
      order.paymentStatus = "refunded";
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
