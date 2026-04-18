import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
// import useStore, { type User } from "../store/useStore";
import { env, images } from "../constant";
import useAuthData from "../hooks/useAuthData";

interface LoginFormValues {
   username: string;
   password: string;
}

const validationSchema = Yup.object({
   username: Yup.string().required("Usuario requerido"),
   password: Yup.string().required("Contraseña requerida")
});

// const demoUser: User = {
//    nombre: "Administrador Electoral",
//    cargo: "Coordinador de Casillas",
//    iniciales: "AE",
//    email: "admin@gomezpalacio.gob.mx",
//    estado: "Ciudad de México",
//    municipio: "Cuauhtémoc",
//    casilla: "Casilla 01 - Esc. Primaria Benito Juárez",
//    seccion: "1234"
// };
// then login(demoUser);

const Login: React.FC = () => {
   const navigate = useNavigate();
   const authContext = useAuthData();
   // const login = useStore((state) => state.login);
   const [loading, setLoading] = useState(false);

   const formik = useFormik<LoginFormValues>({
      initialValues: authContext.initialValues,
      validationSchema,
      onSubmit: async (values) => {
         // await authContext.login(values.username, values.password);
         await authContext.login(values.username, values.password);
         navigate("/registro");
         // await authContext.request({ method: "POST", url: "login", data: { username: values.username, password: values.password }, getData: false }).then((res) => {
         //    console.log("🚀 ~ Login ~ res:", res);
         // });

         // setLoading(true);
         // await new Promise((resolve) => setTimeout(resolve, 800));
         // setLoading(false);
         // if (values.username === "admin" && values.password === "1234") {
         // const res = await login(values.username, values.password);
         // if (!res) {
         //    authContext.loading;
         //    // setFormSubmitted(false);
         //    return;
         // }

         // if (res.errors) {
         //    authContext.loading;
         //    // setFormSubmitted(false);
         //    Object.values(res.errors).forEach((errors) => {
         //       errors.map((error) => Toast.Warning(error));
         //    });
         //    return;
         // } else if (res.status_code !== 200) {
         //    authContext.loading;
         //    // setFormSubmitted(false);
         //    return Toast.Customizable(res.alert_text, res.alert_icon);
         // }

         // if (res.alert_text) Toast.Success(res.alert_text);

         // } else {
         // Swal.fire({
         //    icon: "error",
         //    title: "Credenciales incorrectas",
         //    text: "Usuario: admin / Contraseña: 1234",
         //    confirmButtonColor: "#9B2242",
         //    borderRadius: "16px"
         // });
         // }
      }
   });

   return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ padding: "24px" }}>
         <div className=" w-full max-w-md p-8 md:p-10  z-10 animate-fade-up" style={{ animation: "pageIn 0.5 ease" }}>
            <div className="text-center mb-8" style={{ marginBottom: "2rem" }}>
               <div className="flex items-center justify-center mx-auto mb-4">
                  <img src={images.logo} width="100%" alt="TuVozTransforma" />
               </div>
               {/* <h1 className="font-playfair text-2xl font-bold text-guinda-dark">Sistema Electoral</h1> */}
               <p className="text-sm text-gris mt-1">Votaciones · Gómez Palacio 2026</p>
            </div>
            <form onSubmit={formik.handleSubmit} className="card">
               <div className="card-header bg-guinda-primary!">
                  <p className="card-header-title" style={{ color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                     🔐 Acceso Funcionarios Electorales
                  </p>
               </div>
               <div className="card-body">
                  <div className="form-group">
                     <label htmlFor="username" className="form-label">
                        Usuario
                     </label>
                     <input
                        id="username"
                        type="text"
                        placeholder="Ingrese su usuario"
                        disabled={authContext.loading}
                        className={`form-input transition ${formik.touched.username && formik.errors.username ? "border-red-500" : "border-gris-claro"}`}
                        {...formik.getFieldProps("username")}
                     />
                     {formik.touched.username && formik.errors.username && <div className="form-error text-xs mt-1">⚠ {formik.errors.username}</div>}
                  </div>
                  <div className="form-group">
                     <label htmlFor="password" className="form-label">
                        Contraseña
                     </label>
                     <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        disabled={authContext.loading}
                        className={`form-input transition ${formik.touched.password && formik.errors.password ? "border-red-500" : "border-gris-claro"}`}
                        {...formik.getFieldProps("password")}
                     />
                     {formik.touched.password && formik.errors.password && <div className="form-error text-xs mt-1">⚠ {formik.errors.password}</div>}
                  </div>
                  <button type="submit" disabled={authContext.loading} className="btn-primary">
                     {authContext.loading ? (
                        <>
                           <span className="loading loading-spinner text-gris-claro" /> Verificando...
                        </>
                     ) : (
                        <>Iniciar Sesión</>
                     )}
                  </button>
                  {/* <div className="text-center text-xs text-gris-claro mt-4">Credenciales Demo: admin / 1234</div> */}
               </div>
            </form>
            <div className="text-center text-xs text-gris mt-2!">
               Sistema de Votaciones v {env.VERSION}
               <br />© 2026 Gómez Palacio
            </div>
         </div>
      </div>
   );
};

export default Login;
