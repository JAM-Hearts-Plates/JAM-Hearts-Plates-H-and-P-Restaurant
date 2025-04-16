import { AnalyticsModel } from "../models/analytics.js";


export const logEvent = async (req, res) => {
    try {
        // Extract event details from the request body
        const { userId, adminId, event, entityType, entityId, metadata, sessionId } = req.body;
    
        // Create and save the analytics entry
        const newLog = await AnalyticsModel.create(req.body);
    
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
  