import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Auth } from "../domains/models/auth.model";
import { isNumeric } from "../utils/helpers";
import type { ApiResult } from "../domains/models/apiResult.model";

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface AuthExtension {
   login: (username: string, password: string) => Promise<void>;
   logout: () => Promise<void>;
   changePasswordAuth?: (id: number) => Promise<void>;
   signup?: (auth: Auth) => Promise<Auth>;
}

// ─── Estado persistente ──────────────────────────────────────────────────
export interface AuthPersistState {
   auth: Auth | null;
   token: string;
}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface AuthExtraState {
   // auth: Auth | null;
   // token: string;
}

export type AuthDataReturn = GenericDataReturn<Auth, AuthExtension, AuthPersistState, AuthExtraState>;

const useAuthData = (): AuthDataReturn => {
   const initialState = useMemo<Auth>(
      () => ({
         id: 0,
         username: "",
         email: "",
         password: "",
         active: true,
         user_created_at: "",
         role_id: 0,
         role_name: "",
         role_description: "",
         role_read: "", // "si" o "no" (o true dependiendo de tu BD,
         role_create: "",
         role_update: "",
         role_delete: "",
         role_more_permissions: "", // puede ser JSON o text,
         casilla_id: 0,
         casilla_type: null,
         casilla_district: null,
         casilla_perimeter: null,
         casilla_place: null,
         casilla_location: null,
         casilla_active: null,
         full_name: "",
         token: "",
         // Permisos derivados (opcional, para facilitar uso en frontend)
         permissions: {
            read: true,
            create: true,
            update: true,
            delete: true,
            more_permissions: ""
         }
      }),
      []
   );

   return useGenericData<Auth, AuthExtension, AuthPersistState, AuthExtraState>({
      initialState,
      prefix: "auth",
      autoFetch: false,
      persistKey: "auth-persist",
      // extraState: { auth: localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth") ?? "") : null }, // valor inicial del estado extra

      hooks: {
         beforePost: (user) => ({
            ...user
            // fullName: `${user.firstName} ${user.paternalSurname} ${user.maternalSurname}`.trim()
         }),
         afterFetch: (users) => users.sort((a, b) => a.username.localeCompare(b.username)),
         beforeDelete: (user) => {
            if (user.role_name === "admin") {
               alert("No puedes eliminar un administrador");
               return false;
            }
            return true;
         },
         onError: (msg) => console.error("[Auth]", msg)
      },

      extension: (set, get, persist) => ({
         login: async (username, password) => {
            let postData: any = {
               username,
               password
            };
            if (username.includes("@"))
               postData = {
                  email: username,
                  password
               };
            else if (isNumeric(username))
               postData = {
                  payroll_number: username,
                  password
               };
            const res = (await get().request({ url: `${get().prefix}/login`, method: "POST", data: postData, getData: false })) as unknown as ApiResult<Auth>;

            // Aseguramos que result tenga la estructura esperada
            const resultData = res as unknown as { token: string; auth: Auth };
            // if (res && (res as any).auth) {
            const resAuth = resultData.auth;
            const resToken = resultData.token;

            persist?.set("auth", resAuth);
            persist?.set("token", resToken);
            // get().setAuth(resAuth);
            // set({
            //    auth: {
            //       id: resAuth?.id,
            //       username: resAuth?.username,
            //       email: resAuth?.email,
            //       password: resAuth?.password,
            //       active: resAuth?.active,
            //       user_created_at: resAuth?.user_created_at,
            //       role_id: resAuth?.role_id,
            //       role_name: resAuth?.role_name,
            //       role_description: resAuth?.role_description,
            //       role_read: resAuth?.role_read,
            //       role_create: resAuth?.role_create,
            //       role_update: resAuth?.role_update,
            //       role_delete: resAuth?.role_delete,
            //       role_more_permissions: resAuth?.role_more_permissions,
            //       casilla_id: resAuth?.casilla_id,
            //       casilla_type: resAuth?.casilla_type,
            //       casilla_district: resAuth?.casilla_district,
            //       casilla_perimeter: resAuth?.casilla_perimeter,
            //       casilla_place: resAuth?.casilla_place,
            //       casilla_location: resAuth?.casilla_location,
            // localStorage.setItem("auth", JSON.stringify(resAuth) ?? "{}");
            // localStorage.setItem("token", JSON.stringify(resToken) ?? "");
         },

         logout: async () => {
            // console.log("🚀 ~ useAuthData ~ logout:");

            await get().request({ url: `${get().prefix}/logout`, method: "GET", getData: false });

            persist?.set("auth", null);
            persist?.set("token", "");
            // set({ auth: null });
            // localStorage.removeItem("auth");
            // localStorage.removeItem("token");
         }
      })
   });
};

export default useAuthData;
