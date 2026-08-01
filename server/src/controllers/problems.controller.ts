import { Request, Response } from "express";
import { ContentTypes, GetResponseData, ResponseData, SendResponse } from "../utils";
import ProblemService, { ProblemDoc } from "../services/problems.service";

export default class ProblemsController {
  static async addProblem(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(500, ContentTypes.Json, { message: "Internal server error" });
    const { problem, testCases } = req.body;
    try {
      await ProblemService.addProblem(problem, testCases);
      data.statusCode = 201;
      data.response = problem;
    } catch (err: any) {
      data.response = err;
    } finally { SendResponse(res, data); }
  }

  static async getProblemSet(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(400, ContentTypes.Json, { error: "Bad Request" });

		try {
			const problemset = await ProblemService.getAllProblems();
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
    const data: ResponseData = GetResponseData(404, ContentTypes.Json, { message: "Invalid name of problem" });

		try {
			const name: string = req.params.problemName;

			if (name) {
				const newData = await ProblemService.getProblem(name, req.user.role);
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
    const { problem, testCases } = req.body;
    try {
      data.response = await ProblemService.updateProblem(problem, testCases);
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