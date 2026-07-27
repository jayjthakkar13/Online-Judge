import { Router } from "express";
import AIController from "../controllers/ai.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post('/ai-review', authenticate, authorize('user'), AIController.review);

export default router;