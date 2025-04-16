import { MenuModel } from "../models/menu.js";
import appError from "../utils/appError.js";
import {
  addMenuValidator,
  replaceMenuValidator,
} from "../validators/menuVal.js";

export const addMenu = async (req, res, next) => {
  try {
    const pictures = req.files && req.files.length > 0 
    ? req.files.map(file => file.filename):[]

    const { error, value } = addMenuValidator.validate({
      ...req.body,
      pictures
    });
    if (error) {
      return res.status(422).json(error);
    }
    const result = await MenuModel.create({
      ...value,
      userId: req.auth.id,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error.name === "MongooseError") {
      return res.status(409).json(error.message);
    }
    next(error);
  }
};
// get all menu items
export const getMenuItems = async (req, res, next) => {
  try {
    const { filter = "{}", sort = "{}" } = req.query;
    const menuItems = await MenuModel.find(JSON.parse(filter)).sort(
      JSON.parse(sort)
    );

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (err) {
    next(err);
  }
};

// get single menu item
export const getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuModel.findById(req.params.id);

    if (!menuItem) {
      return next(new appError(`No menu item with id ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

// update menu item (only admin access)
export const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!menuItem) {
      return next(
        new appError(`No menu item found with id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

export const replaceMenuItem = async (req, res, next) => {
  try {

    const pictures = req.files && req.files.length > 0 
    ? req.files.map(file => file.filename):[]

    const { error, value } = replaceMenuValidator.validate({
      ...req.body,
      pictures
    });
    if (error) {
      return res.status(422).json(error);
    }
    const menuItem = await MenuModel.findOneAndReplace(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json(menuItem);
  } catch (error) {
    if (error) {
      next(error);
    }
  }
};

// delete menu item (admin access only)
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuModel.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return next(
        new appError(`No menu item found with id ${req.params.id}`, 404)
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
