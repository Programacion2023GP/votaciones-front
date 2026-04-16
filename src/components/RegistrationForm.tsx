// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import Swal from "sweetalert2";
// import useStore from "../store/useStore";
// import { DocumentPreview } from "./DocumentPreview";
// import icons from "./../constant/icons";

// type DocumentType = "ine" | "documento" | null;

// const ineValidationSchema = Yup.object({
//    value: Yup.string()
//       .required("La clave electoral es requerida")
//       .matches(/^[A-Z]{6}[0-9]{8}[A-Z]{1}[0-9]{3}$/, "Formato inválido. Ejemplo: ABCDEF12345678X123")
//       .length(18, "La clave electoral debe tener 18 caracteres")
// });

// const documentoValidationSchema = Yup.object({
//    value: Yup.string()
//       .required("El nombre completo es requerido")
//       .min(5, "El nombre debe tener al menos 5 caracteres")
//       .max(100, "El nombre no puede exceder 100 caracteres")
//       .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras y espacios")
// });

// export function RegistrationForm() {
//    const [selectedType, setSelectedType] = useState<DocumentType>(null);
//    const [isSubmitting, setIsSubmitting] = useState(false);
//    const { addRegistration, checkRegistrationExists } = useStore();

//    const handleTypeSelect = (type: DocumentType) => {
//       setSelectedType(type);
//    };

//    const getValidationSchema = () => {
//       return selectedType === "ine" ? ineValidationSchema : documentoValidationSchema;
//    };

//    const handleSubmit = async (values: { value: string }, { resetForm }: { resetForm: () => void }) => {
//       setIsSubmitting(true);

//       // Simulate API call delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Check if registration already exists
//       const existingRegistration = checkRegistrationExists(values.value);

//       if (existingRegistration) {
//          setIsSubmitting(false);
//          Swal.fire({
//             title: "Registro Existente",
//             html: `
//           <div class="text-left py-2">
//             <p class="mb-3">Su participación ya fue registrada previamente.</p>
//             <div class="bg-gray-50 p-4 rounded-lg space-y-2">
//               <p><span class="text-gray-500">Casilla:</span> <strong>${existingRegistration.casilla}</strong></p>
//               <p><span class="text-gray-500">Fecha:</span> <strong>${new Date(existingRegistration.timestamp).toLocaleDateString("es-MX", {
//                  year: "numeric",
//                  month: "long",
//                  day: "numeric"
//               })}</strong></p>
//             </div>
//           </div>
//         `,
//             icon: "warning",
//             confirmButtonColor: "#9B2242",
//             confirmButtonText: "Entendido"
//          });
//          return;
//       }

//       // Generate random casilla number
//       const casillaNumber = Math.floor(Math.random() * 9000) + 1000;
//       const casilla = `Casilla ${casillaNumber}`;

//       // Add registration
//       addRegistration({
//          type: selectedType!,
//          value: values.value,
//          casilla
//       });

//       setIsSubmitting(false);

//       Swal.fire({
//          title: "¡Registro Exitoso!",
//          html: `
//         <div class="text-left py-2">
//           <p class="mb-3">Su participación ha sido registrada correctamente.</p>
//           <div class="bg-green-50 p-4 rounded-lg space-y-2 border border-green-200">
//             <p><span class="text-gray-500">Casilla asignada:</span> <strong class="text-green-700">${casilla}</strong></p>
//             <p><span class="text-gray-500">Tipo de documento:</span> <strong>${selectedType === "ine" ? "INE" : "Documento Oficial"}</strong></p>
//           </div>
//           <p class="mt-4 text-sm text-gray-500">Guarde esta información para referencia futura.</p>
//         </div>
//       `,
//          icon: "success",
//          confirmButtonColor: "#9B2242",
//          confirmButtonText: "Gracias"
//       });

//       resetForm();
//       setSelectedType(null);
//    };

//    return (
//       <div className="space-y-8">
//          {/* Step 1: Document Type Selection */}
//          <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="glass-card rounded-2xl p-6 md:p-8 shadow-xl"
//          >
//             <div className="flex items-center gap-3 mb-6">
//                <div className="w-8 h-8 bg-guinda-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
//                <h2 className="text-xl md:text-2xl font-semibold text-negro" style={{ fontFamily: "Georgia, serif" }}>
//                   Seleccione su tipo de identificación
//                </h2>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4 md:gap-6">
//                {/* INE Option */}
//                <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => handleTypeSelect("ine")}
//                   className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
//                      selectedType === "ine" ? "border-guinda-primary bg-guinda-primary/5 shadow-lg" : "border-gris-claro hover:border-guinda-primary/50 hover:bg-white"
//                   }`}
//                >
//                   <div className="flex items-start gap-4">
//                      <div
//                         className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
//                            selectedType === "ine"
//                               ? "bg-guinda-primary text-white"
//                               : "bg-gris-claro/30 text-gris group-hover:bg-guinda-primary/10 group-hover:text-guinda-primary"
//                         }`}
//                      >
//                         <icons.Lu.LuCreditCard className="w-7 h-7" />
//                      </div>
//                      <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-negro mb-1">Credencial INE</h3>
//                         <p className="text-sm text-gris leading-relaxed">Registre su participación usando la clave de elector de su credencial para votar.</p>
//                      </div>
//                   </div>

//                   {selectedType === "ine" && (
//                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
//                         <icons.Lu.LuCircleCheck className="w-6 h-6 text-guinda-primary" />
//                      </motion.div>
//                   )}
//                </motion.button>

