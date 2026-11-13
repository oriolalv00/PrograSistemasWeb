// Genera un código numérico aleatorio de 6 dígitos
export const generateSixDigitCode = (): string => 
  String(Math.floor(100000 + Math.random() * 900000));