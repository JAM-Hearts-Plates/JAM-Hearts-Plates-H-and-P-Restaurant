import { UserModel } from "../models/user.js";
import { updateUserValidator, userIdValidator } from "../validators/authVal.js";

export const updateUser = async (req, res, next) => {
    // Validate request body
    try {
        const { error, value } = updateUserValidator.validate(req.body);
        // Return error 
        if (error) {
            return res.status(422).json({ message: error.details[0].message });
        }
        // Check if password is being updated
        if (value.password) {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(value.password, 10);
            value.password = hashedPassword;
        }
        // Update user in database
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true }
        );
        // if user is not found
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return response without password
        const { password, ...userWithoutPassword } = updatedUser.toObject();
        res.status(200).json({
            message: "Update successful",
            data: userWithoutPassword
        }); // This will not return with the password.
    } catch (error) {
        next(error)
    }
}


export const getUser = async (req, res, next) => {
    try {
        const { error, value } = userIdValidator.validate(req.params, { abortEarly: false })
        if (error) {
            return res.status(400).json(error)
        }
        const result = await UserModel.findById(value.id)
        if (!result) {
            return res.status(404).json(error)
        }
        res.status(201).json(result)
               } catch (error) {
                next(error)
            }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { error, value } = userIdValidator.validate(req.params, { abortEarly: false })
        if (error) {
            return res.status(400).json(error)
        }
        const result = await UserModel.findByIdAndDelete(value.id)
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(201).json({
            message: "Successfully Deleted!",
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (error) {
       next(error)
    }
}