//                {/* Document Option */}
//                <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => handleTypeSelect("documento")}
//                   className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
//                      selectedType === "documento"
//                         ? "border-guinda-primary bg-guinda-primary/5 shadow-lg"
//                         : "border-gris-claro hover:border-guinda-primary/50 hover:bg-white"
//                   }`}
//                >
//                   <div className="flex items-start gap-4">
//                      <div
//                         className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
//                            selectedType === "documento"
//                               ? "bg-guinda-primary text-white"
//                               : "bg-gris-claro/30 text-gris group-hover:bg-guinda-primary/10 group-hover:text-guinda-primary"
//                         }`}
//                      >
//                         <icons.Lu.LuFileText className="w-7 h-7" />
//                      </div>
//                      <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-negro mb-1">Documento Oficial</h3>
//                         <p className="text-sm text-gris leading-relaxed">Registre su participación usando su nombre completo tal como aparece en su documento.</p>
//                      </div>
//                   </div>

//                   {selectedType === "documento" && (
//                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
//                         <icons.Lu.LuCircleCheck className="w-6 h-6 text-guinda-primary" />
//                      </motion.div>
//                   )}
//                </motion.button>
//             </div>
//          </motion.div>

//          {/* Step 2: Data Entry Form */}
//          <AnimatePresence>
//             {selectedType && (
//                <motion.div
//                   initial={{ opacity: 0, y: 20, height: 0 }}
//                   animate={{ opacity: 1, y: 0, height: "auto" }}
//                   exit={{ opacity: 0, y: -20, height: 0 }}
//                   transition={{ duration: 0.4 }}
//                   className="glass-card rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden"
//                >
//                   <div className="flex items-center gap-3 mb-6">
//                      <div className="w-8 h-8 bg-guinda-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
//                      <h2 className="text-xl md:text-2xl font-semibold text-negro" style={{ fontFamily: "Georgia, serif" }}>
//                         {selectedType === "ine" ? "Ingrese su clave electoral" : "Ingrese su nombre completo"}
//                      </h2>
//                   </div>

//                   <div className="grid lg:grid-cols-2 gap-8">
//                      {/* Document Preview */}
//                      <DocumentPreview type={selectedType} />

//                      {/* Form */}
//                      <div>
//                         <Formik initialValues={{ value: "" }} validationSchema={getValidationSchema()} onSubmit={handleSubmit} enableReinitialize>
//                            {({ errors, touched, isValid, dirty }) => (
//                               <Form className="space-y-6">
//                                  <div>
//                                     <label htmlFor="value" className="block text-sm font-medium text-negro mb-2">
//                                        {selectedType === "ine" ? "Clave Electoral" : "Nombre Completo"}
//                                        <span className="text-guinda-primary ml-1">*</span>
//                                     </label>

//                                     <Field
//                                        type="text"
//                                        id="value"
//                                        name="value"
//                                        placeholder={selectedType === "ine" ? "ABCDEF12345678X123" : "Ingrese su nombre completo"}
//                                        className={`input input-bordered w-full text-base bg-white border-2 transition-all duration-300 focus:border-guinda-primary focus:ring-2 focus:ring-guinda-primary/20 ${
//                                           errors.value && touched.value ? "border-red-400 bg-red-50" : "border-gris-claro"
//                                        }`}
//                                        style={{
//                                           textTransform: selectedType === "ine" ? "uppercase" : "none"
//                                        }}
//                                     />

//                                     <ErrorMessage name="value" component="p" className="mt-2 text-sm text-red-500 flex items-center gap-1" />

//                                     <p className="mt-2 text-xs text-gris">
//                                        {selectedType === "ine"
//                                           ? "La clave electoral se encuentra en la parte posterior de su INE (18 caracteres)"
//                                           : "Ingrese su nombre tal como aparece en su documento oficial"}
//                                     </p>
//                                  </div>

//                                  <motion.button
//                                     type="submit"
//                                     disabled={!isValid || !dirty || isSubmitting}
//                                     whileHover={{ scale: isValid && dirty && !isSubmitting ? 1.02 : 1 }}
//                                     whileTap={{ scale: isValid && dirty && !isSubmitting ? 0.98 : 1 }}
//                                     className={`btn btn-lg w-full gap-2 text-white border-none shadow-lg transition-all duration-300 ${
//                                        isValid && dirty && !isSubmitting
//                                           ? "bg-gradient-to-r from-guinda-primary to-guinda-secondary hover:shadow-xl"
//                                           : "bg-gris-claro cursor-not-allowed"
//                                     }`}
//                                  >
//                                     {isSubmitting ? (
//                                        <>
//                                           <span className="loading loading-spinner loading-sm"></span>
//                                           Procesando...
//                                        </>
//                                     ) : (
//                                        <>
//                                           Registrar Participación
//                                           <icons.Lu.LuArrowRight className="w-5 h-5" />
//                                        </>
//                                     )}
//                                  </motion.button>
//                               </Form>
//                            )}
//                         </Formik>

//                         {/* Info Box */}
//                         <motion.div
//                            initial={{ opacity: 0 }}
//                            animate={{ opacity: 1 }}
//                            transition={{ delay: 0.3 }}
//                            className="mt-6 p-4 bg-guinda-primary/5 rounded-xl border border-guinda-primary/20"
//                         >
//                            <p className="text-sm text-gris-cool">
//                               <strong className="text-guinda-primary">Importante:</strong> Verifique que sus datos sean correctos antes de enviar. Solo podrá registrar
//                               una participación por documento.
//                            </p>
//                         </motion.div>
//                      </div>
//                   </div>
//                </motion.div>
//             )}
//          </AnimatePresence>
//       </div>
//    );
// }
