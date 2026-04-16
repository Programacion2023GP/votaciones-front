import { type FormikValues, useFormikContext } from "formik";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Select from "react-tailwindcss-select";
import Toast from "../../utils/Toast";
import icons from "./../../constant/icons"; // Asegúrate de que tenga TbReload y RiAddCircleLine

// =================== INTERFACES =======================
interface Option {
   id?: number | string;
   value?: any;
   label: any;
}
interface GroupOption {
   id?: number | string;
   label: string;
   options: Option[];
   value?: any;
}
export type Options = (Option | GroupOption)[];

interface Select2Props {
   xsOffset?: number | null;
   col?: number;
   sizeCols?: { xs: number; sm: number; md: number };
   idName: string;
   label: string;
   options?: Options;
   helperText?: string;
   hidden?: boolean;
   namePropLabel?: string;
   disabled?: boolean;
   color?: string;
   mb?: number;
   size?: "sm" | "md" | "lg";
   className?: React.HTMLAttributes<HTMLDivElement> | string;
   onChangeExtra?: (value: any) => void;
   focus?: boolean;
   multiple?: boolean;
   refreshSelect?: () => Promise<void> | null;
   addRegister?: () => Promise<void> | null;
   required?: boolean;
   pluralName?: string;
   singularName?: string;
}

type dataPreviewType = {
   cont: number;
   dataPreview: Array<Record<string, any>>;
   ignore: boolean;
};

/**
 * Select2 - Select personalizado con integración Formik, opciones de recarga y agregar registro.
 */
