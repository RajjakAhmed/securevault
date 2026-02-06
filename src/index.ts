import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authroutes";
import fileRoutes from "./routes/fileroutes";


dotenv.config();

const app = express();
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);


app.get("/", (req, res) => {
  res.send("SecureVault API running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
