import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import familiesRoutes from "./routes/families.js";
import familyMembersRoutes from "./routes/familyMembers.js";
import userRoutes from "./routes/users.js";
import disasterRoutes from "./routes/disasters.js";
import ActivityRoutes from "./routes/activity.js";
import DynamicLogoAndTitl from "./routes/DynamicLogoAndTitl.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
dotenv.config();
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Middleware
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        connectSrc: ["'self'", "*"]
      },
    },
  })
);app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));
app.use(
  "/assets/profiles",
  express.static(path.join(__dirname, "assets", "profiles"))
);

// Routes
app.use("/", familiesRoutes);
app.use("/", familyMembersRoutes);
app.use("/", disasterRoutes);
app.use("/", userRoutes);
app.use("/", ActivityRoutes);
app.use("/", DynamicLogoAndTitl)

// Start the server
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
