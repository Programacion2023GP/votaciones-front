import React, { useState, useMemo } from "react";
import useCasillasData from "../../hooks/useCasillasData";
import useRolesData from "../../hooks/useRolesData";
import CasillaTable from "./table.casillas";
import CasillaForm from "./form.casillas";

const Casillas: React.FC = () => {
   const casillaContext = useCasillasData();

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Catálogos <span>›</span> <span>{casillaContext.pluralName}</span>
               </div>
               <h1 className="page-title">{casillaContext.pluralName}</h1>
               <p className="page-subtitle">19 de abril - 8:00 a 16:00 h.</p>
            </div>
            <button className="btn-secondary" onClick={() => casillaContext.setOpen()}>
               {casillaContext.open ? "✕ Cancelar" : "+ Nuevo Centro"}
            </button>
         </div>

         <CasillaForm />

         <CasillaTable />
      </div>
   );
};

export default Casillas;
