import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useStore from "../../store/useStore";
import { validateCURP } from "../../utils/helpers";
import { images } from "../../constant";
import useAuthData from "../../hooks/useAuthData";

interface ParticipationsFormValues {
   tipo: "INE" | "Carta Identidad" | "";
   curp: string;
   casilla: string; // We'll set this automatically from userAuth.casilla
}

const getValidationSchema = (_values: any) =>
   Yup.object({
      tipo: Yup.string().required("Selecciona un tipo de documento"),
      curp: Yup.string()
         .required("El campo no puede estar vacío")
         .test("curp-valid", "Formato de CURP inválido", (value) => {
            if (!value) return false;
            return validateCURP(value);
         }),
      casilla: Yup.string().required("Selecciona una casilla")
   });

const Participations: React.FC = () => {
   const userAuth = useAuthData().persist.auth;
   const { addParticipacion, existsParticipacion } = useStore();
   const [loading, setLoading] = useState(false);

   const formik = useFormik<ParticipationsFormValues>({
      initialValues: { tipo: "", curp: "", casilla: userAuth?.casilla_place || "" }, // default casilla from userAuth
      validateOnChange: true,
      validationSchema: (values: any) => getValidationSchema(values),
      onSubmit: async (values) => {
         if (!values.tipo) {
            Swal.fire({
               icon: "warning",
               title: "Tipo de documento requerido",
               text: "Selecciona INE o Carta Identidad",
               confirmButtonColor: "#9B2242"
            });
            return;
         }
         if (!validateCURP(values.curp)) {
            Swal.fire({
               icon: "error",
               title: "CURP inválida",
               text: "La CURP ingresada no tiene el formato correcto.",
               confirmButtonColor: "#9B2242"
            });
            return;
         }
         setLoading(true);
         await new Promise((resolve) => setTimeout(resolve, 900));
         setLoading(false);

         const exists = existsParticipacion(values.curp);
         if (exists) {
            Swal.fire({
               icon: "warning",
               title: "Participación Duplicada",
               html: `<p>El registro "${values.curp.toUpperCase()}" ya fue registrado. Si crees que es un error, comunícate con el responsable de casilla.</p>`,
               confirmButtonColor: "#9B2242",
               confirmButtonText: "Entendido",
               borderRadius: "16px"
            });
         } else {
            addParticipacion({
               tipo: values.tipo as "INE" | "Carta Identidad",
               curp: values.curp.toUpperCase(),
               casilla: userAuth?.casilla_place || "No asignada"
            });
            Swal.fire({
               icon: "success",
               title: "¡Participación Registrada!",
               html: `<p>Su participación ha sido exitosamente registrada en <b>${userAuth?.casilla_place}</b>.<br><br>¡Gracias por ejercer su voto!</p>`,
               confirmButtonColor: "#9B2242",
               confirmButtonText: "Continuar",
               borderRadius: "16px"
            });
            formik.resetForm();
         }
      }
   });

   const handleTipoSelect = (tipo: "INE" | "Carta Identidad") => {
      formik.setFieldValue("tipo", tipo);
      formik.setFieldValue("curp", "");
      formik.setFieldTouched("curp", false);
   };

   return (
      <>
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Inicio <span>›</span> <span>Registrar Participación</span>
               </div>
               <h1 className="page-title font-nunito">Participations de Participación</h1>
               <p className="page-subtitle">Registre la participación ciudadana en su casilla electoral</p>
            </div>
            <div className="casilla-tag">
               🏛️ {userAuth?.casilla_id ? `${userAuth?.username} - ${userAuth?.casilla_place} (${userAuth?.casilla_type})` : "Sin casilla asignada"}
            </div>
         </div>

         <div className="flex items-center justify-center mx-auto mb-6">
            <img src={images.logo} /* width="35%" */ alt="TuVozTransforma" className="object-cover w-5/12 md:w-3/12" />
         </div>

         <div className="grid-2">
            {/* Left column: form + instructions */}
            <div>
               <div className="card mb-6">
                  <div className="card-header">
                     <span className="card-title-text" style={{ color: "white" }}>
                        1. Tipo de Documento
                     </span>
                  </div>
                  <div className="card-body">
                     <div className="doc-selector">
                        <div className={`doc-option ${formik.values.tipo === "INE" ? "selected" : ""}`} onClick={() => handleTipoSelect("INE")}>
                           <div className="doc-check">✓</div>
                           <span className="doc-icon-wrap">🪪</span>
                           <div className="doc-label">INE</div>
                           <div className="doc-desc">Credencial para votar</div>
                        </div>
                        <div
                           className={`doc-option ${formik.values.tipo === "Carta Identidad" ? "selected" : ""}`}
                           onClick={() => handleTipoSelect("Carta Identidad")}
                        >
                           <div className="doc-check">✓</div>
                           <span className="doc-icon-wrap">📄</span>
                           <div className="doc-label">Carta Identidad</div>
                           <div className="doc-desc">Documento Oficial</div>
                        </div>
                     </div>

                     {!formik.values.tipo && (
                        <div className="empty-state" style={{ padding: "20px 0" }}>
                           <div className="empty-icon" style={{ fontSize: 32 }}>
                              ☝️
                           </div>
                           <div className="empty-title">Seleccione el tipo de documento que presentaste</div>
                           <div className="empty-desc">Elija INE o Carta Identidad para continuar</div>
                        </div>
                     )}

                     {formik.values.tipo && (
                        <div style={{ animation: "slideIn 0.3s ease" }}>
                           <div className="form-group">
                              <label className="form-label">
                                 🔑 CURP
                                 <span> *</span>
                              </label>
                              <input
                                 className={`form-input ${formik.touched.curp && formik.errors.curp ? "error" : ""}`}
                                 type="text"
                                 disabled={loading}
                                 placeholder="Ej: XXXX123456XXXXXXXX"
                                 value={formik.values.curp}
                                 onChange={(e) => {
                                    const val = e.target.value;
                                    formik.setFieldValue("curp", val);
                                    if (val && !validateCURP(val)) {
                                       formik.setFieldError("curp", "Formato de CURP inválido");
                                    } else {
                                       formik.setFieldError("curp", undefined);
                                    }
                                 }}
                                 onKeyDown={(e) => e.key === "Enter" && formik.handleSubmit()}
                                 style={{ textTransform: "uppercase" }}
                              />
                              {formik.touched.curp && formik.errors.curp && <div className="form-error">⚠ {formik.errors.curp}</div>}
                           </div>
                           <button className="btn-primary" onClick={() => formik.handleSubmit()} disabled={loading}>
                              {loading ? (
                                 <>
                                    <span className="loading loading-spinner text-gris-claro" /> Verificando...
                                 </>
                              ) : (
                                 <>✓ Registrar Participación</>
                              )}
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Instrucciones */}
               {/* <div className="card">
                  <div className="card-header">
                     <span className="card-title-text" style={{ color: "white" }}>
                        📋 Instrucciones
                     </span>
                  </div>
                  <div className="card-body">
                     {[
                        ["1", "Seleccione el tipo de documento que presenta el ciudadano."],
                        ["2", "Ingrese la CURP."],
                        ["3", "Verifique la información antes de registrar."],
                        ["4", "Confirme el registro con el botón correspondiente."]
                     ].map(([n, txt]) => (
                        <div key={n} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                           <div
                              style={{
                                 width: 24,
                                 height: 24,
                                 borderRadius: "50%",
                                 background: "var(--guinda)",
                                 color: "#fff",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 fontSize: 11,
                                 fontWeight: 700,
                                 flexShrink: 0
                              }}
                           >
                              {n}
                           </div>
                           <p style={{ fontSize: 13, color: "var(--gris)", lineHeight: 1.5 }}>{txt}</p>
                        </div>
                     ))}
                  </div>
               </div> */}
            </div>

            {/* Right column: preview */}
            <div>
               <div className="card-title-text" style={{ marginBottom: 12, color: "var(--gris)", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
                  2. Referencia del documento
               </div>
               {!formik.values.tipo && (
                  <div className="card" style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <div className="empty-state">
                        <div className="empty-icon">🪪</div>
                        <div className="empty-title">Vista previa</div>
                        <div className="empty-desc">Seleccione un documento para ver la guía visual</div>
                     </div>
                  </div>
               )}
               {formik.values.tipo === "INE" && (
                  <div className="doc-preview">
                     <img src={images.ine} alt="ine ilustrada" className="rounded-4xl object-contain max-h-96" />
                     {/* <div className="ine-card">
                        <div className="ine-header">
                           <div className="ine-eagle">♥️</div>
                           <div>
                              <div className="ine-title">
                                 INSTITUTO NACIONAL ELECTORAL
                                 <br />
                                 CREDENCIAL PARA VOTAR
                              </div>
                           </div>
                        </div>
                        <div className="ine-stripe" />
                        <div className="ine-body">
                           <div className="ine-photo">👤</div>
                           <div>
                              <div className="ine-field">
                                 <div className="ine-field-label">Nombre</div>
                                 <div className="ine-field-val">APELLIDO APELLIDO NOMBRE</div>
                              </div>
                              <div className="ine-field">
                                 <div className="ine-field-label">Domicilio</div>
                                 <div className="ine-field-val">CALLE NÚM COLONIA</div>
                              </div>
                              <div className="ine-field">
                                 <div className="ine-field-label">Municipio / Entidad</div>
                                 <div className="ine-field-val">CIUDAD</div>
                              </div>
                           </div>
                        </div>
                        <div className="ine-highlight">
                           <div className="ine-highlight-label">📍 CURP a capturar</div>
                           <div className="ine-highlight-val">{formik.values.curp || "XXXX000000XXXXXXXX"}</div>
                        </div>
                     </div> */}
                     <p style={{ textAlign: "center", fontSize: 12, color: "var(--gris)", marginTop: 12 }}>
                        La CURP se encuentra en la parte inferior de la credencial
                     </p>
                  </div>
               )}
               {formik.values.tipo === "Carta Identidad" && (
                  <div className="doc-preview">
                     {/* <div className="doc-card">
                        <div className="doc-card-header">
                           <div className="doc-seal">🛡️</div>
                           <div>
                              <div className="doc-institution">
                                 GOBIERNO DE MÉXICO
                                 <br />
                                 DOCUMENTO OFICIAL
                              </div>
                           </div>
                        </div>
                        <div className="doc-field">
                           <div className="doc-field-label">Tipo de documento</div>
                           <div className="doc-field-val">Pasaporte / CURP / Acta de Nacimiento</div>
                        </div>
                        <div className="doc-field">
                           <div className="doc-field-label">Folio / Número</div>
                           <div className="doc-field-val">XXXXXXXXXX</div>
                        </div>
                        <div className="doc-highlight">
                           <div className="doc-highlight-label">✍️ CURP a capturar</div>
                           <div className="doc-highlight-val">{formik.values.curp || "NOMBRE APELLIDO APELLIDO"}</div>
                        </div>
                     </div> */}
                     <img src={images.cartaIdentidad} alt="ine ilustrada" className="rounded-xl object-contain max-h-96" />
                     <p style={{ textAlign: "center", fontSize: 12, color: "var(--gris)", marginTop: 12 }}>Capture la CURP tal como aparece en el documento oficial</p>
                  </div>
               )}
            </div>
         </div>
      </>
   );
};

export default Participations;
