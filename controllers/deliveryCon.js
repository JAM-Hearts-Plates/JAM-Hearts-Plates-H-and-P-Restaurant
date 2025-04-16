import { DeliveryModel } from "../models/delivery.js";
import { RiderModel } from "../models/rider.js";
import { calculateDistance } from "../services/map.js";
import { deliveryValidator } from "../validators/deliveryVal.js";


export const createDelivery = async (req, res) => {
    try {
      const { error, value } = deliveryValidator.validate(req.body)
      if (error) {
        return res.status(422).json(error)
      }
      const delivery = await DeliveryModel.create(value);
      res.status(201).json({ message: 'Delivery created successfully', data: delivery });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  export const updateDeliveryStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, location, notes } = req.body;
  
      const delivery = await DeliveryModel.findByIdAndUpdate(
        id, 
        { status, location, notes }, 
        { new: true } // Return updated entry
      );
  
      res.status(200).json({ message: 'Delivery status updated successfully', data: delivery });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  export const getDelivery = async (req, res) => {
    try {
      const { id } = req.params;
      const delivery = await DeliveryModel.findById(id).populate('orderId driverId'); // Populate related data
      res.status(200).json({ message: 'Delivery details retrieved successfully', data: delivery });
    } catch (error) {
      res.status(404).json({ error: 'Delivery not found' });
    }
  };


  export const deleteDelivery = async (req, res) => {
    try {
      const { id } = req.params;
      await DeliveryModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Delivery deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


  export const assignDelivery = async (req, res) => {
    try {
      const { orderId, location } = req.body; // Delivery location in { lat: x, lon: y } format
  
      // Step 1: Find all available riders
      const availableRiders = await RiderModel.find({ availability: true }).lean();
      if (availableRiders.length === 0) {
        return res.status(400).json({ error: 'No available riders found' });
      }
  
      // Step 2: Find the closest rider based on proximity
      let closestRider = null;
      let shortestDistance = Infinity;
  
      availableRiders.forEach((rider) => {
        const riderLocation = rider.location; // Ensure `location` exists in Rider schema
        const distance = calculateDistance(location, riderLocation); // Use helper from map.js
        if (distance < shortestDistance) {
          closestRider = rider;
          shortestDistance = distance;
        }
      });
  
      if (!closestRider) {
        return res.status(400).json({ error: 'No suitable rider found' });
      }
  
      // Step 3: Create a new delivery record
      const delivery = await DeliveryModel.create({
        orderId,
        riderId: closestRider._id,
        status: 'pending', // Set default status
      });
  
      // Step 4: Update the rider's assigned deliveries and availability
      closestRider.assignedDeliveries.push(delivery._id);
      closestRider.availability = false;
      await RiderModel.findByIdAndUpdate(closestRider._id, closestRider); // Save updates
  
      res.status(201).json({
        message: 'Delivery successfully assigned to the closest rider',
        data: delivery,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };