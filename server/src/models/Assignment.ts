import mongoose, { Document, Schema, Model } from "mongoose";

export enum AssignmentType {
  HOMEWORK = "HOMEWORK",
  EXAM     = "EXAM",
}

// ─── MCQ Choice sub-document ──────────────────────────────────────────────────
export interface IChoice {
  id:   string;   // "a" | "b" | "c" | "d"  (letter label)
  text: string;
}

export interface IQuestion {
  _id:           mongoose.Types.ObjectId;
  text:          string;
  choices:       IChoice[];
  correctAnswer: string;   // matches a choice id
  points:        number;   // default 1
}

// ─── Assignment document ──────────────────────────────────────────────────────
export interface IAssignment extends Document {
  _id:             mongoose.Types.ObjectId;
  group:           mongoose.Types.ObjectId;
  author:          mongoose.Types.ObjectId;
  type:            AssignmentType;
  title:           string;
  description:     string | null;
  youtubeUrl:      string | null;
  dueDate:         Date | null;
  durationMinutes: number | null;   // exam duration in minutes
  questions:       IQuestion[];     // MCQ questions (exam only)
  createdAt:       Date;
  updatedAt:       Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const choiceSchema = new Schema<IChoice>(
  {
    id:   { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    text: {
      type:      String,
      required:  [true, "نص السؤال مطلوب"],
      trim:      true,
      maxlength: [2000, "السؤال لا يتجاوز 2000 حرف"],
    },
    choices: {
      type:     [choiceSchema],
      validate: {
        validator: (v: IChoice[]) => v.length >= 2 && v.length <= 6,
        message:   "يجب أن يكون للسؤال بين خيارين وستة خيارات",
      },
    },
    correctAnswer: { type: String, required: true, trim: true },
    points:        { type: Number, default: 1, min: 1, max: 100 },
  },
  { _id: true }
);

// ─── Main schema ──────────────────────────────────────────────────────────────
const assignmentSchema = new Schema<IAssignment>(
  {
    group:  { type: Schema.Types.ObjectId, ref: "Group", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User",  required: true },
    type: {
      type:    String,
      enum:    Object.values(AssignmentType),
      default: AssignmentType.HOMEWORK,
    },
    title: {
      type:      String,
      required:  [true, "عنوان الواجب مطلوب"],
      trim:      true,
      maxlength: [300, "العنوان لا يتجاوز 300 حرف"],
    },
    description: {
      type:      String,
      default:   null,
      trim:      true,
      maxlength: [3000, "الوصف لا يتجاوز 3000 حرف"],
    },
    youtubeUrl:      { type: String, default: null, trim: true },
    dueDate:         { type: Date,   default: null },
    durationMinutes: { type: Number, default: null, min: 1, max: 600 },
    questions:       { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

assignmentSchema.index({ group: 1, createdAt: -1 });
assignmentSchema.index({ author: 1 });

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ??
  mongoose.model<IAssignment>("Assignment", assignmentSchema);

export default Assignment;
