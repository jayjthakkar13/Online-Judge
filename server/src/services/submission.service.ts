import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import Submission, { SubmissionDocument } from "../models/Submission";
import Problem, { ProblemDocument } from "../models/Problem";
import Test_Case, { Test_CaseDocument } from "../models/Test_Case";
import DockerService from "./docker.service";

interface NewSubmission {
  problemName: string;
  language: string;
  code: string;
  input: string;
  timeLimit: number;
  memoryLimit: number;
}

interface SubmissionsResponse {
  title: string;
  submissions: SubmissionDocument[];
}

export default class SubmissionService {
  public static async createSubmission (userId: string, submission: NewSubmission, verdict: boolean) {
    const problem: ProblemDocument | null = await Problem.findOne({ name: submission.problemName });
    switch(submission.language) {
      case("cpp"):
        submission.language = "C++";
        break;
      case("c"):
        submission.language = "C";
        break;
      case("py"):
        submission.language = "Python";
        break;
    }
    await Submission.insertOne({
      userId: userId,
      problemId: problem!._id,
      language: submission.language as ("C++" | "C" | "Python"),
      code: submission.code,
      verdict: (verdict ? "Accepted": "Rejected")
    });
  }

  private static createFile (language: string, code: string) {
    const id = v4();
    const dirCodes = path.join(process.cwd(), 'submissions', 'workspace', id);
    const hostPath = path.join(process.env.SUBMISSIONS_PATH!, "workspace", id);
    if (!fs.existsSync(dirCodes)) {
      fs.mkdirSync(dirCodes, { recursive: true });
    }
    const filename = `solution.${language}`;
    const filepath = path.join(dirCodes, filename);
    fs.writeFileSync(filepath, code);
    return { dirCodes, hostPath, filename };
  }

  private static getCompileCommand(language: string, filename: string): string {
    switch (language) {
      case "cpp":
        return `g++ -std=c++17 -O2 ${filename}.cpp -o ${filename}`;
      case "c":
        return `gcc -std=c11 -O2 ${filename}.c -o ${filename}`;
      case "py":
        return ``;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  private static getRunCommand(language: string, filename: string, timeLimit: number): string {
    let baseCmd = "";
    if (language === "cpp" || language === "c") {
      baseCmd = `./${filename}`;
    } else if (language === "py") {
      baseCmd = `python3 ${filename}.py`;
    }
    return `timeout ${timeLimit}s ${baseCmd}`;
  }

  public static async run(submission: NewSubmission) {
    let { dirCodes, hostPath, filename } = this.createFile(submission.language, submission.code);
    filename = filename.split('.')[0]!;
    const containerId = await DockerService.createContainer(hostPath, submission.memoryLimit);
    try {
      const compileCommand = this.getCompileCommand(submission.language, filename);
      if (compileCommand) {
        const compileResult = await DockerService.exec(containerId, compileCommand);
        if (compileResult.exitCode !== 0) {
          return {
            data: compileResult.stderr.trim() || "Compilation Error",
            verdict: false
          }
        }
      }
      const inputPath = path.join(dirCodes, "input.txt");
      fs.writeFileSync(inputPath, submission.input);
      
      const runCommand = this.getRunCommand(submission.language, filename, submission.timeLimit);
      const runResult = await DockerService.exec(containerId, runCommand, submission.input);
      const actualOutput = runResult.stdout.trim();
      const errorOutput = runResult.stderr.trim();
      if (runResult.exitCode === 124) {
        return {
          data: "Time Limit Exceeded",
          verdict: false
        };
      } else if (runResult.exitCode === 139) {
        return {
          data: "Segmentation Fault: Your program tried to access restricted memory.",
          verdict: false
        };
      } else if (runResult.exitCode !== 0) {
        const errorMessage = errorOutput || actualOutput || `Process exited with code ${runResult.exitCode}`;
        return { data: errorMessage, verdict: false };
      }
      return {
        data: runResult.stdout.trim(),
        verdict: true
      };
    } catch (error: any) {
      return {
        data: error.message || "Execution error",
        verdict: false
      };
    } finally {
      await DockerService.removeContainer(containerId);
      fs.rmSync(dirCodes, { recursive: true, force: true });
    }
  }

  public static async submit (userId: string, name: string, code: string, language: "C++" | "C" | "Python", timeLimit: number, memoryLimit: number) {
    const problem = await Problem.findOne({ name });
    const testcases: Test_CaseDocument | null = await Test_Case.findOne({ problemId: problem!._id });
    const submission: NewSubmission = {
      problemName: name,
      code: code,
      language: language,
      input: "",
      timeLimit: timeLimit,
      memoryLimit: memoryLimit
    }
    let { dirCodes, hostPath, filename } = this.createFile(language, code);
    filename = filename.split('.')[0]!;
    const containerId = await DockerService.createContainer(hostPath, memoryLimit);
    try {
      const compileCmd = this.getCompileCommand(language, filename);
      if (compileCmd) {
        const compileResult = await DockerService.exec(containerId, compileCmd);
        if (compileResult.exitCode !== 0) {
          await this.createSubmission(userId, submission, false);
          return { data: compileResult.stderr.trim() || "Compilation Error", verdict: false };
        }
      }
      for (const testcase of testcases!.test_cases) {
        const inputPath = path.join(dirCodes, "input.txt");
        fs.writeFileSync(inputPath, testcase.input);
        const runCmd = this.getRunCommand(language, filename, timeLimit);
        const runResult = await DockerService.exec(containerId, runCmd, testcase.input);
        const actualOutput = runResult.stdout.trim();
        const expectedOutput = testcase.output.trim();
        if (runResult.exitCode === 124) {
          await this.createSubmission(userId, submission, false);
          return { data: "Time Limit Exceeded", verdict: false };
        } else if (runResult.exitCode === 139) {
          await this.createSubmission(userId, submission, false);
          return { data: "Segmentation Fault", verdict: false };
        } else if (runResult.exitCode !== 0 || actualOutput !== expectedOutput) {
          await this.createSubmission(userId, submission, false);
          return { data: runResult.stderr.trim() || actualOutput, verdict: false };
        }
      }
      await this.createSubmission(userId, submission, true);
      return { data: "", verdict: true };
    } catch (error: any) {
      await this.createSubmission(userId, submission, false);
      return {
        data: error.message || "Execution error",
        verdict: false
      };
    } finally {
      await DockerService.removeContainer(containerId);
      fs.rmSync(dirCodes, { recursive: true, force: true });
    }
  }

  public static async getSubmission(submissionId: string): Promise<SubmissionDocument | null> {
    const submission = await Submission.findById(submissionId);
    return submission;
  }

  public static async getSubmissionsForUser(name: string, userId: string): Promise<SubmissionsResponse | null> {
    const problem = await Problem.findOne({ name });
    if (problem === null) {
      return { title: "NA", submissions: [] };
    }
    const problemId = problem._id;
    const title = problem.title;
    const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
    return { title, submissions };
  }
}