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
    placeholder = "Ej: 55 1234 5678", 
    className, 
    required = false,
    defaultCountry = "MX",
    disabled = false,
    error = false,
    ...props 
  }, ref) => {
    
    // Enhanced change handler to ensure country code is always included
    const handleChange = (newValue: string | undefined) => {
      // If value exists but doesn't start with +, force it to start with country code
      if (newValue && !newValue.startsWith('+')) {
        const countryCode = defaultCountry === 'MX' ? '+52' : defaultCountry === 'US' ? '+1' : '+1';
        newValue = countryCode + newValue;
      }
      onChange(newValue);
    };

    return (
      <div className="relative">
        <PhoneInput
          ref={ref}
          international
          countryCallingCodeEditable={false}
          defaultCountry={defaultCountry}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          displayInitialValueAsLocalNumber={false} // Always show international format
          className={cn(
            "w-full h-10 px-3 py-2 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            className
          )}
          placeholder={placeholder}
          countries={['MX', 'US', 'CA']}
          addInternationalOption={false}
          {...props}
        />
        {/* Country code indicator */}
        {value && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            {value.startsWith('+52') ? '🇲🇽' : value.startsWith('+1') ? '🇺🇸' : '🌍'}
          </div>
        )}
      </div>
    );
  }
);

CustomPhoneInput.displayName = "CustomPhoneInput";

export { CustomPhoneInput };