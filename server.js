const express = require("express");
const cors = require("cors"); // Import CORS middleware
const connectDB = require("./config/db"); // Import DB connection
const reportRoutes = require("./routes/reportRoutes");
const formRoutes = require("./routes/formRoutes");
const b2bRoutes = require("./routes/b2bRoutes");
const promotionRoutes = require("./routes/promotionRoutes");

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/form", formRoutes);
app.use("/api/promocode", promotionRoutes);
app.use("/api/b2b", b2bRoutes);
app.use("/api/report", reportRoutes);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
