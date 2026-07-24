import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import { notificationService } from '../services/notificationService';

export function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep('OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') { 
      // Simulate registering new retailer
      await notificationService.createNotification({
        userId: 'Admin',
        title: 'New Retailer Registered',
        message: `A new retailer with phone ${phone} has registered.`,
        type: 'account',
        link: '/admin/retailers'
      });
      navigate('/'); 
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-xl rounded-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Retailer Portal</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in with your registered mobile number
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    className="pl-10 rounded-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-none" size="lg">
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2 text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  OTP sent to <span className="font-medium text-foreground">{phone}</span>
                </p>
                <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-primary underline underline-offset-4">
                  Change Number
                </button>
              </div>
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium leading-none">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  className="rounded-none text-center tracking-widest text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-none" size="lg">
                Verify & Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
