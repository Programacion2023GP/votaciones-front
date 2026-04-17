import React, { useEffect } from "react";
import { useBoleta } from "./useBoleta";
import { BoletaStep } from "./boleta.types";

import ProgressBar from "./ProgressBar";
import StepIdentidad from "./StepIdentidad";
import StepSeleccion from "./StepSeleccion";
import StepRevision from "./StepRevision";
import StepExito from "./StepExito";

import useAuthData from "../../hooks/useAuthData";
import useCasillasData from "../../hooks/useCasillasData";
import useProjectsData from "../../hooks/useProjectsData";
import { icons } from "../../constant";

const Boleta: React.FC = () => {
   const { persist } = useAuthData();
   const userAuth = persist.auth ?? null;

   const { items: casillas } = useCasillasData();
   const { items: projects } = useProjectsData();

   const { state, dropRef, slideClass, handleIdentidadChange, handleStep0, handleStep1, handleSubmit, resetBoleta, addVote, removeVote, goStep, setField } =
      useBoleta();

   // Inicializar voterCasilla con la casilla del usuario autenticado
   useEffect(() => {
      if (userAuth?.casilla_place && !state.voterCasilla) {
         setField("voterCasilla", userAuth.casilla_place);
      }
   }, [userAuth?.casilla_place, state.voterCasilla, setField]);

   // Distritos disponibles: si es usuario de casilla (role_id === 3) solo su distrito, sino todos
   const districts: (number | null)[] =
      userAuth?.role_id === 3 && userAuth.casilla_district != null
         ? [userAuth.casilla_district]
         : [null, ...Array.from(new Set(projects.map((p) => p.assigned_district))).sort((a, b) => a - b)];

   return (
      <div className="page">
         <div className="page-header">
            <h1>Boleta de Votación</h1>
            <p>Selecciona los proyectos de tu preferencia de forma anónima y segura. Ejercicio de Tu Voz Transforma ciudadano.</p>
            <div className="voter-badge" style={{ margin: 0 }}>
               <icons.Lu.LuPin size={12} />
               &nbsp;{userAuth?.full_name ?? "—"}
            </div>
            <div className="page-divider" />
         </div>

         <ProgressBar currentStep={state.step} />

         {state.step === BoletaStep.Identidad && (
            <StepIdentidad
               voterCasilla={state.voterCasilla}
               voterNVotos={state.voterNVotos}
               casillas={casillas}
               userAuth={userAuth}
               onChange={handleIdentidadChange}
               onContinue={handleStep0}
            />
         )}

         {state.step === BoletaStep.Seleccion && (
            <StepSeleccion
               seleccion={state.seleccion}
               voterNVotos={state.voterNVotos}
               voterCasilla={state.voterCasilla}
               userAuth={userAuth}
               projects={projects}
               districts={districts}
               districtFilter={state.districtFilter}
               search={state.search}
               dropdownOpen={state.dropdownOpen}
               shakeSlot={state.shakeSlot}
               dropRef={dropRef}
               onSearchChange={(val) => {
                  setField("search", val);
                  setField("dropdownOpen", true);
               }}
               onDistrictChange={(val) => setField("districtFilter", val)}
               onDropdownOpen={() => setField("dropdownOpen", true)}
               onDropdownClose={() => setField("dropdownOpen", false)}
               onAddVote={addVote}
               onRemoveVote={removeVote}
               onBack={() => goStep(BoletaStep.Identidad)}
               onContinue={handleStep1}
            />
         )}

         {state.step === BoletaStep.Revision && (
            <StepRevision
               voterCasilla={state.voterCasilla}
               voterNVotos={state.voterNVotos}
               seleccion={state.seleccion}
               loading={state.loading}
               onBack={() => goStep(BoletaStep.Seleccion)}
               onSubmit={handleSubmit}
            />
         )}

         {state.step === BoletaStep.Exito && <StepExito folio={state.folio} voterCasilla={state.voterCasilla} onReset={resetBoleta} />}
      </div>
   );
};

export default Boleta;
