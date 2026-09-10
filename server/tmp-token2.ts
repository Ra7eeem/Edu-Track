import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "./src/config/env";
import { User } from "./src/models/User";

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const teacher = await User.findOne({ email: "arezq02@gmail.com" }).select("_id role").lean();
  if (!teacher) { console.log("not found"); return; }
  const token = jwt.sign({ userId: String(teacher._id), role: teacher.role }, env.JWT_SECRET, { expiresIn: "7d" });
  console.log(token);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
