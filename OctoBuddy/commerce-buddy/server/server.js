// Import required modules using ES module syntax
import express from "express";
import bodyParser from "body-parser";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();
app.use(bodyParser.json());

// Use API routes
app.use("/api", apiRoutes);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
