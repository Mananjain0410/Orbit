import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus, FulfillmentStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Eye, Filter, ArrowDownToLine, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

import { exportService } from '../../services/exportService';
import { inventoryService } from '../../services/inventoryService';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [inventoryFilter, setInventoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkActionDialog, setBulkActionDialog] = useState<{ isOpen: boolean; action: 'Confirm' | 'On Hold' | 'Cancel' | 'Reject' | null }>({ isOpen: false, action: null });
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = orderService.subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter(order => {
    const s = search.toLowerCase();
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(s) ||
      order.firmName.toLowerCase().includes(s) ||
      order.ownerName.toLowerCase().includes(s) ||
      order.phone.includes(s) ||
      order.items.some(item => item.patternNumber.toLowerCase().includes(s));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesFulfillment = fulfillmentFilter === 'all' || order.fulfillmentStatus === fulfillmentFilter;
    
    const matchesInventory = inventoryFilter === 'all' || 
      (inventoryFilter === 'reserved' && order.inventoryDeducted) ||
      (inventoryFilter === 'available' && !order.inventoryDeducted);
    
    return matchesSearch && matchesStatus && matchesFulfillment && matchesInventory;
  }).sort((a, b) => {
    if (sortOption === 'newest') return b.createdAt - a.createdAt;
    if (sortOption === 'oldest') return a.createdAt - b.createdAt;
    if (sortOption === 'highest') return b.estimatedValue - a.estimatedValue;
    if (sortOption === 'lowest') return a.estimatedValue - b.estimatedValue;
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedOrderIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedOrderIds(newSet);
  };

  const handleBulkAction = async () => {
    if (!bulkActionDialog.action || selectedOrderIds.size === 0) return;
    setIsProcessingBulk(true);
    
    try {
      let targetStatus: OrderStatus;
      switch (bulkActionDialog.action) {
        case 'Confirm': targetStatus = 'Confirmed'; break;
        case 'On Hold': targetStatus = 'On Hold'; break;
        case 'Cancel': targetStatus = 'Cancelled'; break;
        case 'Reject': targetStatus = 'Rejected'; break;
        default: throw new Error('Invalid action');
      }
      
      const ids = Array.from(selectedOrderIds) as string[];
      for (const id of ids) {
        const order = orders.find(o => o.id === id);
        if (order && order.status !== targetStatus) {
          // Update status
          await orderService.updateOrderStatus(id, order.status, targetStatus, 'Admin');
          
          // Handle inventory restoration if cancelled in bulk
          if (targetStatus === 'Cancelled' && order.inventoryDeducted) {
             await inventoryService.restoreInventory(order);
          }
        }
      }
      
      showToast(`Successfully updated ${selectedOrderIds.size} orders to ${targetStatus}`, 'success');
      setSelectedOrderIds(new Set());
    } catch (error) {
      console.error(error);
      showToast('Error performing bulk action', 'error');
    } finally {
      setIsProcessingBulk(false);
      setBulkActionDialog({ isOpen: false, action: null });
    }
  };

  const handleBulkExportExcel = () => {
    if (selectedOrderIds.size === 0) return;
    const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
    
    exportService.exportOrdersToExcel(selectedOrders, `Bulk_Export_${Date.now()}.xlsx`);
    showToast(`Exported ${selectedOrders.length} orders to Excel`, 'success');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage wholesale order requests and fulfillment</p>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm mb-8 overflow-hidden rounded-md">
        <div className="p-4 border-b border-border flex flex-col xl:flex-row gap-4 justify-between items-center bg-muted/20">
          
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto flex-1">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, firms, pattern number..."
                className="pl-9 bg-background h-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
            >
              <option value="all">All Fulfillment</option>
              <option value="Not Started">Not Started</option>
              <option value="Picking">Picking</option>
              <option value="Packed">Packed</option>
              <option value="Ready for Dispatch">Ready for Dispatch</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
            </select>

            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
              value={inventoryFilter}
              onChange={(e) => setInventoryFilter(e.target.value)}
            >
              <option value="all">All Inventory Status</option>
              <option value="reserved">Inventory Reserved</option>
              <option value="available">Inventory Available</option>
            </select>
          </div>

          <div className="flex gap-4 w-full xl:w-auto justify-end">
             <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
              <option value="lowest">Lowest Value</option>
            </select>
          </div>
        </div>
        
        {selectedOrderIds.size > 0 && (
           <div className="bg-blue-50/50 border-b border-border p-3 px-6 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">{selectedOrderIds.size} orders selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-green-700 border-green-200" onClick={handleBulkExportExcel}>Export to Excel</Button>
                <div className="w-px h-4 bg-blue-200 mx-1"></div>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white" onClick={() => setBulkActionDialog({ isOpen: true, action: 'Confirm' })}>Confirm</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-orange-600 border-orange-200" onClick={() => setBulkActionDialog({ isOpen: true, action: 'On Hold' })}>On Hold</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-red-600 border-red-200" onClick={() => setBulkActionDialog({ isOpen: true, action: 'Reject' })}>Reject</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-red-600 border-red-200" onClick={() => setBulkActionDialog({ isOpen: true, action: 'Cancel' })}>Cancel</Button>
              </div>
           </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                      {selectedOrderIds.size === filteredOrders.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Order Info</th>
                  <th className="px-6 py-4 font-medium">Retailer</th>
                  <th className="px-6 py-4 font-medium text-right">Qty & Value</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-muted/10 transition-colors ${selectedOrderIds.has(order.id) ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => toggleSelect(order.id)} className="text-muted-foreground hover:text-foreground">
                        {selectedOrderIds.has(order.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium whitespace-nowrap">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium line-clamp-1">{order.firmName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{order.ownerName} ({order.phone})</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="font-medium">₹{order.estimatedValue.toLocaleString()}</div>
                       <div className="text-xs text-muted-foreground mt-1">{order.totalSets} sets ({order.items.length} items)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge status={order.status} type="order" />
                        <StatusBadge status={order.fulfillmentStatus || 'Not Started'} type="fulfillment" />
                        {order.inventoryDeducted && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-green-100 text-green-700 border border-green-200 inline-block w-fit">
                            Inv Deducted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-xs uppercase tracking-wider font-semibold">
                        <Link to={`/admin/orders/${order.id}`}>
                          Workspace <Eye className="h-3.5 w-3.5 ml-2" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              We couldn't find any orders matching your current search and filter criteria.
            </p>
            {(search || statusFilter !== 'all' || fulfillmentFilter !== 'all' || inventoryFilter !== 'all') && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSearch(''); setStatusFilter('all'); setFulfillmentFilter('all'); setInventoryFilter('all'); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
      
      <ConfirmDialog 
        isOpen={bulkActionDialog.isOpen}
        title={`Bulk ${bulkActionDialog.action} Orders`}
        description={`Are you sure you want to mark ${selectedOrderIds.size} orders as ${bulkActionDialog.action}? This action will update their statuses immediately.`}
        confirmText={`Yes, Mark as ${bulkActionDialog.action}`}
        cancelText="Cancel"
        onConfirm={handleBulkAction}
        onClose={() => setBulkActionDialog({ isOpen: false, action: null })}
        isLoading={isProcessingBulk}
      />
    </div>
  );
}
