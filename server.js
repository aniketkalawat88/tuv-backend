const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const blogRoutes = require("./routes/blogRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "https://www.truevalueventures.in",  // Allow only your frontend domain
    methods: "GET,POST,PUT,DELETE",
    credentials: true,  // Allow cookies and authentication headers if needed
  })
);

// Routes
app.use("/api/blogs", blogRoutes);

app.use("*", (req,res)=> {
  return res.status(404).json({
    message:"Page Not Found"
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

