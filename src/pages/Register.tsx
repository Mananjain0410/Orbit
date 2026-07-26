import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useNavigate, useLocation } from 'react-router';
import { retailerService } from '../services/retailerService';
import { useRetailer } from '../contexts/RetailerAuthContext';
import { useToast } from '../components/ui/Toast';

export function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useRetailer();
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    firmName: '',
    gst: '',
    address: '',
    city: '',
    state: ''
  });

  // Extract uid and phone from navigation state
  const state = location.state as { uid: string, phone: string } | null;
  
  if (!state || !state.uid || !state.phone) {
    // If accessed directly without auth state, redirect to login
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const profile = await retailerService.createRetailer(state.uid, {
        ...formData,
        phone: state.phone
      });
      
      login(profile);
      success('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      showError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md border-border/40 shadow-xl rounded-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Complete Registration</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Please provide your business details
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ownerName" className="text-sm font-medium leading-none">
                Owner Name *
              </label>
              <Input
                id="ownerName"
                name="ownerName"
                placeholder="Full Name"
                className="rounded-none"
                value={formData.ownerName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="firmName" className="text-sm font-medium leading-none">
                Firm/Business Name *
              </label>
              <Input
                id="firmName"
                name="firmName"
                placeholder="Shop or Company Name"
                className="rounded-none"
                value={formData.firmName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gst" className="text-sm font-medium leading-none">
                GST Number (Optional)
              </label>
              <Input
                id="gst"
                name="gst"
                placeholder="22AAAAA0000A1Z5"
                className="rounded-none uppercase"
                value={formData.gst}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium leading-none">
                Address (Optional)
              </label>
              <Input
                id="address"
                name="address"
                placeholder="Street Address"
                className="rounded-none"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium leading-none">
                  City *
                </label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  className="rounded-none"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium leading-none">
                  State *
                </label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  className="rounded-none"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-none mt-6" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
