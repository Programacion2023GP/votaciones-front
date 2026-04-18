import React from "react";
import { icons } from "../../constant";
import type { StepRevisionProps } from "./boleta.types";
import { CAT_COLORS, FALLBACK_COLOR } from "./boleta.const";

const StepRevision: React.FC<StepRevisionProps> = ({ voterCasilla, voterNVotos, seleccion, loading, onBack, onSubmit }) => (
   <div className="review-card slide-in-right">
      <div className="review-header">
         <div className="review-icon">📄</div>
         <div>
            <div className="review-title">Confirma tu boleta</div>
            <div className="review-sub">Revisa cuidadosamente tus elecciones. Una vez enviada, no podrá modificarse.</div>
         </div>
      </div>

      <div className="review-info-row">
         <div className="review-info-item">
            <label>Casilla</label>
            <div className="val">{voterCasilla}</div>
         </div>
         <div className="review-info-item">
            <label>Votos emitidos</label>
            <div className="val">
               {seleccion.length} de {voterNVotos}
            </div>
         </div>
         <div className="review-info-item">
            <label>Fecha y hora</label>
            <div className="val" style={{ fontSize: ".82rem" }}>
               {new Date().toLocaleString("es-MX")}
            </div>
         </div>
      </div>

      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".9rem", fontWeight: 700, color: "var(--guinda-dark)", marginBottom: 12 }}>
         Proyectos seleccionados
      </div>

      <div className="review-votes-list">
         {seleccion.map((p, i) => {
            const catColor = CAT_COLORS[p.assigned_district] ?? FALLBACK_COLOR;
            return (
               <div className="review-vote-item" key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="review-vote-rank">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                     <div className="review-vote-name">
                        {p.folio} - {p.project_name}
                     </div>
                     <div style={{ fontSize: ".75rem", color: "var(--gris)", marginTop: 2 }}>{p.project_place}</div>
                  </div>
                  <span className="review-vote-cat" style={{ background: `${catColor}18`, color: catColor }}>
                     Distrito {p.assigned_district}
                  </span>
               </div>
            );
         })}
      </div>

      <div
         style={{
            background: "rgba(155,34,66,.04)",
            border: "1px solid rgba(155,34,66,.12)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 22,
            fontSize: ".8rem",
            color: "var(--gris-cool)",
            lineHeight: 1.5
         }}
      >
         ℹ Al confirmar, tu voto queda registrado de forma definitiva. Esta acción no puede deshacerse.
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
         <button className="btn-secondary" onClick={onBack} type="button">
            <icons.Lu.LuArrowBigLeft size={16} />
            Modificar
         </button>
         <button className="btn-primary" style={{ flex: 1 }} onClick={onSubmit} disabled={loading} type="button">
            {loading ? (
               <>
                  <span style={{ animation: "pulse 1s infinite" }}>⏳</span> Registrando boleta...
               </>
            ) : (
               <>
                  <icons.Lu.LuSend size={16} color="#fff" />
                  Emitir boleta
               </>
            )}
         </button>
      </div>
   </div>
);

export default StepRevision;
