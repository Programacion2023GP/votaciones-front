import { FormikValues, useFormikContext } from "formik";
import React, { useEffect, useRef, useState } from "react";
// import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { Checkbox, FormControlLabel, FormGroup, FormHelperText, Grid, SxProps } from "@mui/material";
import { Theme } from "@emotion/react";
import { BorderAll } from "@mui/icons-material";

//#region INPUT
interface FormValues {
   [idName: string]: string; // Cambia esto según los campos de tu formulario
}
interface CheckboxProps {
   xsOffset?: number | null; // Offset en pantallas extra pequeñas
   col: number; // Número de columnas que ocupará el input
   sizeCols?: { xs: number; sm: number; md: number }; // Ancho máxima del input
   idName: string; // Identificador único del input
   label: string; // Texto del label
   labelPlacement?: "bottom" | "top" | "end" | "start" | undefined; //Ubicacion del texto referente al check
   value: boolean | any | null; // Texto del label
   defaultChecked?: true | false; // Define el valor inicial del componente
   helperText?: string; // Texto de ayuda que aparece debajo del input
   horizontal?: true | false; // Orientación de las opciones
   // alignItems?: "start" | "center" | "end" | "between"; // Alineación de las opciones
   size?: "small" | "medium"; // Tamaño del input
   className?: string; // Clases CSS adicionales para el input
   sx: SxProps<Theme> | undefined;
   color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "default"; // Color del input y label
   onChangeExtra?: (value: any) => void; // Función extra para manejar el cambio de valor | opcion2: (e: React.ChangeEvent<HTMLCheckboxElement>) => void;
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
 * <Checkbox
 *   col={6}
 *   idName="nombre"
 *   label="Nombre"
 *   defaultChecked={true}
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
 * @param {any} props.value - valor opcional del input.
 * @param {true | false} props.defaultChecked - Define el valor inicial del componente
 * @param {string} [props.helperText] - Texto de ayuda que aparece debajo del input.
 * @param { true | false} [props.horizontal=true] - Orientación de las opciones.
//  * @param {"start" | "center" | "end"} [props.alignItems="center"] - Alineación de las opciones.
 * @param {"small" | "lg"} [props.size="md"] - Tamaño del input.
 * @param {string} [props.className] - Clases CSS adicionales para el input.
 * @param {"primary" | "secondary" | "success" | "error" | "warning" | "info" | "default"} [props.color] - Color del input y del label.
 * @param {(value: string) => void} [props.onChangeExtra] - Función adicional para manejar el cambio de valor del input.
 * @param {boolean} [props.hidden=false] - Indica si el input está oculto.
 * @param {boolean} [props.disabled] - Desactiva el input.
 * @param {number} [props.mb=2] - Margen inferior del input.
 * @param {boolean} [props.focus=false] - Establece si el input debe enfocarse automáticamente.
 * @param {boolean} [props.required] - Establece si el valor del input es obligatorio.
 * @returns {React.JSX.Element} El componente Checkbox.
 */

const CheckboxComponent: React.FC<CheckboxProps> = ({
   xsOffset = null,
   col,
   sizeCols = { xs: 12, sm: 12, md: col }, // 97% Altura máxima del formulario
   idName,
   label,
   labelPlacement,
   value,
   defaultChecked,
   helperText,
   // alignItems = "between",
   hidden = false,
   disabled,
   color,
   mb = 2,
   size = "medium",
   className = "",
   sx,
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
   const [loading, setLoading] = useState(false);
   const [isChecked, setIsChecked] = useState(false);

   useEffect(() => {
      setTimeout(() => {
         if (focus && inputRef.current) {
            inputRef.current.focus();
         }
      }, 500);
   }, [focus]);

   useEffect(() => {
      // console.log("🚀 ~ isError:", isError);
      // setIsChecked(defaultChecked);
   }, [isError]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      // console.log("🚀 ~ handleChange ~ checked:", checked);
      setIsChecked(checked);
      formik.setFieldValue(idName, checked);
      if (onChangeExtra) onChangeExtra({ idName, checked });
   };

   return (
      <Grid size={sizeCols} offset={{ xs: xsOffset }} hidden={hidden} className={`p-1 mb-[${mb}]`}>
         {/* <CheckboxLabelComponent /> */}
         <FormGroup>
            <FormControlLabel
               ref={inputRef}
               id={idName}
               name={idName}
               color={color}
               control={
                  <Checkbox
                     defaultChecked={defaultChecked}
                     checked={values[idName]}
                     onChange={(e) => {
                        const checked = e.target.checked;
                        // setCheckedComponent(checked); // Actualiza el estado del componente
                        handleChange(e);
                        formik.setFieldValue(idName, checked ? value : false);
                        sx = { borderRadius: 100 };
                     }}
                     disabled={loading || disabled}
                     color={color}
                     size={size}
                  />
               }
               label={label}
               labelPlacement={labelPlacement}
               required={required}
               disabled={disabled || loading}
               // sx={{
               //    borderRadius: 100,
               //    marginRight: ["start", "end"].includes(labelPlacement) ? "16px" : 0,
               //    marginBottom: ["start", "end"].includes(labelPlacement) ? 0 : "8px",
               //    "& .MuiSvgIcon-root": {
               //       fontSize: "1.5rem"
               //    }
               // "& .MuiTypography-body1": {
               //    fontSize: "14px"
               // }
               // }}
               {...props}
            />
            <FormHelperText>{isError ? error : helperText}</FormHelperText>
         </FormGroup>
         {/* <label className={`form-control w-full relative mb-2`}>
            <div className={`label mb-0 py-0 pb-0.5`}>
               {alignItems == "between" && <span className={`label-text font-bold text-${color} ${isError && "text-error"}`}></span>}
               <span className={`label-text-alt ${isError ? "text-error" : "text-gray-400"}`}>{required ? "Requerido" : "Opcional"}</span>
            </div>
            <div className="form-control">
               <label className={`cursor-pointer label ${alignItems != "between" ? `justify-${alignItems} space-x-2` : ""}`}>
                  <input
                     ref={inputRef}
                     id={idName}
                     name={idName}
                     // value={value}
                     type="checkbox"
                     className={`checkbox checkbox-primary checkbox-${size} checkbox-${color} ${isError && "checkbox-error"} ${className}`}
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
            <div className={`label py-0 ${helperText && "py-0 pt-0.5"}`}>
               <span className={`label-text-alt ${!isError && !helperText && "text-transparent"} ${isError && "text-error"}`}>
                  {isError ? error : helperText ? helperText : "."}
               </span>
            </div>
         </label> */}
      </Grid>
   );
};
export default CheckboxComponent;
//#endregion INPUT
