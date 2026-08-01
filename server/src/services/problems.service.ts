import Problem, { ProblemDocument } from "../models/Problem";
import Test_Case from "../models/Test_Case";

export interface ProblemDoc {
  name: string,
  title: string,
  statement: string,
  inputInfo: string,
  outputInfo: string,
  examples: { input: string, output: string }[],
  timeLimit: number,
  memoryLimit: number,
  constraints: string[]
}

export interface TestCase {
  input: string,
  output: string
}
export default class ProblemService {
  public static async addProblem(problem: ProblemDoc, testCases: TestCase[]) {
    const newProblem = await Problem.insertOne({
      name: problem.name,
      title: problem.title,
      statement: problem.statement,
      input: problem.inputInfo,
      output: problem.outputInfo,
      examples: problem.examples,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      constraints: problem.constraints
    });
    await Test_Case.insertOne({
      problemId: newProblem._id,
      test_cases: testCases
    });
    return { problem, testCases };
  }

  public static async getAllProblems() {
    return await Problem.find().select("name title timeLimit memoryLimit").sort("_id");
  }

  public static async getProblem(name: string, role: string) {
    const problem = await Problem.findOne({ name });
    if (role === 'user') return problem;
    const testCase = await Test_Case.findOne({ problemId: problem!._id });
    return { problem, testCases: testCase!.test_cases };
  }

  public static async updateProblem(problem: ProblemDoc, testCases: TestCase[]) {
    const currProblem = await Problem.findOne({ name: problem.name });
    await Test_Case.updateOne({ problemId: currProblem!._id }, { $set: { test_cases: testCases } });
    await Problem.updateOne({ _id: currProblem!._id }, { $set: problem });
    return this.getAllProblems();
  }

  public static async deleteProblem(name: string) {
    const problem = await Problem.findOne({ name });
    await Test_Case.deleteOne({ problemId: problem!._id });
    await Problem.deleteOne({ _id: problem!._id });
  }
}