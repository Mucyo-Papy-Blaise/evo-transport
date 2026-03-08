import * as React from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/utils';

// Basic Input component (kept for backward compatibility)
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

// Enhanced TextField Props
interface TextFieldProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  isLoading?: boolean;
  success?: boolean;
  containerClassName?: string;
}

// Enhanced PasswordField Props
interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean;
  strengthIndicator?: boolean;
}

// Password strength calculation
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  // Determine strength label and color
  if (score < 30) return { score, label: 'Weak', color: 'text-red-500' };
  if (score < 60) return { score, label: 'Fair', color: 'text-orange-500' };
  if (score < 80) return { score, label: 'Good', color: 'text-yellow-500' };
  return { score, label: 'Strong', color: 'text-green-500' };
}

// Enhanced TextField Component
const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      isLoading,
      success,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success && !hasError);

    // Size variants
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    // Padding variants based on size and icon presence
    const paddingClasses = {
      sm: {
        base: 'px-2',
        withLeftIcon: 'pl-8 pr-2',
        withRightIcon: 'pl-2 pr-8',
        withBothIcons: 'pl-8 pr-8',
      },
      md: {
        base: 'px-3',
        withLeftIcon: 'pl-10 pr-3',
        withRightIcon: 'pl-3 pr-10',
        withBothIcons: 'pl-10 pr-10',
      },
      lg: {
        base: 'px-4',
        withLeftIcon: 'pl-12 pr-4',
        withRightIcon: 'pl-4 pr-12',
        withBothIcons: 'pl-12 pr-12',
      },
    };

    // Icon positioning based on size
    const iconPositions = {
      sm: {
        left: 'left-2',
        right: 'right-2',
      },
      md: {
        left: 'left-3',
        right: 'right-3',
      },
      lg: {
        left: 'left-4',
        right: 'right-4',
      },
    };

    // Determine padding class
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon || isLoading || hasError || hasSuccess);
    let paddingClass = paddingClasses[size].base;

    if (hasLeftIcon && hasRightIcon) {
      paddingClass = paddingClasses[size].withBothIcons;
    } else if (hasLeftIcon) {
      paddingClass = paddingClasses[size].withLeftIcon;
    } else if (hasRightIcon) {
      paddingClass = paddingClasses[size].withRightIcon;
    }

    // Variant styles
    const variantClasses = {
      default: cn(
        'border-input bg-background',
        hasError && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20',
        hasSuccess &&
          'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20',
        !hasError && !hasSuccess && 'focus-visible:border-ring focus-visible:ring-ring/20',
      ),
      filled: cn(
        'border-transparent bg-muted',
        hasError && 'bg-red-50 dark:bg-red-950/20 border-red-500',
        hasSuccess && 'bg-green-50 dark:bg-green-950/20 border-green-500',
        !hasError && !hasSuccess && 'focus-visible:bg-background focus-visible:border-ring',
      ),
      flushed: cn(
        'border-0 border-b-2 rounded-none bg-transparent px-0',
        hasError && 'border-b-red-500',
        hasSuccess && 'border-b-green-500',
        !hasError && !hasSuccess && 'border-b-input focus-visible:border-b-ring',
      ),
    };

    const inputClasses = cn(
      'flex w-full rounded-md border transition-all duration-200',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      sizeClasses[size],
      paddingClass,
      variantClasses[variant],
      className,
    );

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              hasError ? 'text-red-700 dark:text-red-400' : 'text-foreground',
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-muted-foreground',
                iconPositions[size].left,
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            className={inputClasses}
            disabled={disabled || isLoading}
            aria-invalid={hasError}
            aria-describedby={cn(error && `${id}-error`, helperText && `${id}-helper`)}
            {...props}
          />

          {/* Right Icon/Status */}
          <div className={cn('absolute top-1/2 -translate-y-1/2', iconPositions[size].right)}>
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            ) : hasError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : hasSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              rightIcon && <div className="text-muted-foreground">{rightIcon}</div>
            )}
          </div>
        </div>

        {/* Helper Text & Error */}
        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p
                id={`${id}-error`}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${id}-helper`} className="text-sm text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
TextField.displayName = 'TextField';

// Enhanced PasswordField Component
const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ showPasswordToggle = true, strengthIndicator = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [passwordValue, setPasswordValue] = React.useState(value || '');

    const strength = strengthIndicator ? calculatePasswordStrength(String(passwordValue)) : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPasswordValue(newValue);
      onChange?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const rightIcon = showPasswordToggle ? (
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    ) : undefined;

    return (
      <div className="space-y-2">
        <TextField
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          rightIcon={rightIcon}
          {...props}
        />

        {/* Password Strength Indicator */}
        {strengthIndicator && passwordValue && strength && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  strength.score < 30 && 'bg-red-500',
                  strength.score >= 30 && strength.score < 60 && 'bg-orange-500',
                  strength.score >= 60 && strength.score < 80 && 'bg-yellow-500',
                  strength.score >= 80 && 'bg-green-500',
                )}
                style={{ width: `${Math.max(strength.score, 10)}%` }}
              />
            </div>

            {/* Strength Label */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Password strength:</span>
              <span className={cn('font-medium', strength.color)}>{strength.label}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);
PasswordField.displayName = 'PasswordField';

export { Input, TextField, PasswordField };
