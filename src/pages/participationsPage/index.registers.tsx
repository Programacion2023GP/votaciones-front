// pages/Participations/index.tsx
import React from "react";
import useParticipationsData from "../../hooks/useParticipationsData";
import useAuthData from "../../hooks/useAuthData";
import { images } from "../../constant";
import ParticipationsForm from "./form.participations";

const Registros: React.FC = () => {
   const participationsContext = useParticipationsData();
   const authContext = useAuthData();
   const userAuth = authContext.persist?.auth;

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Inicio <span>›</span> <span>{participationsContext.pluralName}</span>
               </div>
               <h1 className="page-title">{participationsContext.pluralName}</h1>
               <p className="page-subtitle">Registre la participación ciudadana en su casilla electoral</p>
            </div>
            <div className="casilla-tag">🏛️ {userAuth?.casilla_id ? userAuth.full_name : "Sin casilla asignada"}</div>
         </div>

         <div className="flex items-center justify-center mx-auto mb-6">
            <img src={images.logo} alt="TuVozTransforma" className="object-cover w-5/12 md:w-3/15" />
         </div>

         <div className="grid-2">
            {/* Columna izquierda: formulario */}
            <ParticipationsForm />

            {/* Columna derecha: vista previa del documento */}
            <div>
               <div className="card-title-text" style={{ marginBottom: 12, color: "var(--gris)", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
                  2. Referencia del documento
               </div>
               {!participationsContext.initialValues.type && (
                  <div className="card" style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <div className="empty-state">
                        <div className="empty-icon">🪪</div>
                        <div className="empty-title">Vista previa</div>
                        <div className="empty-desc">Seleccione un documento para ver la guía visual</div>
                     </div>
                  </div>
               )}
               {participationsContext.initialValues.type === "INE" && (
                  <div className="doc-preview">
                     <img src={images.ine} alt="INE ilustrada" className="rounded-4xl object-contain max-h-96" />
                     <p style={{ textAlign: "center", fontSize: 12, color: "var(--gris)", marginTop: 12 }}>
                        La CURP se encuentra en la parte inferior de la credencial
                     </p>
                  </div>
               )}
               {participationsContext.initialValues.type === "Carta Identidad" && (
                  <div className="doc-preview">
                     <img src={images.cartaIdentidad} alt="Carta Identidad" className="rounded-xl object-contain max-h-96" />
                     <p style={{ textAlign: "center", fontSize: 12, color: "var(--gris)", marginTop: 12 }}>Capture la CURP tal como aparece en el documento oficial</p>
                  </div>
               )}
            </div>
         </div>

         {/* <div className="mt-8">
            <ParticipationsTable />
         </div> */}
      </div>
   );
};

export default Registros;
