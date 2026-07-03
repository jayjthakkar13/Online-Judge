import { Router } from "express";
import ProblemsController from "../controllers/problems.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.get('/problemset', authenticate, ProblemsController.getProblemSet);

router.get('/problem/:problemName', authenticate, ProblemsController.getProblem);

export default router;