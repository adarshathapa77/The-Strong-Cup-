import { useState, useEffect, useCallback } from 'react';
import { PincodeService, PincodeResult, PincodeDetails, ServiceabilityInfo } from '../services/pincodeService';

interface UsePincodeSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: PincodeResult[];
  isLoading: boolean;
  error: string | null;
  selectedPincode: PincodeDetails | null;
  selectPincode: (pincode: string) => Promise<void>;
  deliveryInfo: ServiceabilityInfo | null;
  clearSelection: () => void;
}

export const usePincodeSearch = (): UsePincodeSearchReturn => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PincodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPincode, setSelectedPincode] = useState<PincodeDetails | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<ServiceabilityInfo | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const searchPincodes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await PincodeService.searchPincodes(debouncedQuery);
        setSuggestions(results);

        if (results.length === 0) {
          setError('No matching pincodes found');
        }
      } catch (err) {
        setError('Failed to search pincodes. Please try again.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchPincodes();
  }, [debouncedQuery]);

  const selectPincode = useCallback(async (pincode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const details = await PincodeService.getPincodeDetails(pincode);

      if (!details) {
        setError('Failed to load pincode details');
        return;
      }

      setSelectedPincode(details);
      setQuery(pincode);
      setSuggestions([]);

      const serviceability = await PincodeService.checkServiceability(pincode);
      setDeliveryInfo(serviceability);
    } catch (err) {
      setError('Failed to load pincode details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPincode(null);
    setDeliveryInfo(null);
    setQuery('');
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    selectedPincode,
    selectPincode,
    deliveryInfo,
    clearSelection,
  };
};
