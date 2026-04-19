import React from "react";
import type { ProjectRankEntry } from "./public-pages.types";

// ─── StatCard ─────────────────────────────────────────────────────────────
interface StatCardProps {
   label: string;
   value: number | string;
   sub?: string;
   delay?: number;
   accent?: string; // color override para la barra superior
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, delay = 0, accent }) => (
   <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
      {accent && (
         <div
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               height: 3,
               background: accent,
               borderRadius: "16px 16px 0 0"
            }}
         />
      )}
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
   </div>
);

// ─── SectionHeader ────────────────────────────────────────────────────────
interface SectionHeaderProps {
   title: string;
   sub?: string;
   action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, sub, action }) => (
   <div
      style={{
         display: "flex",
         alignItems: "flex-end",
         justifyContent: "space-between",
         marginBottom: 16,
         flexWrap: "wrap",
         gap: 10
      }}
   >
      <div>
         <div
            style={{
               fontFamily: "'Playfair Display', serif",
               fontSize: "1.15rem",
               fontWeight: 700,
               color: "var(--guinda-dark)"
            }}
         >
            {title}
         </div>
         {sub && <div style={{ fontSize: ".78rem", color: "var(--gris)", marginTop: 2 }}>{sub}</div>}
      </div>
      {action && <div>{action}</div>}
   </div>
);

// ─── FilterBar ────────────────────────────────────────────────────────────
interface FilterBarProps {
   children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children }) => (
   <div
      style={{
         display: "flex",
         gap: 10,
         flexWrap: "wrap",
         marginBottom: 16,
         padding: "14px 18px",
         background: "#fff",
         borderRadius: 12,
         border: "1px solid rgba(0,0,0,.05)",
         boxShadow: "0 1px 8px rgba(0,0,0,.04)"
      }}
   >
      {children}
   </div>
);

// ─── PublicSelect ─────────────────────────────────────────────────────────
interface PublicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
   label?: string;
}

export const PublicSelect: React.FC<PublicSelectProps> = ({ label, children, ...rest }) => (
   <label
      style={{
         display: "flex",
         flexDirection: "column",
         gap: 4,
         fontSize: ".75rem",
         fontWeight: 700,
         color: "var(--gris-cool)",
         textTransform: "uppercase",
         letterSpacing: ".06em"
      }}
   >
      {label}
      <select className="filter-select" {...rest}>
         {children}
      </select>
   </label>
);

// ─── SearchInput ──────────────────────────────────────────────────────────
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = (props) => (
   <div className="ballot-search-wrap" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
      <span className="ballot-search-icon">
         <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
         </svg>
      </span>
      <input className="ballot-search-input" {...props} />
   </div>
);

// ─── RankingTable ─────────────────────────────────────────────────────────
interface RankingTableProps {
   entries: ProjectRankEntry[];
   maxVotes?: number; // Para la barra de proporción; por defecto el max del propio array
   emptyMsg?: string;
}

export const RankingTable: React.FC<RankingTableProps> = ({ entries, maxVotes, emptyMsg = "Sin datos" }) => {
   const max = maxVotes ?? entries[0]?.votes ?? 1;

   if (entries.length === 0) {
      return <div style={{ textAlign: "center", color: "var(--gris-claro)", padding: "28px 0", fontSize: ".88rem" }}>{emptyMsg}</div>;
   }

   return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
         {entries.map((e, i) => {
            const pct = max > 0 ? (e.votes / max) * 100 : 0;
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return (
               <div
                  key={e.project.id}
                  style={{
                     display: "flex",
                     alignItems: "center",
                     gap: 12,
                     padding: "10px 14px",
                     background: i < 3 ? "rgba(155,34,66,.03)" : "#fafaf8",
                     borderRadius: 10,
                     border: i < 3 ? "1px solid rgba(155,34,66,.1)" : "1px solid transparent",
                     animation: `fadeUp .35s ease ${i * 0.04}s both`
                  }}
               >
                  {/* Posición */}
                  <div
                     style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: i < 3 ? "var(--guinda)" : "rgba(0,0,0,.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Playfair Display',serif",
                        fontWeight: 900,
                        fontSize: ".8rem",
                        color: i < 3 ? "#fff" : "var(--gris)",
                        flexShrink: 0
                     }}
                  >
                     {medal ? <span style={{ fontSize: "1rem" }}>{medal}</span> : i + 1}
                  </div>

                  {/* Info proyecto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                     <div
                        style={{
                           fontWeight: 700,
                           fontSize: ".85rem",
                           color: "var(--negro)",
                           whiteSpace: "nowrap",
                           overflow: "hidden",
                           textOverflow: "ellipsis"
                        }}
                     >
                        {e.project.project_name}
                     </div>
                     <div style={{ fontSize: ".7rem", color: "var(--gris)", marginTop: 1 }}>
                        Folio {e.project.folio} · Distrito {e.project.assigned_district}
                     </div>
                     {/* Barra de proporción */}
                     <div
                        style={{
                           height: 4,
                           background: "#eee",
                           borderRadius: 4,
                           marginTop: 5,
                           overflow: "hidden"
                        }}
                     >
                        <div
                           style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "linear-gradient(90deg,var(--guinda),var(--guinda-dark))",
                              borderRadius: 4,
                              transition: "width .6s ease"
                           }}
                        />
                     </div>
                  </div>

                  {/* Votos */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                     <div
                        style={{
                           fontFamily: "'Playfair Display',serif",
                           fontWeight: 900,
                           fontSize: "1.1rem",
                           color: i < 3 ? "var(--guinda)" : "var(--gris-cool)"
                        }}
                     >
                        {e.votes.toLocaleString("es-MX")}
                     </div>
                     <div style={{ fontSize: ".65rem", color: "var(--gris-claro)", textTransform: "uppercase" }}>votos</div>
                  </div>
               </div>
            );
         })}
      </div>
   );
};

// ─── DownloadButton ───────────────────────────────────────────────────────
interface DownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   label?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ label = "Descargar PDF", ...rest }) => (
   <button className="btn-secondary" style={{ fontSize: ".8rem", padding: "9px 16px", whiteSpace: "nowrap" }} type="button" {...rest}>
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
         <polyline points="7 10 12 15 17 10" />
         <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
   </button>
);

// ─── EmptyState ───────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ msg?: string }> = ({ msg = "Sin registros" }) => (
   <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gris-claro)" }}>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
      <div style={{ fontSize: ".88rem" }}>{msg}</div>
   </div>
);

// ─── Scope tabs ───────────────────────────────────────────────────────────
export type ScopeTab = "general" | "casilla" | "distrito";

interface ScopeTabsProps {
   active: ScopeTab;
   onChange: (t: ScopeTab) => void;
}

const TABS: { id: ScopeTab; label: string }[] = [
   { id: "general", label: "General" },
   { id: "casilla", label: "Por casilla" },
   { id: "distrito", label: "Por distrito" }
];

export const ScopeTabs: React.FC<ScopeTabsProps> = ({ active, onChange }) => (
   <div style={{ display: "flex", gap: 4, background: "#f0eded", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 16 }}>
      {TABS.map((t) => (
         <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
               padding: "7px 18px",
               borderRadius: 8,
               border: "none",
               background: active === t.id ? "var(--guinda)" : "transparent",
               color: active === t.id ? "#fff" : "var(--gris)",
               fontFamily: "'Nunito Sans', sans-serif",
               fontWeight: 700,
               fontSize: ".82rem",
               cursor: "pointer",
               transition: "all .2s",
               whiteSpace: "nowrap"
            }}
         >
            {t.label}
         </button>
      ))}
   </div>
);
