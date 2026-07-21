import { Request, Response } from "express";
import AIService from "../services/ai.service";
import { ContentTypes, GetResponseData, ResponseData, SendResponse } from "../utils";

export default class AIController {
  static async review(req: Request, res: Response) {
    const data: ResponseData = GetResponseData(400, ContentTypes.Json, { error: "Failed to fetch review" });
    try {
      const { code, name } = req.body;
      const review = await AIService.review(code, name);
      data.statusCode = review.status;
      if (data.statusCode !== 200) {
        data.response = { response: review.message };
      } else {
        data.response = { response: review.responseText };
      }
    } catch (err) {
      data.statusCode = 500;
      data.contentType = ContentTypes.Json;
      data.response = { error: "Internal Server Error" };
    } finally { SendResponse(res, data); }
  }
};