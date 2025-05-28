import express, { Router } from 'express';
import authRoutes from './auth.routes';
import stockRoutes from './stock.routes';

const router: Router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is up and running
 */

// API Routes
router.use('/auth', authRoutes);
router.use('/stock', stockRoutes);

// Root endpoint
router.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    message: 'Employee Stock Dashboard API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

export default router;
