import { spawn } from "child_process";

export default class DockerService {
  public static async createContainer(dirPath: string, memoryLimit: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        "run",
        "-d",
        "--network", "none",
        `--memory=${memoryLimit}m`,
        `--memory-swap=${memoryLimit}m`,
        "--cpus=1.0",
        "--pids-limit=64",
        "-v", `${dirPath}:/sandbox/workspace:rw`,
        "-w", "/sandbox/workspace",
        "oj-runner",
        "tail", "-f", "/dev/null"
      ];
      const child = spawn("docker", args);
      let containerId = "";
      let stderr = "";
      child.stdout.on("data", (data) => {
        containerId += data.toString();
      });
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Failed to create docker container: ${stderr.trim()}`));
        } else {
          resolve(containerId.trim());
        }
      });
      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  public static async exec(containerId: string, command: string, input?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const args = ["exec", "-i", containerId, "sh", "-c", command];
      const child = spawn("docker", args);
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      if (input !== undefined) {
        child.stdin.write(input);
      }
      child.stdin.end();
      child.on("close", (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? -1,
        });
      });
      child.on("error", (err) => {
        resolve({
          stdout: "",
          stderr: err.message,
          exitCode: -1,
        });
      });
    });
  }

  public static async removeContainer(containerId: string): Promise<void> {
    return new Promise((resolve) => {
      const child = spawn("docker", ["rm", "-f", containerId]);
      child.on("close", () => {
        resolve();
      });
      child.on("error", () => {
        resolve();
      });
    });
  }
}