import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "./src/config/env";
import { User } from "./src/models/User";
import { Assignment } from "./src/models/Assignment";

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const assignment = await Assignment.findOne().select("author group title").lean();
  const teachers = await User.find({ role: "TEACHER" }).select("name email").lean();
  console.log(JSON.stringify({ assignment, teachers: teachers.slice(0, 5) }, null, 2));
  if (assignment) {
    const token = jwt.sign({ userId: String(assignment.author), role: "TEACHER" }, env.JWT_SECRET, { expiresIn: "7d" });
    console.log("token:", token);
  }
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
