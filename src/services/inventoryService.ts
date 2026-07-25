import { Order, OrderItem } from '../types';
import { productService } from './productService';
import { orderService } from './orderService';
import { notificationService } from './notificationService';
import { settingsService } from './settingsService';

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
  // Check if there is enough inventory for an order
  async checkInventory(order: Order): Promise<InventoryCheckResult> {
    const shortages = [];
    
    // Group order items by product and color to check against current inventory
    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (!product) {
        shortages.push({
          productId: item.productId,
          patternNumber: item.patternNumber,
          color: item.color,
          requested: item.sets,
          available: 0
        });
        continue;
      }

      const productColor = product.colors.find(c => c.name === item.color);
      const available = productColor?.stock || 0;

      if (available < item.sets) {
        shortages.push({
          productId: item.productId,
          patternNumber: item.patternNumber,
          color: item.color,
          requested: item.sets,
          available
        });
      }
    }
    
    return {
      isSufficient: shortages.length === 0,
      shortages
    };
  },

  // Deduct inventory for an order
  async deductInventory(order: Order, userId: string = 'Admin'): Promise<{ success: boolean; error?: string }> {
    if (order.inventoryDeducted) {
      return { success: false, error: 'Inventory has already been deducted for this order.' };
    }

    const check = await this.checkInventory(order);
    
    if (!check.isSufficient) {
      return { success: false, error: 'Insufficient inventory for some items.' };
    }

    const currentSettings = await settingsService.getSettings();
    const threshold = currentSettings.inventory.lowStockThreshold || 10;
    
    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (product) {
        const productColor = product.colors.find(c => c.name === item.color);
        if (productColor && typeof productColor.stock === 'number') {
          productColor.stock -= item.sets;
          
          await productService.saveProduct(product);
          
          if (productColor.stock < threshold) {
            // Notify Admin of low stock
            notificationService.createNotification({
              userId: 'Admin',
              title: 'Low Stock Alert',
              message: `Product ${product.patternNumber} (${productColor.name}) stock has fallen to ${productColor.stock} sets.`,
              type: 'inventory',
              link: `/admin/inventory`
            }).catch(console.error);
          }
        }
      }
    }

    // Mark order as inventory deducted
    await orderService.markInventoryDeducted(order.id, true, userId);
    
    return { success: true };
  },

  // Restore inventory for an order
  async restoreInventory(order: Order, userId: string = 'Admin'): Promise<{ success: boolean; error?: string }> {
    if (!order.inventoryDeducted) {
      return { success: false, error: 'Inventory has not been deducted for this order, so it cannot be restored.' };
    }

    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (product) {
        const productColor = product.colors.find(c => c.name === item.color);
        if (productColor && typeof productColor.stock === 'number') {
          productColor.stock += item.sets;
          await productService.saveProduct(product);
        }
      }
    }

    // Mark order as inventory not deducted
    await orderService.markInventoryDeducted(order.id, false, userId);
    
    return { success: true };
  }
};
