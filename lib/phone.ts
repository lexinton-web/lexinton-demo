// COPIA IDÉNTICA de lexinton-panel/src/lib/phone.ts (sitio lexinton-web).
// La regla de teléfonos es una sola en todo el sistema: si cambia allá,
// cambiar acá y en la otra copia. Ver el encabezado original abajo.
//
// Normalización de teléfonos — ÚNICA regla del sistema. Hay copias idénticas
// de normalizePhone/classifyPhone en supabase/functions/sync-gmail/phone.ts
// (Deno) y en lexinton-web/lib/phone.ts: si cambia una, cambiar las tres.
// Regla de oro del cliente (07/08/2026):
// NUNCA pisar un número a ciegas — normalizar solo lo que es claramente
// argentino o viene explícito con código de país (+/00); lo dudoso se
// guarda crudo y la UI le avisa al agente con el preview en vivo.
// Objetivo AR: +549XXXXXXXXXX (10 dígitos después del +549).

export function normalizePhone(raw: string): string {
  if (!raw) return "";
  const explicito = /^\s*(\+|00)/.test(raw);

  // Dejar solo dígitos y +
  let digits = raw.replace(/[\s\-\(\)\.]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!/^\d+$/.test(digits)) return "";

  // Con el 54 adelante es argentino: lo que sigue es el número nacional (con o
  // sin 9 de celular, con o sin 0 de larga distancia). "+54" + 8 dígitos NO se
  // completa con 11: le falta la característica (caso real Pamela).
  if (digits.startsWith("54") && digits.length >= 12) {
    const ar = nacionalAR(digits.slice(2), false);
    if (ar) return ar;
  }
  // Otro país explícito (+34…, +1…, 00598…): se respeta tal cual.
  if (explicito) return "+" + digits;
  // Sin código de país: solo si es claramente argentino.
  const ar = nacionalAR(digits, true);
  if (ar) return ar;
  // Nunca inventar la característica argentina: se devuelve como vino y
  // classifyPhone lo marca como dudoso (queda crudo en `phone`).
  return "+" + digits;
}

/**
 * Número nacional argentino (sin el 54) → +549 + 10 dígitos, o null si no es
 * claramente argentino. Acepta 0 de larga distancia, 9 de celular adelante,
 * el "15" después de la característica (011 15 5348-3829, 0298 15 453-6504) y
 * la característica repetida (011 11 5932-8967).
 * `local`: 8 dígitos sueltos = AMBA (solo sin código de país).
 */
function nacionalAR(d: string, local: boolean): string | null {
  if (d.startsWith("0")) d = d.slice(1);
  if (d.startsWith("9") && d.length === 11) d = d.slice(1);
  if (d.length === 12) {
    // Característica: 11 (AMBA) o de 3/4 dígitos del interior (empiezan con 2 o 3)
    for (const largo of [2, 3, 4]) {
      const area = d.slice(0, largo);
      const valida = largo === 2 ? area === "11" : /^[23]/.test(area);
      if (valida && d.slice(largo, largo + 2) === "15") {
        d = area + d.slice(largo + 2);
        break;
      }
    }
    if (d.length === 12 && d.startsWith("1111")) d = d.slice(2);
  }
  if (d.startsWith("15") && d.length === 10) d = "11" + d.slice(2); // 15 5348-3829 sin característica
  if (local && d.length === 8) d = "11" + d;                        // 5348-3829 → AMBA
  // Número nacional: 10 dígitos que arrancan con 1 (AMBA), 2 o 3 (interior)
  return /^[123]\d{9}$/.test(d) ? "+549" + d : null;
}

/** ¿Móvil AR plausible? +549 + 10 dígitos = 14 chars. */
export function isPlausibleArMobile(normalized: string): boolean {
  return /^\+549\d{10}$/.test(normalized);
}

export type PhoneKind = "empty" | "ar" | "intl" | "dudoso";

export type PhoneClassification = {
  kind: PhoneKind;
  /** Valor para phone_normalized. null cuando kind = dudoso/empty. */
  normalized: string | null;
};

/**
 * Clasifica lo que tipeó el agente:
 * - "ar":     normaliza a un móvil argentino plausible → se guarda +549…
 * - "intl":   trae código de país explícito (+/00) y NO es AR → se respeta
 *             tal cual (+1786…): WhatsApp funciona con el número completo.
 * - "dudoso": ni AR plausible ni internacional explícito → se guarda crudo,
 *             sin normalizar (la UI muestra la advertencia).
 */
export function classifyPhone(raw: string): PhoneClassification {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { kind: "empty", normalized: null };

  const hasCountryCode = /^(\+|00)/.test(trimmed);
  const norm = normalizePhone(trimmed);

  if (norm && isPlausibleArMobile(norm)) {
    return { kind: "ar", normalized: norm };
  }
  // Internacional explícito: E.164 razonable (8–15 dígitos) y de OTRO país.
  // Un +54 que no da un móvil argentino es un error de tipeo, no "internacional".
  if (hasCountryCode && /^\+\d{8,15}$/.test(norm) && !norm.startsWith("+54")) {
    return { kind: "intl", normalized: norm };
  }
  return { kind: "dudoso", normalized: null };
}
