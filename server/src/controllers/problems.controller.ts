import { Request, Response } from "express";
import { ContentTypes, GetResponseData, ResponseData, SendResponse } from "../utils";
import ProblemService, { ProblemDoc } from "../services/problems.service";

export default class ProblemsController {
  static async addProblem(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(500, ContentTypes.Json, { message: "Internal server error" });
    const { name, title, statement, inputInfo, outputInfo, examples, timeLimit, memoryLimit, constraints } = req.body;
    const problem: ProblemDoc = { name, title, statement, inputInfo, outputInfo, examples, timeLimit, memoryLimit, constraints };
    try {
      await ProblemService.addProblem(problem);
      data.statusCode = 201;
      data.response = problem;
    } catch (err: any) {
      data.response = err;
    } finally { SendResponse(res, data); }
  }

  static async getProblemSet(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(400, ContentTypes.Json, { error: "Bad Request" });

		try {
			const problemset = await ProblemService.getAllProblems(req.user.role);
      Object.assign(data, GetResponseData(200, ContentTypes.Json, problemset));
		} catch (err) {
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = {
				message: "Internal Server Error",
				error: err
			};
		} finally { SendResponse(res, data); }
  }

  static async getProblem(req: Request<{ problemName: string }>, res: Response) {
    const notFound = {
      name: "NA",
      title: "NA",
      statement: "NA",
      input: "NA",
      output: "NA",
      examples: Array<{ input: "NA", output: "NA"}>,
      timeLimit: 0,
      memoryLimit: 0,
      constraints: []
    }
    const data: ResponseData = GetResponseData(404, ContentTypes.Json, { message: "Invalid name of problem" });

		try {
			const name: string = req.params.problemName;

			if (name) {
				const newData = await ProblemService.getProblem(name);
        if (newData) {
          Object.assign(data, GetResponseData(200, ContentTypes.Json, newData));
        }
			}
		} catch (err) {
			console.error("Failed to fetch the problem", err);
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = { message: "Internal Server Error" };
		} finally { SendResponse(res, data); }
  }

  static async updateProblem(req: Request<{ problemName: string }>, res: Response) {
    const data: ResponseData = GetResponseData(500, ContentTypes.Json, { message: "Internal server error" } );
    const name = req.params.problemName;
    const { title, statement, inputInfo, outputInfo, examples, timeLimit, memoryLimit, constraints } = req.body;
    const problem = { name, title, statement, inputInfo, outputInfo, examples, timeLimit, memoryLimit, constraints };
    try {
      data.response = await ProblemService.updateProblem(problem);
      data.statusCode = 200;
    } catch (err: any) {
      data.response.message = "Failed to update the problem.";
    } finally { SendResponse(res, data) }
  }

  static async deleteProblem(req: Request<{ problemName: string }>, res: Response) {
    const data: ResponseData = GetResponseData(500, ContentTypes.Json, { message: "Internal server error" } );
    const name: string = req.params.problemName;
    try {
      await ProblemService.deleteProblem(name);
      data.statusCode = 200;
      data.response.message = "Deleted successfully.";
    } catch (err: any) {
      data.response.message = "Failed to delete."
    } finally { SendResponse(res, data); }
  }
};