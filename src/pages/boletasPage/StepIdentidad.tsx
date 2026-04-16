import React from "react";
import { icons } from "../../constant";
import type { StepIdentidadProps } from "./boleta.types";

const StepIdentidad: React.FC<StepIdentidadProps> = ({ voterCasilla, voterNVotos, casillas, userAuth, onChange, onContinue }) => (
   <div className="voter-id-card slide-in-right">
      {/* Badge */}
      <div className="voter-badge">
         <icons.Lu.LuIdCard size={14} />
         &nbsp;Verificación de Identidad
      </div>

      {/* Título */}
      <div
         style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--guinda-dark)",
            marginBottom: 4
         }}
      >
         Antes de votar, confirma tu identidad
      </div>

      <p style={{ fontSize: ".85rem", color: "var(--gris)", marginBottom: 22, lineHeight: 1.6 }}>Tu participación es anónima. Solo una participación por ciudadano.</p>

      {/* Campos de configuración */}
      <div className="grid gap-4.5 grid-cols-2" style={{ marginBottom: 20 }}>
         {/* Casilla */}
         <div className="config-field">
            <label>Casilla de Votación</label>
            <select className="config-select" value={voterCasilla} onChange={(e) => onChange("voterCasilla", e.target.value)}>
               {/* Si el usuario ya tiene casilla asignada la mostramos primero */}
               {userAuth?.casilla_place && <option value={userAuth.casilla_place}>{userAuth.casilla_place}</option>}
               {casillas
                  .filter((c) => !userAuth?.casilla_place || c.place !== userAuth.casilla_place)
                  .map((c) => (
                     <option key={c.id} value={c.place}>
                        {c.place}
                     </option>
                  ))}
            </select>
         </div>

         {/* Número de votos N */}
         <div className="config-field">
            <label>Número de Votos (N)</label>
            <input className="config-input" type="number" min={1} max={10} value={voterNVotos} onChange={(e) => onChange("voterNVotos", e.target.value)} />
         </div>
      </div>

      {/* Aviso de privacidad */}
      <div
         style={{
            background: "rgba(155,34,66,.04)",
            border: "1px solid rgba(155,34,66,.12)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 22,
            display: "flex",
            gap: 12,
            alignItems: "flex-start"
         }}
      >
         <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🔒</span>
         <div style={{ fontSize: ".8rem", color: "var(--gris-cool)", lineHeight: 1.5 }}>
            <b style={{ color: "var(--guinda-dark)" }}>Tu voto es secreto.</b> Los proyectos que elijas no se asocian a tu nombre en los resultados públicos. Solo se
            registra que participaste.
         </div>
      </div>

      {/* CTA */}
      <button className="btn-primary" onClick={onContinue} type="button">
         <icons.Lu.LuArrowBigRight size={17} color="#fff" />
         Continuar a la Boleta
      </button>
   </div>
);

export default StepIdentidad;
