import { type FormikValues, useFormikContext } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, Radio, RadioGroup, SxProps } from "@mui/material";
import type { Theme } from "@emotion/react";
// import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";

//#region INPUT
interface FormValues {
   [idName: string]: string; // Cambia esto según los campos de tu formulario
}
interface RadioProps {
   xsOffset?: number | null; // Offset en pantallas extra pequeñas
   col: number; // Número de columnas que ocupará el input
   sizeCols?: { xs: number; sm: number; md: number }; // Ancho máxima del input
   idName: string; // Identificador único del input
   label: string; // Texto del label
   options: [{ value: any; label: string }]; // Array de opciones a mostrar
   defaultChecked?: number; // Valor por defecto que tendra seleccionada
   helperText?: string; // Texto de ayuda que aparece debajo del input
   horizontal?: boolean; // Orientación de las opciones
   // alignItems?: "start" | "center" | "end"; // Alineación de las opciones
   // mrOptions?: number;
   size?: "small" | "medium"; // Tamaño del input
   className?: React.HTMLAttributes<HTMLDivElement> | string; // Clases CSS adicionales para el input
   sx: SxProps<Theme> | undefined;
   color?: "primary" | "secondary" | "success" | "error" | "warning" | "info"; // Color del input y label
   onChangeExtra?: (value: any) => void; // Función extra para manejar el cambio de valor | opcion2: (e: React.ChangeEvent<HTMLRadioElement>) => void;
   hidden?: boolean; // Indica si el input está oculto
   disabled?: boolean; // Desactiva el input
   mb?: number; // Margen inferior del input
   focus?: boolean; // Establece si el input debe enfocarse automáticamente
   required?: boolean; // Establece si el valor de intput es oblogatorio
}

/**
 * Componente de radio personalizado con estilos y validación basada en Formik.
 *
 * Este componente renderiza un campo de entrada tipo radio(`<input>`) con un label asociado.
 * Soporta múltiples estilos, incluyendo un label flotante y estilos con label dentro del input.
 *
 * @component
 * @example
 * <Radio
 *   col={6}
 *   idName="nombre"
 *   label="Nombre"
 *   options=[]
 *   defaultChecked
 *   helperText="Tu nombre completo"
 *   horizontal="true"
//  *   alignItems="center"
 *   size="medium"
 *   color="primary"
 *   required
 * />
 *
 * @param {Object} props - Propiedades del componente.
 * @param {number | null} [props.xsOffset=null] - Offset en pantallas extra pequeñas.
 * @param {number} props.col - Número de columnas que ocupará el input.
 * @param {Object} [props.sizeCols={ xs: 12, sm: 9, md: col }] - Ancho máximo del input en diferentes tamaños de pantalla.
 * @param {number} props.sizeCols.xs - Ancho en pantallas extra pequeñas.
 * @param {number} props.sizeCols.sm - Ancho en pantallas pequeñas.
 * @param {number} props.sizeCols.md - Ancho en pantallas medianas.
 * @param {string} props.idName - Identificador único del input.
 * @param {string} props.label - Texto del label del input.
 * @param {[{value:any, label:string}]} props.options - Array de opciones.
 * @param {string} [props.helperText] - Texto de ayuda que aparece debajo del input.
 * @param { true | false} [props.horizontal=true] - Orientación de las opciones.
//  * @param {"start" | "center" | "end"} [props.alignItems="center"] - Alineación de las opciones.
//  * @param {number} [props.mrOptions=2] - Separar las opciones.
 * @param {"small"|"medium"} [props.size="medium"] - Tamaño del input.
 * @param {string} [props.className] - Clases CSS adicionales para el input.
 * @param {"primary" | "secondary" | "success" | "error" | "warning" | "info"} [props.color] - Color del input y del label.
 * @param {(value: string) => void} [props.onChangeExtra] - Función adicional para manejar el cambio de valor del input.
 * @param {boolean} [props.hidden=false] - Indica si el input está oculto.
 * @param {boolean} [props.disabled] - Desactiva el input.
 * @param {number} [props.mb=2] - Margen inferior del input.
 * @param {boolean} [props.focus=false] - Establece si el input debe enfocarse automáticamente.
 * @param {boolean} [props.required] - Establece si el valor del input es obligatorio.
 * @returns {React.JSX.Element} El componente Radio.
 */

