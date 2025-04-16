import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
// import errorHandler from "./middlewares/errorHandler.js"

// importing routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import menuRoutes from "./routes/menuRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import reservationRoutes from "./routes/reservationRoutes.js";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
// import inventoryRoutes from "./routes/inventoryRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import riderRoutes from "./routes/rider.js";


// making a database connection
await mongoose.connect(process.env.MONGO_URI);

// create an express app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Use morgan only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // logs method, status, and response time
}

// using routes
app.use(authRoutes);
app.use(userRoutes)
// app.use(menuRoutes)
// app.use(orderRoutes)
// app.use(reservationRoutes)
app.use(loyaltyRoutes)
// app.use(inventoryRoutes)
app.use(deliveryRoutes)
app.use(analyticsRoutes)
app.use(riderRoutes)



// server listening
const port = process.env.PORT || 4512
app.listen(port, () => {
  console.log(`Hearts and Plates is ready to serve on port ${port}`);
});
