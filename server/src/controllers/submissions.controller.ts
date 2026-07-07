import { Request, Response } from "express";
import { ContentTypes, GetResponseData, ResponseData, SendResponse } from "../utils";
import SubmissionService from "../services/submission.service";

export default class SubmissionController {
  static async run(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(400, ContentTypes.Json, { error: "Bad Request" });
    let output;
    const userEmail = req.user.email;
    const { problemName, language, code, input } = req.body;
    const submission = { userEmail, problemName, language, code, input };
    try {
      output = await SubmissionService.run(submission);
      data.statusCode = 200;
    } catch (err: any) {
      output = {
        data: err.stderr ?? err.stdout ?? err.message,
        verdict: false
      }
    } finally {
      data.response = output;
      SendResponse(res, data);
    }
  }

  static async submit (req: Request, res: Response) {
    const data: ResponseData = GetResponseData(201, ContentTypes.Json, { message: "Created submission" });

    const { name, code, language } = req.body;
    const userId = req.user._id;
    try {
      const output = await SubmissionService.submit(userId, name, code, language);
      data.response = output;
    } catch (err) {
      console.log(err);
      data.statusCode = 500;
      data.response = { error: "Internal Server Error" };
    } finally { SendResponse(res, data); }
  }

  static async getSubmission(req: Request<{ submissionId: string }>, res: Response) {
    const data: ResponseData = GetResponseData(400, ContentTypes.Json, { error: "Bad Request" });

    try {
      const submission = await SubmissionService.getSubmission(req.params.submissionId ?? '');
      if (!submission) {
        Object.assign(data, GetResponseData(404, ContentTypes.Json, { error: "Invalid submission ID" }));
      } else {
        Object.assign(data, GetResponseData(200, ContentTypes.Json, submission));
      }
    } catch (err) {
      Object.assign(
        data,
        GetResponseData(500, ContentTypes.Json, { message: "Internal Server Error", error: err }
      ));
    } finally { SendResponse(res, data); }
  }

  static async getAllSubmissions(req: Request<{ problemName: string }>, res: Response) {
    const data: ResponseData = GetResponseData(404, ContentTypes.Text, "Invalid user");

    try {
      const problemName = req.params.problemName;
      const userId = req.user._id;
      const newData = await SubmissionService.getSubmissionsForUser(problemName, userId);
      Object.assign(data, GetResponseData(200, ContentTypes.Json, newData));
    } catch (err) {
      console.error("Failed to fetch submissions", err);
      Object.assign(
        data,
        GetResponseData(500, ContentTypes.Json, { message: "Internal Server Error", error: err }
      ));
    } finally { SendResponse(res, data); }
  }
};