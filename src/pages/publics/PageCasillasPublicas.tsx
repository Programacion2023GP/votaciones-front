import React, { useMemo, useState } from "react";
import useCasillasData from "../../hooks/useCasillasData";
import type { Casilla } from "../../domains/models/casilla.model";
import { usePdfExport } from "./usePdfExport";
import {
  SectionHeader,
  FilterBar,
  PublicSelect,
  SearchInput,
  DownloadButton,
  EmptyState,
  StatCard,
} from "./PublicAtoms";

// ─── Tipos de casilla con color ───────────────────────────────────────────
const TYPE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  Urbana:   { bg: "rgba(26,104,145,.1)",  color: "#1a6891", icon: "🏙" },
  Rural:    { bg: "rgba(56,102,65,.1)",   color: "#386641", icon: "🌾" },
  Especial: { bg: "rgba(155,34,66,.08)", color: "#9B2242", icon: "⭐" },
};

const TypeBadge: React.FC<{ type: Casilla["type"] }> = ({ type }) => {
  if (!type) return <span style={{ color: "var(--gris-claro)" }}>—</span>;
  const style = TYPE_STYLES[type] ?? { bg: "#f0f0f0", color: "#555", icon: "📍" };
  return (
    <span
      className="badge"
      style={{ background: style.bg, color: style.color, gap: 4, display: "inline-flex", alignItems: "center" }}
    >
      <span style={{ fontSize: ".85rem" }}>{style.icon}</span>
      {type}
    </span>
  );
};

