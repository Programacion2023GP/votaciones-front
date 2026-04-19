import type { Project } from "../../domains/models/project.model";
import type { Casilla } from "../../domains/models/casilla.model";
import type { User } from "../../domains/models/user.model";

// ─── Estadísticas de participaciones ─────────────────────────────────────

export interface ParticipacionStats {
  /** Total global de participaciones */
  total: number;
  /** Total por user_id (casilla operador) */
  porCasilla: Record<number, number>;
  /** Total por distrito (casilla_district del User) */
  porDistrito: Record<number, number>;
}

// ─── Estadísticas de votos ────────────────────────────────────────────────

export interface VotoStats {
  /** Total global de votos emitidos (suma de todos los vote_N no nulos) */
  total: number;
  /** Total por user_id */
  porCasilla: Record<number, number>;
  /** Total por distrito */
  porDistrito: Record<number, number>;
}

// ─── Entrada del ranking ──────────────────────────────────────────────────

export interface ProjectRankEntry {
  project: Project;
  votes: number;
}

export interface Top10Stats {
  general: ProjectRankEntry[];
  /** Clave: user_id */
  porCasilla: Record<number, ProjectRankEntry[]>;
  /** Clave: número de distrito */
  porDistrito: Record<number, ProjectRankEntry[]>;
}

// ─── Contexto enriquecido de casilla ─────────────────────────────────────
/** User enriquecido con sus totales calculados, para la tabla de casillas */
export interface CasillaEnriquecida extends Casilla {
  operador?: User;
  totalParticipaciones: number;
  totalVotos: number;
}

// ─── Props de páginas públicas ────────────────────────────────────────────

export interface PageProyectosPublicosProps {}
export interface PageCasillasPublicasProps {}
export interface PageResultadosProps {}

// ─── Helpers de filtros (usados en las tablas) ────────────────────────────

export type FiltroScope = "general" | "casilla" | "distrito";

export interface FiltroResultados {
  scope: FiltroScope;
  casilla_id: number | null;
  distrito: number | null;
}
