import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
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
    // Disable app verification for dev/preview hostnames (like *.run.app) where domain may not be in Firebase Authorized Domains
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isPreviewOrDev = 
        import.meta.env.DEV || 
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.endsWith('.run.app');

      if (isPreviewOrDev && auth?.settings) {
        auth.settings.appVerificationDisabledForTesting = true;
      }
    }
  }, []);

  const getOrCreateRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;

    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // ignore clear error
      }
      (window as any).recaptchaVerifier = null;
    }

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {}
      });
      (window as any).recaptchaVerifier = verifier;
      return verifier;
    } catch (e) {
      console.warn('Could not instantiate RecaptchaVerifier:', e);
      return null;
    }
  };

  useEffect(() => {
    getOrCreateRecaptchaVerifier();
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const formatPhoneNumber = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    try {
      setLoading(true);
      const formattedPhone = formatPhoneNumber(phone);
      
      let appVerifier = (window as any).recaptchaVerifier || getOrCreateRecaptchaVerifier();
      let confirmation: ConfirmationResult;

      try {
        confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      } catch (err: any) {
        console.warn('Initial signInWithPhoneNumber failed, attempting fallback:', err);
        // If domain hostname match failed (common on dynamic preview hostnames)
        if (
          err?.code === 'auth/captcha-check-failed' ||
          err?.code === 'auth/invalid-app-credential' ||
          err?.message?.includes('Hostname match not found')
        ) {
          if (auth?.settings) {
            auth.settings.appVerificationDisabledForTesting = true;
          }
          const freshVerifier = getOrCreateRecaptchaVerifier();
          confirmation = await signInWithPhoneNumber(auth, formattedPhone, freshVerifier);
        } else {
          throw err;
        }
      }

      setConfirmationResult(confirmation);
      setStep('OTP');
      success('OTP sent successfully');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      let userFriendlyMsg = 'Failed to send OTP. Please try again.';
      if (error?.code === 'auth/captcha-check-failed' || error?.message?.includes('Hostname match not found')) {
        userFriendlyMsg = 'Phone verification domain mismatch. Please add your app domain to Firebase Console -> Auth -> Authorized Domains.';
      } else if (error?.code === 'auth/invalid-phone-number') {
        userFriendlyMsg = 'Invalid phone number format. Please enter a 10-digit mobile number.';
      } else if (error?.code === 'auth/too-many-requests') {
        userFriendlyMsg = 'Too many OTP requests. Please try again in a few minutes.';
      } else if (error?.message) {
        userFriendlyMsg = error.message;
      }
      showError(userFriendlyMsg);
    } finally {
      setLoading(false);
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
          <CardTitle className="text-2xl font-bold tracking-tight">Login Portal</CardTitle>
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
