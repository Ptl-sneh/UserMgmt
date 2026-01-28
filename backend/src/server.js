const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path")

dotenv.config();


const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const moduleRoutes = require('./routes/moduleRoute'); 

const app = express();
app.use('/exports', express.static(path.join(__dirname, '../exports')));

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/modules", moduleRoutes); 

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});