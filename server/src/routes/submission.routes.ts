import { Router } from "express";
import SubmissionController from "../controllers/submissions.controller";

const router = Router();

router.post('/submit', SubmissionController.submit);

router.get('/submission/:submissionId', SubmissionController.getSubmission);

router.get('/submissions/:userId', SubmissionController.getAllSubmissions);

export default router;