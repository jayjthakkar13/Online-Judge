import { GoogleGenerativeAI } from "@google/generative-ai";
import Problem, { ProblemDocument } from "../models/Problem";

export default class AIService {
  public static async review (code: string, name: string) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const problem: ProblemDocument | null = await Problem.findOne({ name });
      const prompt = this.generatePrompt(problem!, code);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return { status: 200, responseText };
    } catch (err: any) {
      console.log(err);
      if (err.message?.includes("429")) {
        return {
          status: 429,
          message: "Gemini API quota exceeded. Please wait and try again."
        };
      }
      return {
        status: 500,
        message: "Internal Server Error"
      }
    }
  }

  private static generatePrompt(problem: ProblemDocument, userCode: string): string {
    return `You are a strict, ultra-concise competitive programming code reviewer. Review the provided code against the problem context. 

### CONTEXT DATA
[PROBLEM]
Title: ${problem.title}
Statement:
${problem.statement.trim()}
[/PROBLEM]

[CODE]
${userCode.trim()}
[/CODE]

### OUTPUT CONSTRAINTS
- Return ONLY clean Markdown. 
- Be incredibly direct. Skip all pleasantries ("Sure, I can help", "Here is your review").
- Limit feedback to a maximum of 3 highly technical bullet points.
- Provide a maximum of one code snippet (max 10 lines) showing the exact optimization. Do NOT rewrite the full program.

### FORMAT
#### ✨ AI Quick Verdict
- **Complexity:** State Time: O(N) | Space: O(N) style.

- **Status:** [Passes Constraints] OR [Risk of Time Limit Exceeded/Memory Limit Exceeded/Wrong Answer] with a 1-sentence explanation why.

#### 🐜 Critical Fixes
* **Issue Type**: Max 2 sentences detailing a bug, edge case failure, or language anti-pattern.

* **Optimization**: Max 2 sentences detailing how to improve runtime/memory.

#### 💡 Suggested Fix
\`\`\``;
  }
}