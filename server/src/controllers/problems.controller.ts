import { Request, Response } from "express";
import { ContentTypes, GetResponseData, ResponseData, SendResponse } from "../utils";
import ProblemService from "../services/problems.service";

export default class ProblemsController {
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
    const data: ResponseData = GetResponseData(404, ContentTypes.Text, "Invalid name of problem");

		try {
			const name: string = req.params.problemName;

			if (name) {
				const newData = await ProblemService.getProblem(name);
        Object.assign(data, GetResponseData(200, ContentTypes.Json, newData));
			}
		} catch (err) {
			console.error("Failed to fetch the problem", err);
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = { message: "Internal Server Error" };
		} finally { SendResponse(res, data); }
  }
};