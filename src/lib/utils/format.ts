/**
 * Formatea un número como moneda (S/ 0,000.00)
 * @param amount Monto a formatear
 * @returns String formateado
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return 'S/ 0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `S/ ${formatter.format(amount)}`;
};

/**
 * Formatea un número con separadores de miles (en-US)
 * @param amount Monto a formatear
 * @returns String formateado con comas
 */
export const formatNumber = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Limpia un string formateado para obtener el número puro
 */
export const parseFormattedNumber = (formatted: string): string => {
  return formatted.replace(/,/g, '');
};
