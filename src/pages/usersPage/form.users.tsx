import { useEffect, useRef } from "react";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import * as Yup from "yup";
import useRolesData from "../../hooks/useRolesData";
import useUsersData from "../../hooks/useUsersData";
import { Input, Select2 } from "../../components/forms";
import type { Options } from "../../components/forms/Select2";
import useCasillasData from "../../hooks/useCasillasData";
import useAuthData from "../../hooks/useAuthData";
import type { User } from "../../domains/models/user.model";

const UserForm = ({}) => {
   const authContext = useAuthData();

   const userContext = useUsersData();
   const roleContext = useRolesData();
   const casillaContext = useCasillasData();

   useEffect(() => {
      (async () => {
         await roleContext.getSelectIndex();
         await casillaContext.getSelectIndex();
      })();
   }, []);

   const formikRef: React.RefObject<null> = useRef(null);
   const formData: FieldConfig<User>[] = [
      {
         name: "id",
         value: null,
         input: <Input key={`key-input-id`} col={1} idName={"id"} label={"ID"} required hidden />,
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "casilla_id",
         value: 0,
         input: (
            <Select2
               key={`key-input-casilla_id`}
               col={12}
               idName="casilla_id"
               label="Casilla Vínculada"
               refreshSelect={async () => await casillaContext.fetchData()}
               // onChangeExtra={handleChangeEmployee}
               options={(casillaContext.itemsSelect as unknown as Options) || []}
               addRegister={authContext.persist?.auth?.permissions?.create ? () => casillaContext.setOpen() : null}
            />
         ),
         validations: Yup.number().min(0, "Esta opción no es valida").notRequired(),
         validationPage: [],
         dividerBefore: { show: true, title: "EMPLEADO", orientation: "horizontal", className: "" }
      },
      {
         name: "username",
         value: "",
         input: (
            <Input
               key={`key-input-username`}
               col={4}
               idName="username"
               label="Nombre de usuario"
               placeholder="miUsuario"
               type="text"
               textStyleCase={null}
               helperText=""
               required
            />
         ),
         validations: Yup.string().trim().required("Nombre de usuario requerido"),
         validationPage: [],
         dividerBefore: { show: true, title: "DATOS DE USUARIO", orientation: "horizontal", className: "" }
      },
      {
         name: "email",
         value: "",
         input: (
            <Input
               key={`key-input-email`}
               col={4}
               idName="email"
               label="Correo"
               placeholder="micorreo@ejemplo.com"
               type="text"
               textStyleCase={false}
               helperText=""
               required
            />
         ),
         validations: Yup.string().trim().email("Formato invalido").required("correo requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      ,
      {
         name: "role_id",
         value: 0,
         input: (
            <Select2
               key={`key-input-role_id`}
               col={4}
               idName="role_id"
               label="Rol"
               refreshSelect={async () => await roleContext.fetchData}
               options={(roleContext.itemsSelect as unknown as Options) || []}
               addRegister={authContext.persist?.auth?.permissions?.create ? () => roleContext.setOpen() : null}
               required
            />
         ),
         validations: Yup.number().min(1, "Esta opción no es valida").required("Rol requerido"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "password",
         value: "123456",
         input: (
            <Input
               key={`key-input-password`}
               col={6}
               idName="password"
               label="Contraseña"
               placeholder="******"
               type="password"
               textStyleCase={null}
               helperText="Mínimo 6 caracteres"
               disabled={userContext.initialValues.id > 0 ? !userContext.initialValues.changePassword : false}
               setChangePassword={() => userContext.handleChangeItem({ ...userContext.initialValues, changePassword: !userContext.initialValues.changePassword })}
               required
            />
         ),
         validations:
            userContext.initialValues.id > 0
               ? userContext.initialValues.changePassword &&
                 Yup.string().trim().min(6, "Tu contraseña debe tener mínimo 6 caracteres").required("La contraseña es requerida")
               : Yup.string().trim().min(6, "Tu contraseña debe tener mínimo 6 caracteres").required("La contraseña es requerida"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "changePassword",
         value: userContext.initialValues.changePassword,
         input: <Input key={`key-input-changePassword`} col={12} idName={"changePassword"} label={"Cambiar contraseña"} type={"checkbox"} required hidden />,
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      }, // solo para la logica en el backend
      {
         name: "confirmPassword",
         value: "123456",
         input: (
            <Input
               key={`key-input-confirmPassword`}
               col={6}
               idName="confirmPassword"
               label="Confirmar Contraseña"
               placeholder="******"
               type="password"
               textStyleCase={null}
               helperText="Vuelve a escribir la contraseña"
               disabled={userContext.initialValues.id > 0 ? !userContext.initialValues.changePassword : false}
               required
            />
         ),
         validations:
            userContext.initialValues.id > 0
               ? userContext.initialValues.changePassword &&
                 Yup.string()
                    .trim()
                    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
                    .required("La confirmación de contraseña es requerida")
               : // :    Yup.string()
                 //      .trim()
                 //      .test("confirmPassword", "Las contraseñas no coinciden", (value) => value.match(formikRef.current.values.password))
                 //      .required("El nombre de usuario es requerido")
                 Yup.string()
                    .trim()
                    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
                    .required("La confirmación de contraseña es requerida"),
         //   Yup.string()
         //      .trim()
         //      .test("confirmPassword", "Las contraseñas no coinciden", (value) => value.match(formikRef.current.values.password))
         //      .required("El nombre de usuario es requerido"),
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
   const onSubmit = async (values: User | User[], {}: any) => {
      console.log("🚀 ~ onSubmit ~ validationSchema:", validationSchema());
      // values.evidences = imgEvidences.length == 0 ? "" : imgEvidences[0].file;
      console.log("🚀 ~ onSubmit ~ values:", values);
      const res = await userContext.postItem(values);
      console.log("🚀 ~ onSubmit ~ res:", res);
      // if (!res) return setIsLoading(false);
      // if (res.errors) {
      //    setIsLoading(false);
      //    Object.values(res.errors).forEach((errors) => {
      //       errors.map((error) => Toast.Warning(error));
      //    });
      //    return;
      // } else if (res.status_code !== 200) {
      //    setIsLoading(false);
      //    return Toast.Customizable(res.alert_text, res.alert_icon);
      // }
      // await resetForm();
      // formikRef.current.resetForm();
      // formikRef.current.setValues(formikRef.current.initialValues);
      // if (res.alert_text) Toast.Success(res.alert_text);
      // setSubmitting(false);
      // setIsLoading(false);
      // if (refreshSelect) await refreshSelect();
      // if (!checkAdd) setOpenDialog(false);
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

   // const handleChangeCheckAdd = (checked) => {
   //    // console.log("🚀 ~ handleChangeCheckAdd ~ checked:", checked);
   //    // try {
   //    //    localStorage.setItem("checkAdd", checked);
   //    //    setCheckAdd(checked);
   //    // } catch (error) {
   //    //    console.log(error);
   //    //    Toast.Error(error);
   //    // }
   // };

   // function handleChangeEmployee(values) {
   //    // // console.log("🚀 ~ handleChangeEmployee ~ values:", values);
   //    // if (values.value.id <= 0) return formikRef.current.setFieldValue("username", "");
   //    // formikRef.current.setFieldValue("username", generateUsername(values.value.label));
   // }

   return (
      <>
         {userContext.open && (
            <div className="card mb-6" style={{ animation: "slideIn 0.3s ease" }}>
               <div className="card-header">
                  <span className="header-title">{userContext.initialValues.id > 0 ? "Editar Centro" : "Nuevo Centro de Votación"}</span>
               </div>
               <div className="card-body">
                  <FormGeneric
                     initialValuesContext={userContext.initialValues}
                     formData={formData}
                     validations={validations}
                     formikRef={formikRef}
                     validationSchema={() => validationSchema()}
                     onSubmit={onSubmit}
                     textBtnSubmit={userContext.textBtnSubmit}
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
                     {userContext.initialValues.id > 0 ? "✓ Actualizar" : "✓ Agregar Centro"}
                  </button> */}
               </div>
            </div>
         )}
      </>
   );
};

export default UserForm;
