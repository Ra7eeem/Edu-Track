import "dotenv/config";
import mongoose from "mongoose";
import { env } from "./src/config/env";
import { User } from "./src/models/User";
import { Group } from "./src/models/Group";
import { Assignment } from "./src/models/Assignment";

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const dbName = mongoose.connection.db?.databaseName ?? "unknown";
  const users = await User.countDocuments();
  const teachers = await User.countDocuments({ role: "TEACHER" });
  const groups = await Group.countDocuments();
  const assignments = await Assignment.countDocuments();
  const sampleTeacher = await User.findOne({ role: "TEACHER" }).select("email name").lean();
  console.log(JSON.stringify({ dbName, users, teachers, groups, assignments, sampleTeacher }, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
