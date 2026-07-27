import Problem, { ProblemDocument } from "../models/Problem";


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
export default class ProblemService {
  public static async addProblem(problem: ProblemDoc): Promise<ProblemDoc> {
    await Problem.insertOne({
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
    return problem;
  }

  public static async getAllProblems(role: string): Promise<ProblemDocument[]> {
    if (role === 'user') {
      return await Problem.find().select("name title");
    }
    return await Problem.find();
  }

  public static async getProblem(name: string) {
    const problem = await Problem.findOne({ name });
    return problem;
  }

  public static async updateProblem(problem: ProblemDoc) {
    await Problem.updateOne({ name: problem.name }, { $set: problem });
    return this.getAllProblems('admin');
  }

  public static async deleteProblem(name: string) {
    await Problem.deleteOne({ name });
  }
}