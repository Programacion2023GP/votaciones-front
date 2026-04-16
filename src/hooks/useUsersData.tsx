import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { User } from "../domains/models/user.model";

// ─── Estado persistente ──────────────────────────────────────────────────
export interface UsersPersistState {
   lastActivatedUserId: number | null;
   favoriteUserIds: number[];
   filterText: string;
}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface UsersExtraState {
   singularName: string;
   pluralName: string;
   formTitle: string;
   textBtnSubmit: string;
   changepassword: boolean;
}

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface UsersExtension {
   // activateUser: (userId: number) => Promise<void>;
   // deactivateUser: (userId: number) => Promise<void>;
   // resetPassword: (userId: number) => Promise<void>;
   // getUsersByDependence: (dependenceId: number) => Promise<User[]>;
   // toggleFavorite: (userId: number) => void;
   // setFilterText: (text: string) => void;
   setChangePassword: () => void;
}

export type UsersDataReturn = GenericDataReturn<User, UsersExtension, UsersPersistState, UsersExtraState>;

const singularName = "Usuario", //Escribirlo siempre letra Capital
   pluralName = "Usuarios"; //Escribirlo siempre letra Capital

const useUsersData = (): UsersDataReturn => {
   const initialState = useMemo<User>(
      () => ({
         id: 0,
         username: "",
         password: "",
         email: "",
         role_id: 0,
         casilla_id: 0,

         active: true,
         created_at: "",

         role_name: "",
         role_description: "",
         role_read: "",
         role_create: "",
         role_update: "",
         role_delete: "",
         role_more_permissions: "",
         casilla_type: null,
         casilla_district: 0,
         casilla_perimeter: "",
         casilla_place: "",
         casilla_location: "",
         casilla_active: true,

         confirmPassword: "",
         changePassword: false
      }),
      []
   );

   return useGenericData<User, UsersExtension, UsersPersistState, UsersExtraState>({
      initialState,
      prefix: "users",
      autoFetch: true,
      persistKey: "users-persist",
      debug: true,
      extraState: {
         textBtnSubmit: "REGISTRAR",
         singularName: singularName,
         pluralName: pluralName,
         formTitle: `REGISTRAR ${singularName.toUpperCase()}`,
         changepassword: true
      }, // valor inicial del estado extra

      extension: (set, get, persist) => ({
         // Método para modificar el estado extra
         setChangePassword: () => {
            set({ changepassword: "xxxxxxx" } as any);
         }
      }),

      hooks: {
         beforePost: (user) => {
            // Creamos un nuevo objeto solo con los campos que necesita el backend
            const payload: any = {
               email: user.email,
               username: user.username,
               role_id: user.role_id,
               changePassword: user.changePassword
            };

            // Solo si hay casilla_id > 0 se envía
            if (user.casilla_id && user.casilla_id > 0) {
               payload.casilla_id = user.casilla_id;
            }

            // Si es edición (id > 0) y NO se desea cambiar contraseña, omitir password
            // Si es creación (id === 0) o se desea cambiar contraseña, enviar password
            console.log("🚀 ~ useUsersData ~ user:", user);
            if (user.id === 0 || user.changePassword === true) {
               payload.password = user.password;
            }

            // Para edición, también se necesita el ID
            if (user.id > 0) {
               payload.id = user.id;
            }

            return payload;
         },
         afterFetch: (users) => users.sort((a, b) => a.username.localeCompare(b.username)),
         beforeDelete: (user) => {
            if (user.role_name === "admin") {
               alert("No puedes eliminar un administrador");
               return false;
            }
            return true;
         },
         onError: (msg) => console.error("[Users]", msg)
      }
   });
};

export default useUsersData;
