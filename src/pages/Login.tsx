import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import { notificationService } from '../services/notificationService';
import { auth } from '../firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useRetailer } from '../contexts/RetailerAuthContext';
import { useToast } from '../components/ui/Toast';

export function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const navigate = useNavigate();
  const { checkRetailerProfile, login } = useRetailer();
  const { success, error: showError } = useToast();

  useEffect(() => {
    // Initialize recaptcha when component mounts
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const formatPhoneNumber = (phoneNumber: string) => {
    // Simple formatter, assumes Indian numbers if no country code provided
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      try {
        setLoading(true);
        const formattedPhone = formatPhoneNumber(phone);
        const appVerifier = (window as any).recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setStep('OTP');
        success('OTP sent successfully');
      } catch (error: any) {
        console.error('Error sending OTP:', error);
        showError(error.message || 'Failed to send OTP. Please try again.');
        // Reset recaptcha
        if ((window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier.render().then((widgetId: any) => {
            (window as any).grecaptcha.reset(widgetId);
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || otp.length < 6) return;
    
    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      if (user.phoneNumber) {
        const profile = await checkRetailerProfile(user.uid);
        
        if (profile) {
          login(profile);
          navigate('/');
        } else {
          // Need to register
          navigate('/register', { state: { uid: user.uid, phone: user.phoneNumber } });
        }
      } else {
        throw new Error("Phone number not found in user object");
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      showError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>
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
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-none" size="lg" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2 text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  OTP sent to <span className="font-medium text-foreground">{formatPhoneNumber(phone)}</span>
                </p>
                <button 
                  type="button" 
                  onClick={() => setStep('PHONE')} 
                  className="text-xs text-primary underline underline-offset-4"
                  disabled={loading}
                >
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
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full rounded-none" size="lg" disabled={loading}>
                {loading ? 'Verifying...' : (
                  <>Verify & Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
