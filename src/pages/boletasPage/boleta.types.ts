import type { Auth } from "../../domains/models/auth.model";
import type { Casilla } from "../../domains/models/casilla.model";
import type { Project } from "../../domains/models/project.model";

// ─── Steps enum ───────────────────────────────────────────────────────────
export enum BoletaStep {
   Identidad = 0,
   Seleccion = 1,
   Revision = 2,
   Exito = 3
}

export const STEP_LABELS: Record<BoletaStep, string> = {
   [BoletaStep.Identidad]: "Identificación",
   [BoletaStep.Seleccion]: "Selección",
   [BoletaStep.Revision]: "Revisión",
   [BoletaStep.Exito]: "Confirmación"
};

// ─── Voto registrado ──────────────────────────────────────────────────────
export interface VotoRegistrado {
   id: number;
   voterId: string;
   casilla: string;
   projects: number[];
   folio: string;
   fecha: string;
}

// ─── Props del componente raíz ────────────────────────────────────────────
export interface BoletaProps {
   votos: VotoRegistrado[];
   onAddVoto: (voto: Omit<VotoRegistrado, "id" | "fecha">) => void;
}

// ─── Estado interno del hook useBoleta ────────────────────────────────────
export interface BoletaState {
   step: BoletaStep;
   prevStep: BoletaStep;
   // Step 0
   // voterId: string;
   voterCasilla: string;
   voterNVotos: number;
   // voterIdErr: string;
   // Step 1
   seleccion: Project[];
   search: string;
   dropdownOpen: boolean;
   districtFilter: number | null;
   shakeSlot: number | null;
   // Step 3
   folio: string;
   submitted: boolean;
   loading: boolean;
}

// ─── Props de los sub-pasos ───────────────────────────────────────────────
export interface StepIdentidadProps {
   voterCasilla: string;
   voterNVotos: number;
   casillas: Casilla[];
   userAuth: Auth | null;
   onChange: (field: keyof Pick<BoletaState, "voterCasilla" | "voterNVotos">, value: string | number) => void;
   onContinue: () => void;
}

export interface StepSeleccionProps {
   seleccion: Project[];
   voterNVotos: number;
   voterCasilla: string;
   userAuth: Auth | null;
   projects: Project[];
   districts: (number | null)[];
   districtFilter: number | null;
   search: string;
   dropdownOpen: boolean;
   shakeSlot: number | null;
   dropRef: React.RefObject<HTMLDivElement>;
   onSearchChange: (val: string) => void;
   onDistrictChange: (val: number | null) => void;
   onDropdownOpen: () => void;
   onDropdownClose: () => void;
   onAddVote: (p: Project) => void;
   onRemoveVote: (id: number) => void;
   onBack: () => void;
   onContinue: () => void;
}

export interface StepRevisionProps {
   voterCasilla: string;
   voterNVotos: number;
   seleccion: Project[];
   loading: boolean;
   onBack: () => void;
   onSubmit: () => void;
}

export interface StepExitoProps {
   folio: string;
   voterCasilla: string;
   onReset: () => void;
}

export interface ProgressBarProps {
   currentStep: BoletaStep;
}

export interface VoteSlotProps {
   index: number;
   project: Project | undefined;
   shake: boolean;
   onRemove: (id: number) => void;
}

export interface ProjectOptionProps {
   project: Project;
   selected: boolean;
   disabled: boolean;
   onSelect: (p: Project) => void;
}
