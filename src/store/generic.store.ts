import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { GenericRepository } from "../domains/repositories/generic.repository";
import Toast from "../utils/Toast";
import type { Auth } from "../domains/models/auth.model";
import type { Options } from "../components/forms/Select2";
import { genericConfig } from "../utils/generic.config";
import type { ApiResult } from "../domains/models/apiResult.model";
import { QuestionAlertConfig } from "../utils/sAlert";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

// ─── Hooks de ciclo de vida ────────────────────────────────────────────────
export interface StoreLifecycleHooks<T> {
   beforeFetch?: () => boolean;
   afterFetch?: (items: T[]) => T[];
   beforePost?: (item: T) => T;
   afterPost?: (item: T | T[]) => void;
   beforeDelete?: (item: T) => boolean;
   afterDelete?: (item: T) => void;
   onError?: (msg: string) => void;
}

// ─── API de Persistencia tipada ───────────────────────────────────────────
export interface PersistAPI<P extends Record<string, any>> {
   get: <K extends keyof P>(key: K) => P[K] | undefined;
   set: <K extends keyof P>(key: K, value: P[K]) => void;
   readonly state: P;
}

// ─── Extensión del store (con persist y estado extra) ─────────────────────
export type StoreExtension<T extends { id?: number }, E = {}, P extends Record<string, any> = {}, S extends Record<string, any> = {}> = (
   set: (partial: Partial<GenericStore<T> & E & S & { _persist: P }>) => void,
   get: () => GenericStore<T> & E & S & { _persist: P },
   persist: PersistAPI<P> | undefined
) => E;

// ─── Estado base ──────────────────────────────────────────────────────────
export interface GenericStore<T extends object> {
   // auth: Auth | null;
   initialValues: T;
   items: T[];
   itemsSelect: Options[];
   loading: boolean;
   error: string | null;
   prefix: string;
   open: boolean;
   constants: T;
   selectedItem: T | null;
   isDirty: boolean;
   meta: { page: number; total: number; limit: number };
   _repo: GenericRepository<T> | null;
   _autoFetched: boolean; // ← AÑADIR ESTA LÍNEA
   _debugEnabled: boolean;

   setOpen: () => void;
   // setAuth: (auth: Auth | null) => void;
   setPrefix: (prefix: string) => void;
   setRepo: (repo: GenericRepository<T>) => void;
   setConstant: <K extends keyof T>(key: K, value: T[K]) => void;
   setSelectedItem: (item: T | null) => void;
   handleChangeItem: (item: T) => void;

   fetchData: (hooks?: StoreLifecycleHooks<T>) => Promise<T[]>;
   fetchDynamic: (repo: GenericRepository<any>, prefix: string) => Promise<any>;
   getSelectIndex: (hooks?: StoreLifecycleHooks<Options>) => Promise<Options[]>;
   // getSelectIndex(prefix?: string): Promise<ApiResult<Options[]>>;
   postItem: (item: T | T[], formData?: boolean, fetchAfter?: boolean, hooks?: StoreLifecycleHooks<T>) => Promise<void>;
   removeItemData: (item: T, hooks?: StoreLifecycleHooks<T>) => Promise<void>;
   request: (
      options: {
         data?: Partial<T>;
         url: string;
         method: "POST" | "PUT" | "GET" | "DELETE";
         formData?: boolean;
         getData?: boolean;
      },
      callback?: { then?: () => void; error?: () => void }
   ) => Promise<T | T[] | undefined>;

   reset: () => void;
   ensureData: (hooks?: StoreLifecycleHooks<T>) => Promise<T[]>; // ← AÑADIR ESTA LÍNEA

   setFieldValue: <K extends keyof T>(key: K, value: T[K]) => void;
   setExtraValue: (key: string, value: any) => void; // o usa un tipo más específico si conoces el estado extra
   setItems: (items: T[] | ((prev: T[]) => T[])) => void;
   setDebug: (enabled: boolean) => void;
}

// ─── Cache de singletons ──────────────────────────────────────────────────
const storeCache = new Map<string, UseBoundStore<StoreApi<any>>>();

export const clearStoreCache = (prefix?: string) => {
   if (prefix) storeCache.delete(prefix);
   else storeCache.clear();
};

