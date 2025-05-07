import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCIES } from '../constants/currencies';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  getCurrencySymbol: () => string;
}

const defaultCurrency = 'USD';

const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrency: () => {},
  getCurrencySymbol: () => '$',
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency && CURRENCIES.some(c => c.code === savedCurrency)) {
        return savedCurrency;
      }
      return defaultCurrency;
    } catch (error) {
      console.error('Error reading currency from localStorage:', error);
      return defaultCurrency;
    }
  });

  const setCurrency = (newCurrency: string) => {
    try {
      if (CURRENCIES.some(c => c.code === newCurrency)) {
        setCurrencyState(newCurrency);
        localStorage.setItem('currency', newCurrency);
      } else {
        console.warn(`Invalid currency code: ${newCurrency}`);
      }
    } catch (error) {
      console.error('Error setting currency:', error);
    }
  };

  const getCurrencySymbol = () => {
    const currencyObj = CURRENCIES.find(c => c.code === currency);
    return currencyObj ? currencyObj.symbol : '$';
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currency' && e.newValue) {
        setCurrencyState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}; 