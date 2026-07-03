import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import { exec } from "child_process";
import Submission, { SubmissionDocument } from "../models/Submission";
import { promisify } from "util";
import User from "../models/User";
import Problem from "../models/Problem";

interface NewSubmission {
  userEmail: string;
  problemName: string;
  language: "C" | "C++" | "Python";
  code: string;
}

export default class SubmissionService {
  public static async createSubmission (submission: NewSubmission, verdict: boolean) {
    const user = await User.findOne({ email: submission.userEmail });
    const problem = await Problem.findOne({ name: submission.problemName });
    await Submission.insertOne({
      userId: user!._id,
      problemId: problem!._id,
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
    
    try {
      const { stdout, stderr } = await promisify(exec)(cmd);
      if (stderr && !stdout) {
        return { data: stderr, verdict: false };
      }

      return { data: stdout || stderr, verdict: true };
    } catch (err: any) {
      return {
        data: err.stderr || err.message,
        verdict: false
      };
    }
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