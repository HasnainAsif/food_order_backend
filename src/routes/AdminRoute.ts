import express, { Request, Response, NextFunction } from 'express';
import { Createvendor, GetvendorById, Getvendors } from '../controllers';

const router = express.Router();

router.post('/vendor', Createvendor);
router.get('/vendor', Getvendors);
router.get('/vendor/:id', GetvendorById);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: 'Hello from Admin...' });
});

export { router as AdminRoute };
