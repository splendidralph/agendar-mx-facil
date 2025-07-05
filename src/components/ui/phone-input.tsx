import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

interface CustomPhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  defaultCountry?: "MX" | "US" | "CA";
  disabled?: boolean;
  error?: boolean;
}

const CustomPhoneInput = React.forwardRef<any, CustomPhoneInputProps>(
  ({ 
    value, 
    onChange, 
    placeholder = "(55) 1234-5678", 
    className, 
    required = false,
    defaultCountry = "MX",
    disabled = false,
    error = false,
    ...props 
  }, ref) => {
    return (
      <PhoneInput
        ref={ref}
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 py-2 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:border-destructive focus:ring-destructive",
          className
        )}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

CustomPhoneInput.displayName = "CustomPhoneInput";

export { CustomPhoneInput };