const Select2: React.FC<Select2Props> = ({
   xsOffset = null,
   col = 12,
   sizeCols = { xs: 12, sm: 12, md: col },
   idName,
   label,
   options = [],
   helperText,
   hidden = false,
   namePropLabel,
   disabled,
   color = "primary",
   mb = 2,
   size = "md",
   className = "",
   onChangeExtra,
   focus = false,
   multiple = false,
   refreshSelect,
   addRegister,
   pluralName = "lista",
   singularName = "registro",
   required = false
}) => {
   const [value, setValue] = useState<Option | null>(null);
   const formik = useFormikContext<FormikValues>();
   const inputRef = useRef<HTMLInputElement>(null);
   const [dataPreview, setDataPreview] = useState<dataPreviewType>({
      cont: 0,
      dataPreview: [],
      ignore: false
   });
   const [loading, setLoading] = useState(false);

   const error =
      formik.touched[idName === "colony" ? "community_id" : idName] && formik.errors[idName === "colony" ? "community_id" : idName]
         ? String(formik.errors[idName === "colony" ? "community_id" : idName])
         : null;
   const isError = Boolean(error);

   // Mapeo de tamaño de DaisyUI
   const sizeClass =
      {
         sm: "input-sm",
         md: "input-md",
         lg: "input-lg"
      }[size] || "input-md";

   // Clases para columnas responsivas
   const gridColsClass = `col-span-${sizeCols.xs} sm:col-span-${sizeCols.sm} md:col-span-${sizeCols.md}`;
   const offsetClass = xsOffset ? `md:col-start-${xsOffset + 1}` : "";

   const handleChange = (selected: any) => {
      setValue(selected);
      formik.setFieldValue(idName, selected === null ? null : selected.id);
      if (onChangeExtra) onChangeExtra({ idName, value: selected });
   };

   const handleClickRefresh = async (onlyRefresh = true) => {
      try {
         setLoading(true);
         if (refreshSelect) await refreshSelect();
         setLoading(false);
         if (onlyRefresh) {
            setDataPreview((prev) => ({ ...prev, ignore: true }));
         } else {
            setDataPreview((prev) => ({ ...prev, cont: 0, ignore: false }));
         }
         Toast.Success("Lista Actualizada");
      } catch (error: any) {
         console.log(error);
         Toast.Error(error);
      }
   };

   const handleClickAddRegister = async () => {
      try {
         setLoading(true);
         if (addRegister) {
            await addRegister();
            await handleClickRefresh(false);
         }
         setLoading(false);
         Toast.Success("Registro agregado");
      } catch (error: any) {
         console.log(error);
         Toast.Error(error);
      }
   };

   useEffect(() => {
      setTimeout(() => {
         if (focus && inputRef.current) {
            inputRef.current.focus();
         }
      }, 500);
   }, [focus]);

   useEffect(() => {
      if (dataPreview.cont === 0 && options.length > 0) {
         setDataPreview({
            cont: 1,
            dataPreview: options,
            ignore: false
         });
      }
      if (options.length > 0 && dataPreview.dataPreview.length > 0 && options.length > dataPreview.dataPreview.length && !dataPreview.ignore) {
         const dataReorder = [...options].sort((a, b) => (b.id || 0) - (a.id || 0));
         const newValue = dataReorder[0];
         formik.setFieldValue(idName, newValue.id);
         if (onChangeExtra) onChangeExtra({ idName, value: newValue });
      }
   }, [options]);

   useEffect(() => {
      setValue(null);
      if (formik.values[idName] > 0) {
         setValue(options.find((item) => item.id === formik.values[idName]) || null);
      }
   }, [idName, formik.values[idName]]);

   useLayoutEffect(() => {
      // Puedes ordenar opciones aquí si es necesario
   }, []);

   return (
      <div className={`${gridColsClass} ${offsetClass} ${hidden ? "hidden" : ""} mb-${mb} ${className}`}>
         <div className="flex items-start gap-2">
            <label className="form-control grow relative mb-2">
               <div className="label py-0 pb-0.5">
                  <span className={`label-text font-bold ${isError ? "text-error" : `text-${color}`}`}>{label}</span>
                  <span className={`label-text-alt ${isError ? "text-error" : "text-gray-400"}`}>{required ? "Requerido" : "Opcional"}</span>
               </div>

               <Select
                  key={`key-Select`}
                  isSearchable
                  value={value as any}
                  options={options as any}
                  onChange={handleChange}
                  placeholder="Selecciona una opción..."
                  searchInputPlaceholder="buscar..."
                  noOptionsMessage="No se encontraron opciones"
                  loading={loading}
                  isDisabled={loading || disabled}
                  isMultiple={multiple}
                  isClearable={true}
                  classNames={{
                     menuButton: ({ isDisabled }) =>
                        `input ${sizeClass} ${isError ? "input-error" : ""} items-center px-0 flex text-sm text-gray-500 border ${isError ? "border-error" : "border-gray-300"} rounded-lg shadow-sm transition-all duration-300 focus:outline-none bg-base-100 hover:${isError ? "border-error" : "border-gray-400"} focus:${isError ? "border-error" : "border-blue-500"} focus:ring focus:${isError ? "ring-red-500/20" : "ring-blue-500/20"}`,
                     searchIcon: "absolute w-4 h-4 mt-2 ml-1 text-gray-500",
                     searchBox:
                        "input input-sm w-full py-2 pl-6 text-sm border border-gray-200 rounded focus:border-gray-500 focus:ring-0 focus:outline-none text-base-content",
                     menu: "bg-base-300 pb-2 rounded-b-lg transition-all duration-300",
                     list: "list-select2 mt-2 max-h-52 overflow-y-auto",
                     listItem: ({ isSelected }) =>
                        `block transition duration-200 px-2 py-4 cursor-pointer select-none truncate rounded text-gray-500 hover:bg-blue-100 hover:text-blue-500 ${isSelected ? "bg-blue-100 text-blue-500" : ""}`
                  }}
                  primaryColor={""}
               />

               <div className="label">
                  <span className={`label-text-alt ${!isError && !helperText ? "text-transparent" : ""} ${isError ? "text-error" : ""}`}>
                     {isError ? error : helperText || ""}
                  </span>
               </div>
            </label>

            {/* Botón de actualizar lista */}
            {refreshSelect && (
               <div className="tooltip tooltip-top" data-tip={`Actualizar ${pluralName}`}>
                  <button
                     type="button"
                     className="btn btn-sm btn-circle btn-ghost text-primary mt-8 transition-transform duration-500 hover:rotate-90 disabled:opacity-50"
                     onClick={() => handleClickRefresh(true)}
                     disabled={disabled || loading}
                  >
                     <icons.Lu.LuIterationCw size={18} />
                  </button>
               </div>
            )}

            {/* Botón de agregar registro */}
            {addRegister && (
               <div className="tooltip tooltip-right" data-tip={`Agregar ${singularName}`}>
                  <button
                     type="button"
                     className="btn btn-sm btn-circle btn-ghost text-success mt-8 transition-transform duration-500 hover:scale-110 disabled:opacity-50"
                     onClick={handleClickAddRegister}
                     disabled={disabled || loading}
                  >
                     <icons.Lu.LuCirclePlus size={20} />
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default Select2;
