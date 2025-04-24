import { AnalyticsModel } from "../models/analytics.js";
import { UserModel } from "../models/user.js";
import { OrderModel } from "../models/order.js"
import { v4 as uuidv4 } from "uuid"


export const logEvent = async (req, res) => {
    try {
        // Extract event details from the request body
        const { userId, adminId, event, entityType, entityId, metadata, sessionId } = req.body;

        // validate that the user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "Invalid userId: User does not exist" });
        }

          // validate that the `entityId` exists in the database
          let entityExists;
          if (entityType === "order") {
              entityExists = await OrderModel.findById(entityId);
          }
          // Add more conditions if tracking reservations, loyalty, etc.
  
          if (!entityExists) {
              return res.status(400).json({ error: `Invalid entityId: No ${entityType} found with this ID` });
          }
    
        // auto-generate a session ID if none was provided
        const generatedSessionId = sessionId || uuidv4(); 

        // Create and save the analytics entry
        const newLog = await AnalyticsModel.create({
          userId: user._id,
          event,
          entityType,
          entityId,
          metadata: metadata,  // Keep original metadata
          sessionId,
          adminId
      });
    
        res.status(201).json({ message: 'Analytics event logged successfully', data: newLog });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
}

export const getEvents = async (req, res) => {
    try {
      // Extract query parameters
      const { event, entityType, userId, adminId, startDate, endDate } = req.query;
  
      // Build filter object
      const filter = {};
      if (event) filter.event = event;
      if (entityType) filter.entityType = entityType;
      if (userId) filter.userId = userId;
      if (adminId) filter.adminId = adminId;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }
  
      // Retrieve and send analytics entries
      const logs = await AnalyticsModel.find(filter).sort({ timestamp: -1 });
      res.status(200).json({ message: 'Analytics data retrieved successfully', data: logs });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


  export const deleteEvent = async (req, res) => {
    try {
      const { id } = req.params;
      await AnalyticsModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Analytics event deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  
  const analyticsOverview = async (req, res) => {
    try {
      const { entityType, startDate, endDate } = req.query;
  
      // Build match filter
      const match = {};
      if (entityType) match.entityType = entityType;
      if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = new Date(startDate);
        if (endDate) match.timestamp.$lte = new Date(endDate);
      }
  
const aggregateData = async (req, res) => {
  try {
    const { entityType, startDate, endDate } = req.query;

    // Build match filter
    const match = {};
    if (entityType) match.entityType = entityType;
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    // Perform aggregation
    const data = await Analytics.aggregate([
      { $match: match },
      { $group: {
          _id: '$event',
          total: { $sum: 1 },
          lastEvent: { $max: '$timestamp' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({ message: 'Aggregated data retrieved successfully', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

  
      res.status(200).json({ message: 'Aggregated data retrieved successfully', data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  