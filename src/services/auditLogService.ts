import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export type AuditAction = 
  | 'admin_login'
  | 'category_created'
  | 'category_edited'
  | 'category_deleted'
  | 'product_created'
  | 'product_updated'
  | 'inventory_updated'
  | 'order_confirmed'
  | 'order_rejected'
  | 'order_status_updated'
  | 'homepage_edited'
  | 'banner_updated'
  | 'media_uploaded'
  | 'media_replaced'
  | 'media_deleted';

export interface AuditLog {
  id?: string;
  timestamp: number;
  adminEmail: string;
  action: AuditAction;
  documentId?: string;
  oldValue?: any;
  newValue?: any;
  details?: string;
}

export const auditLogService = {
  async logAction(
    action: AuditAction, 
    details?: string, 
    documentId?: string, 
    oldValue?: any, 
    newValue?: any
  ): Promise<void> {
    try {
      const adminEmail = auth.currentUser?.email || 'admin@mnfr.in';
      const logEntry: AuditLog = {
        timestamp: Date.now(),
        adminEmail,
        action,
        documentId: documentId || '',
        details: details || '',
      };

      if (oldValue !== undefined) {
        logEntry.oldValue = typeof oldValue === 'object' ? JSON.parse(JSON.stringify(oldValue)) : oldValue;
      }
      if (newValue !== undefined) {
        logEntry.newValue = typeof newValue === 'object' ? JSON.parse(JSON.stringify(newValue)) : newValue;
      }

      await addDoc(collection(db, 'audit_logs'), logEntry);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Non-blocking for UI operations, but logged for diagnostic transparency
    }
  }
};
