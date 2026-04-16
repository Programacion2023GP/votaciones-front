import { useCallback, useEffect, useMemo, useRef } from "react";
import { GenericApi } from "../infrastructure/infrastructure.generic";
import { createGenericStore, type StoreExtension, type StoreLifecycleHooks } from "../store/generic.store";
import type { Options } from "../components/forms/Select2";
import { useStore } from "zustand";

// ─── Config del hook ──────────────────────────────────────────────────────
export interface GenericDataConfig<T extends { id?: number }, E = {}, P extends Record<string, any> = {}, S extends Record<string, any> = {}> {
   initialState: T;
   prefix: string;
   autoFetch?: boolean;
   hooks?: StoreLifecycleHooks<T>;
   extension?: StoreExtension<T, E, P, S>;
   persistKey?: string;
   extraState?: S;
   debug?: boolean; // ← esta propiedad existe
}

// ─── Cache ────────────────────────────────────────────────────────────────
const storeCache = new Map<string, ReturnType<typeof createGenericStore<any>>>();

// ─── Return type ──────────────────────────────────────────────────────────
export type GenericDataReturn<T extends { id?: number }, E = {}, P extends Record<string, any> = {}, S extends Record<string, any> = {}> = {
   getSelectIndex(): unknown;
   items: T[];
   itemsSelect?: Options[];
   prefix: string;
   loading: boolean;
   open: boolean;
   isDirty: boolean;
   selectedItem: T | null;
   initialValues: T;
   constants: T;
   meta: { page: number; total: number; limit: number };
   setOpen: () => void;
   setSelectedItem: (item: T | null) => void;
   handleChangeItem: (item: T) => void;
   setConstant: <K extends keyof T>(key: K, value: T[K]) => void;
   setPrefix: (prefix: string) => void;
   reset: () => void;
   fetchData: () => Promise<T[]>;
   refresh: () => Promise<T[]>;
   postItem: (item: T | T[], formData?: boolean, fetchAfter?: boolean) => Promise<void>;
   removeItemData: (item: T) => Promise<void>;
   request: (options: any, callback?: any) => Promise<T | T[] | undefined>;
   persist: P;
   setFieldValue: <K extends keyof T>(key: K, value: T[K]) => void;
   setExtraValue: <K extends keyof S>(key: K, value: S[K]) => void;
   setItems: (items: T[] | ((prev: T[]) => T[])) => void;
   setDebug: (enabled: boolean) => void;
   debug: boolean;
} & E &
   S;

// ─── Hook ─────────────────────────────────────────────────────────────────
export const useGenericData = <T extends { id?: number }, E = {}, P extends Record<string, any> = {}, S extends Record<string, any> = {}>(
   config: GenericDataConfig<T, E, P, S>
): GenericDataReturn<T, E, P, S> => {
   const { initialState, prefix, autoFetch = true, hooks, extension, persistKey, extraState, debug = false } = config;
   const initialStateRef = useRef(initialState);
   const hooksRef = useRef(hooks);
   hooksRef.current = hooks;

   const useStoreInstance = useMemo(() => {
      let store = storeCache.get(prefix);
      if (!store) {
         // ✅ Pasar el flag debug correctamente (quinto argumento)
         store = createGenericStore<T, E, P, S>(
            initialStateRef.current,
            extension,
            persistKey,
            extraState,
            debug // ← aquí se usa el valor de config.debug
         );
         storeCache.set(prefix, store);
      } else {
         // Si el store ya existe, actualizar el flag debug por si cambió
         const state = store.getState();
         if (state.setDebug && state._debugEnabled !== debug) {
            state.setDebug(debug);
         }
      }
      return store!;
   }, [prefix, persistKey, extension, extraState, debug]);

   // Protección extra (por si algo sale mal)
   if (!useStoreInstance) {
      throw new Error(`[useGenericData] No se pudo obtener/crear el store para el prefijo "${prefix}".`);
   }

   const store = useStore(useStoreInstance);
   const {
      items,
      itemsSelect,
      loading,
      open,
      initialValues,
      constants,
      setConstant,
      fetchData,
      postItem,
      removeItemData,
      handleChangeItem,
      setPrefix,
      setRepo,
      request,
      setOpen,
      setSelectedItem,
      selectedItem,
      isDirty,
      meta,
      reset,
      _persist,
      ensureData,
      _repo,
      setFieldValue,
      setExtraValue,
      setItems,
      setDebug: setDebugStore,
      _debugEnabled
   } = store as any;

   const apiRef = useRef(new GenericApi<T>());

   const fetchDataWrapped = useCallback(async () => {
      return await fetchData(hooksRef.current);
   }, [fetchData]);

   const ensureDataWrapped = useCallback(async () => {
      return await ensureData(hooksRef.current);
   }, [ensureData]);

   const postItemWrapped = useCallback(
      async (item: T | T[], formData?: boolean, fetchAfter?: boolean) => {
         await postItem(item, formData, fetchAfter, hooksRef.current);
      },
      [postItem]
   );

   const removeItemWrapped = useCallback(
      async (item: T) => {
         await removeItemData(item, hooksRef.current);
      },
      [removeItemData]
   );

   const requestWrapped = useCallback(
      async (options: any, callback: any) => {
         return await request(options, callback);
      },
      [request]
   );

   useEffect(() => {
      setPrefix(prefix);
      if (!_repo) {
         setRepo(apiRef.current);
      }
      if (autoFetch) {
         ensureDataWrapped();
      }
   }, [prefix, autoFetch, setPrefix, setRepo, ensureDataWrapped, _repo]);

   return {
      items,
      itemsSelect,
      prefix,
      loading,
      open,
      isDirty,
      selectedItem,
      initialValues,
      constants,
      meta,
      setOpen,
      setSelectedItem,
      handleChangeItem,
      setConstant,
      setPrefix,
      reset,
      fetchData: fetchDataWrapped,
      refresh: fetchDataWrapped,
      postItem: postItemWrapped,
      removeItemData: removeItemWrapped,
      request: requestWrapped,
      persist: _persist || {},
      setFieldValue,
      setExtraValue,
      setItems,
      setDebug: setDebugStore,
      debug: _debugEnabled,
      ...(store as any)
   } as GenericDataReturn<T, E, P, S>;
};
