/**
 * barrio-groups.ts
 * Agrupaciones de barrios para el buscador.
 * Seleccionar un barrio prioritario expande la búsqueda
 * a todos sus sub-barrios automáticamente.
 */

export const BARRIO_GROUPS: Record<string, string[]> = {
  'Palermo': [
    'Palermo',
    'Palermo Chico',
    'Palermo Soho',
    'Palermo Hollywood',
    'Palermo Botánico',
    'Las Cañitas',
    'Palermo Nuevo',
  ],
  'Belgrano': [
    'Belgrano',
    'Belgrano C',
    'Barrancas de Belgrano',
    'Belgrano R',
  ],
  'Núñez': ['Núñez', 'Nuñez'],
  'Recoleta': ['Recoleta'],
}

/** Dado un barrio seleccionado, devolver todos los barrios del grupo */
export function expandBarrioGroup(barrio: string): string[] {
  return BARRIO_GROUPS[barrio] || [barrio]
}

/** Lista de barrios prioritarios (para mostrar primero en el dropdown) */
export const BARRIOS_PRIORITARIOS = Object.keys(BARRIO_GROUPS)
