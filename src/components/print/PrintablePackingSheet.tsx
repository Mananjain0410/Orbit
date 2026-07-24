import React, { forwardRef } from 'react';
import { Order } from '../../types';

interface PrintablePackingSheetProps {
  order: Order;
}

export const PrintablePackingSheet = forwardRef<HTMLDivElement, PrintablePackingSheetProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="p-8 max-w-4xl mx-auto bg-white text-black min-h-screen" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-1">PACKING SHEET</h1>
          <p className="text-sm font-medium">MNFR Warehouse Operations</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{order.orderNumber}</p>
          <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-6 p-4 border-2 border-black rounded-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Deliver To</p>
            <p className="font-bold text-xl">{order.firmName}</p>
            <p>{order.city}, {order.state}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Total Sets to Pack</p>
            <p className="text-3xl font-bold">{order.totalSets}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm text-left mb-8 border-collapse border-2 border-black">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-black">
            <th className="py-4 px-4 font-bold uppercase tracking-wider text-xs border-r border-black w-16 text-center">Pack</th>
            <th className="py-4 px-4 font-bold uppercase tracking-wider text-xs border-r border-black">Pattern Number</th>
            <th className="py-4 px-4 font-bold uppercase tracking-wider text-xs border-r border-black">Color</th>
            <th className="py-4 px-4 font-bold uppercase tracking-wider text-xs border-r border-black">Sizes Included</th>
            <th className="py-4 px-4 font-bold uppercase tracking-wider text-xs text-center">Sets</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400">
          {order.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="py-4 px-4 border-r border-black text-center">
                <div className="w-6 h-6 border-2 border-black rounded-sm mx-auto" />
              </td>
              <td className="py-4 px-4 font-bold text-lg uppercase tracking-wider border-r border-black">{item.patternNumber}</td>
              <td className="py-4 px-4 border-r border-black">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: item.hex }} />
                  <span className="font-medium text-base">{item.color}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-gray-600 border-r border-black font-medium">{item.sizes.join(', ')}</td>
              <td className="py-4 px-4 text-center font-bold text-xl">{item.sets}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="flex justify-between mt-20 pt-10 border-t-2 border-dashed border-gray-400">
        <div className="w-64 text-center">
          <div className="border-b-2 border-black mb-2"></div>
          <p className="text-xs uppercase font-bold tracking-widest">Picked By</p>
        </div>
        <div className="w-64 text-center">
          <div className="border-b-2 border-black mb-2"></div>
          <p className="text-xs uppercase font-bold tracking-widest">Packed By</p>
        </div>
        <div className="w-64 text-center">
          <div className="border-b-2 border-black mb-2"></div>
          <p className="text-xs uppercase font-bold tracking-widest">Verified By</p>
        </div>
      </div>
    </div>
  );
});

PrintablePackingSheet.displayName = 'PrintablePackingSheet';
