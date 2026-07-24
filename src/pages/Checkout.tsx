import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useRetailer } from '../contexts/RetailerAuthContext';
import { orderService } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/SEO';

export function Checkout() {
  const { items, totalSets, totalPrice, clearCart } = useCart();
  const { retailer } = useRetailer();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [retailerNotes, setRetailerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-[70vh] flex flex-col justify-center items-center pt-32">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-3xl font-serif mb-4">Your cart is empty</h2>
        <Button asChild className="rounded-none">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (!retailer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center pt-32">
        <h2 className="text-3xl font-serif mb-4">Please log in to submit an order request</h2>
        <Button onClick={() => navigate('/login')} className="rounded-none">Login</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orderItems = items.flatMap(item => 
        item.selections.map(sel => ({
          productId: item.product.id,
          patternNumber: item.product.patternNumber,
          color: sel.name,
          hex: sel.hex,
          sets: sel.quantity,
          sizes: item.product.sizes,
          price: item.product.price,
          image: item.product.images[0] || ''
        }))
      );

      const orderData = {
        retailerId: retailer.uid,
        firmName: retailer.firmName,
        ownerName: retailer.ownerName,
        phone: retailer.phone,
        totalProducts: items.length,
        totalColors: orderItems.length,
        totalSets,
        estimatedValue: totalPrice,
        retailerNotes,
        items: orderItems,
      };

      const order = await orderService.createOrder(orderData);
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
      showToast('Order request submitted successfully', 'success');
    } catch (error) {
      console.error('Order submission failed', error);
      showToast('Failed to submit order request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pt-24 md:pt-32">
      <SEO title="Review Order - MNFR Wholesale" />
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-none px-0 hover:bg-transparent">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
      </Button>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-serif mb-8 border-b border-border pb-4">Review Order</h1>
          
          <div className="space-y-6">
            {items.map(item => (
              <div key={item.product.id} className="border border-border p-4 flex gap-6">
                <div className="w-24 h-32 bg-muted relative">
                  <img src={item.product.images[0]} alt={item.product.patternNumber} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold tracking-[2px] uppercase text-[12px]">{item.product.patternNumber}</h3>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-[1px] mt-1">{item.product.categoryId}</p>
                    </div>
                    <span className="font-serif font-medium">₹{item.product.price} / set</span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {item.selections.map(sel => (
                      <div key={sel.name} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: sel.hex }} />
                          <span>{sel.name}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {sel.quantity} Sets ({item.product.sizes.join(', ')})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form id="order-form" onSubmit={handleSubmit} className="mt-8 border-t border-border pt-8">
            <h3 className="text-[12px] font-bold uppercase tracking-[2px] mb-4">Retailer Notes (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">Add any special instructions or requests for this order.</p>
            <textarea
              className="w-full min-h-[120px] p-4 border border-border bg-background focus:outline-none focus:border-foreground resize-y text-sm"
              placeholder="E.g. Please dispatch with my previous order..."
              value={retailerNotes}
              onChange={(e) => setRetailerNotes(e.target.value)}
            />
          </form>
        </div>

        <div className="lg:w-1/3">
          <div className="border border-border p-6 bg-muted/10 sticky top-24">
            <h2 className="text-[10px] uppercase tracking-[3px] font-bold mb-6 border-b border-border pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firm</span>
                <span className="font-medium text-right">{retailer.firmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{retailer.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sets</span>
                <span className="font-medium">{totalSets}</span>
              </div>
            </div>

            <div className="border-t border-border pt-6 pb-6 mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] uppercase tracking-[2px] font-bold">Estimated Value</span>
                <span className="font-serif text-3xl">₹{totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-4">
                By submitting, you are requesting these items at wholesale. The manufacturer will review and confirm availability, final billing, and shipping details.
              </p>
            </div>

            <Button 
              type="submit"
              form="order-form"
              className="w-full rounded-none h-14 text-[11px] uppercase tracking-[2px] font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
