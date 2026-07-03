import { Router } from "express";
import SubmissionController from "../controllers/submissions.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post('/submit', authenticate, SubmissionController.submit);

router.get('/submission/:submissionId', authenticate, SubmissionController.getSubmission);

router.get('/submissions/:userId', authenticate, SubmissionController.getAllSubmissions);

export default router;