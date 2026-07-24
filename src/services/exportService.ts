import { Order } from '../types';
import * as xlsx from 'xlsx';

export const exportService = {
  exportOrdersToExcel(orders: Order[], filename: string = 'orders_export.xlsx') {
    const wb = xlsx.utils.book_new();

    orders.forEach(order => {
      // Prepare data for this order
      const data = order.items.map(item => ({
        'Order Number': order.orderNumber,
        'Date': new Date(order.createdAt).toLocaleDateString(),
        'Firm Name': order.firmName,
        'Owner Name': order.ownerName,
        'Phone': order.phone,
        'Pattern Number': item.patternNumber,
        'Category': 'N/A', // Assuming category name isn't readily available in item, could fetch if needed
        'Color': item.color,
        'Sets Ordered': item.sets,
        'Sizes Included': item.sizes.join(', '),
        'Estimated Price': item.sets * item.price,
        'Retailer Note': order.retailerNotes || '',
        'Status': order.status,
        'Fulfillment Status': order.fulfillmentStatus || 'Not Started'
      }));

      const ws = xlsx.utils.json_to_sheet(data);
      
      // Auto-size columns (rough approximation)
      const colWidths = [
        { wch: 15 }, // Order Number
        { wch: 12 }, // Date
        { wch: 20 }, // Firm Name
        { wch: 20 }, // Owner Name
        { wch: 15 }, // Phone
        { wch: 15 }, // Pattern Number
        { wch: 15 }, // Category
        { wch: 15 }, // Color
        { wch: 15 }, // Sets Ordered
        { wch: 20 }, // Sizes Included
        { wch: 15 }, // Estimated Price
        { wch: 30 }, // Retailer Note
        { wch: 15 }, // Status
        { wch: 20 }  // Fulfillment Status
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook. Sheet names must be <= 31 chars
      let sheetName = order.orderNumber;
      if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
      
      // If bulk export and duplicate order numbers exist, make name unique
      let attempt = 1;
      let uniqueSheetName = sheetName;
      while (wb.SheetNames.includes(uniqueSheetName)) {
        uniqueSheetName = `${sheetName}_${attempt}`;
        attempt++;
      }

      xlsx.utils.book_append_sheet(wb, ws, uniqueSheetName);
    });

    // Write file
    xlsx.writeFile(wb, filename);
  }
};
