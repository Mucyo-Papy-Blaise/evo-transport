'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Phone,
  Mail,
  User,
  Send,
  CheckCircle2,
  Ruler,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { useSendLongDistanceRequest } from '@/hooks/useBooking';
import { format } from 'date-fns';

interface LongDistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromLocation: string;
  toLocation: string;
  fromCode?: string;
  toCode?: string;
  distance: number;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  departureDate: string;
}

interface FormErrors {
  phone?: string;
  email?: string;
  message?: string;
}

export function LongDistanceModal({
  isOpen,
  onClose,
  fromLocation,
  toLocation,
  fromCode = '',
  toCode = '',
  distance,
}: LongDistanceModalProps) {
  const { user } = useAuth();
  const sendLongDistanceRequest = useSendLongDistanceRequest();

  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const [form, setForm] = useState<FormState>({
    name: user?.fullName ? user.fullName : '',
    email: user?.email ?? '',
    phone: '',
    message: '',
    departureDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!user && !form.email.trim()) next.email = 'Email is required';
    if (!user && form.email && !/\S+@\S+\.\S+/.test(form.email))
      next.email = 'Enter a valid email';
    if (!form.message.trim())
      next.message = 'Please describe your requirements so we can assist you';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    sendLongDistanceRequest.mutate(
      {
        ...(form.email && { guestEmail: form.email }),
        ...(form.name && { guestName: form.name }),
        guestPhone: form.phone,

        tripType: 'ONE_WAY',
        fromLocation,
        toLocation,
        fromCode,
        toCode,
        fromCity: fromLocation.split(' ')[0],
        toCity: toLocation.split(' ')[0],
        departureDate: form.departureDate,
        departureTime: '08:00',
        passengerDetails: [{ type: 'adult', age: 30, requiresAssistance: false }],
        price: 0, // price TBD by admin
        currency: 'RWF',
        distance,
        message: form.message,
      },
      {
        onSuccess: (response) => {
          setBookingRef(response.bookingReference);
          setSubmitted(true);
        },
      },
    );
  };

  const handleClose = () => {
    // Reset state when closing
    setSubmitted(false);
    setBookingRef('');
    setForm({
      name: user?.fullName ? user.fullName : '',
      email: user?.email ?? '',
      phone: '',
      message: '',
      departureDate: format(new Date(), 'yyyy-MM-dd'),
    });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ld-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="ld-modal"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-background shadow-2xl overflow-hidden',
              'bottom-0 left-0 right-0 rounded-t-2xl max-h-[92dvh]',
              'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
              'md:rounded-2xl md:w-full md:max-w-lg md:max-h-[90vh]',
            )}
          >
            {/* Amber top bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

            {/* Drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground leading-tight">
                    Long Distance Request
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Route exceeds 400 km — special arrangements needed
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div
              className="overflow-y-auto px-6 py-5"
              style={{ maxHeight: 'calc(92dvh - 140px)' }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Request Submitted!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                        Our team will review your request and contact you within 2–4 hours to confirm arrangements.
                      </p>
                    </div>
                    {bookingRef && (
                      <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2 text-sm">
                        <span className="text-muted-foreground">Reference:</span>
                        <span className="font-mono font-semibold text-primary">
                          {bookingRef}
                        </span>
                      </div>
                    )}
                    <div className="rounded-xl bg-muted/60 p-4 text-left space-y-2 text-sm">
                      <p className="font-medium text-foreground">What happens next</p>
                      <div className="space-y-1.5 text-muted-foreground">
                        <p>1. Team reviews your request</p>
                        <p>2. We contact you via phone or email</p>
                        <p>3. Confirm details &amp; pricing together</p>
                        <p>4. Booking confirmed ✓</p>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleClose}>
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  /* ── Form state ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Route summary */}
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{fromLocation}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{toLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                        <Ruler className="h-3 w-3" />
                        <span>{distance} km — exceeds the 400 km standard route limit</span>
                      </div>
                    </div>

                    {/* Preferred date */}
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        Preferred Departure Date
                      </Label>
                      <Input
                        type="date"
                        value={form.departureDate}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={update('departureDate')}
                        className="h-11"
                      />
                    </div>

                    {/* Contact fields — name + email only for guests */}
                    {!user && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-1.5 block">
                            Full Name (optional)
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="John Doe"
                              value={form.name}
                              onChange={update('name')}
                              className="pl-9 h-11"
                            />
                          </div>
                        </div>
                        <div>
                          <Label
                            className={cn(
                              'text-sm font-medium mb-1.5 block',
                              errors.email && 'text-destructive',
                            )}
                          >
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              value={form.email}
                              onChange={update('email')}
                              className={cn(
                                'pl-9 h-11',
                                errors.email && 'border-destructive',
                              )}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-destructive mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div>
                      <Label
                        className={cn(
                          'text-sm font-medium mb-1.5 block',
                          errors.phone && 'text-destructive',
                        )}
                      >
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+250 788 123 456"
                          value={form.phone}
                          onChange={update('phone')}
                          className={cn(
                            'pl-9 h-11',
                            errors.phone && 'border-destructive',
                          )}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <Label
                        className={cn(
                          'text-sm font-medium mb-1.5 block',
                          errors.message && 'text-destructive',
                        )}
                      >
                        Trip Requirements <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder={
                          `Describe your needs, e.g.:\n` +
                          `- Number of passengers\n` +
                          `- Luggage or special equipment\n` +
                          `- Preferred pickup time\n` +
                          `- Any special stops along the route`
                        }
                        value={form.message}
                        onChange={update('message')}
                        rows={4}
                        className={cn(
                          'resize-none text-sm',
                          errors.message && 'border-destructive',
                        )}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive mt-1">{errors.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        We&apos;ll review and reach out within 2–4 hours.
                      </p>
                    </div>

                    {/* Submit */}
                    <Button
                      size="lg"
                      className="w-full h-12 gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white"
                      onClick={handleSubmit}
                      disabled={sendLongDistanceRequest.isPending}
                    >
                      {sendLongDistanceRequest.isPending ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Request
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}