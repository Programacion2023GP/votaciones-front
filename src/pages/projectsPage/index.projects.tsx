import React from "react";
import useProjectsData from "../../hooks/useProjectsData";
import ProjectsTable from "./table.projects";
import ProjectsForm from "./form.projects";

const Projects: React.FC = () => {
   const projectsContext = useProjectsData();

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Catálogos <span>›</span> <span>{projectsContext.pluralName}</span>
               </div>
               <h1 className="page-title">{projectsContext.pluralName}</h1>
               <p className="page-subtitle">Listado de proyectos registrados para el presupuesto participativo</p>
            </div>
            <button className="btn-secondary" onClick={() => projectsContext.setOpen()}>
               {projectsContext.open ? "✕ Cancelar" : "+ Nuevo Proyecto"}
            </button>
         </div>

         <ProjectsForm />

         <ProjectsTable />
      </div>
   );
};

export default Projects;
