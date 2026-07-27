import { Router } from "express";
import ProblemsController from "../controllers/problems.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post('/create', authenticate, authorize('admin'), ProblemsController.addProblem);

router.get('/problemset', authenticate, authorize('user', 'admin'), ProblemsController.getProblemSet);

router.get('/problem/:problemName', authenticate, authorize('user'), ProblemsController.getProblem);

router.put('/:problemName', authenticate, authorize('admin'), ProblemsController.updateProblem);

router.delete('/:problemName', authenticate, authorize('admin'), ProblemsController.deleteProblem);

export default router;