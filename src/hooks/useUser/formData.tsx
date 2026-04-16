import { Input, Select2 } from "../../components/forms";
import * as Yup from "yup";
import useUsersData from "../useUsersData";
import useRolesData from "../useRolesData";

const userContext = useUsersData();
const roleContext = useRolesData();

const initialFormData = [
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
            // placeholder="C"
            // refreshSelect={refreshEmployees}
            // onChangeExtra={handleChangeEmployee}
            // options={allEmployees || []}
            // addRegister={auth.permissions.create ? () => setEmployeeFormDialog(true) : null}
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
            col={12}
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
            col={12}
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
   },
   {
      name: "role_id",
      value: 0,
      input: (
         <Select2
            key={`key-input-role_id`}
            col={12}
            idName="role_id"
            label="Rol"
            placeholder="Mi perfil"
            refreshSelect={roleContext.fetchData}
            options={(roleContext.itemsSelect as Options) || []}
            // addRegister={auth.permissions.create ? () => setRoleFormDialog(true) : null}
            required
         />
      ),
      validations: Yup.number().min(1, "Esta opción no es valida").required("Rol requerido"),
      validationPage: [],
      dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
   }
];
export default initialFormData;
