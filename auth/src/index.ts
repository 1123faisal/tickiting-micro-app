import mongoose from "mongoose";
import { app } from "./app";

if (!process.env.MONGO_URI) {
  throw new Error("MONGO URI must be defind.");
}

console.log("staring up...");

mongoose
  .connect(process.env.MONGO_URI)
  .then((rs) => {
    console.log("connected to mongodb.");
    app.listen(3000, () => {
      console.log("Listening on port 3000.");
    });
  })
  .catch((error) => {
    console.log("error", error);
  });
