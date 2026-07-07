import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import { exec, spawn } from "child_process";
import Submission, { SubmissionDocument } from "../models/Submission";
import { promisify } from "util";
import Problem, { ProblemDocument } from "../models/Problem";
import Test_Case, { Test_CaseDocument } from "../models/Test_Case";

interface NewSubmission {
  problemName: string;
  language: "C" | "C++" | "Python";
  code: string;
  input: string;
}

interface SubmissionsResponse {
  title: string;
  submissions: SubmissionDocument[];
}

export default class SubmissionService {
  public static async createSubmission (userId: string, submission: NewSubmission, verdict: boolean) {
    const problem: ProblemDocument | null = await Problem.findOne({ name: submission.problemName });
    await Submission.insertOne({
      userId: userId,
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

  private static executeCommand(command: string, args: string[], input: string, cwd?: string): Promise<{ data: string; verdict: boolean }> {
    return new Promise((resolve) => {
      const process = spawn(command, args, { cwd });
      let stdout = "";
      let stderr = "";
      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      process.stdin.write(input);
      process.stdin.end();
      process.on("close", (code) => {
        if (code === 0) {
          resolve({
            data: stdout,
            verdict: true,
          });
        } else {
          resolve({
            data: stderr || stdout,
            verdict: false,
          });
        }
      });

      process.on("error", (err) => {
        resolve({
          data: err.message,
          verdict: false,
        });
      });
    });
  }

  private static async executeFile (filepath: string, input: string) {
    const language = path.basename(filepath).split(".")[1]!;
    if (language === 'py') {
      return await this.executeCommand("python", [filepath], input);
    }
    const dirOutputs = path.join(__dirname, '../', 'submissions', 'outputs', language);
    if (!fs.existsSync(dirOutputs)) {
      fs.mkdirSync(dirOutputs, { recursive: true });
    }
    const id = path.basename(filepath).split(".")[0];
    const outfile = `${id}.exe`;
    const outpath = path.join(dirOutputs, outfile);
    
    const compiler = (language === 'cpp' ? 'g++': 'gcc');
    let cmd = `${compiler} "${filepath}" -o "${outpath}"`;
    const compile = await promisify(exec)(cmd).catch((err) => err);

    if (compile.stderr) {
      return { data: compile.stderr, verdict: false };
    }

    return await this.executeCommand(outpath, [], input, dirOutputs);
  }

  public static async run (submission: NewSubmission) {
    const filepath = this.createFile(submission.language, submission.code);
    const output = await this.executeFile(filepath, submission.input);
    return output;
  }

  public static async submit (userId: string, name: string, code: string, language: "C++" | "C" | "Python") {
    const problem = await Problem.findOne({ name });
    const testcases: Test_CaseDocument | null = await Test_Case.findOne({ problemId: problem!._id });
    const submission: NewSubmission = {
      problemName: name,
      code: code,
      language: language,
      input: ""
    }
    const filepath = this.createFile(submission.language, submission.code);
    for (const testcase of testcases!.test_cases) {
      const { data, verdict } = await this.executeFile(filepath, testcase.input);
      if (!verdict) {
        await this.createSubmission(userId, submission, false);
        return { data, verdict };
      }
      if (data !== testcase.output) {
        await this.createSubmission(userId, submission, false);
        return { data, verdict };
      }
    }
    await this.createSubmission(userId, submission, true);
    return {
      data: "",
      verdict: true
    }
  }

  public static async getSubmission(submissionId: string): Promise<SubmissionDocument | null> {
    const submission = await Submission.findById(submissionId);
    return submission;
  }

  public static async getSubmissionsForUser(name: string, userId: string): Promise<SubmissionsResponse | null> {
    const problem = await Problem.findOne({ name });
    const problemId = problem!._id;
    const title = problem!.title;
    const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
    return { title, submissions };
  }
}