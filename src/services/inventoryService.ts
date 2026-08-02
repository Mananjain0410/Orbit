import { doc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order, OrderItem, Product } from '../types';
import { productService } from './productService';
import { notificationService } from './notificationService';
import { settingsService } from './settingsService';

// Helper function to recursively remove undefined properties before saving to Firestore
function cleanUndefinedFields<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedFields) as unknown as T;
  }
  const cleanObj: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      cleanObj[key] = cleanUndefinedFields(val);
    }
  }
  return cleanObj as T;
}

export interface InventoryCheckResult {
  isSufficient: boolean;
  shortages: {
    productId: string;
    patternNumber: string;
    color: string;
    requested: number;
    available: number;
  }[];
}

export const inventoryService = {
  // Automatically initialize inventory records in Firestore when a product is created or updated
  async initializeProductInventory(product: Product): Promise<void> {
    try {
      if (!product || !product.id || !product.colors) return;
      
      const now = Date.now();
      for (const colorObj of product.colors) {
        const colorName = colorObj.name;
        if (!colorName) continue;
        
        const stock = typeof colorObj.stock === 'number' ? colorObj.stock : 0;
        const invDocId = `${product.id}_${colorName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        const invRef = doc(db, 'inventory', invDocId);
        
        const invData = {
          id: invDocId,
          productId: product.id,
          patternNumber: product.patternNumber || '',
          color: colorName,
          hex: colorObj.hex || '#000000',
          currentStock: stock,
          reservedStock: 0,
          availableStock: stock,
          createdAt: product.createdAt || now,
          updatedAt: now
        };
        
        await setDoc(invRef, invData, { merge: true });
      }
    } catch (error) {
      console.error('Error initializing product inventory:', error);
    }
  },

  // Check if there is enough inventory for an order
  async checkInventory(order: Order): Promise<InventoryCheckResult> {
    const shortages: {
      productId: string;
      patternNumber: string;
      color: string;
      requested: number;
      available: number;
    }[] = [];

    const aggregatedNeeded: Record<string, { productId: string; patternNumber: string; color: string; requested: number }> = {};
    for (const item of order.items) {
      const normColor = (item.color || '').trim().toLowerCase();
      const key = `${item.productId}_${normColor}`;
      if (!aggregatedNeeded[key]) {
        aggregatedNeeded[key] = {
          productId: item.productId,
          patternNumber: item.patternNumber,
          color: item.color,
          requested: 0
        };
      }
      aggregatedNeeded[key].requested += item.sets || 0;
    }

    const productCache: Record<string, Product | null> = {};
    for (const key of Object.keys(aggregatedNeeded)) {
      const req = aggregatedNeeded[key];
      if (!productCache[req.productId]) {
        productCache[req.productId] = await productService.getProductById(req.productId);
      }
      const product = productCache[req.productId];

      if (!product || !product.colors) {
        shortages.push({
          productId: req.productId,
          patternNumber: req.patternNumber,
          color: req.color,
          requested: req.requested,
          available: 0
        });
        continue;
      }

      const productColor = product.colors.find(c => (c.name || '').trim().toLowerCase() === (req.color || '').trim().toLowerCase());
      const available = productColor && typeof productColor.stock === 'number' ? productColor.stock : 0;

      if (available < req.requested) {
        shortages.push({
          productId: req.productId,
          patternNumber: req.patternNumber,
          color: req.color,
          requested: req.requested,
          available
        });
      }
    }
    
    return {
      isSufficient: shortages.length === 0,
      shortages
    };
  },

  // Transaction-based inventory deduction for Confirmed order status
  async deductInventoryTransaction(orderId: string, userId: string = 'Admin'): Promise<{ success: boolean; error?: string }> {
    try {
      const orderRef = doc(db, 'orders', orderId);

      return await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error('Order not found.');
        }
        const order = orderSnap.data() as Order;

        // Prevent double deduction
        if (order.inventoryDeducted) {
          return { success: true };
        }

        const productIds = Array.from(new Set(order.items.map(i => i.productId)));
        const productRefsMap: Record<string, { ref: any; data: Product }> = {};

        for (const pId of productIds) {
          const pRef = doc(db, 'products', pId);
          const pSnap = await transaction.get(pRef);
          if (pSnap.exists()) {
            productRefsMap[pId] = { ref: pRef, data: { id: pSnap.id, ...(pSnap.data() as any) } as Product };
          }
        }

        // Aggregate required quantities per product and color
        const productDeductions: Record<string, Record<string, number>> = {};
        for (const item of order.items) {
          const pId = item.productId;
          const normColor = (item.color || '').trim().toLowerCase();
          if (!productDeductions[pId]) productDeductions[pId] = {};
          productDeductions[pId][normColor] = (productDeductions[pId][normColor] || 0) + (item.sets || 0);
        }

        const now = Date.now();
        let hasPartial = false;

        const updatedOrderItems = order.items.map(item => {
          const pObj = productRefsMap[item.productId];
          if (!pObj) return { ...item, fulfilledSets: item.sets, pendingSets: 0 };

          const normColor = (item.color || '').trim().toLowerCase();
          const colorItem = (pObj.data.colors || []).find(c => (c.name || '').trim().toLowerCase() === normColor);
          const currentStock = colorItem && typeof colorItem.stock === 'number' ? colorItem.stock : 0;
          
          const requested = item.sets || 0;
          const fulfilled = Math.min(requested, currentStock);
          const pending = Math.max(0, requested - fulfilled);

          if (pending > 0) {
            hasPartial = true;
          }

          const updatedItem: OrderItem = {
            ...item,
            fulfilledSets: fulfilled,
            pendingSets: pending
          };

          if (pending > 0) {
            updatedItem.unfulfilledReason = 'Unfulfilled due to stock shortage';
          }

          return updatedItem;
        });

        for (const pId of Object.keys(productDeductions)) {
          const pObj = productRefsMap[pId];
          if (!pObj) continue;

          const product = pObj.data;
          const colorMap = productDeductions[pId];
          const newColors = (product.colors || []).map(c => ({ ...c }));

          for (const normColor of Object.keys(colorMap)) {
            const qtyNeeded = colorMap[normColor];
            const colorItem = newColors.find(c => (c.name || '').trim().toLowerCase() === normColor);
            if (!colorItem) continue;
            
            const currentStock = typeof colorItem.stock === 'number' ? colorItem.stock : 0;
            const actualDeduction = Math.min(qtyNeeded, currentStock);
            colorItem.stock = Math.max(0, currentStock - actualDeduction);
          }

          transaction.update(pObj.ref, cleanUndefinedFields({
            colors: newColors,
            updatedAt: now
          }));
        }

        const updateData: any = {
          inventoryDeducted: true,
          items: updatedOrderItems,
          updatedAt: now
        };

        if (hasPartial) {
          updateData.isPartialFulfillment = true;
          updateData.fulfillmentStatus = 'Partial Fulfillment';
        }

        transaction.update(orderRef, cleanUndefinedFields(updateData));

        return { success: true };
      });
    } catch (error: any) {
      console.error('Deduct inventory transaction error:', error);
      return { success: false, error: error.message || 'Failed to deduct inventory.' };
    }
  },

  // Transaction-based inventory restoration when order status moves from Confirmed to Pending / On Hold / Rejected / Cancelled
  async restoreInventoryTransaction(orderId: string, userId: string = 'Admin'): Promise<{ success: boolean; error?: string }> {
    try {
      const orderRef = doc(db, 'orders', orderId);

      return await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error('Order not found.');
        }
        const order = orderSnap.data() as Order;

        // If not deducted, nothing to restore
        if (!order.inventoryDeducted) {
          return { success: true };
        }

        const productIds = Array.from(new Set(order.items.map(i => i.productId)));
        const productRefsMap: Record<string, { ref: any; data: Product }> = {};

        for (const pId of productIds) {
          const pRef = doc(db, 'products', pId);
          const pSnap = await transaction.get(pRef);
          if (pSnap.exists()) {
            productRefsMap[pId] = { ref: pRef, data: { id: pSnap.id, ...(pSnap.data() as any) } as Product };
          }
        }

        // Aggregate quantities to restore per product and color
        const productRestorations: Record<string, Record<string, number>> = {};
        for (const item of order.items) {
          const pId = item.productId;
          const normColor = (item.color || '').trim().toLowerCase();
          if (!productRestorations[pId]) productRestorations[pId] = {};
          productRestorations[pId][normColor] = (productRestorations[pId][normColor] || 0) + (item.sets || 0);
        }

        const now = Date.now();

        for (const pId of Object.keys(productRestorations)) {
          const pObj = productRefsMap[pId];
          if (!pObj) continue;

          const product = pObj.data;
          const colorMap = productRestorations[pId];
          const newColors = (product.colors || []).map(c => ({ ...c }));

          for (const normColor of Object.keys(colorMap)) {
            const qtyToRestore = colorMap[normColor];
            const colorItem = newColors.find(c => (c.name || '').trim().toLowerCase() === normColor);
            if (colorItem) {
              colorItem.stock = (typeof colorItem.stock === 'number' ? colorItem.stock : 0) + qtyToRestore;
            }
          }

          transaction.update(pObj.ref, cleanUndefinedFields({
            colors: newColors,
            updatedAt: now
          }));
        }

        transaction.update(orderRef, cleanUndefinedFields({
          inventoryDeducted: false,
          updatedAt: now
        }));

        return { success: true };
      });
    } catch (error: any) {
      console.error('Restore inventory transaction error:', error);
      return { success: false, error: error.message || 'Failed to restore inventory.' };
    }
  },

  // Wrappers
  async deductInventory(order: Order, userId: string = 'Admin'): Promise<{ success: boolean; error?: string }> {
    return this.deductInventoryTransaction(order.id, userId);
  },

  async restoreInventory(order: Order, userId: string = 'Admin'): Promise<{ success: boolean; error?: string }> {
    return this.restoreInventoryTransaction(order.id, userId);
  }
};
