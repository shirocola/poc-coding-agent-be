import express, { Router } from 'express';
import { StockController } from '../controllers';
import { authenticateToken } from '../middlewares/auth.middleware';
import { StockService } from '../services';
import { StockRepository } from '../repositories';

// Initialize controllers
const stockRepository = new StockRepository();
const stockService = new StockService(stockRepository);
const stockController = new StockController(stockService);
const router: Router = express.Router();

// Apply authentication middleware to all stock routes
router.use(authenticateToken);

/**
 * @swagger
 * /stock/dashboard:
 *   get:
 *     summary: Get stock dashboard summary
 *     description: Returns a summary of user's stock information for dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/dashboard', stockController.getDashboard);

/**
 * @swagger
 * /stock/balance:
 *   get:
 *     summary: Get stock balance
 *     description: Returns the user's current stock balance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Optional employee ID (for admins)
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/balance', stockController.getBalance);

/**
 * @swagger
 * /stock/grants:
 *   get:
 *     summary: Get stock grants
 *     description: Returns the user's stock grants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Optional employee ID (for admins)
 *     responses:
 *       200:
 *         description: Grants retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/grants', stockController.getGrants);

/**
 * @swagger
 * /stock/grants/{grantId}:
 *   get:
 *     summary: Get specific grant details
 *     description: Returns detailed information for a specific grant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the grant
 *     responses:
 *       200:
 *         description: Grant details retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Grant not found
 */
router.get('/grants/:grantId', stockController.getGrantDetails);

/**
 * @swagger
 * /stock/vesting:
 *   get:
 *     summary: Get vesting schedule
 *     description: Returns the user's vesting schedule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Optional employee ID (for admins)
 *     responses:
 *       200:
 *         description: Vesting schedule retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/vesting', stockController.getVestingSchedule);

/**
 * @swagger
 * /stock/transactions:
 *   get:
 *     summary: Get transaction history
 *     description: Returns the user's stock transaction history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Optional employee ID (for admins)
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/transactions', stockController.getTransactionHistory);

export default router;
