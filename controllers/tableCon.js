// import { TableModel } from "../models/TableModel.js";
// import appError from "../utils/appError.js";
// import { tableValidator } from "../validators/tableVal.js";

// // Get all tables (admin access)
// export const getAllTables = async (req, res, next) => {
//   try {
//     if (req.auth.role !== 'admin') {
//       return next(new appError('Only admins can view all tables', 403));
//     }

//     const { filter = "{}", sort = "{}" } = req.query;
//     const tables = await TableModel.find(JSON.parse(filter))
//       .sort(JSON.parse(sort))
//       .populate("reservedBy", "name email");

//     res.status(200).json({
//       success: true,
//       count: tables.length,
//       data: tables,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get available tables
// export const getAvailableTables = async (req, res, next) => {
//   try {
//     const { capacity, type, location } = req.query;
//     const query = { isAvailable: true };
    
//     if (capacity) query.capacity = { $gte: parseInt(capacity) };
//     if (type) query.type = type;
//     if (location) query.location = location;
    
//     const tables = await TableModel.find(query).sort('tableNumber');
    
//     res.status(200).json({
//       success: true,
//       count: tables.length,
//       data: tables,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Reserve a table
// export const reserveTable = async (req, res, next) => {
//   try {
//     const { tableId, duration = 120 } = req.body;
//     const orderId = req.body.orderId || null;
    
//     const table = await TableModel.findById(tableId);
//     if (!table) {
//       return next(new appError(`No table found with id ${tableId}`, 404));
//     }
    
//     if (!table.isAvailable) {
//       return next(new appError('Table is not available for reservation', 400));
//     }
    
//     // Set reservation details
//     table.isAvailable = false;
//     table.reservedBy = req.auth.id;
//     table.orderId = orderId;
//     table.reservedAt = new Date();
    
//     // Calculate release time
//     const releaseTime = new Date();
//     releaseTime.setMinutes(releaseTime.getMinutes() + parseInt(duration));
//     table.releaseAt = releaseTime;
    
//     await table.save();
    
//     res.status(200).json({
//       success: true,
//       message: 'Table reserved successfully',
//       data: table,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Release a table
// export const releaseTable = async (req, res, next) => {
//   try {
//     const table = await TableModel.findById(req.params.id);
//     if (!table) {
//       return next(new appError(`No table found with id ${req.params.id}`, 404));
//     }
    
//     // Only the user who reserved or an admin can release
//     if (table.reservedBy?.toString() !== req.auth.id && req.auth.role !== 'admin') {
//       return next(new appError('Not authorized to release this table', 401));
//     }
    
//     table.isAvailable = true;
//     table.reservedBy = null;
//     table.orderId = null;
//     table.reservedAt = null;
//     table.releaseAt = null;
    
//     await table.save();
    
//     res.status(200).json({
//       success: true,
//       message: 'Table released successfully',
//       data: table,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Run expired table cleanup manually (admin only)
// export const releaseExpiredTables = async (req, res, next) => {
//   try {
//     if (req.auth.role !== 'admin') {
//       return next(new appError('Only admins can release expired tables', 403));
//     }
    
//     const result = await TableModel.releaseExpiredReservations();
    
//     res.status(200).json({
//       success: true,
//       message: 'Expired table reservations released',
//       count: result.modifiedCount,
//     });
//   } catch (error) {
//     next(error);
//   }
// };