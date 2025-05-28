import { StockRepository } from '@/repositories';
import {
  StockBalance,
  StockGrant,
  VestingEvent,
  Transaction,
  VestingSchedule,
  ApiError,
} from '@/models';
import logger from '@/logger';

export class StockService {
  constructor(private stockRepository: StockRepository) {}

  /**
   * Get employee stock balance
   */
  async getStockBalance(employeeId: string): Promise<StockBalance> {
    try {
      const balance = await this.stockRepository.calculateStockBalance(employeeId);

      logger.info('Stock balance retrieved', {
        employeeId,
        totalGranted: balance.totalGranted,
        totalVested: balance.totalVested,
        availableToExercise: balance.availableToExercise,
      });

      return balance;
    } catch (error) {
      logger.error('Failed to get stock balance', {
        employeeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(500, 'Failed to retrieve stock balance');
    }
  }

  /**
   * Get employee stock grants
   */
  async getStockGrants(employeeId: string): Promise<StockGrant[]> {
    try {
      const grants = await this.stockRepository.findGrantsByEmployeeId(employeeId);

      logger.info('Stock grants retrieved', {
        employeeId,
        grantsCount: grants.length,
      });

      return grants;
    } catch (error) {
      logger.error('Failed to get stock grants', {
        employeeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(500, 'Failed to retrieve stock grants');
    }
  }

  /**
   * Get vesting schedule for employee
   */
  async getVestingSchedule(employeeId: string): Promise<VestingEvent[]> {
    try {
      const vestingEvents = await this.stockRepository.findVestingEventsByEmployeeId(employeeId);

      // Sort by vesting date
      vestingEvents.sort((a, b) => a.vestingDate.getTime() - b.vestingDate.getTime());

      logger.info('Vesting schedule retrieved', {
        employeeId,
        eventsCount: vestingEvents.length,
      });

      return vestingEvents;
    } catch (error) {
      logger.error('Failed to get vesting schedule', {
        employeeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(500, 'Failed to retrieve vesting schedule');
    }
  }

  /**
   * Get transaction history for employee
   */
  async getTransactionHistory(employeeId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.stockRepository.findTransactionsByEmployeeId(employeeId);

      // Sort by transaction date (most recent first)
      transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());

      logger.info('Transaction history retrieved', {
        employeeId,
        transactionsCount: transactions.length,
      });

      return transactions;
    } catch (error) {
      logger.error('Failed to get transaction history', {
        employeeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(500, 'Failed to retrieve transaction history');
    }
  }

  /**
   * Get specific stock grant details
   */
  async getStockGrantDetails(
    grantId: string,
    employeeId: string
  ): Promise<{
    grant: StockGrant;
    vestingEvents: VestingEvent[];
    vestingSchedule: VestingSchedule | null;
  }> {
    try {
      const grant = await this.stockRepository.findGrantById(grantId);
      if (!grant) {
        throw new ApiError(404, 'Stock grant not found');
      }

      // Verify the grant belongs to the employee
      if (grant.employeeId !== employeeId) {
        throw new ApiError(403, 'Access denied to this stock grant');
      }

      const vestingEvents = await this.stockRepository.findVestingEventsByGrantId(grantId);
      const vestingSchedule = await this.stockRepository.findVestingScheduleById(
        grant.vestingScheduleId
      );

      logger.info('Stock grant details retrieved', {
        grantId,
        employeeId,
        vestingEventsCount: vestingEvents.length,
      });

      return {
        grant,
        vestingEvents: vestingEvents.sort(
          (a, b) => a.vestingDate.getTime() - b.vestingDate.getTime()
        ),
        vestingSchedule,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Failed to get stock grant details', {
        grantId,
        employeeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(500, 'Failed to retrieve stock grant details');
    }
  }

  /**
   * Get stock dashboard summary
   */
  async getDashboardSummary(employeeId: string): Promise<{
    balance: StockBalance;
    recentTransactions: Transaction[];
    upcomingVesting: VestingEvent[];
    grantsCount: number;
  }> {
    try {
      const [balance, allTransactions, vestingEvents, grants] = await Promise.all([
        this.getStockBalance(employeeId),
        this.getTransactionHistory(employeeId),
        this.getVestingSchedule(employeeId),
        this.getStockGrants(employeeId),
      ]);

      // Get recent transactions (last 5)
      const recentTransactions = allTransactions.slice(0, 5);

      // Get upcoming vesting events (next 5)
      const now = new Date();
      const upcomingVesting = vestingEvents.filter(event => event.vestingDate > now).slice(0, 5);

      logger.info('Dashboard summary retrieved', {
        employeeId,
        grantsCount: grants.length,
        recentTransactionsCount: recentTransactions.length,
        upcomingVestingCount: upcomingVesting.length,
      });

      return {
        balance,
        recentTransactions,
        upcomingVesting,
        grantsCount: grants.length,
      };
    } catch (error) {
      logger.error('Failed to get dashboard summary', {
        employeeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(500, 'Failed to retrieve dashboard summary');
    }
  }
}
