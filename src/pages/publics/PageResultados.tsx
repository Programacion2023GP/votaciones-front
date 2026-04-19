import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import useProjectsData from "../../hooks/useProjectsData";
import useBallotsData from "../../hooks/useBallotsData";
import useParticipationsData from "../../hooks/useParticipationsData";
import useUsersData from "../../hooks/useUsersData";
import { useResultados } from "./useResultados";
import {
  StatCard,
  SectionHeader,
  ScopeTabs,
  PublicSelect,
  RankingTable,
  EmptyState,
  type ScopeTab,
} from "./PublicAtoms";

// ─── Tooltip personalizado para las gráficas ──────────────────────────────
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontSize: 13,
        boxShadow: "0 4px 16px rgba(0,0,0,.1)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: <b>{p.value.toLocaleString("es-MX")}</b>
        </div>
      ))}
    </div>
  );
};

// ─── Bloque de sección con card ───────────────────────────────────────────
const SectionCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => (
  <div
    className="table-wrapper"
    style={{
      padding: "22px 24px",
      marginBottom: 20,
      animation: `fadeUp .45s ease ${delay}s both`,
    }}
  >
    {children}
  </div>
);

// ─── Tabla compacta de casilla/distrito ───────────────────────────────────
interface BreakdownRowProps {
  label: string;
  participaciones: number;
  votos: number;
  totalPart: number;
  totalVotos: number;
  index: number;
}

