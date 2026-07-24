import React from 'react';
import { OrderStatus, FulfillmentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | FulfillmentStatus;
  type?: 'order' | 'fulfillment';
  className?: string;
}

export function StatusBadge({ status, type = 'order', className = '' }: StatusBadgeProps) {
  let bgColor = 'bg-neutral-100';
  let textColor = 'text-neutral-800';
  let borderColor = 'border-transparent';

  switch (status) {
    case 'Pending':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'Confirmed':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Rejected':
    case 'Cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'On Hold':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    case 'Not Started':
      bgColor = 'bg-neutral-100';
      textColor = 'text-neutral-600';
      borderColor = 'border-neutral-200';
      break;
    case 'Picking':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'Packed':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      break;
    case 'Ready for Dispatch':
      bgColor = 'bg-teal-100';
      textColor = 'text-teal-800';
      break;
    case 'Dispatched':
      bgColor = 'bg-cyan-100';
      textColor = 'text-cyan-800';
      break;
    case 'Delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${bgColor} ${textColor} ${borderColor} ${className}`}>
      {status}
    </span>
  );
}
