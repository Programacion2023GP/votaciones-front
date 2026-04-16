import { FormikValues, useFormikContext } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgress, Grid, Tooltip } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

//#region INPUT
interface FormValues {
   [idName: string]: string; // Cambia esto según los campos de tu formulario
}
interface SwitchProps {
   xsOffset?: number | null; // Offset en pantallas extra pequeñas
   col: number; // Número de columnas que ocupará el input
   loading?: true | false; // Indica que la información se esta procesando
   sizeCols?: { xs: number; sm: number; md: number }; // Ancho máxima del input
   idName: string; // Identificador único del input
   label: string; // Texto del label
   labelPlacement?: "end" | "start" | "top" | "bottom" | undefined;
   defaultChecked?: true | false; // Define el valor inicial del componente
   textEnable?: string;
   textDisable?: string;
   helperText?: string; // Texto de ayuda que aparece debajo del input
   horizontal?: true | false; // Orientación de las opciones
   alignItems?: "start" | "center" | "end"; // Alineación de las opciones
   size?: "small" | "medium"; // Tamaño del input
   className?: string; // Clases CSS adicionales para el input
   color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "default"; // Color del input y label
   onChangeExtra?: (value: any) => void; // Función extra para manejar el cambio de valor | opcion2: (e: React.ChangeEvent<HTMLSwitchElement>) => void;
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
 * <Switch
 *   col={6}
 *   idName="nombre"
 *   label="Nombre"
 *   defaultChecked={true}
 *   helperText="Tu nombre completo"
 *   horizontal="true"
 *   alignItems="center"
 *   size="md"
 *   color="primary"
 *   required
 * />
 *
 * @param {Object} props - Propiedades del componente.
 * @param {number | null} [props.xsOffset=null] - Offset en pantallas extra pequeñas.
 * @param {true | false} [props.loading=false] - Indica que la información se esta procesando.
 * @param {number} props.col - Número de columnas que ocupará el input.
 * @param {Object} [props.sizeCols={ xs: 12, sm: 9, md: col }] - Ancho máximo del input en diferentes tamaños de pantalla.
 * @param {number} props.sizeCols.xs - Ancho en pantallas extra pequeñas.
 * @param {number} props.sizeCols.sm - Ancho en pantallas pequeñas.
 * @param {number} props.sizeCols.md - Ancho en pantallas medianas.
 * @param {string} props.idName - Identificador único del input.
 * @param {string} props.label - Texto del label del input.
 * @param {"end" | "start" | "top" | "bottom" | undefined} props.labelPlacement - Ubicación del label del input.
 * @param {true | false} props.defaultChecked - Define el valor inicial del componente
 * @param {string} [props.textEnable] - Texto del Tooltip al estar activo el switch.
 * @param {string} [props.textDisable] - Texto del Tooltip al estar inactivo el switch.
 * @param {string} [props.helperText] - Texto de ayuda que aparece debajo del input.
 * @param { true | false} [props.horizontal=true] - Orientación de las opciones.
 * @param {"start" | "center" | "end"} [props.alignItems="center"] - Alineación de las opciones.
 * @param {"xs" | "sm" | "md" | "lg"} [props.size="md"] - Tamaño del input.
 * @param {string} [props.className] - Clases CSS adicionales para el input.
 * @param {"primary" | "secondary" | "success" | "error" | "warning" | "info" | "disabled" | "accent"} [props.color] - Color del input y del label.
 * @param {(value: string) => void} [props.onChangeExtra] - Función adicional para manejar el cambio de valor del input.
 * @param {boolean} [props.hidden=false] - Indica si el input está oculto.
 * @param {boolean} [props.disabled] - Desactiva el input.
 * @param {number} [props.mb=2] - Margen inferior del input.
 * @param {boolean} [props.focus=false] - Establece si el input debe enfocarse automáticamente.
 * @param {boolean} [props.required] - Establece si el valor del input es obligatorio.
 * @returns {React.JSX.Element} El componente Switch.
 */

const SwitchSlide: React.FC<SwitchProps> = ({
   xsOffset = null,
   col,
   sizeCols = { xs: 12, sm: 12, md: col }, // 97% Altura máxima del formulario
   loading,
   idName,
   label,
   labelPlacement = "end",
   defaultChecked,
   textEnable = "Activo",
   textDisable = "Inactivo",
   helperText,
   horizontal = true,
   alignItems = "center",
   hidden = false,
   disabled,
   color,
   mb = 2,
   size = "md",
   className = "",
   onChangeExtra = null,
   focus = false,
   required,
   ...props
}): React.JSX.Element => {
   const formik = useFormikContext<FormikValues>();
   const inputRef = useRef<HTMLInputElement>(null);
   const { values } = formik;
   const error = formik.touched[idName] && formik.errors[idName] ? formik.errors[idName].toString() : null;
   const isError = Boolean(error);
   // const [loading, setLoading] = useState(false);
   const [isChecked, setIsChecked] = useState(false);

   useEffect(() => {
      setTimeout(() => {
         if (focus && inputRef.current) {
            inputRef.current.focus();
         }
      }, 500);
   }, [focus]);

   useEffect(() => {
      if (focus && inputRef.current) {
         // console.log("🚀 ~ useEffect ~ inputRef.current:", inputRef.current.querySelector("input"));
         const input = inputRef.current.querySelector("input");
         input?.focus();
      }
   }, [inputRef]);

   useEffect(() => {
      // console.log("formik.values[idName]", formik.values[idName]);
   }, [idName]);

   useEffect(() => {
      // console.log("🚀 ~ isError:", isError);
      // setIsChecked(defaultChecked);
   }, [isError]);

   const handleChange = (e: any) => {
      const checked = e.target.checked;
      // console.log("🚀 ~ handleChange ~ checked:", checked);
      setIsChecked(checked);
      formik.setFieldValue(idName, checked);
      if (onChangeExtra) onChangeExtra({ idName, checked });
   };

   return (
      <Grid size={sizeCols} offset={{ xs: xsOffset }} hidden={hidden} className={`p-1 mb-[${mb}]`}>
         <FormGroup>
            <FormControlLabel
               control={
                  <Tooltip title={values[idName] ? textEnable : textDisable} placement="top">
                     <Switch /* ref={inputRef} */ id={idName} name={idName} checked={Boolean(values[idName])} /* defaultChecked={Boolean(defaultChecked)}  */color={color} />
                  </Tooltip>
               }
               label={label}
               labelPlacement={labelPlacement}
               className={className}
               checked={Boolean(values[idName])}
               // defaultChecked={Boolean(defaultChecked)}
               onChange={(e) => {
                  formik.handleChange(e);
                  handleChange(e);
               }}
               onBlur={(e) => {
                  formik.handleBlur(e);
               }}
               disabled={disabled}
               required={required}
               {...props}
            />
         </FormGroup>
         {/* {loading && <CircularProgress sx={{ position: "relative", top: "-50%", left: "20%" }} />} */}

         {/* <SwitchLabelComponent /> */}
         {/* <label className={`form-control w-full relative mb-2`}>
            <div className={`label mb-0 py-0 pb-0.5`}>
               <span className={`label-text font-bold text-${color} ${isError && "text-error"}`}></span>
               <span className={`label-text-alt ${isError ? "text-error" : "text-gray-400"}`}>{required ? "Requerido" : "Opcional"}</span>
            </div>
            <div className="form-control">
               <label className="pt-0 cursor-pointer label">
                  <input
                     ref={inputRef}
                     id={idName}
                     name={idName}
                     type="checkbox"
                     className={`toggle toggle-primary toggle-${size} toggle-${color} ${isError && "toggle-error"} ${className}`}
                     checked={values[idName]}
                     // defaultChecked={defaultChecked}
                     onChange={(e) => {
                        formik.handleChange(e);
                        handleChange(e);
                     }}
                     onBlur={(e) => {
                        formik.handleBlur(e);
                     }}
                     disabled={disabled}
                  />
                  <span className={`label-text font-bold text-${color} ${isError && "text-error"}`}>{label}</span>
               </label>
            </div>
            <div className={`label py-0`}>
               <span className={`label-text-alt ${!isError && !helperText && "text-transparent"} ${isError && "text-error"}`}>
                  {isError ? error : helperText ? helperText : "."}
               </span>
            </div>
         </label> */}
      </Grid>
   );
};
export default SwitchSlide;
//#endregion INPUT
