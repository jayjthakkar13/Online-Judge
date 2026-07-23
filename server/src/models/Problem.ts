import { HydratedDocument, InferSchemaType, Schema, Types, model } from "mongoose";

const problemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
	statement: {
    type: String,
    required: true
  },
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  examples: {
    type: [
      {
        input: String,
        output: String
      }
    ],
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  memoryLimit: {
    type: Number,
    required: true
  },
  constraints: {
    type: [String],
    required: true
  }
});

problemSchema.index({ name: 1 }, { unique: true });

export default model("Problem", problemSchema);

export type ProblemDocument = HydratedDocument<InferSchemaType<typeof problemSchema>>;