import { UserModel } from "../models/user.js";
import { RiderModel } from "../models/rider.js";


export const userRoleCheck = (roles) => {
    return async (req, res, next) => {
        const user = await UserModel.findById(req.auth.id);

        if (roles?.includes(user.role)) {
            next();
        } else {
            res.status(403).json("You have to be Authorized")
        }
    }
};



export const riderRoleCheck = (roles) => {
    return async (req, res, next) => {
        const rider = await RiderModel.findById(req.auth.id);

        if (roles?.includes(rider.role)) {
            next();
        } else {
            res.status(403).json("You have to be Authorized")
        }
    }
};