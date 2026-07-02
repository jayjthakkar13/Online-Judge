import { Request, Response } from "express";
import { ContentTypes, GetResponseData, ResponseData, SendResponse } from "../utils";
import SubmissionService from "../services/submission.service";

export default class SubmissionController {
  static async submit(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(400, ContentTypes.Json, { error: "Bad Request" });
    let output;
    const submission = req.body;
    try {
      output = await SubmissionService.addSubmission(submission);
      data.statusCode = 200;
    } catch (err: any) {
      output = {
        data: err.stderr ?? err.stdout ?? err.message,
        verdict: false
      }
    } finally {
      data.response = output;
      await SubmissionService.createSubmission(submission, output!.verdict);
      SendResponse(res, data);
    }
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

  static async getAllSubmissions(req: Request<{ userId: string }>, res: Response) {
    const data: ResponseData = GetResponseData(404, ContentTypes.Text, "Invalid user");

    try {
      const userId: string = req.params.userId;

      if (userId) {
        const newData = await SubmissionService.getSubmissionsForUser(userId);
        Object.assign(data, GetResponseData(200, ContentTypes.Json, newData));
      }
    } catch (err) {
      console.error("Failed to fetch submissions", err);
      Object.assign(
        data,
        GetResponseData(500, ContentTypes.Json, { message: "Internal Server Error", error: err }
      ));
    } finally { SendResponse(res, data); }
  }
};