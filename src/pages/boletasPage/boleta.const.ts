// ─── Colores por categoría / distrito ────────────────────────────────────
// La clave coincide con el valor de Project.assigned_district
export const CAT_COLORS: Record<string | number, string> = {
   "Espacio Publico": "#2d6a4f",
   Movilidad: "#1a6891",
   Salud: "#9b2242",
   Infraestructura: "#5a3825",
   Educacion: "#7b3f91",
   "Medio Ambiente": "#386641",
   Servicios: "#8b6914",
   Deporte: "#c94f0a",
   Economia: "#1f5c8a",
   Social: "#912248",
   Seguridad: "#363d45",
   Tecnologia: "#1a5276",
   Inclusion: "#7d5a1e",
   Cultura: "#6d2e8a",
   // Soporte numérico (distrito asignado como número)
   1: "#1a6891",
   2: "#7b3f91",
   3: "#2d6a4f",
   4: "#386641",
   5: "#5a3825"
};

/** Color de fallback cuando el distrito/categoría no tiene mapeo. */
export const FALLBACK_COLOR = "#555";

/** Número máximo de votos permitidos por boleta. */
export const MAX_VOTOS = 10;

/** Longitud mínima aceptada para el campo voterId. */
export const MIN_VOTER_ID_LEN = 5;
