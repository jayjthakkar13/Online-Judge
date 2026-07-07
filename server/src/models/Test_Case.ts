import { Schema, Types, model } from "mongoose";

const test_caseSchema = new Schema({
	problemId: {
    type: Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  test_cases: [
    {
      input: {
        type: String,
        required: true
      },
      output: {
        type: String,
        required: true
      }
    }
  ]
});

export default model("Test_Case", test_caseSchema);

export type Test_CaseDocument = {
  problemId: Types.ObjectId,
	test_cases: {input: string, output: string}[]
};