const BreakdownRow: React.FC<BreakdownRowProps> = ({
  label, participaciones, votos, totalPart, totalVotos, index,
}) => {
  const pctPart = totalPart > 0 ? Math.round((participaciones / totalPart) * 100) : 0;
  const pctVotos = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;

  return (
    <tr style={{ animation: `fadeUp .3s ease ${index * 0.04}s both` }}>
      <td style={{ fontWeight: 600, color: "var(--negro)" }}>{label}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
            <div style={{ height: "100%", width: `${pctPart}%`, background: "#9B2242", borderRadius: 4 }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--guinda-dark)", minWidth: 36 }}>
            {participaciones.toLocaleString("es-MX")}
          </span>
          <span style={{ fontSize: ".7rem", color: "var(--gris-claro)" }}>({pctPart}%)</span>
        </div>
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
            <div style={{ height: "100%", width: `${pctVotos}%`, background: "#0f3460", borderRadius: 4 }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "#0f3460", minWidth: 36 }}>
            {votos.toLocaleString("es-MX")}
          </span>
          <span style={{ fontSize: ".7rem", color: "var(--gris-claro)" }}>({pctVotos}%)</span>
        </div>
      </td>
    </tr>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────
const PageResultados: React.FC = () => {
  const { items: projects, loading: loadingProj } = useProjectsData();
  const { items: ballots, loading: loadingBallots } = useBallotsData();
  const { items: participaciones, loading: loadingPart } = useParticipationsData();
  const { items: users, loading: loadingUsers } = useUsersData();

  const loading = loadingProj || loadingBallots || loadingPart || loadingUsers;

  // ── Métricas calculadas ────────────────────────────────────────────────
  const {
    participacionStats,
    votoStats,
    top10Stats,
    distritos,
    casillasConTotales,
    userMap,
  } = useResultados(projects, users, ballots, participaciones);

  // ── Filtros de la sección Top 10 ───────────────────────────────────────
  const [top10Scope, setTop10Scope] = useState<ScopeTab>("general");
  const [top10Casilla, setTop10Casilla] = useState<number>(users[0]?.id ?? 0);
  const [top10Distrito, setTop10Distrito] = useState<number>(distritos[0] ?? 0);

  // ── Filtros de la sección desglose ─────────────────────────────────────
  const [desglosScope, setDesglosScope] = useState<ScopeTab>("casilla");

  // ── Datos del Top 10 según scope ──────────────────────────────────────
  const top10Data = useMemo(() => {
    if (top10Scope === "general") return top10Stats.general;
    if (top10Scope === "casilla") return top10Stats.porCasilla[top10Casilla] ?? [];
    return top10Stats.porDistrito[top10Distrito] ?? [];
  }, [top10Scope, top10Stats, top10Casilla, top10Distrito]);

  // ── Datos de gráfica por casilla ──────────────────────────────────────
  const chartCasilla = useMemo(
    () =>
      casillasConTotales.map((c) => ({
        name: c.user.casilla_place ?? `C${c.user.id}`,
        participaciones: c.participaciones,
        votos: c.votos,
      })),
    [casillasConTotales]
  );

  // ── Datos de gráfica por distrito ────────────────────────────────────
  const chartDistrito = useMemo(
    () =>
      distritos.map((d) => ({
        name: `Dist. ${d}`,
        participaciones: participacionStats.porDistrito[d] ?? 0,
        votos: votoStats.porDistrito[d] ?? 0,
      })),
    [distritos, participacionStats, votoStats]
  );

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gris)" }}>
          Cargando resultados…
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Cabecera */}
      <div className="page-header" style={{ animation: "fadeUp .4s ease both" }}>
        <h1>Resultados del Proceso</h1>
        <p>
          Concentrado oficial de participaciones y votaciones del proceso de presupuesto
          participativo 2025. Datos actualizados en tiempo real.
        </p>
        <div className="page-divider" />
      </div>

      {/* ── KPIs globales ── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          {
            label: "Total participaciones",
            value: participacionStats.total.toLocaleString("es-MX"),
            sub: "Ciudadanos que participaron",
            delay: 0,
          },
          {
            label: "Total votos emitidos",
            value: votoStats.total.toLocaleString("es-MX"),
            sub: "Suma de todos los votos en boletas",
            delay: 0.06,
          },
          {
            label: "Proyectos en competencia",
            value: projects.length,
            sub: "Registrados en el sistema",
            delay: 0.12,
          },
          {
            label: "Casillas activas",
            value: users.filter((u) => u.casilla_active !== false).length,
            sub: `de ${users.length} totales`,
            delay: 0.18,
          },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Gráfica por casilla ── */}
      <SectionCard delay={0.1}>
        <SectionHeader
          title="Participaciones y votos por casilla"
          sub="Comparativo de actividad entre casillas"
        />
        {chartCasilla.length === 0 ? (
          <EmptyState msg="Sin datos de casillas" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartCasilla} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontFamily: "Nunito Sans", fontSize: 11, fill: "#727372" }} />
              <YAxis tick={{ fontFamily: "Nunito Sans", fontSize: 11, fill: "#727372" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="participaciones" name="Participaciones" fill="#9B2242" radius={[4, 4, 0, 0]} />
              <Bar dataKey="votos" name="Votos emitidos" fill="#0f3460" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* ── Gráfica por distrito ── */}
      {chartDistrito.length > 0 && (
        <SectionCard delay={0.15}>
          <SectionHeader
            title="Participaciones y votos por distrito"
            sub="Distribución territorial del proceso"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartDistrito} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontFamily: "Nunito Sans", fontSize: 11, fill: "#727372" }} />
              <YAxis tick={{ fontFamily: "Nunito Sans", fontSize: 11, fill: "#727372" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="participaciones" name="Participaciones" fill="#9B2242" radius={[4, 4, 0, 0]} />
              <Bar dataKey="votos" name="Votos emitidos" fill="#0f3460" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* ── Desglose tabular ── */}
      <SectionCard delay={0.2}>
        <SectionHeader
          title="Desglose de participaciones y votos"
          sub="Vista detallada por casilla o distrito"
        />
        <ScopeTabs
          active={desglosScope}
          onChange={(t) => setDesglosScope(t === "general" ? "casilla" : t)}
        />

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>{desglosScope === "casilla" ? "Casilla" : "Distrito"}</th>
                <th>Participaciones</th>
                <th>Votos emitidos</th>
              </tr>
            </thead>
            <tbody>
              {desglosScope === "casilla"
                ? casillasConTotales.map((c, i) => (
                    <BreakdownRow
                      key={c.user.id}
                      index={i}
                      label={c.user.casilla_place ?? `Casilla ${c.user.id}`}
                      participaciones={c.participaciones}
                      votos={c.votos}
                      totalPart={participacionStats.total}
                      totalVotos={votoStats.total}
                    />
                  ))
                : distritos.map((d, i) => (
                    <BreakdownRow
                      key={d}
                      index={i}
                      label={`Distrito ${d}`}
                      participaciones={participacionStats.porDistrito[d] ?? 0}
                      votos={votoStats.porDistrito[d] ?? 0}
                      totalPart={participacionStats.total}
                      totalVotos={votoStats.total}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Top 10 proyectos ── */}
      <SectionCard delay={0.25}>
        <SectionHeader
          title="Top 10 proyectos más votados"
          sub="Ranking basado en la suma de votos recibidos (vote_1 a vote_5)"
        />

        <ScopeTabs active={top10Scope} onChange={setTop10Scope} />

        {/* Filtro secundario por casilla o distrito */}
        {top10Scope === "casilla" && users.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <PublicSelect
              label="Casilla"
              value={top10Casilla}
              onChange={(e) => setTop10Casilla(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.casilla_place ?? `Casilla ${u.id}`}
                </option>
              ))}
            </PublicSelect>
          </div>
        )}

        {top10Scope === "distrito" && distritos.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <PublicSelect
              label="Distrito"
              value={top10Distrito}
              onChange={(e) => setTop10Distrito(Number(e.target.value))}
            >
              {distritos.map((d) => (
                <option key={d} value={d}>
                  Distrito {d}
                </option>
              ))}
            </PublicSelect>
          </div>
        )}

        <RankingTable
          entries={top10Data}
          emptyMsg={
            top10Scope === "general"
              ? "Aún no hay votos registrados"
              : `Sin votos para ${top10Scope === "casilla" ? "esta casilla" : "este distrito"}`
          }
        />
      </SectionCard>
    </div>
  );
};

export default PageResultados;
