import { Router } from 'express';
import { CdsEvaluationController } from '../controllers/cds-evaluation.controller';

const router = Router();

router.get('/criteria', CdsEvaluationController.getCriteria);
router.get('/periods', CdsEvaluationController.getPeriods);
router.post('/periods', CdsEvaluationController.createPeriod);
router.get('/dashboard', CdsEvaluationController.getDashboardStats);
router.get('/', CdsEvaluationController.getMyEvaluations);
router.get('/:id', CdsEvaluationController.getEvaluationById);
router.post('/', CdsEvaluationController.createEvaluation);
router.put('/:id', CdsEvaluationController.updateEvaluation);
router.delete('/:id', CdsEvaluationController.deleteEvaluation);

export default router;
