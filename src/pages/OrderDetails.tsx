import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { CartColorSelection } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, RefreshCcw, XCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Spinner } from '../components/ui/Spinner';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../contexts/StoreContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useRetailer } from '../contexts/RetailerAuthContext';

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const { clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const { products } = useStore();
  const { showToast } = useToast();
  const { retailer } = useRetailer();

  useEffect(() => {
    let unsubscribe = () => {};
    if (id) {
      unsubscribe = orderService.subscribeToOrder(id, (data) => {
        setOrder(data);
        setLoading(false);
      });
    }
    return () => unsubscribe();
  }, [id]);

  const handleReorder = () => {
    if (!order) return;
    
    clearCart();
    
    let unavailableCount = 0;
    
    // Group order items by product ID
    const productMap = new Map<string, typeof order.items>();
    order.items.forEach(item => {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, []);
      }
      productMap.get(item.productId)!.push(item);
    });

    productMap.forEach((items, productId) => {
      const product = products.find(p => p.id === productId);
      
      if (!product || !product.inStock) {
        unavailableCount++;
        return; // Skip this product
      }

      // Recreate color selections
      const selections: CartColorSelection[] = [];
      
      items.forEach(item => {
        // Check if color still exists on product
        const colorExists = product.colors.find(c => c.name === item.color);
        if (colorExists) {
          selections.push({
            name: item.color,
            hex: item.hex,
            quantity: item.sets
          });
        }
      });

      if (selections.length > 0) {
        addToCart(product, selections);
      } else {
        unavailableCount++;
      }
    });

    if (unavailableCount > 0) {
      showToast(`Added available items to cart. ${unavailableCount} product(s) or colors were no longer available.`, 'warning');
    } else {
      showToast('All items added to cart', 'success');
    }
    
    navigate('/cart');
  };

  const handleCancelOrder = async () => {
    if (!order || !retailer) return;
    setCancelling(true);
    try {
      await orderService.updateOrderStatus(order.id, order.status, 'Cancelled', retailer.uid);
      setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      showToast('Order cancelled successfully', 'success');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      showToast('Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center pt-32"><Spinner /></div>;
  }

  if (!order) {
    return <div className="min-h-[70vh] flex flex-col items-center justify-center pt-32">
      <h2 className="text-2xl font-serif mb-4">Order not found</h2>
      <Button asChild className="rounded-none"><Link to="/profile">Back to Profile</Link></Button>
    </div>;
  }

  const canCancel = order.status === 'Pending';

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 min-h-[70vh] pt-24 md:pt-32">
      <SEO title={`Order ${order.orderNumber} - Order Details`} />
      
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-none px-0 hover:bg-transparent">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Button>

      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-3">Order {order.orderNumber}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="hidden sm:inline text-border">•</span>
            <StatusBadge status={order.status} type="order" />
            {order.fulfillmentStatus && order.fulfillmentStatus !== 'Not Started' && (
               <>
                 <span className="hidden sm:inline text-border">•</span>
                 <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
               </>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <Button onClick={() => setCancelDialogOpen(true)} variant="outline" className="rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
              <XCircle className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
          )}
          <Button onClick={handleReorder} variant="outline" className="rounded-none">
            <RefreshCcw className="w-4 h-4 mr-2" /> Reorder
          </Button>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText={cancelling ? "Cancelling..." : "Cancel Order"}
        cancelText="Keep Order"
        variant="danger"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-[12px] font-bold uppercase tracking-[2px] border-b border-border pb-2">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const fulfilled = item.fulfilledSets !== undefined ? item.fulfilledSets : item.sets;
              const pending = item.pendingSets !== undefined ? item.pendingSets : 0;

              return (
                <div key={idx} className="border border-border p-4 flex gap-4 bg-card">
                  <div className="w-20 h-28 bg-muted relative shrink-0">
                    {item.image && <img src={item.image} alt={item.patternNumber} className="w-full h-full object-cover mix-blend-multiply" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold tracking-[2px] uppercase text-[12px]">{item.patternNumber}</span>
                      <span className="font-serif">₹{item.price} / set</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: item.hex }} />
                      <span>{item.color}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end text-sm mt-auto gap-2">
                      <span className="text-muted-foreground text-xs uppercase tracking-[1px]">Sizes: {item.sizes.join(', ')}</span>
                      <div className="text-right">
                        <div className="font-medium text-xs">Requested: {item.sets} Sets</div>
                        <div className="font-semibold text-emerald-700 text-xs">Fulfilled: {fulfilled} Sets</div>
                        {pending > 0 && (
                          <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                            Pending: {pending} Sets ({item.unfulfilledReason || 'Stock Shortage'})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {order.retailerNotes && (
            <div className="mt-8 border border-border p-6 bg-muted/10">
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-muted-foreground">Retailer Notes</h3>
              <p className="text-sm">{order.retailerNotes}</p>
            </div>
          )}
        </div>

        <div>
          <div className="border border-border p-6 bg-muted/10 sticky top-24">
            <h2 className="text-[10px] uppercase tracking-[3px] font-bold mb-6 border-b border-border pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-medium">{order.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Colors</span>
                <span className="font-medium">{order.totalColors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sets</span>
                <span className="font-medium">{order.totalSets}</span>
              </div>
            </div>

            <div className="border-t border-border pt-6 pb-6 mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] uppercase tracking-[2px] font-bold">Estimated Value</span>
                <span className="font-serif text-3xl">₹{order.estimatedValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
