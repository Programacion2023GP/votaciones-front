import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Participation } from "../domains/models/participation.model";
import useAuthData from "./useAuthData";

// ─── Estado persistente ──────────────────────────────────────────────────
export interface ParticipationsPersistState {}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface ParticipationsExtraState {
   singularName: string;
   pluralName: string;
   formTitle: string;
   textBtnSubmit: string;
}

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface ParticipationsExtension {}

export type ParticipationsDataReturn = GenericDataReturn<Participation, ParticipationsExtension, ParticipationsPersistState, ParticipationsExtraState>;

const singularName = "Registro de Participación Ciudadana", //Escribirlo siempre letra Capital
   pluralName = "Registros de Participación Ciudadana"; //Escribirlo siempre letra Capital

const useParticipationsData = () => {
   const { persist } = useAuthData(); // para obtener el user_id
   const userId = persist?.auth?.id ?? 0;
   const initialState = useMemo<Participation>(
      () => ({
         id: 0,
         type: null,
         curp: "",
         user_id: userId,

         active: true,
         created_at: "" //dayjs().format("YYYY-MM-DD").toString()
      }),
      []
   );

   return useGenericData<Participation, ParticipationsExtension, ParticipationsPersistState, ParticipationsExtraState>({
      initialState,
      prefix: "participations",
      autoFetch: true,
      persistKey: "participations-persist",
      debug: false,
      extraState: {
         textBtnSubmit: "✓ Registrar Participación".toUpperCase(),
         singularName: singularName,
         pluralName: pluralName,
         formTitle: `1. Tipo de Documento`
      }, // valor inicial del estado extra

      extension: (_set, _get, _persist) => ({
         // Método para modificar el estado extra
      }),

      hooks: {
         beforePost: (participation) => ({
            ...participation
            // fullName: `${participation.firstName} ${participation.paternalSurname} ${participation.maternalSurname}`.trim()
         }),
         afterFetch: (participations) => {
            return participations.sort((a, b) => a.curp.localeCompare(b.curp));
         },
         beforeDelete: (_participation) => {
            // if (participation.curp === "admin") {
            //    alert("No puedes eliminar un administrador");
            //    return false;
            // }
            return true;
         },
         onError: (msg) => console.error("[Participations]", msg)
      }
   });
};

export default useParticipationsData;
