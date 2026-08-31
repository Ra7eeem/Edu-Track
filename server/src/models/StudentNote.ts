import mongoose, { Document, Schema, Model } from "mongoose";

export interface IStudentNote extends Document {
  _id:       mongoose.Types.ObjectId;
  teacher:   mongoose.Types.ObjectId;
  student:   mongoose.Types.ObjectId;
  group:     mongoose.Types.ObjectId;
  content:   string;
  createdAt: Date;
  updatedAt: Date;
}

const studentNoteSchema = new Schema<IStudentNote>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "User",  required: true },
    student: { type: Schema.Types.ObjectId, ref: "User",  required: true },
    group:   { type: Schema.Types.ObjectId, ref: "Group", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

studentNoteSchema.index({ teacher: 1, student: 1, group: 1 });

export const StudentNote: Model<IStudentNote> =
  mongoose.models.StudentNote ??
  mongoose.model<IStudentNote>("StudentNote", studentNoteSchema);
