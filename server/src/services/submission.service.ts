import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import { exec } from "child_process";
import Submission, { SubmissionDocument } from "../models/Submission";
import { promisify } from "util";
import { Types } from "mongoose";

interface NewSubmission {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  language: "C" | "C++" | "Python";
  code: string;
}

export default class SubmissionService {
  public static async createSubmission (submission: NewSubmission, verdict: boolean) {
    await Submission.insertOne({
      userId: submission.userId,
      problemId: submission.problemId,
      language: submission.language,
      code: submission.code,
      verdict: (verdict ? "Accepted": "Rejected")
    });
  }

  private static createFile (language: string, code: string) {
    const dirCodes = path.join(__dirname, '../', 'submissions', 'codes', language);
    if (!fs.existsSync(dirCodes)) {
      fs.mkdirSync(dirCodes, { recursive: true });
    }
    const id = v4();
    const filename = `${id}.${language}`;
    const filepath = path.join(dirCodes, filename);
    fs.writeFileSync(filepath, code);
    return filepath;
  }

  private static async executeFile (filepath: string) {
    const language = path.basename(filepath).split(".")[1]!;
    let cmd = `python ${filepath}`;
    if (language !== 'py') {
      const dirOutputs = path.join(__dirname, '../', 'submissions', 'outputs', language);
      if (!fs.existsSync(dirOutputs)) {
        fs.mkdirSync(dirOutputs, { recursive: true });
      }
      const id = path.basename(filepath).split(".")[0];
      const outfile = `${id}.exe`;
      const outpath = path.join(dirOutputs, outfile);
      cmd = (language === 'cpp' ? 'g++': 'gcc');
      cmd += ` "${filepath}" -o "${outpath}" && cd "${dirOutputs}" && "./${outfile}"`;
    }
    
    const { stdout, stderr } = await promisify(exec)(cmd);
    if (stderr) {
      throw new Error(stderr);
    }
    return { data: stdout, verdict: true };
  }

  public static async addSubmission (submission: NewSubmission) {
    const filepath = this.createFile(submission.language, submission.code);
    const output = await this.executeFile(filepath);
    return output;
  }

  public static async getSubmission(submissionId: string): Promise<SubmissionDocument | null> {
    const submission = await Submission.findById(submissionId);
    return submission;
  }

  public static async getSubmissionsForUser(userId: string): Promise<SubmissionDocument[] | null> {
    const submissions = await Submission.find({ userId });
    return submissions;
  }
}