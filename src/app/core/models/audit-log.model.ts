export interface AuditLog {
  id: number;
  userId: number;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  timestamp: string;
}
