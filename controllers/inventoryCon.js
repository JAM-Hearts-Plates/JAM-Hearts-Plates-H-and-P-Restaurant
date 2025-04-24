import { InventoryModel } from "../models/inventory.js";
import { MenuModel } from "../models/menu.js";
import appError from "../utils/appError.js";
import { inventoryValidator } from "../validators/inventoryVal.js";

// get all inventory
export const getInventoryItems = async (req, res, next) => {
  try {
    // Admin only
    // if (req.auth.role !== "admin") {
    //   return next(new appError("Only admins can view inventory", 403));
    // }
    const { filter = "{}", sort = "{}" } = req.query;
    const inventoryItems = await InventoryModel.find(JSON.parse(filter)).sort(
      JSON.parse(sort)
    );

    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems,
    });
  } catch (err) {
    next(err);
  }
};

// get single inventory
export const getInventoryItem = async (req, res, next) => {
  try {
    // Admin only
    if (req.auth.role !== "admin") {
      return next(new appError("Only admins can view inventory", 403));
    }

    const inventoryItem = await InventoryModel.findById(req.params.id);

    if (!inventoryItem) {
      return next(
        new appError(`No inventory item found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: inventoryItem,
    });
  } catch (err) {
    next(err);
  }
};

// Create inventory item
export const createInventoryItem = async (req, res, next) => {
  try {
    // Admin only
    // if (req.auth.role !== "admin") {
    //   return next(new appError("Only admins can create inventory items", 403));
    // }

    const { error, value } = inventoryValidator.validate(req.body);

    if (error) {
      return next(
        new appError(error.details.map((d) => d.message).join(", "), 422)
      );
    }

    const inventoryItem = await InventoryModel.create(value);

    res.status(201).json({
      success: true,
      data: inventoryItem,
    });
  } catch (error) {
    if (error.name === "MongooseError" && error.code === 11000) {
      return next(
        new appError("Inventory item with this name already exists", 409)
      );
    }
    next(error);
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res, next) => {
  try {
    // Admin only
    // if (req.auth.role !== "admin") {
    //   return next(new appError("Only admins can update inventory", 403));
    // }

    const inventoryItem = await InventoryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!inventoryItem) {
      return next(
        new appError(`No inventory item found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: inventoryItem,
    });
  } catch (err) {
    next(err);
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res, next) => {
  try {
    // Admin only
    // if (req.auth.role !== "admin") {
    //   return next(new appError("Only admins can delete inventory items", 403));
    // }

    // Check if any menu items use this inventory
    const menuItemsUsingInventory = await MenuModel.find({
      ingredients: req.params.id,
    });

    if (menuItemsUsingInventory.length > 0) {
      return next(
        new appError("Cannot delete inventory item used in menu items", 400)
      );
    }

    const inventoryItem = await InventoryModel.findByIdAndDelete(req.params.id);

    if (!inventoryItem) {
      return next(
        new appError(`No inventory item found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// Get low inventory items
export const getLowInventoryItems = async (req, res, next) => {
  try {
    // Admin only
    // if (req.auth.role !== "admin") {
    //   return next(new appError("Only admins can view inventory", 403));
    // }

    const lowInventoryItems = await InventoryModel.find({
      $expr: { $lte: ["$quantity", "$threshold"] },
    });

    res.status(200).json({
      success: true,
      count: lowInventoryItems.length,
      data: lowInventoryItems,
    });
  } catch (err) {
    next(err);
  }
};

export const restockInventory = async (req, res, next) => {
  try {
    // Admin only
    // if (req.auth.role !== "admin") {
    //   return next(new appError("Only admins can restock inventory", 403));
    // }

    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return next(new appError("Invalid restock quantity", 400));
    }

    const inventoryItem = await InventoryModel.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { quantity },
        lastRestocked: new Date(),
      },
      { new: true }
    );

    if (!inventoryItem) {
      return next(
        new appError(`No inventory item found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: inventoryItem,
    });
  } catch (error) {
    next(error);
  }
};
