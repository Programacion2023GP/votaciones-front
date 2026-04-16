import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Role } from "../domains/models/role.model";
import dayjs from "dayjs";

// ─── Estado persistente ──────────────────────────────────────────────────
export interface RolesPersistState {}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface RolesExtraState {}

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface RolesExtension {}

export type RolesDataReturn = GenericDataReturn<Role, RolesExtension, RolesPersistState, RolesExtraState>;

const useRolesData = () => {
   const initialState = useMemo<Role>(
      () => ({
         id: 0,
         role: "",
         description: "",
         read: "",
         create: "",
         update: "",
         delete: "",
         more_permissions: "",
         page_index: "",

         active: true,
         created_at: "" //dayjs().format("YYYY-MM-DD").toString()
      }),
      []
   );
   return useGenericData<Role, RolesExtension, RolesPersistState, RolesExtraState>({
      initialState,
      debug: false,
      prefix: "roles",
      autoFetch: true,
      persistKey: "roles-persist",
      extraState: { textBtnSubmit: "REGISTRAR", changepassword: true }, // valor inicial del estado extra

      extension: (set, get, persist) => ({
         // Método para modificar el estado extra
      }),

      hooks: {
         beforePost: (role) => ({
            ...role
            // fullName: `${role.firstName} ${role.paternalSurname} ${role.maternalSurname}`.trim()
         }),
         afterFetch: (roles) => roles.sort((a, b) => a.role.localeCompare(b.role)),
         beforeDelete: (role) => {
            if (role.role === "admin") {
               alert("No puedes eliminar un administrador");
               return false;
            }
            return true;
         },
         onError: (msg) => console.error("[Roles]", msg)
      }
   });
};

export default useRolesData;
