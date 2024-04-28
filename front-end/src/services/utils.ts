export const sleep = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

//TODO aggiungere funzioni utili
/** Validation */
export const validators = {
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Please enter a valid email address'
  },
  number: (v: any) => {
    // Verifica se il valore è un numero valido, maggiore o uguale a zero e ha al massimo due decimali
    const isValidNumber = !isNaN(parseFloat(v)) && isFinite(v) && v >= 0
    const hasMaxTwoDecimals = /^\d+(\.\d{1,2})?$/.test(v)
    return (
      (isValidNumber && hasMaxTwoDecimals) ||
      'Please enter a valid number greater than or equal to 0 with at most two decimals'
    )
  },
  required: (v: any) => (v !== null && v !== undefined && v !== '') || 'This field is required',
  hexColor: (v: string) => {
    const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return pattern.test(v) || 'Please enter a valid HEX color code'
  },
  integer: (v: any) => {
    const isInteger = Number.isInteger(Number(v))
    return isInteger || 'Please enter a valid integer number'
  },
}
