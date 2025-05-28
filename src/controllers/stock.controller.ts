import { Request, Response, NextFunction } from 'express';
import { StockService } from '@/services';
import { ApiResponse, StockBalance, StockGrant, VestingEvent, Transaction } from '@/models';
import logger from '@/logger';

export class StockController {
  constructor(private stockService: StockService) {}

  /**
   * GET /stock/balance
   * Get employee stock balance
   */
  getBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      // For employees, use their own employee ID from the token
      // For admins, allow querying by employeeId parameter
      const employeeId = (req.query.employeeId as string) || req.user.userId;

      const balance: StockBalance = await this.stockService.getStockBalance(employeeId);

      res.status(200).json({
        success: true,
        data: balance,
      } as ApiResponse<StockBalance>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stock/grants
   * Get employee stock grants
   */
  getGrants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      const employeeId = (req.query.employeeId as string) || req.user.userId;
      const grants: StockGrant[] = await this.stockService.getStockGrants(employeeId);

      res.status(200).json({
        success: true,
        data: grants,
      } as ApiResponse<StockGrant[]>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stock/grants/:grantId
   * Get specific stock grant details
   */
  getGrantDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      const { grantId } = req.params;
      const employeeId = req.user.userId;

      const grantDetails = await this.stockService.getStockGrantDetails(grantId, employeeId);

      res.status(200).json({
        success: true,
        data: grantDetails,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stock/vesting
   * Get employee vesting schedule
   */
  getVestingSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      const employeeId = (req.query.employeeId as string) || req.user.userId;
      const vestingEvents: VestingEvent[] = await this.stockService.getVestingSchedule(employeeId);

      res.status(200).json({
        success: true,
        data: vestingEvents,
      } as ApiResponse<VestingEvent[]>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stock/transactions
   * Get employee transaction history
   */
  getTransactionHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      const employeeId = (req.query.employeeId as string) || req.user.userId;
      const transactions: Transaction[] = await this.stockService.getTransactionHistory(employeeId);

      res.status(200).json({
        success: true,
        data: transactions,
      } as ApiResponse<Transaction[]>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stock/dashboard
   * Get stock dashboard summary
   */
  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      const employeeId = req.user.userId;
      const dashboardSummary = await this.stockService.getDashboardSummary(employeeId);

      res.status(200).json({
        success: true,
        data: dashboardSummary,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  };
}
