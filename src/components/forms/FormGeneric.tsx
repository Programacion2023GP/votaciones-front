import React from "react";
import DividerComponent from "./DividerComponent";
import FormikForm, { type FormikFormProps } from "./FormikForm";
import * as Yup from "yup";

// =================== INTERFACES =======================

/**
 * Configuración de un campo de formulario.
 */
export interface FieldConfig<T> {
   name: keyof T; // Nombre del campo (clave en initialValues)
   value: any; // Valor inicial
   input: React.ReactNode; // Componente de entrada (Input, Select, etc.)
   validations: Yup.AnySchema | null | false; // Validación de Yup para este campo (opcional) | false puede venir de condiciones
   dividerBefore: {
      // Configuración de un divisor antes del campo
      show: boolean;
      title: string;
      orientation: "horizontal" | "vertical";
      className: any; //React.HTMLAttributes<HTMLDivElement>; // Se puede tipar mejor si se usa, pero originalmente era sx de MUI; ahora se puede omitir o usar className
   };
   validationPage: any[]; // Propiedad original, se mantiene pero no se usa explícitamente
}

/**
 * Props del componente FormGeneric.
 */
export interface FormGenericProps<T> {
   initialValuesContext: object;
   formData: FieldConfig<T>[]; // Arreglo de configuración de campos
   validations: Record<string, Yup.AnySchema> | null; // Objeto de validaciones (se llena automáticamente si no hay validationPage)
   formikRef?: any; // Referencia para Formik
   validationSchema: Yup.ObjectSchema<any> | (() => Yup.ObjectSchema<any>); // Función que retorna el esquema Yup
   onSubmit: FormikFormProps["onSubmit"]; // Función de envío
   textBtnSubmit: string; // Texto del botón de enviar
   handleCancel?: FormikFormProps["handleCancel"]; // Función de cancelación
   container?: "drawer" | "modal" | "none"; // Tipo de contenedor para ajustar maxHeight
}

/**
 * FormGeneric - Genera un formulario completo a partir de una configuración.
 * Permite agregar divisores y campos dinámicamente.
 */
// <T extends object>({ name, value, label, onChange }: InputProps<T>) => {
const FormGeneric = <T extends object>({
   initialValuesContext,
   formData,
   validations,
   formikRef,
   validationSchema,
   onSubmit,
   textBtnSubmit,
   handleCancel,
   container = "none"
}: FormGenericProps<T>) => {
   const initialValues: Record<string, any> = {};
   const inputsForms: React.ReactNode[] = [];

   formData.forEach((field) => {
      // Agregar divisor si está configurado
      if (field.dividerBefore?.show) {
         inputsForms.push(
            <DividerComponent
               key={`divider-${String(field.name)}`}
               title={field.dividerBefore.title}
               orientation={field.dividerBefore.orientation || "horizontal"}
               className={field.dividerBefore?.className} // Si se usaba sx, se puede pasar className; de lo contrario se omite
            />
         );
      }

      // Agregar el campo de entrada
      inputsForms.push(<React.Fragment key={`field-${String(field?.name)}`}>{field.input}</React.Fragment>);

      // Inicializar valor inicial
      initialValues[String(field?.name)] = field.value;

      // Si no hay validationPage (es decir, es el primer campo y la lista está vacía), llenar validations
      if (formData[0]?.validationPage?.length === 0 && field.validations) {
         if (validations) {
            validations[String(field?.name)] = field.validations;
         }
      }
   });

   // Determinar maxHeight según el contenedor
   let maxHeight = "auto";
   if (container === "drawer") maxHeight = "73vh";
   else if (container === "modal") maxHeight = "65vh";

   return (
      <FormikForm
         formikRef={formikRef}
         initialValues={initialValuesContext}
         validationSchema={validationSchema}
         onSubmit={onSubmit}
         alignContent="center"
         textBtnSubmit={textBtnSubmit}
         showCancelButton={true}
         handleCancel={handleCancel}
         showActionButtons={true}
         col={12}
         spacing={2}
         maxHeight={maxHeight}
         inContainer={["drawer", "modal"].includes(container)}
      >
         {inputsForms}
      </FormikForm>
   );
};

export default FormGeneric;
