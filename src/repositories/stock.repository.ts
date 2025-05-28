import {
  StockGrant,
  VestingSchedule,
  StockBalance,
  VestingEvent,
  Transaction,
  GrantType,
  GrantStatus,
  VestingEventStatus,
  TransactionType,
  TransactionStatus,
} from '@/models';
import { generateId } from '@/utils';

/**
 * In-memory stock repository for demo purposes
 */
export class StockRepository {
  private stockGrants: StockGrant[] = [];
  private vestingSchedules: VestingSchedule[] = [];
  private vestingEvents: VestingEvent[] = [];
  private transactions: Transaction[] = [];

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    // Create demo vesting schedules
    const vestingSchedule: VestingSchedule = {
      id: generateId(),
      name: 'Standard 4-Year Vesting',
      description: '25% after 1 year cliff, then monthly for 3 years',
      totalYears: 4,
      cliffMonths: 12,
      vestingIntervalMonths: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vestingSchedules.push(vestingSchedule);

    // Create demo stock grants
    const grants: Omit<StockGrant, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        employeeId: 'EMP001',
        grantDate: new Date('2023-01-15'),
        totalShares: 1000,
        vestingScheduleId: vestingSchedule.id,
        grantPrice: 10.0,
        grantType: GrantType.ISO,
        status: GrantStatus.ACTIVE,
      },
      {
        employeeId: 'EMP002',
        grantDate: new Date('2023-03-01'),
        totalShares: 500,
        vestingScheduleId: vestingSchedule.id,
        grantPrice: 12.0,
        grantType: GrantType.RSU,
        status: GrantStatus.ACTIVE,
      },
    ];

    for (const grantData of grants) {
      const grant: StockGrant = {
        ...grantData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.stockGrants.push(grant);

      // Create vesting events for this grant
      this.createVestingEventsForGrant(grant);
    }

    // Create demo transactions
    this.createDemoTransactions();
  }

  private createVestingEventsForGrant(grant: StockGrant): void {
    const schedule = this.vestingSchedules.find(s => s.id === grant.vestingScheduleId);
    if (!schedule) return;

    const totalVestingMonths = schedule.totalYears * 12;
    const sharesPerVesting = grant.totalShares / (totalVestingMonths - schedule.cliffMonths + 1);
    
    // Cliff vesting
    const cliffDate = new Date(grant.grantDate);
    cliffDate.setMonth(cliffDate.getMonth() + schedule.cliffMonths);
    
    const cliffShares = grant.totalShares * 0.25; // 25% at cliff
    this.vestingEvents.push({
      id: generateId(),
      employeeId: grant.employeeId,
      grantId: grant.id,
      vestingDate: cliffDate,
      sharesVested: cliffShares,
      cumulativeVested: cliffShares,
      status: cliffDate <= new Date() ? VestingEventStatus.VESTED : VestingEventStatus.PENDING,
      createdAt: new Date(),
    });

    // Monthly vesting after cliff
    let cumulativeVested = cliffShares;
    for (let month = schedule.cliffMonths + 1; month <= totalVestingMonths; month++) {
      const vestingDate = new Date(grant.grantDate);
      vestingDate.setMonth(vestingDate.getMonth() + month);
      
      const monthlyShares = (grant.totalShares - cliffShares) / (totalVestingMonths - schedule.cliffMonths);
      cumulativeVested += monthlyShares;
      
      this.vestingEvents.push({
        id: generateId(),
        employeeId: grant.employeeId,
        grantId: grant.id,
        vestingDate,
        sharesVested: monthlyShares,
        cumulativeVested,
        status: vestingDate <= new Date() ? VestingEventStatus.VESTED : VestingEventStatus.PENDING,
        createdAt: new Date(),
      });
    }
  }

  private createDemoTransactions(): void {
    const transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        employeeId: 'EMP001',
        grantId: this.stockGrants[0].id,
        transactionType: TransactionType.EXERCISE,
        shares: 100,
        pricePerShare: 10.0,
        totalAmount: 1000.0,
        transactionDate: new Date('2024-01-15'),
        status: TransactionStatus.COMPLETED,
      },
    ];

    for (const transactionData of transactions) {
      this.transactions.push({
        ...transactionData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Stock Grant methods
  async findGrantsByEmployeeId(employeeId: string): Promise<StockGrant[]> {
    return this.stockGrants.filter(grant => grant.employeeId === employeeId);
  }

  async findGrantById(id: string): Promise<StockGrant | null> {
    return this.stockGrants.find(grant => grant.id === id) || null;
  }

  // Vesting methods
  async findVestingEventsByEmployeeId(employeeId: string): Promise<VestingEvent[]> {
    return this.vestingEvents.filter(event => event.employeeId === employeeId);
  }

  async findVestingEventsByGrantId(grantId: string): Promise<VestingEvent[]> {
    return this.vestingEvents.filter(event => event.grantId === grantId);
  }

  // Transaction methods
  async findTransactionsByEmployeeId(employeeId: string): Promise<Transaction[]> {
    return this.transactions.filter(transaction => transaction.employeeId === employeeId);
  }

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const transaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  // Stock balance calculation
  async calculateStockBalance(employeeId: string): Promise<StockBalance> {
    const grants = await this.findGrantsByEmployeeId(employeeId);
    const vestingEvents = await this.findVestingEventsByEmployeeId(employeeId);
    const transactions = await this.findTransactionsByEmployeeId(employeeId);

    const totalGranted = grants.reduce((sum, grant) => sum + grant.totalShares, 0);
    
    const totalVested = vestingEvents
      .filter(event => event.status === VestingEventStatus.VESTED)
      .reduce((sum, event) => sum + event.sharesVested, 0);

    const totalExercised = transactions
      .filter(tx => tx.transactionType === TransactionType.EXERCISE && tx.status === TransactionStatus.COMPLETED)
      .reduce((sum, tx) => sum + tx.shares, 0);

    const availableToExercise = totalVested - totalExercised;
    const unvested = totalGranted - totalVested;
    
    // Mock current stock price
    const currentStockPrice = 25.0;
    const currentValue = availableToExercise * currentStockPrice;

    return {
      employeeId,
      totalGranted,
      totalVested,
      totalExercised,
      availableToExercise: Math.max(0, availableToExercise),
      unvested,
      currentValue,
      lastUpdated: new Date(),
    };
  }

  async findVestingScheduleById(id: string): Promise<VestingSchedule | null> {
    return this.vestingSchedules.find(schedule => schedule.id === id) || null;
  }
}