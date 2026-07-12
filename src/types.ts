/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type UserRole = 'employee' | 'staff' | 'admin' | 'hod' | 'ceo';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  totalLeaveDays: number;
  usedLeaveCount: number;
  createdAt: number;
  employeeNo: string;
  phone?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  callmebotApiKey?: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Personal' | 'Maternity/Paternity' | 'Study';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNo: string;
  department: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  type: LeaveType;
  status: LeaveStatus;
  reason: string;
  actingEmployeeNo: string;
  submittedAt: number;
  handledAt?: number;
  adminComment?: string;
  approvedBy?: string;
}

export interface AppLanguage {
  lang: 'en' | 'ta' | 'si';
  t: any;
}
