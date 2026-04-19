import { useMemo } from "react";
import type { Ballot } from "../../domains/models/ballot.model";
import type { Participation } from "../../domains/models/participation.model";
import type { Project } from "../../domains/models/project.model";
import type { User } from "../../domains/models/user.model";
import type {
  ParticipacionStats,
  VotoStats,
  Top10Stats,
  ProjectRankEntry,
} from "./public-pages.types";

const VOTE_KEYS: Array<keyof Pick<Ballot, "vote_1" | "vote_2" | "vote_3" | "vote_4" | "vote_5">> = [
  "vote_1",
  "vote_2",
  "vote_3",
  "vote_4",
  "vote_5",
];

const TOP_N = 10;

/**
 * useResultados
 * ──────────────
 * Dado el catálogo de projects, la lista de usuarios (con info de casilla),
 * los ballots y las participaciones, devuelve todas las métricas necesarias
 * para la página de resultados. Memoizado: solo recalcula si cambian las listas.
 */
export function useResultados(
  projects: Project[],
  users: User[],
  ballots: Ballot[],
  participaciones: Participation[]
) {
  // Mapa rápido: user_id → User (para obtener distrito sin iterar)
  const userMap = useMemo<Map<number, User>>(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  // Mapa rápido: project_id → Project
  const projectMap = useMemo<Map<number, Project>>(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  // ── Participaciones ────────────────────────────────────────────────────
  const participacionStats = useMemo<ParticipacionStats>(() => {
    const porCasilla: Record<number, number> = {};
    const porDistrito: Record<number, number> = {};

    for (const p of participaciones) {
      // Por casilla (user_id)
      porCasilla[p.user_id] = (porCasilla[p.user_id] ?? 0) + 1;

      // Por distrito — obtenemos el distrito del usuario operador
      const distrito = userMap.get(p.user_id)?.casilla_district;
      if (distrito != null) {
        porDistrito[distrito] = (porDistrito[distrito] ?? 0) + 1;
      }
    }

    return { total: participaciones.length, porCasilla, porDistrito };
  }, [participaciones, userMap]);

  // ── Votos ──────────────────────────────────────────────────────────────
  const votoStats = useMemo<VotoStats>(() => {
    const porCasilla: Record<number, number> = {};
    const porDistrito: Record<number, number> = {};
    let total = 0;

    for (const b of ballots) {
      const votos = VOTE_KEYS.reduce<number>(
        (acc, k) => acc + (b[k] != null ? 1 : 0),
        0
      );
      total += votos;
      porCasilla[b.user_id] = (porCasilla[b.user_id] ?? 0) + votos;

      const distrito = userMap.get(b.user_id)?.casilla_district;
      if (distrito != null) {
        porDistrito[distrito] = (porDistrito[distrito] ?? 0) + votos;
      }
    }

    return { total, porCasilla, porDistrito };
  }, [ballots, userMap]);

  // ── Conteo bruto de votos por proyecto ────────────────────────────────
  /**
   * Devuelve un Map<projectId, count> para un subconjunto de ballots.
   */
  const contarVotos = (subset: Ballot[]): Map<number, number> => {
    const counts = new Map<number, number>();
    for (const b of subset) {
      for (const k of VOTE_KEYS) {
        const pid = b[k];
        if (pid != null) counts.set(pid, (counts.get(pid) ?? 0) + 1);
      }
    }
    return counts;
  };

  /**
   * Convierte un Map de conteos en un array ordenado de ProjectRankEntry,
   * limitado a TOP_N elementos.
   */
  const toRanking = (counts: Map<number, number>): ProjectRankEntry[] =>
    Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, TOP_N)
      .flatMap(([pid, votes]) => {
        const project = projectMap.get(pid);
        return project ? [{ project, votes }] : [];
      });

  // ── Top 10 ─────────────────────────────────────────────────────────────
  const top10Stats = useMemo<Top10Stats>(() => {
    // General
    const general = toRanking(contarVotos(ballots));

    // Por casilla (user_id)
    const casillaIds = Array.from(new Set(ballots.map((b) => b.user_id)));
    const porCasilla: Record<number, ProjectRankEntry[]> = {};
    for (const cid of casillaIds) {
      const subset = ballots.filter((b) => b.user_id === cid);
      porCasilla[cid] = toRanking(contarVotos(subset));
    }

    // Por distrito
    const distritos = Array.from(new Set(users.map((u) => u.casilla_district).filter((d): d is number => d != null)));
    const porDistrito: Record<number, ProjectRankEntry[]> = {};
    for (const d of distritos) {
      const userIds = users.filter((u) => u.casilla_district === d).map((u) => u.id);
      const subset = ballots.filter((b) => userIds.includes(b.user_id));
      porDistrito[d] = toRanking(contarVotos(subset));
    }

    return { general, porCasilla, porDistrito };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballots, users, projectMap]);

  // ── Lista de distritos únicos (para filtros) ───────────────────────────
  const distritos = useMemo<number[]>(() => {
    return Array.from(
      new Set(users.map((u) => u.casilla_district).filter((d): d is number => d != null))
    ).sort((a, b) => a - b);
  }, [users]);

  // ── Casillas únicas con totales ────────────────────────────────────────
  const casillasConTotales = useMemo(() => {
    return users.map((u) => ({
      user: u,
      participaciones: participacionStats.porCasilla[u.id] ?? 0,
      votos: votoStats.porCasilla[u.id] ?? 0,
    }));
  }, [users, participacionStats, votoStats]);

  return {
    userMap,
    projectMap,
    participacionStats,
    votoStats,
    top10Stats,
    distritos,
    casillasConTotales,
  };
}
