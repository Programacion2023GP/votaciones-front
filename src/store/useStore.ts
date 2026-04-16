// import { create } from "zustand";
// import { isNumeric } from "../utils/helpers";
// import axios from "axios";
// import { env } from "../constant";
// import Toast from "../utils/Toast";
// import type { ApiResult } from "../domains/models/apiResult.model";
// import type { Auth } from "../domains/models/auth.model";

// // --- Types ---
// // export interface UserAuth {
// //    id: number;
// //    username: string;
// //    email: string;
// //    active: boolean;
// //    user_created_at: string;
// //    role_id: number;
// //    role_name: string;
// //    role_description: string;
// //    role_read: string; // "si" o "no" (o boolean dependiendo de tu BD)
// //    role_create: string;
// //    role_update: string;
// //    role_delete: string;
// //    role_more_permissions: any[]; // puede ser JSON o texto
// //    casilla_id: number | null;
// //    casilla_type: "Rural" | "Urbana" | "Especial" | null;
// //    casilla_district: number | null;
// //    casilla_perimeter: string | null;
// //    casilla_place: string | null;
// //    casilla_location: string | null;
// //    casilla_active: boolean | null;
// //    token?: string;
// //    // Permisos derivados (opcional, para facilitar uso en frontend)
// //    permissions?: {
// //       read: boolean;
// //       create: boolean;
// //       update: boolean;
// //       delete: boolean;
// //       more_permissions: any[];
// //    };
// // }

// interface User {
//    nombre: string;
//    cargo: string;
//    iniciales: string;
//    email: string;
//    estado: string;
//    municipio: string;
//    casilla: string; // e.g., "Casilla 01 - Esc. Primaria..."
//    seccion: string;
// }

// // Tipos
// export interface Casilla {
//    place: string;
//    id: number;
//    tipo: "rural" | "urbana" | "especial";
//    distrito?: string; // rural, urbana
//    perimetro?: string; // rural
//    lugar: string; // nombre del centro (ej: "Vergel", "Plaza de Armas")
//    ubicacion?: string; // rural: "Plaza", etc.
//    colonia?: string; // urbana y especial
//    activa: boolean;
// }

// export interface Participacion {
//    id: number;
//    tipo: "INE" | "Carta Identidad";
//    curp: string;
//    casilla: string;
//    fecha: string;
// }

// interface StoreState {
//    user: Auth | null;
//    participaciones: Participacion[];
//    casillas: Casilla[];
//    isLoading: boolean;
//    error: string | null;
//    login: (username: string, password: string) => Promise<ApiResult<Auth>>;
//    logout: () => Promise<void>;
//    clearError: () => void;

//    addCasilla: (nueva: Omit<Casilla, "id">) => void;
//    updateCasilla: (id: number, casilla: Casilla) => void;
//    toggleCasilla: (id: number) => void;
//    deleteCasilla: (id: number) => void;

//    addParticipacion: (nueva: Omit<Participacion, "id" | "fecha">) => Participacion;
//    existsParticipacion: (curp: string) => boolean;
// }

// // --- Static data ---
// // Datos iniciales extraídos de la imagen
// const CASILLAS_INIT: Casilla[] = [
//    // Rural
//    { id: 1, tipo: "rural", distrito: "10", perimetro: "Lavín", lugar: "Vergel", ubicacion: "Plaza", activa: true },
//    { id: 2, tipo: "rural", distrito: "10", perimetro: "Lavín", lugar: "Brittingham", ubicacion: "Plaza", activa: true },
//    { id: 3, tipo: "rural", distrito: "10", perimetro: "Lavín", lugar: "6 de Octubre", ubicacion: "Plaza", activa: true },
//    { id: 4, tipo: "rural", distrito: "10", perimetro: "Sacramento", lugar: "Compás", ubicacion: "Plaza", activa: true },
//    { id: 5, tipo: "rural", distrito: "10", perimetro: "Sacramento", lugar: "Gregorio A. García", ubicacion: "Plaza", activa: true },
//    { id: 6, tipo: "rural", distrito: "10", perimetro: "Sacramento", lugar: "Arturo Mtz Adame", ubicacion: "Plaza", activa: true },
//    { id: 7, tipo: "rural", distrito: "10", perimetro: "Centro", lugar: "Cuba", ubicacion: "Plaza", activa: true },
//    { id: 8, tipo: "rural", distrito: "10", perimetro: "Centro", lugar: "Jabonoso", ubicacion: "Plaza", activa: true },
//    { id: 9, tipo: "rural", distrito: "10", perimetro: "Centro", lugar: "13 de Marzo", ubicacion: "Plaza", activa: true },
//    // Urbana
//    { id: 10, tipo: "urbana", distrito: "11", colonia: "Centro", lugar: "Plaza de Armas", activa: true },
//    { id: 11, tipo: "urbana", distrito: "11", colonia: "Fidel Velázquez", lugar: "Plaza Corazón", activa: true },
//    { id: 12, tipo: "urbana", distrito: "11", colonia: "Miravalle", lugar: "Plaza", activa: true },
//    { id: 13, tipo: "urbana", distrito: "12", colonia: "Flores Magón", lugar: "Torre Eiffel", activa: true },
//    { id: 14, tipo: "urbana", distrito: "12", colonia: "Rinconada Napoles", lugar: "Filadelfia y Rcda. de las Azaleas", activa: true },
//    { id: 15, tipo: "urbana", distrito: "12", colonia: "Felipe Ángeles", lugar: "Centro Comunitario", activa: true },
//    // Especiales
//    { id: 16, tipo: "especial", colonia: "Hamburgo", lugar: "Paseo Gómez Palacio", activa: true },
//    { id: 17, tipo: "especial", colonia: "Fracc. Sta Rosa", lugar: "Central de Abastos", activa: true },
//    { id: 18, tipo: "especial", colonia: "Filadelfia", lugar: "UJED FICA", activa: true }
// ];

