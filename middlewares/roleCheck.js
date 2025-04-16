import { UserModel } from "../models/user.js";
import { RiderModel } from "../models/rider.js";
import appError from "../utils/appError.js";

export const userRoleCheck = (roles = []) => {
  return async (req, res, next) => {
    try {
      // 1. Check if user exists
      const user = await UserModel.findById(req.auth.id);
      if (!user) {
        return next(new appError('User not found', 404));
      }

      // 2. Check if user has role
      if (!user.role) {
        return next(new appError('User role missing', 403));
      }

      // 3. Check if role is authorized
      if (roles.includes(user.role)) {
        return next();
      }

      // 4. If not authorized
      return next(new appError('You are not authorized to perform this action', 403));
    } catch (err) {
      return next(err);
    }
  };
};

export const riderRoleCheck = (roles = []) => {
  return async (req, res, next) => {
    try {
      const rider = await RiderModel.findById(req.auth.id);
      if (!rider) {
        return next(new appError('Rider not found', 404));
      }
      if (!rider.role) {
        return next(new appError('Rider role missing', 403));
      }
      if (roles.includes(rider.role)) {
        return next();
      }
      return next(new appError('Unauthorized rider access', 403));
    } catch (err) {
      return next(err);
    }
  };
};

// export const userRoleCheck = (roles ) => {
//     return async (req, res, next) => {
//         const user = await UserModel.findById(req.auth.id);

//         if (roles?.includes(user.role)) {
//             next();
//         } else {
//             res.status(403).json("You have to be Authorized")
//         }
//     }
// };



// export const riderRoleCheck = (roles) => {
//     return async (req, res, next) => {
//         const rider = await RiderModel.findById(req.auth.id);

//         if (roles?.includes(rider.role)) {
//             next();
//         } else {
//             res.status(403).json("You have to be Authorized")
//         }
//     }
// };