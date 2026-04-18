import { useEffect, useRef } from "react";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import * as Yup from "yup";
import useProjectsData from "../../hooks/useProjectsData";
import { Input } from "../../components/forms";
import type { Project } from "../../domains/models/project.model";

const ProjectsForm: React.FC = () => {
   const projectsContext = useProjectsData();
   const formikRef = useRef<any>(null);

   const formData: FieldConfig<Project>[] = [
      {
         name: "id",
         value: null,
         input: <Input key="id" col={1} idName="id" label="ID" required hidden />,
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "folio",
         value: "",
         input: <Input key="folio" col={3} idName="folio" label="Folio" placeholder="Ej: 00123" type="number" required />,
         validations: Yup.number().typeError("El folio debe ser un número").positive("El folio debe ser mayor a cero").required("El folio es requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "assigned_district",
         value: "",
         input: <Input key="assigned_district" col={3} idName="assigned_district" label="Distrito" placeholder="Ej: 10" type="number" required />,
         validations: Yup.number().typeError("El distrito debe ser un número").min(1, "El distrito mínimo es 1").required("El distrito es requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "project_name",
         value: "",
         input: (
            <Input key="project_name" col={6} idName="project_name" label="Nombre del Proyecto" placeholder="Ej: Construcción de techumbre" type="text" required />
         ),
         validations: Yup.string().trim().min(5, "Mínimo 5 caracteres").required("El nombre del proyecto es requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "project_place",
         value: "",
         input: <Input key="project_place" col={6} idName="project_place" label="Ubicación del Proyecto" placeholder="Ej: Ejido La Aurora" type="text" required />,
         validations: Yup.string().trim().min(5, "Mínimo 5 caracteres").required("La ubicación es requerida"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "viability",
         value: 1,
         input: <Input key="viability" col={3} idName="viability" label="Viabilidad" type="number" min={0} max={1} />,
         validations: Yup.number().min(0, "valor invalido").max(1, "valor fuera de rango").required("ingrese 0=No viable o 1=Viable"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      }
   ];

   const validations = {};

   const validationSchema = () => Yup.object().shape(validations);

   const onSubmit = async (values: Project | Project[]) => {
      await projectsContext.postItem(values);
      // Limpiar formulario después de enviar (opcional)
      if (formikRef.current) {
         formikRef.current.resetForm();
      }
   };

   const handleCancel = () => {
      if (formikRef.current) {
         formikRef.current.resetForm();
      }
      projectsContext.handleChangeItem({
         id: 0,
         folio: 0,
         assigned_district: 0,
         project_name: "",
         project_place: "",
         viability: true,
         active: true
      });
   };

   return (
      <>
         {projectsContext.open && (
            <div className="card mb-6" style={{ animation: "slideIn 0.3s ease" }}>
               <div className="card-header">
                  <span className="header-title">{projectsContext.initialValues.id > 0 ? "Editar Proyecto" : "Nuevo Proyecto"}</span>
               </div>
               <div className="card-body">
                  <FormGeneric
                     initialValuesContext={projectsContext.initialValues}
                     formData={formData}
                     validations={validations}
                     formikRef={formikRef}
                     validationSchema={validationSchema}
                     onSubmit={onSubmit}
                     textBtnSubmit={projectsContext.textBtnSubmit}
                     handleCancel={handleCancel}
                     container="none"
                  />
               </div>
            </div>
         )}
      </>
   );
};

export default ProjectsForm;