// ─── Factory ──────────────────────────────────────────────────────────────
export function createGenericStore<T extends { id?: number }, E = {}, P extends Record<string, any> = {}, S extends Record<string, any> = {}>(
   initialValues: T,
   extension?: StoreExtension<T, E, P, S>,
   persistKey?: string,
   initialExtraState?: S,
   debug: boolean = false
): UseBoundStore<StoreApi<GenericStore<T> & E & S & { _persist: P }>> {
   const cfg = genericConfig;
   const _original = { ...initialValues };

   // Cargar estado persistente desde localStorage
   const loadPersistState = (): P => {
      if (!persistKey) return {} as P;
      try {
         const stored = localStorage.getItem(persistKey);
         return stored ? JSON.parse(stored) : ({} as P);
      } catch {
         return {} as P;
      }
   };

   // Guardar en localStorage
   const savePersistState = (state: P) => {
      if (!persistKey) return;
      try {
         localStorage.setItem(persistKey, JSON.stringify(state));
      } catch (e) {
         console.error("Error guardando en localStorage", e);
      }
   };

   return create<GenericStore<T> & E & S & { _persist: P }>((set, get) => {
      // API de persistencia (undefined si no hay persistKey)
      const persistAPI: PersistAPI<P> | undefined = persistKey
         ? {
              get: (key) => get()._persist?.[key],
              set: (key, value) => {
                 set((state) => {
                    const newPersist = { ...state._persist, [key]: value };
                    savePersistState(newPersist);
                    return { _persist: newPersist } as any;
                 });
              },
              get state() {
                 return get()._persist;
              }
           }
         : undefined;

      const log = (action: string, stage: string, data?: any, duration?: number) => {
         // console.log("sa", get()._debugEnabled);
         if (!get()._debugEnabled) return;
         const storeName = get().prefix || "generic";
         const color = stage === "start" ? "🔵" : stage === "success" ? "🟢" : stage === "error" ? "🔴" : "⚪";
         console.groupCollapsed(`${color} [${storeName}] ${action} - ${stage}`);
         console.log("⏱️ Tiempo:", duration ? `${duration}ms` : "inicio");
         if (data) console.log("📦 Datos:", data);
         console.trace("Traza");
         console.groupEnd();
      };

      const baseState: GenericStore<T> & S & { _persist: P } = {
         open: false,
         prefix: "",
         initialValues,
         constants: initialValues,
         items: [],
         itemsSelect: [],

         loading: false,
         error: null,
         selectedItem: null,
         isDirty: false,
         meta: { page: 1, total: 0, limit: 20 },
         _repo: null,
         _autoFetched: false,
         _persist: loadPersistState(),
         _debugEnabled: debug,
         ...(initialExtraState || ({} as S)),

         setOpen: () => set((s) => ({ open: !s.open, initialValues: _original }) as any),
         setPrefix: (prefix) => set({ prefix } as any),
         setRepo: (repo) => set({ _repo: repo } as any),
         setConstant: (key, value) => set((s) => ({ constants: { ...s.constants, [key]: value } }) as any),
         setSelectedItem: (item) => set({ selectedItem: item } as any),
         handleChangeItem: (item) => set((s) => ({ initialValues: item, isDirty: JSON.stringify(item) !== JSON.stringify(s.constants) }) as any),
         reset: () => set({ initialValues: _original, selectedItem: null, isDirty: false, error: null } as any),

         ensureData: async (hooks) => {
            const state = get();
            // Si ya hay datos o ya se intentó cargar automáticamente, retornar lo existente
            if (state.items.length > 0 || state._autoFetched) {
               return state.items;
            }
            // Marcar que ya se hizo el intento automático
            set({ _autoFetched: true } as any);
            // Realizar la carga real usando fetchData
            return await state.fetchData(hooks);
         },

         fetchDynamic: async (repo, prefix) => {
            const start = performance.now();
            log("fetchDynamic", "start", { prefix });
            set({ loading: true } as any);
            try {
               const result = await repo.getAll(prefix);
               const duration = performance.now() - start;

               if (result.ok) {
                  set({ items: result.data } as any);
                  log("fetchDynamic", "success", result.data, duration);
               }
               log("fetchDynamic", "error", { message: result.message }, duration);

               return result.ok ? result.data : [];
            } catch (error: any) {
               const duration = performance.now() - start;
               log("fetchDynamic", "error", error, duration);

               set({ error: error?.message ?? cfg.messages.unknownError } as any);
               return [];
            } finally {
               set({ loading: false } as any);
            }
         },

         fetchData: async (hooks) => {
            const repo = get()._repo;
            if (!repo) return [];
            if (hooks?.beforeFetch?.() === false) return get().items;

            const start = performance.now();
            const url = get().prefix;
            log("fetchData", "start", { url });

            set({ loading: true } as any);
            try {
               const data = await repo.getAll(get().prefix);
               const duration = performance.now() - start;
               if (data.ok) {
                  const raw = data.data ?? [];
                  const items = hooks?.afterFetch ? hooks.afterFetch(raw) : (cfg.middlewares.afterResponse?.(raw) ?? raw);
                  set({ items } as any);
                  log("fetchData", "success", { count: items.length, sample: items[0] }, duration);

                  return items;
               } else log("fetchData", "error", { message: data.message }, duration);

               return [];
            } catch (error: any) {
               const duration = performance.now() - start;
               log("fetchData", "error", error, duration);
               const msg = error?.message ?? cfg.messages.fetchError;
               (hooks?.onError ?? cfg.middlewares.onError)?.(msg);
               set({ error: msg, items: [] } as any);
               return [];
            } finally {
               set({ loading: false } as any);
            }
         },

         getSelectIndex: async (hooks) => {
            const repo = get()._repo;
            if (!repo) return [];
            if (hooks?.beforeFetch?.() === false) return get().itemsSelect;

            const start = performance.now();
            const url = get().prefix;
            log("getSelectIndex", "start", { url });

            set({ loading: true } as any);
            try {
               const data = await repo.getSelectIndex(get().prefix);
               const duration = performance.now() - start;

               if (data.ok) {
                  const raw = data.data ?? [];
                  const itemsSelect = (hooks?.afterFetch ? hooks.afterFetch(raw) : (cfg.middlewares.afterResponse?.(raw) ?? raw)) as Options[];
                  set({ itemsSelect } as any);
                  log("getSelectIndex", "success", { count: itemsSelect.length, sample: itemsSelect[0] }, duration);

                  return itemsSelect;
               } else log("getSelectIndex", "error", { message: data.message }, duration);
               return [];
            } catch (error: any) {
               const duration = performance.now() - start;
               log("fetchData", "error", error, duration);

               const msg = error?.message ?? cfg.messages.fetchError;
               (hooks?.onError ?? cfg.middlewares.onError)?.(msg);
               set({ error: msg, itemsSelect: [] } as any);
               return [];
            } finally {
               set({ loading: false } as any);
            }
         },

         postItem: async (item, formData, fetchAfter = true, hooks) => {
            const repo = get()._repo;
            if (!repo) return;

            const start = performance.now();
            const payload = hooks?.beforePost ? hooks.beforePost(item as T) : (cfg.middlewares.beforeRequest?.(item) ?? item);
            log("postItem", "start", { payload, formData });

            let success = false; // Bandera para saber si el POST fue exitoso
            set({ loading: true } as any);
            try {
               const data = await repo.create(payload, get().prefix, formData);
               // console.log("🚀 ~ createGenericStore ~ data:", data);
               const duration = performance.now() - start;

               if (data.ok) {
                  success = true;
                  Toast.Customizable(data.message || cfg.messages.createSuccess, "success");
                  hooks?.afterPost?.(item);
                  get().setOpen();
                  if (fetchAfter) {
                     await get().fetchData(hooks);
                     log("postItem", "success", { response: data.data }, duration);
                  }
               } else {
                  // console.log("aqui merengue",JSON.stringify(data.error))
                  log("postItem", "error", { message: data.message }, duration);

                  if (data.error && typeof data.error == "object") {
                     Object.values(data.error).forEach((errors: any) => {
                        console.log("🚀 ~ createGenericStore ~ errors:", errors)
                        errors.map((error: string) => Toast.Warning(error));
                     });
                  } else {
                     Toast.Customizable(data.message, "error");
                  }
               }
            } catch (error: any) {
               const duration = performance.now() - start;
               log("postItem", "error", error, duration);

               const msg = error?.message ?? cfg.messages.unknownError;
               (hooks?.onError ?? cfg.middlewares.onError)?.(msg);
               Toast.Customizable(msg, "error");
               set({ error: msg, open: true } as any);
            } finally {
               if (success) set({ loading: false, initialValues: _original } as any);
               else set({ loading: false } as any);
            }
         },

         removeItemData: async (item, hooks) => {
            const mySwal = withReactContent(Swal);

            const repo = get()._repo;
            if (!repo) return;
            if (hooks?.beforeDelete?.(item) === false) return;

            const start = performance.now();
            log("removeItemData", "start", { item });

            const previous = get().items;
            try {
               mySwal.fire(QuestionAlertConfig(`¿Estas seguro de eliminar el producto ${name}?`, "CONFIRMAR")).then(async (result) => {
                  if (result.isConfirmed) {
                     const data = await repo.delete(item, get().prefix);
                     const duration = performance.now() - start;

                     if (data.ok) {
                        set({ items: previous.filter((i: any) => i.id !== (item as any).id), loading: true } as any);
                        Toast.Customizable(data.message || cfg.messages.deleteSuccess, "success");
                        hooks?.afterDelete?.(item);
                        await get().fetchData(hooks);
                        log("removeItemData", "success", { message: data.message }, duration);
                     } else {
                        set({ items: previous } as any);
                        log("removeItemData", "error", { message: data.message }, duration);
                     }
                  } else {
                     set({ items: previous } as any);
                     const duration = performance.now() - start;
                     log("removeItemData", "error", { message: "data.message" }, duration);
                     // Toast.Customizable(data.message, "error");
                  }
               });
            } catch (error: any) {
               const duration = performance.now() - start;
               log("removeItemData", "error", error, duration);

               set({ items: previous } as any);
               const msg = error?.message ?? cfg.messages.unknownError;
               (hooks?.onError ?? cfg.middlewares.onError)?.(msg);
               Toast.Customizable(msg, "error");
               set({ error: msg } as any);
            } finally {
               set({ loading: false, initialValues: _original } as any);
            }
         },

         request: async (
            options: { data: any; url: any; method: "POST" | "PUT" | "GET" | "DELETE"; formData: any; getData: any },
            callback: { error: () => void; then: () => void }
         ) => {
            const repo = get()._repo;
            if (!repo) {
               callback?.error?.();
               return undefined;
            }

            const start = performance.now();
            log("request", "start", { method: options.method, url: options.url, data: options.data });

            set({ loading: true } as any);
            try {
               const result = await repo.request({
                  data: options.data,
                  prefix: options.url,
                  method: options.method,
                  formData: options.formData
               });
               // console.log("🚀 ~ createGenericStore ~ result:", result);
               const duration = performance.now() - start;

               if (result.ok) {
                  if (options.method !== "GET" && result.message) Toast.Customizable(result.message, "success");
                  if (options.method === "GET") {
                     const dataArray = Array.isArray(result.data) ? result.data : [result.data];
                     set({ items: dataArray } as any);
                     log("request", "success", { data: dataArray }, duration);

                     callback?.then?.();
                     Toast.Customizable(result.message, "info");
                     return dataArray;
                  } else {
                     if (options.getData) await get().fetchData();
                     log("request", "success", { data: result.data }, duration);

                     callback?.then?.();
                     return result.data as T | T[];
                  }
               } else {
                  log("request", "error", { message: result.message }, duration);

                  Toast.Customizable(result.message || "Error en la operación", "error");
                  set({ error: result.message } as any);
                  callback?.error?.();
               }
            } catch (error: any) {
               const duration = performance.now() - start;
               log("request", "error", error, duration);

               const msg = error?.message ?? cfg.messages.unknownError;
               set({ error: msg } as any);
               callback?.error?.();
               if (!callback?.error) Toast.Customizable(msg, "error");
            } finally {
               set({ loading: false } as any);
            }
         },

         setFieldValue: (key, value) => set((s) => ({ initialValues: { ...s.initialValues, [key]: value } }) as any),

         setExtraValue: (key, value) => set({ [key]: value } as any),

         setItems: (items) => set((s) => ({ items: typeof items === "function" ? items(s.items) : items }) as any),

         setDebug: (enabled) => set({ _debugEnabled: enabled } as any)
      };

      const extensionState = extension ? extension(set as any, get as any, persistAPI) : ({} as E);

      return {
         ...baseState,
         ...extensionState
      } as any;
   });
}
