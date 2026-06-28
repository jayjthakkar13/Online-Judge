import { ContentTypes, GetResponseData, ResponseData } from "../utils";
import Problem, { ProblemDocument } from "../models/Problem";

export default class ProblemService {
  public static async getAllProblems(): Promise<ProblemDocument[]> {
    const problemset = await Problem.find();
    return problemset;
  }

  public static async getProblem(name: string) {
    const problem = await Problem.find({ name });
    return problem;
  }
}