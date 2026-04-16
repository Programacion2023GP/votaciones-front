import { type FormikValues, useFormikContext } from "formik";
import React, { useEffect, useRef, useState } from "react";
import icons from "../../constant/icons";
import { handleInputFormik, handlePhoneChange } from "../../utils/helpers";

// =================== INTERFACES =======================
interface InputProps {
   xsOffset?: number | null;
   loading?: boolean;
   col: number;
   sizeCols?: { xs: number; sm: number; md: number };
   idName: string;
   label: string;
   placeholder?: string;
   helperText?: string;
   hidden?: boolean;
   disabled?: boolean;
   color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
   mask?: string;
   maskChar?: string;
   mb?: number;
   type?: "text" | "number" | "search" | "email" | "tel" | "hidden" | "url" | "password" | "color" | "range" | "date" | "checkbox";
   textStyleCase?: boolean | null;
   startAdornmentContent?: React.ReactNode;
   endAdornmentContent?: React.ReactNode;
   size?: "xs" | "sm" | "md" | "lg";
   className?: React.HTMLAttributes<HTMLDivElement> | string;
   characterLimit?: number;
   onChangeExtra?: (e: React.ChangeEvent<HTMLInputElement>) => void;
   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
   focus?: boolean;
   required?: boolean;
   changePassword?: boolean;
   setChangePassword?: (value: boolean) => void;
   maxLength?: number;
   minLength?: number;
   onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
   inputRef?: React.RefObject<HTMLInputElement>;
   rows?: number;
}

// =================== COMPONENTE =======================
/**
 * Input personalizado con integración Formik, soporte de máscara, contador de caracteres,
 * adornos, spinner de carga y manejo de visibilidad de contraseña.
 *
 * @param props - Ver interfaz InputProps
 */
const Input: React.FC<InputProps> = ({
   xsOffset = null,
   loading = false,
   col,
   sizeCols = { xs: 12, sm: 12, md: col },
   idName,
   label,
   placeholder,
   helperText,
   hidden = false,
   disabled = false,
   color = "primary",
   mask,
   maskChar = "_",
   mb = 0,
   type = "text",
   textStyleCase = null,
   startAdornmentContent,
   endAdornmentContent,
   size = "md",
   className = "",
   characterLimit = 0,
   onChangeExtra,
   onChange,
   focus = false,
   required = false,
   changePassword = false,
   setChangePassword,
   maxLength,
   minLength,
   onKeyUp,
   inputRef: externalRef,
   rows = 3
}) => {
   const formik = useFormikContext<FormikValues>();
   const internalRef = useRef<HTMLInputElement>(null);
   const inputRef = externalRef || internalRef;
   const [showPassword, setShowPassword] = useState(false);
   const [charCount, setCharCount] = useState(0);

   // Valor actual del campo
   const fieldValue = formik.values[idName] || "";
   const error = formik.touched[idName] && formik.errors[idName] ? String(formik.errors[idName]) : null;
   const isError = !!error;

   // Enfocar automáticamente
   useEffect(() => {
      if (focus && inputRef.current) {
         setTimeout(() => inputRef.current?.focus(), 100);
      }
   }, [focus, inputRef]);

   // Actualizar contador de caracteres
   useEffect(() => {
      setCharCount(fieldValue.length);
   }, [fieldValue]);

   // Manejar cambio de valor
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      formik.handleChange(e);
      onChangeExtra?.(e);
      onChange?.(e);
      if (characterLimit > 0) setCharCount(e.target.value.length);
   };

   // Manejar entrada para formateo (mayúsculas/minúsculas, teléfono)
   const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (textStyleCase !== null) {
         handleInputFormik(e, formik.setFieldValue, idName, textStyleCase);
      }
      if (type === "tel") {
         handlePhoneChange(e, formik.setFieldValue, idName);
      }
   };

   // Determinar clases de columnas según sizeCols
   const gridColsClass = `col-span-${sizeCols.xs} sm:col-span-${sizeCols.sm} md:col-span-${sizeCols.md}`;
   const offsetClass = xsOffset ? `md:offset-${xsOffset}` : "";

   // Tamaño del input (DaisyUI)
   const sizeClass = {
      xs: "input-xs",
      sm: "input-sm",
      md: "input-md",
      lg: "input-lg"
   }[size];

   // Colores de DaisyUI para borde y texto
   const colorClass =
      {
         primary: "input-primary",
         secondary: "input-secondary",
         success: "input-success",
         error: "input-error",
         warning: "input-warning",
         info: "input-info"
      }[color] || "input-primary";

   // Mostrar switch "Cambiar contraseña" solo cuando se edita un usuario existente
   const showPasswordSwitch = type === "password" && formik.values.id && formik.values.id > 0 && idName === "password";

   return (
      <div className={`${gridColsClass} ${offsetClass} ${hidden ? "hidden" : ""} mb-${mb}`}>
         {showPasswordSwitch && (
            <div className="form-control mb-2">
               <label className="label cursor-pointer justify-start gap-3">
                  <input
                     type="checkbox"
                     className="toggle toggle-sm toggle-primary"
                     checked={changePassword}
                     onChange={(e) => setChangePassword?.(e.target.checked)}
                  />
                  <span className="label-text">Cambiar contraseña</span>
               </label>
            </div>
         )}

         <div className="form-control w-full">
            <label className="label">
               <span className={`label-text font-medium ${required ? "after:content-['*'] after:ml-0.5 after:text-error" : ""}`}>{label}</span>
               {required && <span className="label-text-alt text-gray-400">Requerido</span>}
            </label>

            <div className="relative">
               {startAdornmentContent && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{startAdornmentContent}</div>}

               <input
                  ref={inputRef}
                  id={idName}
                  name={idName}
                  type={type === "password" ? (showPassword ? "text" : "password") : type}
                  placeholder={placeholder}
                  className={`
              input w-full
              ${sizeClass}
              ${colorClass}
              ${isError ? "input-error" : ""}
              ${startAdornmentContent ? "pl-10" : ""}
              ${endAdornmentContent || type === "password" || loading ? "pr-10" : ""}
              ${className}
            `}
                  value={fieldValue}
                  onChange={handleChange}
                  onInput={handleInput}
                  onBlur={formik.handleBlur}
                  onKeyUp={onKeyUp}
                  disabled={disabled}
                  required={required}
                  maxLength={characterLimit > 0 ? characterLimit : maxLength}
                  minLength={minLength}
                  aria-rowspan={type === "text" && rows > 1 ? rows : undefined}
               />

               {endAdornmentContent && !loading && type !== "password" && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">{endAdornmentContent}</div>
               )}

               {type === "password" && (
                  <button
                     type="button"
                     className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                     onClick={() => setShowPassword(!showPassword)}
                     tabIndex={-1}
                  >
                     {showPassword ? <icons.Lu.LuEyeOff size={20} /> : <icons.Lu.LuEye size={20} />}
                  </button>
               )}

               {loading && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                     <span className="loading loading-spinner loading-xs text-primary"></span>
                  </div>
               )}
            </div>

            <div className="label">
               <span className={`label-text-alt ${!isError && !helperText ? "text-transparent" : ""} ${isError ? "text-error" : "text-gray-500"}`}>
                  {isError ? error : helperText || " "}
               </span>
               {characterLimit > 0 && (
                  <span className="label-text-alt text-gray-400">
                     {charCount}/{characterLimit}
                  </span>
               )}
            </div>
         </div>
      </div>
   );
};

export default Input;
