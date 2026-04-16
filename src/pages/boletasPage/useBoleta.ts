import { useCallback, useReducer, useRef } from "react";
import Swal from "sweetalert2";
import type { Project } from "../../domains/models/project.model";
import { BoletaStep, type BoletaState, type VotoRegistrado } from "./boleta.types";
import { MIN_VOTER_ID_LEN, MAX_VOTOS } from "./boleta.const";

// ─── Action types ─────────────────────────────────────────────────────────
type Action =
   | { type: "SET_FIELD"; field: keyof BoletaState; value: BoletaState[keyof BoletaState] }
   | { type: "GO_STEP"; next: BoletaStep }
   | { type: "ADD_VOTE"; project: Project }
   | { type: "REMOVE_VOTE"; id: number }
   | { type: "RESET" };

// ─── Initial state ────────────────────────────────────────────────────────
const INITIAL_STATE: BoletaState = {
   step: BoletaStep.Identidad,
   prevStep: BoletaStep.Identidad,
   //  voterId: "",
   voterCasilla: "",
   voterNVotos: 5,
   //  voterCasillaErr: "",
   seleccion: [],
   search: "",
   dropdownOpen: false,
   districtFilter: null,
   shakeSlot: null,
   folio: "",
   submitted: false,
   loading: false
};

