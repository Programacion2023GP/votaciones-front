// pages/Participations/ParticipationsForm.tsx
import { useEffect, useRef } from "react";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import * as Yup from "yup";
import useParticipationsData from "../../hooks/useParticipationsData";
import { Input, Select2 } from "../../components/forms";
import { validateCURP } from "../../utils/helpers";
import type { Participation } from "../../domains/models/participation.model";
import useAuthData from "../../hooks/useAuthData";

const ParticipationsForm: React.FC = () => {
   const userAuth = useAuthData().persist.auth;
   const participationsContext = useParticipationsData();
   const formikRef = useRef<any>(null);

   // Opciones para tipo de documento
   const tipoOptions = [
      { id: "INE", label: "INE / IFE" },
      { id: "Carta Identidad", label: "Carta Identidad" }
   ];

   const handleTipoSelect = (tipo: "INE" | "Carta Identidad") => {
      // console.log("🚀 ~ handleTipoSelect ~ tipo:", tipo);
      formikRef.current.setFieldValue("type", tipo);
      formikRef.current.setFieldValue("curp", "");

      participationsContext.setFieldValue("type", tipo);
      participationsContext.setFieldValue("curp", "");
      // participationsContext.setFieldTouched("curp", false);
   };

   const formData: FieldConfig<Participation>[] = [
      {
         name: "id",
         value: null,
         input: <Input key="id" col={1} idName="id" label="ID" required hidden />,
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "type",
         value: "",
         // input: <Select2 key="type" col={12} idName="type" label="Tipo de Documento" options={tipoOptions} required />,
         input: (
            <div className="doc-selector pt-3">
               <div className={`doc-option ${participationsContext.initialValues.type === "INE" ? "selected" : ""}`} onClick={() => handleTipoSelect("INE")}>
                  <div className="doc-check">✓</div>
                  <span className="doc-icon-wrap">🪪</span>
                  <div className="doc-label">INE</div>
                  <div className="doc-desc">Credencial para votar</div>
               </div>
               <div
                  className={`doc-option ${participationsContext.initialValues.type === "Carta Identidad" ? "selected" : ""}`}
                  onClick={() => handleTipoSelect("Carta Identidad")}
               >
                  <div className="doc-check">✓</div>
                  <span className="doc-icon-wrap">📄</span>
                  <div className="doc-label">Carta Identidad</div>
                  <div className="doc-desc">Documento Oficial</div>
               </div>
               {!participationsContext.initialValues.type && (
                  <div className="empty-state grid col-span-2" style={{ padding: "0px 0" }}>
                     <div className="empty-icon animate-bounce" style={{ fontSize: 32 }}>
                        ☝️
                     </div>
                     <div className="empty-title">Seleccione el tipo de documento que presentaste</div>
                     <div className="empty-desc">Elija INE o Carta Identidad para continuar</div>
                  </div>
               )}
            </div>
         ),
         validations: Yup.string().required("Selecciona un tipo de documento"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "curp",
         value: "",
         input: (
            <div className={!participationsContext.initialValues.type ? "hidden" : ""} style={{ animation: "slideIn 0.3s ease" }}>
               <Input
                  key="curp"
                  col={12}
                  idName="curp"
                  label="🔑 CURP"
                  placeholder="Ej: XXXX123456XXXXXXXX"
                  type="text"
                  textStyleCase={null}
                  helperText="Ingrese la CURP del ciudadano"
                  required
               />
            </div>
         ),
         validations: Yup.string()
            .required("La CURP es obligatoria")
            .test("curp-valid", "Formato de CURP inválido", (value) => validateCURP(value || "")),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      }
   ];

   const validations = {};

   const validationSchema = () => Yup.object().shape(validations);

   const onSubmit = async (values: any) => {
      // El user_id se añadirá en beforePost del hook
      const res = await participationsContext.postItem(values);
      console.log("🚀 ~ onSubmit ~ res:", res)
      // Limpiar formulario después de enviar (opcional)
      // if (formikRef.current) {
      //    formikRef.current.resetForm();
      // }
   };

   const handleCancel = () => {
      if (formikRef.current) {
         formikRef.current.resetForm();
      }
      participationsContext.handleChangeItem({
         id: 0,
         type: null,
         curp: "",
         user_id: userAuth?.id || 0
      });
   };

   return (
      <>
         <div className="card mb-6" style={{ animation: "slideIn 0.3s ease" }}>
            <div className="card-header">
               <span className="card-title-text">
                  1. Tipo de Documento
                  {/* {participationsContext.initialValues.id > 0 ? "Editar Registro" : "Nuevo Registro de Participación"} */}
               </span>
            </div>
            <div className="card-body">
               <FormGeneric
                  initialValuesContext={participationsContext.initialValues}
                  formData={formData}
                  validations={validations}
                  formikRef={formikRef}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                  textBtnSubmit={participationsContext.textBtnSubmit}
                  handleCancel={handleCancel}
                  container="none"
               />
            </div>
         </div>
      </>
   );
};

export default ParticipationsForm;
