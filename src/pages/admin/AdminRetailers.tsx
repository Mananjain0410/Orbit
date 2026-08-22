import { Skeleton } from '../../components/ui/Skeleton';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, MoreHorizontal, UserCheck, UserX, UserMinus } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { retailerService, RetailerProfile } from '../../services/retailerService';

export function AdminRetailers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const [retailersList, setRetailersList] = useState<RetailerProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = retailerService.subscribeToAllRetailers((data) => {
      setRetailersList(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const retailers = retailersList.filter(r => {
    const matchesSearch = r.firmName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.phone.includes(searchQuery) ||
                          r.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>;
    if (status === 'suspended') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Blocked</span>;
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Retailer Management</h1>
          <p className="text-muted-foreground">Manage wholesale buyers and their account access.</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search by firm, owner, phone or city..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Blocked</option>
          </select>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Firm Details</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Registration Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full max-w-[150px]" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full max-w-[100px]" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-full max-w-[80px]" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-full max-w-[50px]" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : retailers.map((retailer) => (
                <tr key={retailer.uid} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/retailers/${retailer.uid}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{retailer.firmName}</div>
                    <div className="text-xs text-muted-foreground">{retailer.gst || 'No GST Provided'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{retailer.ownerName}</div>
                    <div className="text-muted-foreground">{retailer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{retailer.city}</div>
                    <div className="text-muted-foreground text-xs">{retailer.state}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(retailer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(retailer.status)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    —
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && retailers.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
                <UserX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Retailers Found</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                We couldn't find any retailers matching your current filters. Try adjusting your search or clearing the status filter.
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
