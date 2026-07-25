import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { retailerService, RetailerProfile } from '../../services/retailerService';
import { ArrowLeft, User, Phone, MapPin, Building2, Calendar, FileText, ShoppingBag, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Spinner } from '../../components/ui/Spinner';

export function AdminRetailerProfile() {
  const { id } = useParams();
  const [retailer, setRetailer] = useState<RetailerProfile | null>(null);
  useEffect(() => {
    if(id) retailerService.getRetailerById(id).then(r => {
       if(r) {
           setRetailer(r);
           setStatus(r.status);
       }
    });
  }, [id]);
  const [status, setStatus] = useState('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (id) {
      orderService.getRetailerOrders(id)
        .then(data => setOrders(data))
        .finally(() => setLoadingOrders(false));
    }
  }, [id]);

  if (!retailer) {
    return <div className="p-8 text-center">Retailer not found.</div>;
  }

  const getStatusBadge = (s: string) => {
    if (s === 'active') return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span>;
    if (s === 'pending') return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Pending</span>;
    if (s === 'suspended') return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Blocked</span>;
    return null;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <Link to="/admin/retailers" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 w-fit mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Retailers
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif mb-1 flex items-center gap-3">
              {retailer.firmName} {getStatusBadge(status)}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> {retailer.ownerName}
            </p>
          </div>
          <div className="flex gap-2">
            <select 
              className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Blocked</option>
            </select>
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300">
              <ShieldAlert className="w-4 h-4 mr-2" /> Revoke Access
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-medium mb-4 uppercase tracking-widest text-xs text-muted-foreground">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">+91 {retailer.phone}</div>
                  <div className="text-xs text-muted-foreground">Primary</div>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">{retailer.city}, {retailer.state}</div>
                  <div className="text-xs text-muted-foreground">Location</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-medium mb-4 uppercase tracking-widest text-xs text-muted-foreground">Business Details</h2>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">{retailer.gst || 'Not Provided'}</div>
                  <div className="text-xs text-muted-foreground">GST Number</div>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">{new Date(retailer.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">Registration Date</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col max-h-[600px]">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-medium">Order History</h2>
              </div>
              <div className="text-sm text-muted-foreground">{orders.length} Orders</div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingOrders ? (
                <div className="p-12 flex justify-center"><Spinner /></div>
              ) : orders.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium text-right">Value</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          <Link to={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                            {order.orderNumber}
                          </Link>
                          <div className="text-xs text-muted-foreground font-normal mt-1">{order.totalSets} sets</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          ₹{order.estimatedValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <StatusBadge status={order.status} type="order" />
                            {order.fulfillmentStatus && order.fulfillmentStatus !== 'Not Started' && (
                              <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center">
                  <ShoppingBag className="w-10 h-10 mb-3 text-muted-foreground/30" />
                  No orders placed by this retailer yet.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-medium">Internal Notes</h2>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                placeholder="Add private notes about this retailer..."
              ></textarea>
              <div className="flex justify-end mt-4">
                <Button>Save Note</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
