import { Formik, type FormikHelpers, type FormikValues } from "formik";
import * as Yup from "yup";
import React, { forwardRef, type ReactNode, useEffect } from "react";

//#region FORMIK COMPONENT
// =================== INTERFACES =======================
export interface FormikFormProps {
   initialValues: FormikValues;
   validationSchema: Yup.ObjectSchema<any> | (() => Yup.ObjectSchema<any>);
   onSubmit: (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>) => void;
   children: ReactNode;
   textBtnSubmit: string;
   formikRef?: any;
   handleCancel?: (resetForm: () => void) => void;
   showActionButtons?: boolean;
   showCancelButton?: boolean;
   activeStep?: number | null;
   setStepFailed?: ((step: number) => void) | null;
   alignContent?: "center" | "space-between" | "start" | "end" | "space-around";
   alignItems?: "center" | "start" | "end" | "flex-start" | "flex-end" | "baseline";
   maxHeight?: string;
   col?: number;
   sizeCols?: { xs: number; sm: number; md: number };
   spacing?: number;
   btnSize?: "xs" | "sm" | "md" | "lg";
   className?: React.HTMLAttributes<HTMLDivElement> | string;
   inContainer?: boolean;
}

// =================== COMPONENTE =======================
/**
 * FormikForm es un componente reutilizable basado en Formik, que permite crear formularios dinámicos y personalizables.
 *
 * @param {object} initialValues - Valores iniciales del formulario.
 * @param {object} validationSchema - Esquema de validación de Yup para el formulario.
 * @param {function} onSubmit - Función que se ejecuta al enviar el formulario.
 * @param {ReactNode} children - Contenido del formulario (campos e ítems de formulario).
 * @param {string} textBtnSubmit - Texto que aparecerá en el botón de enviar.
 * @param {object} formikRef - Referencia al formulario para acceder a sus métodos.
 * @param {function} handleCancel - Función que se ejecuta al cancelar el formulario.
 * @param {true | false} showActionButtons - Si se muestran los botones de acción (enviar y cancelar).
 * @param {true | false} showCancelButton - Si se muestra el botón de cancelar.
 * @param {number | null} activeStep - Paso activo en un formulario con múltiples pasos (opcional).
 * @param {function | null} setStepFailed - Función para establecer si un paso ha fallado (opcional).
 * @param {string} alignContent - Orientación vertical del contenedor del formulario.
 * @param {string} alignItems - Orientación horizontal del contenedor del formulario.
 * @param {string} maxHeight - Altura máxima del contenedor del formulario.
 * @param {number} col - Número de columnas base (se usa en sizeCols.md si no se provee).
 * @param {object} sizeCols - Columnas responsivas (xs, sm, md) usando Tailwind grid.
 * @param {number} spacing - Espaciado entre elementos (gap en Tailwind).
 * @param {string} btnSize - Tamaño del botón ('xs'|'sm'|'md'|'lg').
 * @param {string} className - Clases CSS adicionales.
 * @param {true | false} inContainer - Si el formulario está dentro de un contenedor para ajustar altura.
 *
 * @returns {JSX.Element} Formulario basado en Formik con gestión de pasos y botones de acción.
 */