const RadioComponent: React.FC<RadioProps> = ({
   xsOffset = null,
   col,
   sizeCols = { xs: 12, sm: 12, md: col }, // 97% Altura máxima del formulario
   idName,
   label,
   options = [],
   defaultChecked,
   helperText,
   horizontal,
   // alignItems = "center",
   // mrOptions = 0,
   hidden = false,
   disabled,
   color,
   mb = 2,
   size = "medium",
   className = "",
   sx,
   onChangeExtra = null,
   focus = false,
   required
}): React.JSX.Element => {
   const formik = useFormikContext<FormikValues>();
   const inputRef = useRef<HTMLInputElement>(null);
   const { values } = formik;
   const error = formik.touched[idName] && formik.errors[idName] ? formik.errors[idName].toString() : null;
   const isError = Boolean(error);
   const [loading, setLoading] = useState(false);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // console.log("🚀 ~ handleChange ~ value:", value);
      formik.setFieldValue(idName, value);
      if (onChangeExtra) onChangeExtra({ idName, value });
   };

   useEffect(() => {
      setTimeout(() => {
         if (focus && inputRef.current) {
            inputRef.current.focus();
         }
      }, 500);
   }, [focus]);

   useEffect(() => {
      if (Array.isArray(options) && options.length > 0) {
         setLoading(false);
      }
      if (Array.isArray(options) && options.length == 0) {
         setLoading(true);
      }
      if (!Array.isArray(options)) {
         setLoading(true);
         options = [];
      }
   }, [label, idName, values[idName], options]);

   // const AlignItemsClasses = alignItems === "start" ? "justify-start" : alignItems === "end" ? "justify-end" : "justify-around";

   return (
      <Grid size={sizeCols} offset={{ xs: xsOffset }} hidden={hidden} className={`p-1 mb-[${mb}]`} sx={{ display: hidden ? "none" : "block" }}>
         <FormControl error={isError} color={color} size={size} sx={sx} disabled={disabled} required={required}>
            <FormLabel id="radio-buttons-group-label">{label}</FormLabel>
            <RadioGroup
               ref={inputRef}
               row={horizontal}
               name={idName}
               value={values[idName]} // Usar el valor del formulario
               onChange={(e) => {
                  formik.handleChange(e);
                  handleChange(e);
               }} // Usar la función de cambio de Formik
               onBlur={formik.handleBlur} // Usar la función de desenfoque de Formik
               color={color}
               aria-labelledby="radio-buttons-group-label"
            >
               {options.map((item: { value: any; label: string }, i: number) => (
                  <FormControlLabel
                     key={`key-option-${i}`}
                     value={item.value}
                     control={<Radio /* checked={defaultChecked == values[idName] ? true : false}  */ />}
                     label={item.label}
                     color={color}
                     sx={sx}
                  />
               ))}
            </RadioGroup>
            <FormHelperText> {isError ? error : helperText}</FormHelperText>
         </FormControl>
         {/* <label className={`form-control w-full relative mb-4 `}>
            <div className={`label py-0 pb-0.5`}>
               <span className={`label-text font-bold text-${color} ${isError && "text-error"}`}>{label}</span>
               <span className={`label-text-alt -mb-3 ${isError ? "text-error" : "text-gray-400"}`}>{required ? "Requerido" : "Opcional"}</span>
            </div>
            <div className={`flex rounded-lg border-2 border-base-300 ${!horizontal && "flex-col "} ${AlignItemsClasses}`}>
               {options.map((item: any, i: number) => (
                  // // <div key={`key-div-option-${i}`} className={`form-control ${mrOptions ? `mr-${mrOptions}` : ""}`}>
                     <label className="cursor-pointer label">
                        <span className={`label-text ${horizontal && "mr-2"}`}>{item.label}</span>
                        <input
                           ref={inputRef}
                           // id={idName}
                           name={idName}
                           type="radio"
                           value={item.value || ""}
                           onChange={(e) => {
                              formik.handleChange(e);
                              if (onChangeExtra) handleChange(e);
                           }}
                           // className="radio checked:bg-red-500"
                           className={`radio radio-${size} radio-primary ${isError && "radio-error"} ${className}`}
                           onBlur={(e) => {
                              formik.handleBlur(e);
                           }}
                           disabled={disabled}
                           formNoValidate={false}
                           checked={defaultChecked ? (defaultChecked === item.value ? true : false) : values[idName] === item.value ? true : false}
                        />
                     </label>
                  </div>
               ))}
            </div>
            <div className={`label`}>
               <span className={`label-text-alt ${!isError && !helperText && "text-transparent"} ${isError && "text-error"}`}>
                  {isError ? error : helperText ? helperText : "."}
               </span>
            </div>
         </label> */}
      </Grid>
   );
};
export default RadioComponent;
//#endregion INPUT
