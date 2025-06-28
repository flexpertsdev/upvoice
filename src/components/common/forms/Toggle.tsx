import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          toggle: 'w-8 h-4',
          circle: 'w-3 h-3',
          translate: 'translate-x-4'
        };
      case 'lg':
        return {
          toggle: 'w-12 h-6',
          circle: 'w-5 h-5',
          translate: 'translate-x-6'
        };
      default:
        return {
          toggle: 'w-10 h-5',
          circle: 'w-4 h-4',
          translate: 'translate-x-5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-start ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2
          ${checked ? 'bg-primary-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${sizeClasses.toggle}
        `}
      >
        <motion.span
          initial={false}
          animate={{
            x: checked ? sizeClasses.translate.split('-')[1] : '0px'
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
          className={`
            inline-block bg-white rounded-full shadow-sm
            ${sizeClasses.circle}
            ${checked ? '' : 'translate-x-0.5'}
          `}
        />
      </button>
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              onClick={handleClick}
              className={`
                block text-sm font-medium text-gray-900
                ${disabled ? 'opacity-50' : 'cursor-pointer'}
              `}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;