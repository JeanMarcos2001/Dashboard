export type ResultadoCompartir = 'compartido' | 'copiado' | 'cancelado' | 'error';

/**
 * Comparte un texto con el selector nativo del dispositivo (WhatsApp, correo, mensajes, etc.).
 * Si el navegador no lo soporta, copia el texto al portapapeles.
 * Debe llamarse directamente desde un gesto del usuario (clic/toque).
 */
export const compartirTexto = async (titulo: string, texto: string): Promise<ResultadoCompartir> => {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: titulo, text: texto });
      return 'compartido';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelado';
      // Cualquier otro fallo del selector: se intenta con el portapapeles
    }
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'error';
  }
};
