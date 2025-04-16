import { RiderModel } from "../models/rider.js";
import { updateRiderValidator } from "../validators/authVal.js";



export const updateDriverAvailability = async (req, res) => {
    try {
      const { userId } = req.params; // Driver ID from request params
      const { availability } = req.body; // New availability status from frontend
  
      const driver = await RiderModel.findByIdAndUpdate(
        userId,
        { availability },
        { new: true } // Return the updated document
      );
  
      res.status(200).json({ message: 'Driver availability updated successfully', data: driver });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  

export const getAvailableRiders = async (req, res) => {
    try {
      const drivers = await RiderModel.find({ role: 'rider', availability: true });
      res.status(200).json({ message: 'These are the Available riders', data: drivers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  

  export const getDriverDeliveries = async (req, res) => {
    try {
      const { riderId } = req.params; // Get the rider ID 
  
      // Step 1: Find the rider and populate assigned deliveries
      const rider = await RiderModel.findById(riderId).populate('assignedDeliveries');
      if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
      }
  
      if (rider.assignedDeliveries.length === 0) {
        return res.status(404).json({ message: 'This rider has no assigned deliveries' });
      }
  
      // Step 2: Respond with the assigned deliveries
      res.status(200).json({
        message: `Deliveries for rider ${riderId}`,
        data: rider.assignedDeliveries,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };



export const updateRider = async (req, res, next) => {
    // Validate request body
    try {
        const { error, value } = updateRiderValidator.validate(req.body);
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
        const updatedUser = await RiderModel.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true }
        );
        // if user is not found
        if (!updatedUser) {
            return res.status(404).json({ message: 'Rider not found' });
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


export const deleteRider = async (req, res, next) => {
    try {
        const { error, value } = userIdValidator.validate(req.params, { abortEarly: false })
        if (error) {
            return res.status(400).json(error)
        }
        const result = await RiderModel.findByIdAndDelete(value.id)
        if (!result) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        res.status(201).json({
            message: "Successfully Deleted!",
            data: result
        })
    } catch (error) {
        next(error)
    }
}


export const getAllRiders = async (req, res) => {
    try {
      const drivers = await User.find({ role: 'rider' });
      res.status(200).json({ message: 'These are all the Riders', data: drivers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  