import React, { useEffect } from "react";

import { useBoleta } from "./useBoleta";
import { BoletaStep } from "./boleta.types";
import type { BoletaProps } from "./boleta.types";

import ProgressBar from "./ProgressBar";
import StepIdentidad from "./StepIdentidad";
import StepSeleccion from "./StepSeleccion";
import StepRevision from "./StepRevision";
import StepExito from "./StepExito";
import useAuthData from "../../hooks/useAuthData";
import useCasillasData from "../../hooks/useCasillasData";
import useProjectsData from "../../hooks/useProjectsData";

/**
 * index.boleta.tsx
 * ─────────────────
 * Componente raíz del módulo de Boleta de Votación.
 * Responsabilidad única: orquestar hooks y sub-pasos.
 * Toda la lógica de negocio vive en useBoleta.ts.
 * Toda la UI granular vive en los Step*.tsx y primitivas.
 */
const Boleta: React.FC<BoletaProps> = ({ votos, onAddVoto }) => {
  // ── Datos externos ─────────────────────────────────────────────────────
  const { persist } = useAuthData();
  const userAuth = persist.auth ?? null;

  const { items: casillas } = useCasillasData();
  const { items: projects } = useProjectsData();

  // ── Lógica del módulo ──────────────────────────────────────────────────
  const {
    state,
    dropRef,
    slideClass,
    handleIdentidadChange,
    handleStep0,
    handleStep1,
    handleSubmit,
    resetBoleta,
    addVote,
    removeVote,
    goStep,
    setField,
  } = useBoleta(votos, onAddVoto);

  // ── Inicializar voterCasilla con la casilla del usuario autenticado ─────
  useEffect(() => {
    if (userAuth?.casilla_place && !state.voterCasilla) {
      setField("voterCasilla", userAuth.casilla_place);
    }
  }, [userAuth?.casilla_place, state.voterCasilla, setField]);

  // ── Distritos disponibles según el rol ────────────────────────────────
  // Rol 3 (operador de casilla) → solo su distrito; admin → todos
  const districts: (number | null)[] =
    userAuth?.role_id === 3 && userAuth.casilla_district != null
      ? [userAuth.casilla_district]
      : [null, ...Array.from(new Set(projects.map((p) => p.assigned_district))).sort((a, b) => a - b)];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Cabecera de página */}
      <div className="page-header">
        <h1>Boleta de Votación</h1>
        <p>
          Selecciona los proyectos de tu preferencia de forma anónima y segura.
          Ejercicio de presupuesto participativo ciudadano.
        </p>
        <div className="page-divider" />
      </div>

      {/* Barra de progreso compartida por todos los pasos */}
      <ProgressBar currentStep={state.step} />

      {/* ── Paso 0: Identificación ── */}
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

      {/* ── Paso 1: Selección de proyectos ── */}
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

      {/* ── Paso 2: Revisión ── */}
      {state.step === BoletaStep.Revision && (
        <StepRevision
          voterId={state.voterId}
          voterCasilla={state.voterCasilla}
          voterNVotos={state.voterNVotos}
          seleccion={state.seleccion}
          loading={state.loading}
          onBack={() => goStep(BoletaStep.Seleccion)}
          onSubmit={handleSubmit}
        />
      )}

      {/* ── Paso 3: Éxito ── */}
      {state.step === BoletaStep.Exito && (
        <StepExito
          folio={state.folio}
          voterCasilla={state.voterCasilla}
          onReset={resetBoleta}
        />
      )}
    </div>
  );
};

export default Boleta;
