export interface StockGrant {
  id: string;
  employeeId: string;
  grantDate: Date;
  totalShares: number;
  vestingScheduleId: string;
  grantPrice: number;
  grantType: GrantType;
  status: GrantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VestingSchedule {
  id: string;
  name: string;
  description: string;
  totalYears: number;
  cliffMonths: number;
  vestingIntervalMonths: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockBalance {
  employeeId: string;
  totalGranted: number;
  totalVested: number;
  totalExercised: number;
  availableToExercise: number;
  unvested: number;
  currentValue: number;
  lastUpdated: Date;
}

export interface VestingEvent {
  id: string;
  employeeId: string;
  grantId: string;
  vestingDate: Date;
  sharesVested: number;
  cumulativeVested: number;
  status: VestingEventStatus;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  employeeId: string;
  grantId: string;
  transactionType: TransactionType;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  transactionDate: Date;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum GrantType {
  ISO = 'iso', // Incentive Stock Options
  NSO = 'nso', // Non-Qualified Stock Options
  RSU = 'rsu', // Restricted Stock Units
  ESPP = 'espp', // Employee Stock Purchase Plan
}

export enum GrantStatus {
  ACTIVE = 'active',
  EXERCISED = 'exercised',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum VestingEventStatus {
  PENDING = 'pending',
  VESTED = 'vested',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  EXERCISE = 'exercise',
  SALE = 'sale',
  GRANT = 'grant',
  VEST = 'vest',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
