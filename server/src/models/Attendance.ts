import mongoose, { Document, Schema, Model } from "mongoose";
import { AttendanceStatus } from "../types";

// ─────────────────────────────────────────
// Attendance Record sub-document
// ─────────────────────────────────────────

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId;
  status: AttendanceStatus;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────
// Attendance Session (one per group per date)
// ─────────────────────────────────────────

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  date: Date;            // stored as YYYY-MM-DD (date only, no time)
  records: IAttendanceRecord[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    // Store as a date-only value (midnight UTC) for idempotent upserts
    date: {
      type: Date,
      required: true,
    },
    records: {
      type: [attendanceRecordSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

// One session per group per date — idempotent-safe
attendanceSchema.index({ group: 1, date: 1 }, { unique: true });
attendanceSchema.index({ group: 1 });
attendanceSchema.index({ date: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ??
  mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
