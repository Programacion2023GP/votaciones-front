// pages/Participations/index.tsx
import React from "react";
import useParticipationsData from "../../hooks/useParticipationsData";
import useAuthData from "../../hooks/useAuthData";
import { images } from "../../constant";
import ParticipationsForm from "./form.participations";
import ParticipationsTable from "./table.participations";

const Participations: React.FC = () => {
   const participationsContext = useParticipationsData();
   const authContext = useAuthData();
   const userAuth = authContext.persist?.auth;

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Inicio <span>›</span> <span>{"Participaciones"}</span>
               </div>
               <h1 className="page-title">{"Participaciones"}</h1>
               <p className="page-subtitle">Registros de participación ciudadana</p>
            </div>
            <div className="casilla-tag">🏛️ {userAuth?.casilla_id ? userAuth.full_name : "Sin casilla asignada"}</div>
         </div>

         <div className="mt-8">
            <ParticipationsTable />
         </div>
      </div>
   );
};

export default Participations;
