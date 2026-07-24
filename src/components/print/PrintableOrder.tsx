import React, { forwardRef } from 'react';
import { Order } from '../../types';

interface PrintableOrderProps {
  order: Order;
}

export const PrintableOrder = forwardRef<HTMLDivElement, PrintableOrderProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="p-8 max-w-4xl mx-auto bg-white text-black min-h-screen" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">MNFR</h1>
          <p className="text-sm text-gray-600">Premium Wholesale Clothing</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-800">Order Request</h2>
          <p className="text-lg font-medium mt-1">{order.orderNumber}</p>
          <p className="text-sm text-gray-600 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">Billed To</h3>
          <p className="font-bold text-lg">{order.firmName}</p>
          <p>{order.ownerName}</p>
          <p>Phone: {order.phone}</p>
          <p>GST: {order.retailerId.substring(0, 8).toUpperCase()}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">Order Summary</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1 text-gray-600">Total Products:</td><td className="py-1 text-right font-medium">{order.totalProducts}</td></tr>
              <tr><td className="py-1 text-gray-600">Total Colors:</td><td className="py-1 text-right font-medium">{order.totalColors}</td></tr>
              <tr><td className="py-1 text-gray-600">Total Sets:</td><td className="py-1 text-right font-medium">{order.totalSets}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm text-left mb-8 border-collapse">
        <thead>
          <tr className="border-y-2 border-black bg-gray-50">
            <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs">Pattern Number</th>
            <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs">Color</th>
            <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs">Sizes Included</th>
            <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs text-right">Sets Ordered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-3 px-2 font-semibold uppercase">{item.patternNumber}</td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.hex }} />
                  {item.color}
                </div>
              </td>
              <td className="py-3 px-2 text-gray-600">{item.sizes.join(', ')}</td>
              <td className="py-3 px-2 text-right font-bold">{item.sets}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black">
            <td colSpan={3} className="py-3 px-2 text-right font-bold uppercase text-xs tracking-widest">Total Estimated Value:</td>
            <td className="py-3 px-2 text-right font-bold text-lg">₹{order.estimatedValue.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Notes */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Retailer Note</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 min-h-[80px] text-sm">
            {order.retailerNotes || <span className="text-gray-400 italic">No notes provided.</span>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Internal Note</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 min-h-[80px] text-sm">
            {order.internalNotes || <span className="text-gray-400 italic">No internal notes.</span>}
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
        <p>This is a system-generated document. For internal processing and wholesale tracking.</p>
      </div>
    </div>
  );
});

PrintableOrder.displayName = 'PrintableOrder';
