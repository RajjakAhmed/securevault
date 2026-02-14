import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authroutes";
import fileRoutes from "./routes/fileroutes";
import teamRoutes from "./routes/teamroutes";
import cors from "cors";


dotenv.config();

const app = express();
app.use(express.json());
app.set("trust proxy", true);
app.use(
  cors({
    origin: "*", // for development (we will restrict later)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/teams", teamRoutes);


app.get("/", (req, res) => {
  res.send("SecureVault API running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
