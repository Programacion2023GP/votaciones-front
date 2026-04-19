import React, { useMemo, useState } from "react";
import useProjectsData from "../../hooks/useProjectsData";
import type { Project } from "../../domains/models/project.model";
import { usePdfExport } from "./usePdfExport";
import {
  SectionHeader,
  FilterBar,
  PublicSelect,
  SearchInput,
  DownloadButton,
  EmptyState,
} from "./PublicAtoms";

// ─── Badge de viabilidad ──────────────────────────────────────────────────
const ViabilityBadge: React.FC<{ viable: boolean }> = ({ viable }) => (
  <span
    className="badge"
    style={{
      background: viable ? "rgba(34,155,85,.1)" : "rgba(200,0,0,.07)",
      color: viable ? "#1a7a40" : "#b00",
    }}
  >
    {viable ? "✓ Viable" : "✗ No viable"}
  </span>
);

// ─── Fila de la tabla ─────────────────────────────────────────────────────
const ProjectRow: React.FC<{ project: Project; index: number }> = ({ project, index }) => (
  <tr style={{ animation: `fadeUp .3s ease ${index * 0.03}s both` }}>
    <td style={{ color: "var(--gris-claro)", fontWeight: 600, width: 48 }}>
      {String(index + 1).padStart(3, "0")}
    </td>
    <td>
      <span
        style={{
          fontFamily: "monospace",
          background: "rgba(155,34,66,.07)",
          color: "var(--guinda-dark)",
          borderRadius: 6,
          padding: "2px 8px",
          fontWeight: 700,
          fontSize: ".82rem",
        }}
      >
        {project.folio}
      </span>
    </td>
    <td>
      <span className="stat-pill" style={{ display: "inline-flex" }}>
        Distrito {project.assigned_district}
      </span>
    </td>
    <td style={{ fontWeight: 600, color: "var(--negro)" }}>{project.project_name}</td>
    <td style={{ color: "var(--gris)", fontSize: ".83rem" }}>{project.project_place}</td>
    <td>
      <ViabilityBadge viable={project.viability} />
    </td>
  </tr>
);

// ─── Página principal ─────────────────────────────────────────────────────
const PageProyectosPublicos: React.FC = () => {
  const { items: projects, loading } = useProjectsData();
  const { exportProyectos } = usePdfExport();

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("TODOS");
  const [viabilityFilter, setViabilityFilter] = useState<string>("TODOS");

  // Distritos únicos
  const distritos = useMemo<number[]>(
    () => Array.from(new Set(projects.map((p) => p.assigned_district))).sort((a, b) => a - b),
    [projects]
  );

  // Proyectos filtrados
  const filtered = useMemo<Project[]>(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.project_name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.folio).includes(search) ||
        p.project_place.toLowerCase().includes(search.toLowerCase());

      const matchDistrict =
        districtFilter === "TODOS" || p.assigned_district === Number(districtFilter);

      const matchViability =
        viabilityFilter === "TODOS" ||
        (viabilityFilter === "VIABLE" ? p.viability : !p.viability);

      return matchSearch && matchDistrict && matchViability;
    });
  }, [projects, search, districtFilter, viabilityFilter]);

  const handleExport = () => {
    const distNum = districtFilter === "TODOS" ? null : Number(districtFilter);
    exportProyectos(filtered, distNum);
  };

  return (
    <div className="page-container">
      {/* Cabecera */}
      <div className="page-header" style={{ animation: "fadeUp .4s ease both" }}>
        <h1>Proyectos Ciudadanos</h1>
        <p>
          Catálogo público de proyectos registrados en el proceso de presupuesto participativo 2025.
          Consulta el listado y descárgalo en PDF.
        </p>
        <div className="page-divider" />
      </div>

      {/* Stats rápidas */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          {
            label: "Total proyectos",
            value: projects.length,
            sub: "Registrados en el sistema",
            delay: 0,
          },
          {
            label: "Viables",
            value: projects.filter((p) => p.viability).length,
            sub: `${projects.length ? Math.round((projects.filter((p) => p.viability).length / projects.length) * 100) : 0}% del total`,
            delay: 0.06,
          },
          {
            label: "Distritos",
            value: distritos.length,
            sub: "Con proyectos registrados",
            delay: 0.12,
          },
          {
            label: "Mostrando",
            value: filtered.length,
            sub: "Con filtros aplicados",
            delay: 0.18,
          },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ animationDelay: `${s.delay}s` }}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="table-wrapper" style={{ animation: "fadeUp .45s ease both" }}>
        <div className="table-header">
          <SectionHeader
            title="Listado de Proyectos"
            sub={`${filtered.length} de ${projects.length} proyectos`}
            action={<DownloadButton onClick={handleExport} />}
          />
        </div>

        {/* Filtros */}
        <FilterBar>
          <PublicSelect
            label="Distrito"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="TODOS">Todos los distritos</option>
            {distritos.map((d) => (
              <option key={d} value={d}>
                Distrito {d}
              </option>
            ))}
          </PublicSelect>

          <PublicSelect
            label="Viabilidad"
            value={viabilityFilter}
            onChange={(e) => setViabilityFilter(e.target.value)}
          >
            <option value="TODOS">Todos</option>
            <option value="VIABLE">Viables</option>
            <option value="NO_VIABLE">No viables</option>
          </PublicSelect>

          <SearchInput
            placeholder="Buscar por nombre, folio o lugar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterBar>

        {/* Tabla de datos */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gris)" }}>
              Cargando proyectos…
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Folio</th>
                  <th>Distrito</th>
                  <th>Nombre del Proyecto</th>
                  <th>Lugar</th>
                  <th>Viabilidad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState msg="No se encontraron proyectos con los filtros aplicados" />
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => <ProjectRow key={p.id} project={p} index={i} />)
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageProyectosPublicos;
