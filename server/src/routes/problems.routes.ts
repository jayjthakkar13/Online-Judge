import { Router } from "express";
import ProblemsController from "../controllers/problems.controller";

const router = Router();

router.get('/problemset', ProblemsController.getProblemSet);

router.get('/problem/:problemName', ProblemsController.getProblem);

export default router;