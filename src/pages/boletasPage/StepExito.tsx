import React from "react";
import type { StepExitoProps } from "./boleta.types";

const StepExito: React.FC<StepExitoProps> = ({ folio, voterCasilla, onReset }) => (
   <div className="slide-in-right" style={{ display: "flex", justifyContent: "center" }}>
      <div className="boleta-success">
         {/* Barra superior decorativa */}
         <div
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               height: 4,
               background: "linear-gradient(90deg,var(--guinda),var(--guinda-dark))",
               borderRadius: "24px 24px 0 0"
            }}
         />

         {/* Ícono principal */}
         <div className="success-emblem">🎉</div>

         {/* Título */}
         <div className="success-title">¡Voto registrado!</div>

         {/* Descripción */}
         <p className="success-sub">
            Tu boleta fue emitida correctamente en la <b>{voterCasilla}</b>.<br />
            Gracias por participar en el proceso de Tu Voz Transforma.
         </p>

         {/* Folio comprobante */}
         <div className="success-folio">{folio}</div>
         <div style={{ fontSize: ".75rem", color: "var(--gris-claro)", marginBottom: 22 }}>Guarda este folio como comprobante de tu participación</div>

         {/* Acciones */}
         <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={onReset} type="button">
               📋 Nueva boleta
            </button>
         </div>
      </div>
   </div>
);

export default StepExito;