// const PARTICIPACIONES_INIT: Participacion[] = [
//    { id: 1, tipo: "INE", curp: "GMZM750312HDFRRN04", casilla: "01", fecha: "2025-06-02T09:14:22" },
//    { id: 2, tipo: "Carta Identidad", curp: "RUVF820115MDFRRN09", casilla: "01", fecha: "2025-06-02T09:22:10" },
//    { id: 3, tipo: "INE", curp: "HERJ890505MDFRRN07", casilla: "02", fecha: "2025-06-02T10:01:55" },
//    { id: 4, tipo: "INE", curp: "LOPT651201HDFBLR08", casilla: "03", fecha: "2025-06-02T10:35:42" },
//    { id: 5, tipo: "Carta Identidad", curp: "SOTM780425MDFRRN12", casilla: "04", fecha: "2025-06-02T11:02:19" },
//    { id: 6, tipo: "INE", curp: "VALD780930HDFRRN02", casilla: "01", fecha: "2025-06-02T11:48:33" }
// ];

// // peticion login

// const useStore = create<StoreState>((set, get) => ({
//    user: null,
//    participaciones: PARTICIPACIONES_INIT,
//    casillas: CASILLAS_INIT,
//    isLoading: false,
//    error: null,

//    login: async (username: string, password: string) => {
//       set({ isLoading: true, error: null });
//       try {
//          let postData: any = { username, password };
//          if (username.includes("@")) {
//             postData = { email: username, password };
//          } else if (isNumeric(username)) {
//             postData = { payroll_number: username, password };
//          }

//          const response = await axios.post(`${env.API_URL}/login`, postData);
//          console.log("🚀 ~ response:", response);
//          const result = response.data.data.result;
//          const authData = result.auth; // asumiendo que viene de vw_users
//          const token = result.token;

//          // Construir objeto UserAuth
//          const userData: UserAuth = {
//             id: authData.id,
//             username: authData.username,
//             email: authData.email,
//             active: authData.active,
//             user_created_at: authData.user_created_at,
//             role_id: authData.role_id,
//             role_name: authData.role_name,
//             role_description: authData.role_description,
//             role_read: authData.role_read,
//             role_create: authData.role_create,
//             role_update: authData.role_update,
//             role_delete: authData.role_delete,
//             role_more_permissions: authData.role_more_permissions || [],
//             casilla_id: authData.casilla_id,
//             casilla_type: authData.casilla_type,
//             casilla_district: authData.casilla_district,
//             casilla_perimeter: authData.casilla_perimeter,
//             casilla_place: authData.casilla_place,
//             casilla_location: authData.casilla_location,
//             casilla_active: authData.casilla_active,
//             token: token,
//             // Derivamos permisos para facilitar uso
//             permissions: {
//                read: authData.role_read === "si",
//                create: authData.role_create === "si",
//                update: authData.role_update === "si",
//                delete: authData.role_delete === "si",
//                more_permissions: authData.role_more_permissions || []
//             }
//          };

//          localStorage.setItem("auth", JSON.stringify(authData));
//          localStorage.setItem("token", token);
//          set({ user: userData, isLoading: false });
//          return result;
//       } catch (error: any) {
//          const message = error.response?.data?.message || "Error en login";
//          Toast.Error(message);
//          set({ error: message, isLoading: false });
//          throw error;
//       }
//    },
//    logout: async () => {
//       set({ isLoading: true });
//       try {
//          const token = get().user?.token;
//          if (token) {
//             await axios.post(`${env.API_URL}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
//          }
//          localStorage.removeItem("auth");
//          localStorage.removeItem("token");
//          set({ user: null, isLoading: false });
//       } catch (err) {
//          console.error(err);
//          localStorage.removeItem("auth");
//          localStorage.removeItem("token");
//          set({ user: null, isLoading: false });
//       }
//    },

//    clearError: () => set({ error: null }),

//    addCasilla: (casilla: Omit<Casilla, "id">) => {
//       const newId = Date.now();
//       set((state) => ({
//          casillas: [...state.casillas, { ...casilla, id: newId }]
//       }));
//    },
//    updateCasilla: (id: number, updates: Partial<Casilla>) => {
//       set((state) => ({
//          casillas: state.casillas.map((c) => (c.id === id ? { ...c, ...updates } : c))
//       }));
//    },
//    toggleCasilla: (id: number) => {
//       set((state) => ({
//          casillas: state.casillas.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c))
//       }));
//    },
//    deleteCasilla: (id: number) => {
//       set((state) => ({
//          casillas: state.casillas.filter((c) => c.id !== id)
//       }));
//    },

//    addParticipacion: (nueva) => {
//       const nuevaParticipacion: Participacion = {
//          id: Date.now(),
//          ...nueva,
//          fecha: new Date().toISOString()
//       };
//       set((state) => ({
//          participaciones: [...state.participaciones, nuevaParticipacion]
//       }));
//       return nuevaParticipacion;
//    },

//    existsParticipacion: (curp) => {
//       const participaciones = get().participaciones;
//       return participaciones.some((p) => p.curp.toUpperCase() === curp.trim().toUpperCase());
//    }
// }));

// export default useStore;
