import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useReactToPrint } from 'react-to-print';
import { orderService } from '../../services/orderService';
import { inventoryService } from '../../services/inventoryService';
import { exportService } from '../../services/exportService';
import { Order, OrderStatus, FulfillmentStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, Building, User, Phone, MapPin, Calendar, Clock, Activity, AlertCircle, FileText, Download, Printer } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PrintableOrder } from '../../components/print/PrintableOrder';
import { PrintablePackingSheet } from '../../components/print/PrintablePackingSheet';

export function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const printOrderRef = useRef<HTMLDivElement>(null);
  const printPackingRef = useRef<HTMLDivElement>(null);
  
  const handlePrintOrder = useReactToPrint({
    contentRef: printOrderRef,
    documentTitle: `Order_${order?.orderNumber || 'Document'}`,
  });

  const handlePrintPackingSheet = useReactToPrint({
    contentRef: printPackingRef,
    documentTitle: `PackingSheet_${order?.orderNumber || 'Document'}`,
  });

  const handleExportExcel = () => {
    if (order) {
      exportService.exportOrdersToExcel([order], `Order_${order.orderNumber}.xlsx`);
      showToast('Order exported to Excel', 'success');
    }
  };

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    let unsubscribe = () => {};
    if (id) {
      setLoading(true);
      let isFirstLoad = true;
      unsubscribe = orderService.subscribeToOrder(id, (data) => {
        setOrder(data);
        if (data && isFirstLoad) {
          setInternalNotes(data.internalNotes || '');
          isFirstLoad = false;
        }
        setLoading(false);
      });
    }
    return () => unsubscribe();
  }, [id]);

  const handleSaveNotes = async () => {
    if (!order) return;
    setIsSaving(true);
    try {
      await orderService.updateInternalNotes(order.id, internalNotes);
      showToast('Internal notes saved', 'success');
    } catch (error) {
      showToast('Failed to save notes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrderStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      await orderService.updateOrderStatus(order.id, order.status, newStatus, 'Admin');
      
      // Auto-restore inventory if cancelled
      if (newStatus === 'Cancelled' && order.inventoryDeducted) {
        const result = await inventoryService.restoreInventory(order);
        if (result.success) {
          showToast(`Order status updated to ${newStatus}. Inventory restored.`, 'success');
        } else {
          showToast(`Order cancelled, but inventory restoration failed: ${result.error}`, 'error');
        }
      } else {
        showToast(`Order status updated to ${newStatus}`, 'success');
      }
      
    } catch (error) {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleFulfillmentStatusChange = async (newStatus: FulfillmentStatus) => {
    if (!order) return;
    
    // Inventory deduction logic
    if (newStatus === 'Packed' && !order.inventoryDeducted) {
      const inventoryCheck = await inventoryService.checkInventory(order);
      
      if (!inventoryCheck.isSufficient) {
        let msg = 'Insufficient inventory for:\n';
        inventoryCheck.shortages.forEach(s => {
           msg += `- ${s.patternNumber} (${s.color}): Need ${s.requested}, Have ${s.available}\n`;
        });
        showToast(msg, 'error');
        return; // Prevent status change
      }

      const deductResult = await inventoryService.deductInventory(order);
      if (!deductResult.success) {
         showToast(`Failed to deduct inventory: ${deductResult.error}`, 'error');
         return;
      }
      
      showToast('Inventory deducted successfully.', 'success');
    }
    
    try {
      await orderService.updateFulfillmentStatus(order.id, order.fulfillmentStatus, newStatus, 'Admin');
      showToast(`Fulfillment updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update fulfillment', 'error');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (!order) return <div className="p-8 text-center text-xl text-muted-foreground flex flex-col items-center"><AlertCircle className="w-12 h-12 mb-4 text-muted-foreground" /> Order not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto bg-muted/10 min-h-screen">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4 hover:bg-transparent">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Workspace
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-1">{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Submitted on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Retailer & Summary */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Retailer Info</h2>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-base">{order.firmName}</div>
                  {order.retailerId && <div className="text-muted-foreground mt-1">ID: {order.retailerId}</div>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.ownerName}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>Address on file</span>
              </div>
              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="w-full" asChild>
                   <Link to={`/admin/retailers/${order.retailerId}`}>Open Retailer Profile</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Order Summary</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Patterns</span>
                <span className="font-medium">{order.totalProducts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Colors</span>
                <span className="font-medium">{order.totalColors}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Sets</span>
                <span className="font-medium">{order.totalSets}</span>
              </div>
              <div className="pt-3 border-t border-border mt-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Est. Value</span>
                  <span className="text-xl font-serif font-medium">₹{order.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Inventory</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${order.inventoryDeducted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.inventoryDeducted ? 'Deducted' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Packing</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${order.fulfillmentStatus === 'Packed' || order.fulfillmentStatus === 'Ready for Dispatch' || order.fulfillmentStatus === 'Dispatched' || order.fulfillmentStatus === 'Delivered' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                      {order.fulfillmentStatus || 'Not Started'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Retailer Note</h2>
            </div>
            <div className="p-4 text-sm text-muted-foreground">
              {order.retailerNotes ? <p className="italic">"{order.retailerNotes}"</p> : <p>No retailer note.</p>}
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden flex flex-col h-[250px]">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Internal Notes</h2>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <textarea 
              className="flex-1 w-full p-4 border-none text-sm focus:outline-none bg-background resize-none placeholder:text-muted-foreground/50"
              placeholder="e.g. Waiting for stock on red color..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>
        </div>

        {/* CENTER COLUMN: Products */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Products Ordered</h2>
              <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded border border-border">{order.items.length} Line Items</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Color</th>
                    <th className="px-4 py-3 font-medium text-right">Sets</th>
                    <th className="px-4 py-3 font-medium text-right">Est. Value</th>
                    <th className="px-4 py-3 font-medium text-center">Inv. Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0 border border-border">
                            {item.image && <img src={item.image} alt={item.patternNumber} className="w-full h-full object-cover mix-blend-multiply" />}
                          </div>
                          <div>
                            <div className="font-semibold uppercase tracking-wider text-[11px]">{item.patternNumber}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Sizes: {item.sizes.join(', ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.hex }} />
                          <span className="font-medium text-xs">{item.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {item.sets}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium">₹{(item.sets * item.price).toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">₹{item.price}/set</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-neutral-100 text-[10px] font-semibold text-neutral-600">
                          {item.sets * 2} in stock
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Status & Timeline */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Status</h2>
            </div>
            <div className="p-5 space-y-6">
              
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Request Status</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  value={order.status}
                  onChange={(e) => handleOrderStatusChange(e.target.value as OrderStatus)}
                  disabled={order.status === 'Cancelled' || order.status === 'Rejected'}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="pt-2">
                   <StatusBadge status={order.status} type="order" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fulfillment Status</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  value={order.fulfillmentStatus || 'Not Started'}
                  onChange={(e) => handleFulfillmentStatusChange(e.target.value as FulfillmentStatus)}
                  disabled={order.status !== 'Confirmed' || order.fulfillmentStatus === 'Delivered'}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Picking">Picking</option>
                  <option value="Packed">Packed</option>
                  <option value="Ready for Dispatch">Ready for Dispatch</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <div className="pt-2 flex flex-col gap-2">
                  <StatusBadge status={order.fulfillmentStatus || 'Not Started'} type="fulfillment" />
                  {order.status !== 'Confirmed' && <span className="text-xs text-amber-600">Order must be Confirmed to update fulfillment.</span>}
                </div>
              </div>

            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Order Execution</h2>
            </div>
            <div className="p-4 space-y-4">
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inventory Status</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${order.inventoryDeducted ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-sm font-medium">{order.inventoryDeducted ? 'Deducted' : 'Pending Deduction'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inventory is only deducted when Fulfillment Status is set to "Packed".
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Documents</label>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="w-full justify-start text-xs" onClick={handlePrintOrder}>
                    <Printer className="w-4 h-4 mr-2" /> Print Order Request
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start text-xs" onClick={handlePrintPackingSheet}>
                    <FileText className="w-4 h-4 mr-2" /> Print Packing Sheet
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start text-xs" onClick={handleExportExcel}>
                    <Download className="w-4 h-4 mr-2" /> Export to Excel
                  </Button>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-sm uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => handleOrderStatusChange('Confirmed')} disabled={order.status === 'Confirmed' || order.status === 'Cancelled' || order.status === 'Rejected'}>Confirm</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => handleOrderStatusChange('On Hold')} disabled={order.status === 'On Hold' || order.status === 'Cancelled' || order.status === 'Rejected'}>Put On Hold</Button>
              <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200" onClick={() => handleOrderStatusChange('Rejected')} disabled={order.status === 'Rejected' || order.status === 'Cancelled'}>Reject</Button>
              <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200" onClick={() => handleOrderStatusChange('Cancelled')} disabled={order.status === 'Cancelled' || order.status === 'Rejected'}>Cancel</Button>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Timeline</h2>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="relative border-l border-border/50 ml-3 space-y-6">
                  {/* Sort history newest first */}
                  {[...order.statusHistory].sort((a, b) => b.timestamp - a.timestamp).map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute w-2.5 h-2.5 bg-background border-2 border-primary rounded-full -left-[5px] top-1.5" />
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground flex justify-between items-center">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(event.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="font-medium">{event.user}</span>
                        </div>
                        <div className="text-sm">
                          Changed {event.type === 'order' ? 'Order' : 'Fulfillment'} to <span className="font-semibold">{event.newStatus}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">No history recorded</div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Hidden Print Components */}
      <div className="hidden">
        <PrintableOrder ref={printOrderRef} order={order} />
        <PrintablePackingSheet ref={printPackingRef} order={order} />
      </div>
    </div>
  );
}
