import Problem, { ProblemDocument } from "../models/Problem";

export default class ProblemService {
  public static async getAllProblems(): Promise<ProblemDocument[]> {
    const problemset = await Problem.find().select("name title");
    return problemset;
  }

  public static async getProblem(name: string) {
    const problem = await Problem.findOne({ name });
    return problem;
  }
}