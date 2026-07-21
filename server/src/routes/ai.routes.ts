import { Router } from "express";
import AIController from "../controllers/ai.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post('/ai-review', authenticate, AIController.review);

export default router;