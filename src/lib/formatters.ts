export const formatCurrency = (value: number, options?: { decimals?: number }) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: options?.decimals ?? 2,
    minimumFractionDigits: options?.decimals ?? 2,
  }).format(value);
};

export const formatNumber = (value: number, options?: { decimals?: number }) => {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: options?.decimals ?? 0,
    minimumFractionDigits: options?.decimals ?? 0,
  }).format(value);
};

export const formatPercentage = (value: number, options?: { decimals?: number }) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: options?.decimals ?? 0,
    minimumFractionDigits: options?.decimals ?? 0,
  }).format(value / 100);
};
