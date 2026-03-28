export function numeroALetras(monto: number): string {
  if (!monto) return 'CERO Y 00/100 SOLES'

  const enteros = Math.floor(monto)
  const centavos = Math.round((monto - enteros) * 100)

  // Función interna recursiva básica (hasta 999,999)
  function convertir(num: number): string {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
    const decenas = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']
    const veinte = ['VEINTE', 'VEINTIUN', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE']
    const decenasMultiplos = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

    if (num === 0) return ''
    if (num === 100) return 'CIEN'
    if (num < 10) return unidades[num]
    if (num < 20) return decenas[num - 10]
    if (num < 30) return veinte[num - 20]
    if (num < 100) return decenasMultiplos[Math.floor(num / 10)] + (num % 10 !== 0 ? ' Y ' + unidades[num % 10] : '')
    if (num < 1000) return centenas[Math.floor(num / 100)] + ' ' + convertir(num % 100)
    
    if (num < 2000) return 'MIL ' + convertir(num % 1000)
    if (num < 1000000) return convertir(Math.floor(num / 1000)) + ' MIL ' + convertir(num % 1000)

    // Expand if needed, for small loans up to 999,999 is enough
    return ''
  }

  const letras = enteros === 0 ? 'CERO' : convertir(enteros).trim()
  const centsStr = centavos < 10 ? `0${centavos}` : `${centavos}`

  return `${letras} CON ${centsStr}/100 SOLES`.toUpperCase()
}
