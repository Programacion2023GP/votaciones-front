import React from "react";
import { icons } from "../../constant";
import type { VoteSlotProps, ProjectOptionProps } from "./boleta.types";
import { CAT_COLORS, FALLBACK_COLOR } from "./boleta.const";

// ─── VoteSlot ─────────────────────────────────────────────────────────────
/**
 * Tarjeta individual dentro de la cuadrícula de votos.
 * Muestra el proyecto elegido o un estado "vacío / pendiente".
 */
export const VoteSlot: React.FC<VoteSlotProps> = ({ index, project, shake, onRemove }) => {
   const catColor = project ? (CAT_COLORS[project.assigned_district] ?? FALLBACK_COLOR) : null;

   return (
      <div className={`vote-slot ${project ? "filled" : "empty"} ${shake ? "shake" : ""}`} style={{ animationDelay: `${index * 0.04}s` }}>
         {project ? (
            <>
               <div className="vote-slot-num">
                  <icons.Lu.LuCheck size={11} color="var(--guinda)" />
                  &nbsp;Proyecto {index + 1}
               </div>
               <div className="vote-slot-name">
                  <span
                     className="text-guinda-primary rounded-lg font-extrabold "
                     style={{ backgroundColor: "rgba(155, 34, 66, 0.08)", padding: "2px", marginRight: "8px" }}
                  >
                     {project.folio}
                  </span>
                  {project.project_name}
               </div>
               <div className="vote-slot-cat" style={{ color: catColor ?? undefined }}>
                  Distrito {project.assigned_district}
               </div>
               <button className="vote-remove-btn" onClick={() => onRemove(project.id)} title="Quitar selección" type="button">
                  ✕
               </button>
            </>
         ) : (
            <div className="vote-slot-empty-label">
               <span
                  style={{
                     width: 22,
                     height: 22,
                     borderRadius: "50%",
                     border: "2px dashed var(--gris-claro)",
                     display: "inline-flex",
                     alignItems: "center",
                     justifyContent: "center",
                     fontSize: ".75rem",
                     color: "var(--gris-claro)",
                     flexShrink: 0
                  }}
               >
                  {index + 1}
               </span>
               Voto pendiente
            </div>
         )}
      </div>
   );
};

// ─── ProjectOption ────────────────────────────────────────────────────────
/**
 * Fila dentro del dropdown de proyectos.
 * Muestra el número, nombre, descripción corta y categoría/distrito.
 */
export const ProjectOption: React.FC<ProjectOptionProps> = ({ project, selected, disabled, onSelect }) => {
   const catColor = CAT_COLORS[project.assigned_district] ?? FALLBACK_COLOR;

   return (
      <div className={`project-option ${selected || disabled ? "disabled" : ""}`} onClick={() => !selected && !disabled && onSelect(project)}>
         <div className="project-option-num">{project.folio}</div>

         <div style={{ flex: 1 }}>
            <div className="project-option-name" style={{ color: selected ? "var(--gris)" : "var(--negro)" }}>
               {project.project_name}
               {selected && <span style={{ fontSize: ".7rem", color: "var(--guinda)", fontWeight: 700, marginLeft: 6 }}>✓ Elegido</span>}
            </div>
            {project.project_place && (
               <div style={{ fontSize: ".72rem", color: "var(--gris)", marginTop: 1 }}>
                  {project.project_place.slice(0, 60)}
                  {project.project_place.length > 60 ? "…" : ""}
               </div>
            )}
         </div>

         <span className="project-option-cat" style={{ background: `${catColor}18`, color: catColor }}>
            Distrito {project.assigned_district}
         </span>
      </div>
   );
};
