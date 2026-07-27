import { Router } from "express";
import SubmissionController from "../controllers/submissions.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post('/run', authenticate, authorize('user'), SubmissionController.run);

router.post('/submit', authenticate, authorize('user'), SubmissionController.submit);

router.get('/submission/:submissionId', authenticate, authorize('user'), SubmissionController.getSubmission);

router.get('/submissions/:problemName', authenticate, authorize('user'), SubmissionController.getAllSubmissions);

export default router;