import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAnswer {
  questionId: string;   // question _id from Assignment
  chosen:     string;   // the choice id the student selected
}

export interface IExamSubmission extends Document {
  _id:        mongoose.Types.ObjectId;
  assignment: mongoose.Types.ObjectId;
  student:    mongoose.Types.ObjectId;
  group:      mongoose.Types.ObjectId;
  answers:    IAnswer[];
  score:      number;          // auto-calculated on submit
  total:      number;          // maximum possible points
  submittedAt: Date;
  createdAt:  Date;
  updatedAt:  Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: String, required: true },
    chosen:     { type: String, required: true },
  },
  { _id: false }
);

const examSubmissionSchema = new Schema<IExamSubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    student:    { type: Schema.Types.ObjectId, ref: "User",       required: true },
    group:      { type: Schema.Types.ObjectId, ref: "Group",      required: true },
    answers:    { type: [answerSchema], default: [] },
    score:      { type: Number, default: 0, min: 0 },
    total:      { type: Number, default: 0, min: 0 },
    submittedAt:{ type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One submission per student per assignment
examSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
examSubmissionSchema.index({ assignment: 1 });
examSubmissionSchema.index({ student: 1 });

export const ExamSubmission: Model<IExamSubmission> =
  mongoose.models.ExamSubmission ??
  mongoose.model<IExamSubmission>("ExamSubmission", examSubmissionSchema);

export default ExamSubmission;
