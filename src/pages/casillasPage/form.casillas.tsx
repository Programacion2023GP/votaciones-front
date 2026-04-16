import { useEffect, useRef } from "react";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import * as Yup from "yup";
import useCasillasData from "../../hooks/useCasillasData";
import { Input, Select2 } from "../../components/forms";
import type { Options } from "../../components/forms/Select2";
import useAuthData from "../../hooks/useAuthData";
import type { Casilla } from "../../domains/models/casilla.model";

const CasillaForm = ({}) => {
   const authContext = useAuthData();

   const casillaContext = useCasillasData();

   useEffect(() => {
      (async () => {
         await casillaContext.getSelectIndex();
      })();
   }, []);

   const formikRef: React.RefObject<null> = useRef(null);
   const formData: FieldConfig<Casilla>[] = [
      {
         name: "id",
         value: null,
         input: <Input key={`key-input-id`} col={1} idName={"id"} label={"ID"} required hidden />,
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "type",
         value: 0,
         input: (
            <Select2
               key={`key-input-type`}
               col={12}
               idName="type"
               label="Tipo"
               // refreshSelect={async () => await casillaContext.fetchData()}
               // onChangeExtra={handleChangeEmployee}
               options={[
                  { id: "Rural", label: "Rural" },
                  { id: "Urbana", label: "Urbana" },
                  { id: "Especial", label: "Especial" }
               ]}
               // addRegister={authContext.persist?.auth?.permissions?.create ? () => casillaContext.setOpen() : null}
            />
         ),
         validations: Yup.number().min(0, "Esta opción no es valida").notRequired(),
         validationPage: [],
         dividerBefore: { show: false, title: "EMPLEADO", orientation: "horizontal", className: "" }
      },
      {
         name: "district",
         value: "",
         input: (
            <Input key={`key-input-district`} col={4} idName="district" label="Distrito" placeholder="00" type="number" textStyleCase={null} helperText="" required />
         ),
         validations: Yup.string().trim().required("Distrito requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "DATOS DE USUARIO", orientation: "horizontal", className: "" }
      },
      {
         name: "perimeter",
         value: "",
         input: (
            <Input
               key={`key-input-perimeter`}
               col={4}
               idName="perimeter"
               label="Perimetro / Colonia"
               placeholder="ingresa el nombre del perimetro"
               type="text"
               textStyleCase={false}
               helperText=""
               required
            />
         ),
         validations: Yup.string().trim().required("Perimetro requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "place",
         value: "",
         input: (
            <Input
               key={`key-input-place`}
               col={4}
               idName="place"
               label="Lugar"
               placeholder="ingresa el nombre del lugar"
               type="text"
               textStyleCase={false}
               helperText=""
               required
            />
         ),
         validations: Yup.string().trim().required("Lugar requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "location",
         value: "",
         input: (
            <Input
               key={`key-input-location`}
               col={4}
               idName="location"
               label="Ubicación"
               placeholder="ingresa el nombre de la ubicación"
               type="text"
               textStyleCase={false}
               helperText=""
               required
            />
         ),
         validations: Yup.string().trim().required("Ubicación requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      }
   ];
   const validations = {};

   const validationSchema = (page = null) => {
      if (!page) return Yup.object().shape(validations);

      const formDataPerPage = formData.filter((item) => item.validationPage?.includes(page));
      const validationsPerPage: any = [];
      formDataPerPage.forEach((field) => {
         validationsPerPage[field?.name] = field?.validations;
      });
      return Yup.object().shape(validationsPerPage);
   };
   const onSubmit = async (values: Casilla | Casilla[], {}: any) => {
      console.log("🚀 ~ onSubmit ~ validationSchema:", validationSchema());
      // values.evidences = imgEvidences.length == 0 ? "" : imgEvidences[0].file;
      console.log("🚀 ~ onSubmit ~ values:", values);
      const res = await casillaContext.postItem(values);
      console.log("🚀 ~ onSubmit ~ res:", res);
   };
   const handleCancel = () => {
      // formikRef.current.resetForm();
      // formikRef.current.setValues(formikRef.current.initialValues);
      // setFormTitle(`REGISTRAR ${singularName.toUpperCase()}`);
      // setTextBtnSubmit("AGREGAR");
      // // setImgEvidences([]);
      // setIsEdit(false);
      // setChangePassword(false);
      // if (!checkAdd) setOpenDialog(false);
   };

   return (
      <>
         {casillaContext.open && (
            <div className="card mb-6" style={{ animation: "slideIn 0.3s ease" }}>
               <div className="card-header">
                  <span className="header-title">{casillaContext.initialValues.id > 0 ? "Editar Centro" : "Nuevo Centro de Votación"}</span>
               </div>
               <div className="card-body">
                  <FormGeneric
                     initialValuesContext={casillaContext.initialValues}
                     formData={formData}
                     validations={validations}
                     formikRef={formikRef}
                     validationSchema={() => validationSchema()}
                     onSubmit={onSubmit}
                     textBtnSubmit={casillaContext.textBtnSubmit}
                     handleCancel={handleCancel}
                     container={"none"}
                  />
                  {/* <div className="grid-3 mb-4">
                     <div className="form-group">
                        <label className="form-label">Rol</label>
                        <select className="form-input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}>
                           <option value="1">SuperAdmin</option>
                           <option value="2">Admin</option>
                           <option value="3">Casilla</option>
                        </select>
                     </div>
                     <div className="form-group">
                        <label className="form-label">email</label>
                        <input
                           className="form-input"
                           placeholder="Ej: 10, 11, 12"
                           type="email"
                           value={form.email}
                           onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                     </div>
                     <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                           className="form-input"
                           placeholder="Ej: Lavín, Sacramento, Centro"
                           type="password"
                           value={form.password}
                           onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                     </div>
                  </div> */}
                  {/* <button className="btn-primary" style={{ maxWidth: 200 }} onClick={() => console.log("jiji")}>
                     {casillaContext.initialValues.id > 0 ? "✓ Actualizar" : "✓ Agregar Centro"}
                  </button> */}
               </div>
            </div>
         )}
      </>
   );
};

export default CasillaForm;
