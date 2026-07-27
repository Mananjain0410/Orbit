import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      orderService.getOrder(id).then(data => {
        setOrder(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 min-h-[80vh] flex flex-col justify-center items-center text-center pt-32">
      <SEO title="Order Confirmation - MNFR Wholesale" />
      <CheckCircle2 className="w-20 h-20 text-green-600 mb-8 stroke-1" />
      <h1 className="text-4xl font-serif mb-4">Order Request Submitted</h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Thank you. Your wholesale order request has been received and is currently <span className="font-semibold text-foreground">Pending Review</span>. We will contact you shortly with confirmation.
      </p>

      <div className="w-full border border-border p-8 bg-muted/10 mb-10 text-left grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[2px] block mb-2">Order Number</span>
          <span className="font-serif text-2xl">{order.orderNumber}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[2px] block mb-2">Date</span>
          <span className="font-medium text-lg">{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[2px] block mb-2">Total Items</span>
          <span className="font-medium text-lg">{order.totalProducts}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[2px] block mb-2">Total Sets</span>
          <span className="font-medium text-lg">{order.totalSets}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button asChild variant="outline" className="rounded-none h-14 px-8 text-[11px] uppercase tracking-[2px] font-bold">
          <Link to="/profile">View My Orders</Link>
        </Button>
        <Button asChild className="rounded-none h-14 px-8 text-[11px] uppercase tracking-[2px] font-bold">
          <Link to="/">Continue Shopping <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </Button>
      </div>
    </div>
  );
}
