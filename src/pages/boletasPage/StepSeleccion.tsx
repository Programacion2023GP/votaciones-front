import React from "react";
import { icons } from "../../constant";
import type { Project } from "../../domains/models/project.model";
import type { StepSeleccionProps } from "./boleta.types";
import { VoteSlot, ProjectOption } from "./VoteSlot";

const StepSeleccion: React.FC<StepSeleccionProps> = ({
   seleccion,
   voterNVotos,
   voterCasilla,
   userAuth,
   projects,
   districts,
   districtFilter,
   search,
   dropdownOpen,
   shakeSlot,
   dropRef,
   onSearchChange,
   onDistrictChange,
   onDropdownOpen,
   onAddVote,
   onRemoveVote,
   onBack,
   onContinue
}) => {
   const pct = voterNVotos > 0 ? (seleccion.length / voterNVotos) * 100 : 0;

   // Proyectos filtrados para el dropdown
   const filteredProjs: Project[] = projects.filter((p) => {
      const matchSearch = p.project_name.toLowerCase().includes(search.toLowerCase()) || String(p.folio).includes(search.toLowerCase());
      // const matchDistrict = districtFilter === null || p.assigned_district === districtFilter;
      return matchSearch;
   });

   return (
      <div className="slide-in-right">
         {/* ── Contador de progreso ── */}
         <div
            style={{
               background: "#fff",
               borderRadius: 16,
               padding: "18px 22px",
               border: "1px solid rgba(0,0,0,.05)",
               boxShadow: "0 2px 12px rgba(0,0,0,.04)",
               marginBottom: 20
            }}
         >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
               <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 700, color: "var(--guinda-dark)" }}>
                  Elige {voterNVotos} proyecto{voterNVotos > 1 ? "s" : ""} de tu preferencia
               </div>
               <div className="voter-badge" style={{ margin: 0 }}>
                  <icons.Lu.LuPin size={12} />
                  &nbsp;{userAuth?.username ?? "—"} · {voterCasilla} · {userAuth?.casilla_location}
               </div>
            </div>

            <div className="ballot-counter">
               <div className="counter-bar-wrap">
                  <div className="counter-bar-fill" style={{ width: `${pct}%` }} />
               </div>
               <div className="counter-label">
                  {seleccion.length} <span>/ {voterNVotos}</span>
               </div>
            </div>
         </div>

         {/* ── Grid de slots ── */}
         <div className="votes-grid" style={{ marginBottom: 18 }}>
            {Array.from({ length: voterNVotos }).map((_, i) => (
               <VoteSlot key={i} index={i} project={seleccion[i]} shake={shakeSlot === i} onRemove={onRemoveVote} />
            ))}
         </div>

         {/* ── Panel de búsqueda y dropdown ── */}
         <div
            ref={dropRef}
            style={{
               background: "#fff",
               borderRadius: 16,
               padding: "20px 22px",
               border: "1px solid rgba(0,0,0,.05)",
               boxShadow: "0 2px 12px rgba(0,0,0,.04)",
               marginBottom: 20
            }}
         >
            <div
               style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: ".95rem",
                  fontWeight: 700,
                  color: "var(--guinda-dark)",
                  marginBottom: 12
               }}
            >
               Agregar proyecto
            </div>

            {/* Filtros */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
               {/* Selector de distrito */}
               <select
                  className="filter-select"
                  style={{ flex: "0 0 auto", minWidth: 160 }}
                  value={districtFilter ?? ""}
                  onChange={(e) => {
                     const val = e.target.value;
                     onDistrictChange(val === "" ? null : Number(val));
                  }}
               >
                  <option value="">Todos los distritos</option>
                  {(districts.filter((d) => d !== null) as number[]).map((d) => (
                     <option key={d} value={d}>
                        Distrito {d}
                     </option>
                  ))}
               </select>

               {/* Buscador */}
               <div className="ballot-search-wrap" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                  <span className="ballot-search-icon">
                     <icons.Lu.LuSearch size={15} />
                  </span>
                  <input
                     className="ballot-search-input"
                     placeholder="Buscar proyecto por nombre o folio..."
                     value={search}
                     onChange={(e) => onSearchChange(e.target.value)}
                     onFocus={onDropdownOpen}
                  />
               </div>
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
               <div className="projects-dropdown">
                  {filteredProjs.length === 0 ? (
                     <div style={{ padding: "16px", textAlign: "center", color: "var(--gris-claro)", fontSize: ".85rem" }}>Sin resultados</div>
                  ) : (
                     filteredProjs.map((p) => (
                        <ProjectOption
                           key={p.id}
                           project={p}
                           selected={seleccion.some((s) => s.id === p.id)}
                           disabled={seleccion.length >= voterNVotos && !seleccion.some((s) => s.id === p.id)}
                           onSelect={onAddVote}
                        />
                     ))
                  )}
               </div>
            )}
         </div>

         {/* ── Acciones ── */}
         <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={onBack} type="button">
               <icons.Lu.LuArrowBigLeft size={16} />
               Atrás
            </button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={onContinue} disabled={seleccion.length === 0} type="button">
               <icons.Lu.LuArrowBigRight size={17} color="#fff" />
               Revisar selección
            </button>
         </div>
      </div>
   );
};

export default StepSeleccion;
