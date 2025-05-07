import { CURRENCIES } from '../constants/currencies';

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `${currencyCode} ${amount.toFixed(2)}`;

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol'
  });

  return formatter.format(amount);
}; 