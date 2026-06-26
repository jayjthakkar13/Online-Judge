import { Schema, Types, model } from "mongoose";

const problemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
	statement: {
    type: String,
    required: true
  }
});

problemSchema.index({ name: 1 }, { unique: true });

export default model("Problem", problemSchema);

export type ProblemDocument = {
	_id: Types.ObjectId,
	name: string,
	statement: string
};