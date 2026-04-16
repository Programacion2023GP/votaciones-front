import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Project } from "../domains/models/project.model";

// ─── Estado persistente ──────────────────────────────────────────────────
export interface ProjectsPersistState {}

// ─── Estado extra (no persistente) ───────────────────────────────────────
export interface ProjectsExtraState {
   singularName: string;
   pluralName: string;
   formTitle: string;
   textBtnSubmit: string;
}

// ─── Extensión con métodos ───────────────────────────────────────────────
export interface ProjectsExtension {}

export type ProjectsDataReturn = GenericDataReturn<Project, ProjectsExtension, ProjectsPersistState, ProjectsExtraState>;

const singularName = "Proyecto", //Escribirlo siempre letra Capital
   pluralName = "Proyectos"; //Escribirlo siempre letra Capital

const useProjectsData = () => {
   const initialState = useMemo<Project>(
      () => ({
         id: 0,
         folio: 0,
         assigned_district: 0,
         project_name: "",
         project_place: "",
         viability: true,

         active: true,
         created_at: "" //dayjs().format("YYYY-MM-DD").toString()
      }),
      []
   );

   return useGenericData<Project, ProjectsExtension, ProjectsPersistState, ProjectsExtraState>({
      initialState,
      prefix: "projects",
      autoFetch: true,
      persistKey: "projects-persist",
      debug: true,
      extraState: {
         textBtnSubmit: "REGISTRAR",
         singularName: singularName,
         pluralName: pluralName,
         formTitle: `REGISTRAR ${singularName.toUpperCase()}`
      }, // valor inicial del estado extra

      extension: (_set, _get, _persist) => ({
         // Método para modificar el estado extra
      }),

      hooks: {
         beforePost: (project) => ({
            ...project
            // fullName: `${project.firstName} ${project.paternalSurname} ${project.maternalSurname}`.trim()
         }),
         afterFetch: (projects) => {
            return projects.sort((a, b) => a.project_name.localeCompare(b.project_name));
         },
         beforeDelete: (_project) => {
            // if (project.location === "admin") {
            //    alert("No puedes eliminar un administrador");
            //    return false;
            // }
            return true;
         },
         onError: (msg) => console.error("[Projects]", msg)
      }
   });
};

export default useProjectsData;
