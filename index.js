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
import stripeRouter from "./routes/stripeWebhooks.js";
import vipRouter from "./routes/vipRoutes.js";




// making a database connection
await mongoose.connect(process.env.MONGO_URI);


// create an express app
const app = express();

const allowedOrigin = ["http://localhost:5173"]


const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
app.use(cors(corsOptions));


app.use('/webhooks', stripeRouter)

app.use(express.json());

// using routes
app.use(authRoutes);
app.use(userRoutes)
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


const httpServer = createServer(app);

// Set up Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST","PUT", "DELETE"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});



// Socket.IO connection handler
const configureSocketIO = () => {
io.on('connection', (socket) => {
  console.log(`New client connected:, ${socket.id}`);
  
   // Join room for order updates
   socket.on('joinOrderRoom', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order_${orderId}`);
  });

//   // Handle real-time order updates
  socket.on('orderUpdate', (data) => {
    io.to(`order_${data.orderId}`).emit('orderStatusChanged', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected:, ${socket.id}`);
  });
});

// Make io accessible to other modules
app.set('io', io);
}

configureSocketIO();

// middlewares
// / Configure CORS middleware


// Handle preflight requests
app.options("", cors(corsOptions))

// Use morgan only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // logs method, status, and response time
}

// Health Check
app.get('/', (req, res) => res.status(200).json({
  status: 'running',
  timestamp: new Date().toISOString(),
  // websockets: io.engine.clientsCount
}));

// initialize passport middleware**
app.use(passport.initialize()); // Required for Google OAuth authentication



// Handle undefined routes
app.all("", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler)


// server listening
const port = process.env.PORT || 4512
app.listen(port, () => {
  console.log(`Hearts and Plates is ready to serve on port ${port} 
     WebSockets active on: ws://localhost:${port}`);
});

// Export getIO function
// export const getIO = () => io;