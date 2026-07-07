import { Router } from "express";
import SubmissionController from "../controllers/submissions.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post('/run', authenticate, SubmissionController.run);

router.post('/submit', authenticate, SubmissionController.submit);

router.get('/submission/:submissionId', authenticate, SubmissionController.getSubmission);

router.get('/submissions/:problemName', authenticate, SubmissionController.getAllSubmissions);

export default router;