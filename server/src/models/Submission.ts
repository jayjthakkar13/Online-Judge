import { Schema, Types, model } from "mongoose";

const submissionSchema = new Schema({
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

export default model("Submission", submissionSchema);

export type SubmissionDocument = {
	userId: Types.ObjectId,
	problemId: Types.ObjectId,
	language: "C" | "C++" | "Python",
	code: string,
  verdict: "Accepted" | "Rejected",
  submittedAt: Date
};