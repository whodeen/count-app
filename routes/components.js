import express from 'express';
import { createComponent, getComputerComponents, getAllComponents, getComponentsByType, addComponentToComputer, deleteComponent } from '../contollers/components.js';

const router = express.Router();

router.get('/', getAllComponents);
router.get('/:type', getComponentsByType);
router.get('/:id', getComputerComponents);
router.post('/create', createComponent);
router.post('/:id', addComponentToComputer)
router.delete('/delete', deleteComponent);

// module.exports = router;
export default router;