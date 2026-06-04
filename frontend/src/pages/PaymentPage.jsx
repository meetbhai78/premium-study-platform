import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL, SERVER_URL } from '../context/AuthContext';
import { QrCode, Upload, CheckCircle2, ShieldCheck, Sparkles, Smartphone, ArrowRight, Image as ImageIcon, AlertCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentPage() {
  const { user, refreshUser } = useAuth();
  const [upiInfo, setUpiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [instantSuccess, setInstantSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already premium, redirect back to dashboard
    if (user?.premium) {
      navigate('/dashboard');
    }

    const fetchUPIInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/payments/upi-info`);
        if (res.data && res.data.success) {
          setUpiInfo(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load UPI payment configurations:', err.message);
        setError('Failed to load payment credentials. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUPIInfo();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment SDK. Check your internet connection.');
      }

      // 1. Create order on backend
      const orderRes = await axios.post(`${API_URL}/payments/razorpay/order`);
      if (!orderRes.data || !orderRes.data.success) {
        throw new Error('Failed to generate payment order. Try again.');
      }

      const orderData = orderRes.data.data;

      // 2. Configure checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EDUCATION07_',
        description: 'Lifetime Premium Subscription',
        order_id: orderData.orderId,
        handler: async function (response) {
          setIsSubmitting(true);
          try {
            // 3. Verify signature on backend
            const verifyRes = await axios.post(`${API_URL}/payments/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data && verifyRes.data.success) {
              setInstantSuccess(true);
              refreshUser();
              setTimeout(() => {
                navigate('/dashboard');
              }, 4000);
            } else {
              throw new Error('Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Verification failed:', err);
            setError(err.response?.data?.message || 'Payment verification failed. Contact admin with payment ID.');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || '',
        },
        notes: {
          userId: user?._id || '',
        },
        theme: {
          color: '#6366f1', // Indigo accent
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay payment failed:', err);
      setError(err.message || 'Payment initialization failed.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Please upload a screenshot of your payment receipt.');
      return;
    }

    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('transactionId', transactionId);

    setIsSubmitting(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/payments/unlock`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        refreshUser(); // Sync status locally
        setTimeout(() => {
          navigate('/dashboard');
        }, 4000);
      }
    } catch (err) {
      console.error('Payment upload failed:', err);
      setError(err.response?.data?.message || 'Failed to submit payment verification claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-darkbg-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-premium-500 border-t-transparent" />
      </div>
    );
  }

  if (instantSuccess) {
    return (
      <div className="max-w-md mx-auto my-16 px-6 text-center space-y-6 animate-scale-in">
        <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
          <Sparkles className="h-14 w-14" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-500 mb-3">
            ⚡ Premium Activated!
          </span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">🎉 Welcome to Premium!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
            તમારું Razorpay Payment Successful! <br />
            <strong className="text-emerald-500">Premium Access ત્વરિત ચાલુ થઈ ગઈ છે!</strong><br />
            Dashboard ઉપર redirect થઈ રહ્યું છે...
          </p>
        </div>
        <div className="pt-2">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
            <div className="h-full bg-emerald-500 animate-pulse w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto my-16 px-6 text-center space-y-6 animate-scale-in">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Receipt Submitted!</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Payment receipt upload successful! Admin will verify shortly and activate your premium access. Dashboard ઉપર redirect થઈ રહ્યું છે...
        </p>
        <div className="pt-4">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
            <div className="h-full bg-indigo-500 animate-pulse w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header title */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 text-center max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 dark:bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-500 mb-3 premium-glow">
          <Sparkles className="h-3.5 w-3.5 fill-amber-400" />
          ₹{upiInfo?.amount || 99} Premium Vault Access
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
          Unlock Premium Study Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
          Make a payment using any UPI method, upload receipt, and access premium materials immediately.
        </p>
      </div>

      {/* 📘 Step-by-Step Payment Guide */}
      <div className="max-w-2xl mx-auto glass rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/60 space-y-4 shadow-sm animate-scale-in">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-premium-500" />
          પેમેન્ટ માર્ગદર્શિકા — કઈ રીત પસંદ કરવી? (Payment Guide)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-relaxed">
          {/* Method 1 instruction */}
          <div className="rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/10 p-3.5 border border-emerald-100/50 dark:border-emerald-900/20 space-y-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-extrabold text-emerald-600 dark:text-emerald-400 text-[9px] uppercase tracking-wide">
              રીત ૧: Secure Payment ⚡
            </span>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">આપોઆપ એક્ટિવેશન (Instant & Automatic)</h4>
            <p className="text-slate-500 dark:text-slate-400">
              નીચેના **"Pay Securely"** બટન પર ક્લિક કરીને ઓનલાઈન પેમેન્ટ કરો. પેમેન્ટ પૂરું થતાં જ તમારું એકાઉન્ટ **આપોઆપ ૨ સેકન્ડમાં પ્રીમિયમ** થઈ જશે! કોઈ સ્ક્રીનશોટ મોકલવાની જરૂર નથી.
            </p>
          </div>

          {/* Method 2 instruction */}
          <div className="rounded-2xl bg-amber-50/40 dark:bg-amber-950/10 p-3.5 border border-amber-100/50 dark:border-amber-900/20 space-y-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-extrabold text-amber-600 dark:text-amber-400 text-[9px] uppercase tracking-wide">
              રીત ૨: UPI QR Code 📲
            </span>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">મેન્યુઅલ વેરિફિકેશન (Manual ScreenShot)</h4>
            <p className="text-slate-500 dark:text-slate-400">
              આપેલા QR કોડને સ્કેન કરીને ડાયરેક્ટ પેમેન્ટ કરો. પેમેન્ટ થઈ ગયા પછી **સ્ક્રીનશોટ પાડીને જમણી બાજુ અપલોડ કરો.** એડમિન વેરિફાય કરીને થોડા સમયમાં તમારું પ્રીમિયમ ચાલુ કરશે.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs leading-relaxed animate-scale-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ⚡ Instant & Automated Checkout Card */}
      <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-tr from-premium-500 via-indigo-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl shadow-premium-500/10 border border-premium-400/25 relative overflow-hidden animate-scale-in">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:16px_16px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center md:text-left">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/35 px-3 py-0.5 text-[9px] font-black text-amber-400 uppercase tracking-wide">
              ⚡ Instant Unlock
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              ઓટોમેટિક પ્રીમિયમ ચાલુ કરો
            </h2>
            <p className="text-xs text-indigo-100 max-w-md">
              UPI, Netbanking, Card અથવા Wallets વડે સુરક્ષિત ઓનલાઈન પેમેન્ટ કરો. પેમેન્ટ થતા જ તમારું એકાઉન્ટ આપમેળે ત્વરિત એક્ટિવેટ થઈ જશે!
            </p>
          </div>
          <button
            onClick={handleRazorpayPayment}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-4 text-sm font-black text-slate-900 shadow-lg shadow-amber-500/20 hover:bg-amber-300 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
          >
            {isSubmitting ? 'પ્રોસેસિંગ...' : `Pay ₹${upiInfo?.amount || 99} Securely`}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Or Divider */}
      <div className="max-w-2xl mx-auto flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest py-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span>અથવા (Or manual backup)</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Double Column Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: QR scanner and Deep links */}
        <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-6 flex flex-col items-center">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 text-center flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/40 w-full pb-3 justify-center">
            <QrCode className="h-4.5 w-4.5 text-premium-500" />
            Scan UPI QR Code to Pay
          </h3>

          {/* Real QR image uploaded by user / admin */}
          <div className="relative p-4 rounded-3xl bg-white border border-slate-100 shadow-inner flex items-center justify-center h-60 w-60">
            <img
              src="/qr_code.png"
              onError={(e) => {
                e.target.onerror = null;
                // Fallback to backend served uploaded file if local web image fails to load
                e.target.src = `${SERVER_URL}/uploads/qr_code.png`;
              }}
              alt="UPI Payment QR Code"
              className="h-48 w-48 object-contain"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Amount to Pay: ₹{upiInfo?.amount || 99}
            </p>
            <p className="text-[10px] text-slate-400">
              Merchant: {upiInfo?.merchantName || 'Premium Study Platform'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-xl mt-2 inline-block">
              UPI: {upiInfo?.upiId}
            </p>
          </div>

          {/* Android App Deep links anchors */}
          <div className="w-full space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
              Or Open directly in Apps
            </p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={upiInfo?.deepLinks.gpay}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 transition-all group"
              >
                <Smartphone className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-slate-500 mt-1">GPay</span>
              </a>
              <a
                href={upiInfo?.deepLinks.phonepe}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 transition-all group"
              >
                <Smartphone className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-slate-500 mt-1">PhonePe</span>
              </a>
              <a
                href={upiInfo?.deepLinks.paytm}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 transition-all group"
              >
                <Smartphone className="h-5 w-5 text-cyan-500 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-slate-500 mt-1">Paytm</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Screenshot receipt uploader and form */}
        <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-5">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <Upload className="h-4.5 w-4.5 text-premium-500" />
            Upload Payment Receipt
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Screenshot file drop block */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                UPI Payment Receipt Screenshot (Max 5MB)
              </label>
              
              <div className="relative rounded-2xl border-2 border-dashed border-slate-200 hover:border-premium-400 dark:border-slate-800/60 dark:hover:border-premium-500 transition-colors flex flex-col items-center justify-center py-6 px-4 bg-slate-50/50 dark:bg-darkbg-100/30">
                {previewUrl ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Payment screenshot receipt preview"
                      className="h-40 max-w-full rounded-xl object-contain border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshot(null);
                        setPreviewUrl('');
                      }}
                      className="rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 transition-colors"
                    >
                      Remove receipt
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 cursor-pointer text-center">
                    <div className="h-10 w-10 rounded-xl bg-premium-100 dark:bg-premium-900/40 text-premium-600 dark:text-premium-300 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-premium-500 hover:underline">Click to upload</span> or drag receipt file
                    </div>
                    <span className="text-[9px] text-slate-400">Supports PNG, JPG, JPEG</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ display: previewUrl ? 'none' : 'block' }}
                />
              </div>
            </div>

            {/* Reference input field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                Transaction reference ID / UTR (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="12-digit transaction ID"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !screenshot}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-premium-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 disabled:opacity-50 transition-all pt-3.5"
            >
              {isSubmitting ? 'Uploading Receipt...' : 'Request Premium Activation'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Secure transaction guarantee */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-4">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            SSL Secure 256-bit automated logs verification
          </div>
        </div>
      </div>
    </div>
  );
}
