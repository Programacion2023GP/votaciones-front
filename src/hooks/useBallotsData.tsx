import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Ballot } from "../domains/models/ballot.model";
import useAuthData from "./useAuthData";

// ─── Estado persistente ──────────────────────────────────────────────────
export interface BallotsPersistState {}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface BallotsExtraState {
   singularName: string;
   pluralName: string;
   formTitle: string;
   textBtnSubmit: string;
}

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface BallotsExtension {}

export type BallotsDataReturn = GenericDataReturn<Ballot, BallotsExtension, BallotsPersistState, BallotsExtraState>;

const singularName = "Boleta", //Escribirlo siempre letra Capital
   pluralName = "Boletas"; //Escribirlo siempre letra Capital

const useBallotsData = () => {
   const { persist } = useAuthData(); // para obtener el user_id
   const userId = persist?.auth?.id ?? 0;
   const initialState = useMemo<Ballot>(
      () => ({
         id: 0,
         user_id: userId,
         vote_1: null,
         vote_2: null,
         vote_3: null,
         vote_4: null,
         vote_5: null,

         active: true,
         created_at: "" //dayjs().format("YYYY-MM-DD").toString()
      }),
      []
   );

   return useGenericData<Ballot, BallotsExtension, BallotsPersistState, BallotsExtraState>({
      initialState,
      prefix: "ballots",
      autoFetch: true,
      persistKey: "ballots-persist",
      debug: true,
      extraState: {
         textBtnSubmit: "✓ Registrar Votos".toUpperCase(),
         singularName: singularName,
         pluralName: pluralName,
         formTitle: `1. Tipo de Documento`
      }, // valor inicial del estado extra

      extension: (_set, _get, _persist) => ({
         // Método para modificar el estado extra
      }),

      hooks: {
         beforePost: (ballot) => ({
            ...ballot
            // fullName: `${ballot.firstName} ${ballot.paternalSurname} ${ballot.maternalSurname}`.trim()
         }),
         afterFetch: (_ballots) => {
            // return ballots.sort((a, b) => a.curp.localeCompare(b.curp));
         },
         beforeDelete: (_ballot) => {
            // if (ballot.curp === "admin") {
            //    alert("No puedes eliminar un administrador");
            //    return false;
            // }
            return true;
         },
         onError: (msg) => console.error("[Ballots]", msg)
      }
   });
};

export default useBallotsData;