// ─── Reducer ──────────────────────────────────────────────────────────────
function reducer(state: BoletaState, action: Action): BoletaState {
   switch (action.type) {
      case "SET_FIELD":
         return { ...state, [action.field]: action.value };

      case "GO_STEP":
         return { ...state, prevStep: state.step, step: action.next };

      case "ADD_VOTE":
         return { ...state, seleccion: [...state.seleccion, action.project], search: "", dropdownOpen: false };

      case "REMOVE_VOTE":
         return { ...state, seleccion: state.seleccion.filter((s) => s.id !== action.id) };

      case "RESET":
         return INITIAL_STATE;

      default:
         return state;
   }
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useBoleta(votos: VotoRegistrado[], onAddVoto: (voto: Omit<VotoRegistrado, "id" | "fecha">) => void) {
   const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
   const dropRef = useRef<HTMLDivElement>(null);
   const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   // ── Navegación ──────────────────────────────────────────────────────────
   const goStep = useCallback((next: BoletaStep) => {
      dispatch({ type: "GO_STEP", next });
      window.scrollTo({ top: 0, behavior: "smooth" });
   }, []);

   // ── Campo genérico ──────────────────────────────────────────────────────
   const setField = useCallback(<K extends keyof BoletaState>(field: K, value: BoletaState[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
   }, []);

   // ── Helpers de onChange para StepIdentidad ──────────────────────────────
   const handleIdentidadChange = useCallback((field: "voterCasilla" | "voterNVotos", value: string | number) => {
      if (field === "voterNVotos") {
         const clamped = Math.min(MAX_VOTOS, Math.max(1, Number(value) || 1));
         dispatch({ type: "SET_FIELD", field, value: clamped });
      } else {
         dispatch({ type: "SET_FIELD", field, value: value as string });
      }
      // Limpiar error de voterId al editar
      // if (field === "voterId") dispatch({ type: "SET_FIELD", field: "voterCasillaErr", value: "" });
   }, []);

   // ── Validar paso 0 ──────────────────────────────────────────────────────
   const handleStep0 = useCallback(() => {
      console.log("🚀 ~ useBoleta ~ state:", state);
      const { voterCasilla } = state;
      if (!voterCasilla.trim() || voterCasilla.trim().length < MIN_VOTER_ID_LEN) {
        //  dispatch({ type: "SET_FIELD", field: "voterCasillaErr", value: "Ingresa tu clave de elector o nombre completo." });
         return;
      }
      // const alreadyVoted = votos.find((v) => v.voterId.toUpperCase() === voterId.trim().toUpperCase());
      // if (alreadyVoted) {
      //    Swal.fire({
      //       icon: "warning",
      //       title: "Boleta ya emitida",
      //       html: "<p style=\"font-family:'Nunito Sans',sans-serif;font-size:.95rem;color:#474C55\">Tu boleta <b>ya fue registrada</b> anteriormente.<br>Solo se permite una participación por ciudadano.</p>",
      //       confirmButtonColor: "#9B2242",
      //       confirmButtonText: "Entendido"
      //    });
      //    return;
      // }
      // dispatch({ type: "SET_FIELD", field: "voterCasillaErr", value: "" });
      goStep(BoletaStep.Seleccion);
   }, [state, votos, goStep]);

   // ── Validar paso 1 ──────────────────────────────────────────────────────
   const handleStep1 = useCallback(() => {
      const { seleccion, voterNVotos } = state;
      if (seleccion.length < voterNVotos) {
         Swal.fire({
            icon: "info",
            title: "Selección incompleta",
            html: `<p style="font-family:'Nunito Sans',sans-serif;font-size:.95rem;color:#474C55">Debes elegir <b>${voterNVotos} proyecto${voterNVotos > 1 ? "s" : ""}</b>.<br>Llevas <b>${seleccion.length}</b> seleccionado${seleccion.length !== 1 ? "s" : ""}.</p>`,
            confirmButtonColor: "#9B2242",
            confirmButtonText: "Continuar seleccionando"
         });
         return;
      }
      goStep(BoletaStep.Revision);
   }, [state, goStep]);

   // ── Agregar voto ────────────────────────────────────────────────────────
   const addVote = useCallback(
      (project: Project) => {
         const { seleccion, voterNVotos } = state;
         if (seleccion.some((s) => s.id === project.id)) return;

         if (seleccion.length >= voterNVotos) {
            // Shake del último slot lleno
            const slotIdx = voterNVotos - 1;
            dispatch({ type: "SET_FIELD", field: "shakeSlot", value: slotIdx });
            if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
            shakeTimerRef.current = setTimeout(() => dispatch({ type: "SET_FIELD", field: "shakeSlot", value: null }), 500);

            Swal.fire({
               toast: true,
               position: "top-end",
               showConfirmButton: false,
               timer: 2200,
               icon: "warning",
               title: `Ya seleccionaste ${voterNVotos} proyecto${voterNVotos > 1 ? "s" : ""}`,
               timerProgressBar: true
            });
            return;
         }
         dispatch({ type: "ADD_VOTE", project });
      },
      [state]
   );

   // ── Quitar voto ─────────────────────────────────────────────────────────
   const removeVote = useCallback((id: number) => {
      dispatch({ type: "REMOVE_VOTE", id });
   }, []);

   // ── Enviar boleta ───────────────────────────────────────────────────────
   const handleSubmit = useCallback(() => {
      dispatch({ type: "SET_FIELD", field: "loading", value: true });

      // Simula latencia de red; reemplazar con repo.create() cuando exista endpoint
      setTimeout(() => {
         const newFolio = "BOL-" + Date.now().toString(36).toUpperCase();
         dispatch({ type: "SET_FIELD", field: "folio", value: newFolio });
         dispatch({ type: "SET_FIELD", field: "submitted", value: true });

         onAddVoto({
            voterId: state.voterId.trim().toUpperCase(),
            casilla: state.voterCasilla,
            projects: state.seleccion.map((s) => s.id),
            folio: newFolio
         });

         dispatch({ type: "SET_FIELD", field: "loading", value: false });
         goStep(BoletaStep.Exito);
      }, 1000);
   }, [state, onAddVoto, goStep]);

   // ── Reiniciar ───────────────────────────────────────────────────────────
   const resetBoleta = useCallback(() => {
      dispatch({ type: "RESET" });
   }, []);

   // ── Slide class (dirección de la animación) ─────────────────────────────
   const slideClass = state.step >= state.prevStep ? "slide-in-right" : "slide-in-left";

   // ── Porcentaje de avance ────────────────────────────────────────────────
   const pct = state.voterNVotos > 0 ? (state.seleccion.length / state.voterNVotos) * 100 : 0;

   return {
      state,
      dropRef,
      slideClass,
      pct,
      setField,
      handleIdentidadChange,
      handleStep0,
      handleStep1,
      handleSubmit,
      resetBoleta,
      addVote,
      removeVote,
      goStep
   };
}
