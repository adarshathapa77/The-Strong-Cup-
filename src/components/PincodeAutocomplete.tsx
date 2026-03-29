import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, X } from 'lucide-react';
import { PincodeResult } from '../services/pincodeService';

interface PincodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: PincodeResult[];
  isLoading: boolean;
  error?: string | null;
  onSelect: (pincode: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PincodeAutocomplete({
  value,
  onChange,
  suggestions,
  isLoading,
  error,
  onSelect,
  onClear,
  disabled = false,
  placeholder = 'Enter pincode or city name',
  className = '',
}: PincodeAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex].pincode);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (pincode: string) => {
    onSelect(pincode);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 text-tea-brown/40"
          size={18}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-tea-cream/30 border-2 ${
            error ? 'border-red-400' : 'border-tea-brown/5'
          } pl-12 pr-24 py-3 rounded-xl focus:border-tea-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {isLoading && (
            <Loader2 className="text-tea-gold animate-spin" size={18} />
          )}

          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-tea-brown/40 hover:text-tea-brown transition-colors p-1 rounded-lg hover:bg-tea-brown/5"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-tea-brown/10 overflow-hidden max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.pincode}
                type="button"
                onClick={() => handleSelect(suggestion.pincode)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  highlightedIndex === index
                    ? 'bg-tea-gold/10'
                    : 'hover:bg-tea-cream/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-tea-brown text-sm">
                      {suggestion.pincode}
                    </span>
                    {suggestion.is_serviceable && (
                      <CheckCircle2 size={14} className="text-tea-green flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-tea-brown/60 truncate">
                    {suggestion.area ? `${suggestion.area}, ` : ''}
                    {suggestion.city}, {suggestion.state}
                  </p>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <span className="text-[10px] font-bold text-tea-brown/40 uppercase tracking-wider">
                    {suggestion.delivery_days}d
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center space-x-2 text-red-500 text-xs font-medium"
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
