import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Casilla } from "../domains/models/casilla.model";

// ─── Estado persistente ──────────────────────────────────────────────────
export interface CasillasPersistState {}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface CasillasExtraState {
   singularName: string;
   pluralName: string;
   formTitle: string;
   textBtnSubmit: string;
}

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface CasillasExtension {}

export type CasillasDataReturn = GenericDataReturn<Casilla, CasillasExtension, CasillasPersistState, CasillasExtraState>;

const singularName = "Centro de Votación", //Escribirlo siempre letra Capital
   pluralName = "Centros de Votación"; //Escribirlo siempre letra Capital

const useCasillasData = () => {
   const initialState = useMemo<Casilla>(
      () => ({
         id: 0,
         type: null,
         district: 0,
         perimeter: "",
         place: "",
         location: "",

         active: true,
         created_at: "" //dayjs().format("YYYY-MM-DD").toString()
      }),
      []
   );

   return useGenericData<Casilla, CasillasExtension, CasillasPersistState, CasillasExtraState>({
      initialState,
      prefix: "casillas",
      autoFetch: true,
      persistKey: "casillas-persist",
      extraState: {
         textBtnSubmit: "REGISTRAR",
         singularName: singularName,
         pluralName: pluralName,
         formTitle: `REGISTRAR ${singularName.toUpperCase()}`
      }, // valor inicial del estado extra

      extension: (set, get, persist) => ({
         // Método para modificar el estado extra
      }),

      hooks: {
         beforePost: (casilla) => ({
            ...casilla
            // fullName: `${casilla.firstName} ${casilla.paternalSurname} ${casilla.maternalSurname}`.trim()
         }),
         afterFetch: (casillas) => {
            return casillas.sort((a, b) => a.place.localeCompare(b.place));
         },
         beforeDelete: (casilla) => {
            if (casilla.location === "admin") {
               alert("No puedes eliminar un administrador");
               return false;
            }
            return true;
         },
         onError: (msg) => console.error("[Casillas]", msg)
      }
   });
};

export default useCasillasData;