// ─── Tarjeta de casilla (vista grid) ─────────────────────────────────────
const CasillaCard: React.FC<{ casilla: Casilla; index: number }> = ({ casilla, index }) => {
  const style = casilla.type ? TYPE_STYLES[casilla.type] : null;
  return (
    <div
      className="casilla-card"
      style={{ animationDelay: `${index * 0.05}s`, position: "relative", overflow: "hidden" }}
    >
      {/* Franja de color según tipo */}
      {style && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            bottom: 0,
            background: style.color,
            borderRadius: "16px 0 0 16px",
          }}
        />
      )}
      <div style={{ paddingLeft: style ? 12 : 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div className="casilla-label">Distrito {casilla.district}</div>
          <TypeBadge type={casilla.type} />
        </div>
        <div className="casilla-num" style={{ fontSize: "1.5rem" }}>{casilla.place}</div>
        <div className="casilla-loc" style={{ marginTop: 6 }}>{casilla.location}</div>
        <div
          style={{
            marginTop: 8,
            fontSize: ".75rem",
            color: "var(--gris)",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span>📍</span>
          {casilla.perimeter}
        </div>
        <div className="casilla-stat">
          <div
            className="stat-pill"
            style={{
              background: casilla.active !== false ? "rgba(34,155,85,.08)" : "rgba(200,0,0,.06)",
              color: casilla.active !== false ? "#1a7a40" : "#c00",
            }}
          >
            {casilla.active !== false ? "✓ Activa" : "✗ Inactiva"}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────
const PageCasillasPublicas: React.FC = () => {
  const { items: casillas, loading } = useCasillasData();
  const { exportCasillas } = usePdfExport();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("TODOS");
  const [districtFilter, setDistrictFilter] = useState<string>("TODOS");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const distritos = useMemo<number[]>(
    () => Array.from(new Set(casillas.map((c) => c.district))).sort((a, b) => a - b),
    [casillas]
  );

  const filtered = useMemo<Casilla[]>(() => {
    return casillas.filter((c) => {
      const matchSearch =
        c.place.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.perimeter.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "TODOS" || c.type === typeFilter;
      const matchDist = districtFilter === "TODOS" || c.district === Number(districtFilter);
      return matchSearch && matchType && matchDist;
    });
  }, [casillas, search, typeFilter, districtFilter]);

  // Stats por tipo
  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of casillas) counts[c.type ?? "Sin tipo"] = (counts[c.type ?? "Sin tipo"] ?? 0) + 1;
    return counts;
  }, [casillas]);

  return (
    <div className="page-container">
      {/* Cabecera */}
      <div className="page-header" style={{ animation: "fadeUp .4s ease both" }}>
        <h1>Casillas de Votación</h1>
        <p>
          Catálogo público de casillas habilitadas para el proceso de presupuesto participativo 2025.
          Ubica la casilla más cercana a tu domicilio.
        </p>
        <div className="page-divider" />
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Total casillas" value={casillas.length} sub="Registradas en el proceso" delay={0} />
        <StatCard label="Urbanas" value={byType["Urbana"] ?? 0} sub="Casillas en zona urbana" delay={0.06} />
        <StatCard label="Rurales" value={byType["Rural"] ?? 0} sub="Casillas en zona rural" delay={0.12} />
        <StatCard label="Especiales" value={byType["Especial"] ?? 0} sub="Casillas con régimen especial" delay={0.18} />
      </div>

      {/* Panel de filtros + acciones */}
      <div className="table-wrapper" style={{ animation: "fadeUp .45s ease both" }}>
        <div className="table-header">
          <SectionHeader
            title="Listado de Casillas"
            sub={`${filtered.length} de ${casillas.length} casillas`}
            action={
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Toggle vista */}
                <div style={{ display: "flex", background: "#f0eded", borderRadius: 8, padding: 3, gap: 2 }}>
                  {(["grid", "table"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewMode(m)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: viewMode === m ? "var(--guinda)" : "transparent",
                        color: viewMode === m ? "#fff" : "var(--gris)",
                        cursor: "pointer",
                        fontSize: ".78rem",
                        fontWeight: 700,
                        transition: "all .2s",
                      }}
                    >
                      {m === "grid" ? "⊞ Tarjetas" : "☰ Tabla"}
                    </button>
                  ))}
                </div>
                <DownloadButton onClick={() => exportCasillas(filtered)} />
              </div>
            }
          />
        </div>

        <FilterBar>
          <PublicSelect
            label="Distrito"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="TODOS">Todos los distritos</option>
            {distritos.map((d) => (
              <option key={d} value={d}>Distrito {d}</option>
            ))}
          </PublicSelect>

          <PublicSelect
            label="Tipo"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="Urbana">Urbana</option>
            <option value="Rural">Rural</option>
            <option value="Especial">Especial</option>
          </PublicSelect>

          <SearchInput
            placeholder="Buscar por nombre, lugar o perímetro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterBar>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gris)" }}>
            Cargando casillas…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "0 24px 24px" }}>
            <EmptyState msg="No se encontraron casillas con los filtros aplicados" />
          </div>
        ) : viewMode === "grid" ? (
          /* Vista tarjetas */
          <div style={{ padding: "16px 24px" }}>
            <div className="grid-cards">
              {filtered.map((c, i) => <CasillaCard key={c.id} casilla={c} index={i} />)}
            </div>
          </div>
        ) : (
          /* Vista tabla */
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Distrito</th>
                  <th>Tipo</th>
                  <th>Nombre / Lugar</th>
                  <th>Perímetro</th>
                  <th>Ubicación</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ animation: `fadeUp .3s ease ${i * 0.03}s both` }}>
                    <td style={{ color: "var(--gris-claro)", fontWeight: 600 }}>
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td>
                      <span className="stat-pill" style={{ display: "inline-flex" }}>
                        {c.district}
                      </span>
                    </td>
                    <td><TypeBadge type={c.type} /></td>
                    <td style={{ fontWeight: 600, color: "var(--negro)" }}>{c.place}</td>
                    <td style={{ color: "var(--gris)", fontSize: ".83rem" }}>{c.perimeter}</td>
                    <td style={{ color: "var(--gris)", fontSize: ".83rem" }}>{c.location}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: c.active !== false ? "rgba(34,155,85,.1)" : "rgba(200,0,0,.07)",
                          color: c.active !== false ? "#1a7a40" : "#b00",
                        }}
                      >
                        {c.active !== false ? "✓ Activa" : "✗ Inactiva"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageCasillasPublicas;
