import { Schema, Types, model } from "mongoose";

export type SubmissionDocument = {
	userId: Types.ObjectId,
	problemId: Types.ObjectId,
	language: "C" | "C++" | "Python",
	code: string,
  verdict: "Accepted" | "Rejected",
  createdAt: Date,
  updatedAt: Date
};

const submissionSchema = new Schema<SubmissionDocument>({
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
	problemId: {
    type: Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default model<SubmissionDocument>("Submission", submissionSchema);