const FormikForm = forwardRef<any, FormikFormProps>(
   (
      {
         initialValues = {},
         validationSchema = {},
         onSubmit,
         children,
         textBtnSubmit,
         formikRef,
         handleCancel,
         showActionButtons = true,
         showCancelButton = true,
         activeStep = null,
         setStepFailed = null,
         alignContent = "space-between",
         alignItems = "center",
         maxHeight = "100%",
         col = 12,
         sizeCols = { xs: 12, sm: 12, md: col },
         spacing = 2,
         btnSize = "lg",
         className = "",
         inContainer = true
      },
      ref
   ) => {
      // Convertir spacing (número) a gap de Tailwind: spacing*0.25 rem -> gap-{spacing/4}
      const gapClass = spacing ? `gap-${spacing / 4}` : "gap-2";

      // Mapeo de alignContent a clases Tailwind
      const alignContentClass =
         {
            center: "content-center",
            "space-between": "content-between",
            start: "content-start",
            end: "content-end",
            "space-around": "content-around"
         }[alignContent] || "content-between";

      // Mapeo de alignItems a clases Tailwind
      const alignItemsClass =
         {
            center: "items-center",
            start: "items-start",
            end: "items-end",
            "flex-start": "items-start",
            "flex-end": "items-end",
            baseline: "items-baseline"
         }[alignItems] || "items-center";

      // Tamaños de botón (DaisyUI)
      const btnSizeClass =
         {
            xs: "btn-xs",
            sm: "btn-sm",
            md: "btn-md",
            lg: "btn-lg"
         }[btnSize] || "btn-md";

      // Columnas responsivas: convertimos a clases de Tailwind grid (grid-cols-12)
      const gridColsClass = `grid-cols-${sizeCols.xs} sm:grid-cols-${sizeCols.sm} md:grid-cols-${sizeCols.md}`;

      // Efecto para marcar paso fallido cuando cambian los errores
      useEffect(() => {
         if (activeStep && setStepFailed) {
            const hasErrors = formikRef?.current?.errors && Object.keys(formikRef.current.errors).length > 0;
            if (hasErrors) setStepFailed(activeStep);
            else setStepFailed(-1);
         }
      }, [formikRef?.current?.errors, activeStep, setStepFailed]);

      const onBlur = () => {
         if (activeStep && setStepFailed) {
            if (formikRef?.current?.errors && Object.keys(formikRef.current.errors).length > 0) setStepFailed(activeStep);
            else setStepFailed(-1);
         }
      };

      const onChange = () => {
         if (activeStep && setStepFailed && !formikRef?.current?.isSubmitting) {
            const hasErrors = formikRef?.current?.errors && Object.keys(formikRef.current.errors).length > 0;
            if (hasErrors && formikRef.current.stepFailed !== activeStep) {
               setStepFailed(activeStep);
               formikRef.current.stepFailed = activeStep;
            } else if (!hasErrors && formikRef.current.stepFailed !== -1) {
               setStepFailed(-1);
               formikRef.current.stepFailed = -1;
            }
         }
      };

      return (
         <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} innerRef={formikRef == null ? ref : formikRef}>
            {({ handleSubmit, isSubmitting, resetForm, errors, values }) => {
               // console.log("🚀 ~ values:", values);
               // Efecto adicional para sincronizar errores con el paso
               useEffect(() => {
                  if (activeStep && setStepFailed) {
                     if (Object.keys(errors).length > 0) setStepFailed(activeStep);
                     else setStepFailed(-1);
                  }
               }, [errors, activeStep, setStepFailed]);

               const onReset = (resetFormFn: any) => {
                  resetFormFn();
                  formikRef?.current?.setValues(formikRef.current.initialValues);
                  if (handleCancel) handleCancel(resetFormFn);
               };

               return (
                  <form
                     noValidate
                     className={`
                ${inContainer ? "h-full" : ""}
                my-3
                w-full
                ${className}
                flex flex-col
              `}
                     onSubmit={handleSubmit}
                     onBlur={onBlur}
                     onChangeCapture={onChange}
                     style={{ alignContent: alignContentClass, maxHeight }}
                  >
                     {!showActionButtons ? (
                        <div
                           className={`
                    grid ${gridColsClass}
                    ${gapClass}
                    ${alignContentClass}
                    ${alignItemsClass}
                    p-1
                    w-full
                  `}
                           style={{ maxHeight, height: "100%" }}
                        >
                           {children}
                        </div>
                     ) : (
                        <>
                           <div
                              className={`
                      grid ${gridColsClass}
                      ${gapClass}
                      ${alignContentClass}
                      ${alignItemsClass}
                      p-1
                      w-full
                      overflow-auto
                    `}
                              style={{ maxHeight, height: "100%" }}
                           >
                              {children}
                           </div>
                           <div className={`grid ${gridColsClass} ${gapClass} p-1 mt-2 w-full`}>
                              <button type="submit" disabled={isSubmitting} className={`btn btn-primary w-full ${btnSizeClass}`}>
                                 {isSubmitting && <span className="loading loading-spinner loading-xs"></span>}
                                 {textBtnSubmit}
                              </button>
                              {showCancelButton && (
                                 <button type="reset" onClick={() => onReset(resetForm)} className="btn btn-outline btn-error w-full">
                                    CANCELAR
                                 </button>
                              )}
                           </div>
                        </>
                     )}
                  </form>
               );
            }}
         </Formik>
      );
   }
);

FormikForm.displayName = "FormikForm";

export default FormikForm;

//#endregion FORMIK COMPONENT
