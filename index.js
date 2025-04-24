import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js"
import appError from "./utils/appError.js";
import morgan from "morgan";
import passport from "passport";
import { createServer } from 'http';
import { Server } from 'socket.io';

// importing routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import reservationRouter from "./routes/reservationRoutes.js";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
import inventoryRouter from "./routes/inventoryRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import tableRouter from "./routes/tableRoutes.js"
import riderRoutes from "./routes/rider.js";
import "./middlewares/auth.js"
import vipRouter from "./routes/vipRoutes.js";


// making a database connection
await mongoose.connect(process.env.MONGO_URI);

// create an express app
const app = express();
const httpServer = createServer(app);

// Set up Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to other modules
app.set('io', io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Use morgan only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // logs method, status, and response time
}

// initialize passport middleware**
app.use(passport.initialize()); // Required for Google OAuth authentication

// using routes
app.use(authRoutes);
app.use( userRoutes)
app.use(menuRouter)
app.use(orderRouter)
app.use(reservationRouter)
app.use(loyaltyRoutes)
app.use(inventoryRouter)
app.use(deliveryRoutes)
app.use(analyticsRoutes)
app.use(tableRouter)
app.use(riderRoutes)
app.use(vipRouter)

// Handle undefined routes
// app.all("*", (req, res, next) => {
//   next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
// });




// server listening
const port = process.env.PORT || 4512
app.listen(port, () => {
  console.log(`Hearts and Plates is ready to serve on port ${port}`);
});

// Export getIO function
export const getIO = () => io;