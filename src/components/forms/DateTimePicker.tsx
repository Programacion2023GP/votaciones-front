import { FormControl, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { useFormikContext } from "formik";
import { useEffect, useRef } from "react";

interface FormikValues {
   [idName: string]: string; // Cambia esto según los campos de tu formulario
}

/**
 * 
 * INSTALAR...
 * npm install @mui/x-date-pickers
 * npm install dayjs
 * 
 * AGREGAR A TODA LA APLICACION --> src/App.jsx
 * import { LocalizationProvider } from "@mui/x-date-pickers";
 * import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
 * <LocalizationProvider dateAdapter={AdapterDayjs}> ... </<LocalizationProvider>
 * 
 * <DateTimePicker
      col={6}
      idName="fechaNacimiento"
      label="Fecha de Nacimiento"
      value={formik.values.fechaNacimiento}
      onChange={(val) => formik.setFieldValue("fechaNacimiento", val)}
      onChangeExtra={(val) => console.log("Valor adicional:", val)}
      required
      helperText="Selecciona tu fecha de nacimiento"
      color="primary"
      startAdornmentContent={<CalendarMonthIcon />}
   />
 */

interface DateTimePickerProps {
   xsOffset?: number | null;
   loading?: boolean;
   col: number;
   sizeCols?: { xs: number; sm: number; md: number };
   idName: string;
   label: string;
   placeholder?: string;
   helperText?: string;
   format?: string;
   hidden?: boolean;
   disabled?: boolean;
   color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
   variant?: "filled" | "outlined" | "standard";
   startAdornmentContent?: React.ReactNode;
   endAdornmentContent?: React.ReactNode;
   size?: "small" | "medium";
   className?: string;
   sx?: any;
   onChange?: (e: any) => void;
   onChangeExtra?: (value: any) => void;
   focus?: boolean;
   required?: boolean;
   onKeyUp?: (e: any) => void;
   inputRef?: any;
   value?: any;
   [key: string]: any;
   picker: "date" | "time";
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
   xsOffset = null,
   loading = false,
   col,
   sizeCols = { xs: 12, sm: 12, md: col },
   idName,
   label,
   placeholder,
   format = "DD/MM/YYYY",
   helperText,
   hidden = false,
   disabled,
   color = "primary",
   variant = "outlined",
   size = "medium",
   className = "",
   sx,
   onChangeExtra = null,
   onChange,
   focus = false,
   required,
   onKeyUp,
   inputRef,
   value,
   picker = "date",
   ...props
}) => {
   // const handleChangeDatePicker = (date, setFieldValue) => {
   //    // console.log("valor del datePicker en daysjs", date);
   //    const dateFormated = dayjs(date).format("YYYY-MM-DD");
   //    // console.log("idName", idName);
   //    // console.log("formData", formData);
   //    formData[idName] = dateFormated;
   //    setFieldValue(idName, formData[idName]);
   //    // console.log("formData", formData);
   // };
   const formik = useFormikContext<FormikValues>();
   const inputRefFocus = useRef<HTMLInputElement>(null);
   const { values, touched } = formik;
   const error = formik.touched[idName] && formik.errors[idName] ? formik.errors[idName].toString() : null;
   const isError = Boolean(error);

   useEffect(() => {
      setTimeout(() => {
         if (focus && inputRefFocus.current) {
            // console.log("🚀 ~ setTimeout ~ focus:", focus);
            inputRefFocus.current.focus();
         }
      }, 500);
   }, [focus]);

   useEffect(() => {
      // console.log("inputRef", inputRef);
      // console.log("isError", isError);
   }, [idName, formik.values[idName]]);

   return (
      <Grid size={sizeCols} offset={{ xs: xsOffset }} hidden={hidden} px={{}} /* className={`pt-2 mb-[${mb}]`} */>
         <FormControl fullWidth>
            {picker === "date" ? (
               <DatePicker
                  ref={inputRef ? inputRef : inputRefFocus}
                  name={idName}
                  label={label}
                  format={format}
                  className={className}
                  sx={sx}
                  value={dayjs(values[idName]) || new Date()} //dayjs()}
                  onChange={(date) => {
                     formik.setFieldValue(idName, dayjs(date).format("YYYY-MM-DD"));
                     if (onChangeExtra) onChangeExtra(date);
                     if (onChange) onChange(date);
                  }}
                  disabled={disabled}
                  slotProps={{
                     textField: {
                        placeholder: placeholder,
                        color: color,
                        variant: variant,
                        size: size,
                        required: required,
                        error: isError,
                        helperText: isError ? error : helperText
                     }
                  }}
               />
            ) : (
               <TimePicker
                  ref={inputRef ? inputRef : inputRefFocus}
                  name={idName}
                  label={label}
                  format={format}
                  className={className}
                  sx={sx}
                  value={dayjs(values[idName]) || dayjs()}
                  onChange={(date) => {
                     formik.setFieldValue(idName, dayjs(date).format("YYYY-MM-DD"));
                     if (onChangeExtra) onChangeExtra(date);
                     if (onChange) onChange(date);
                  }}
                  disabled={disabled}
                  slotProps={{
                     textField: {
                        placeholder: placeholder,
                        color: color,
                        variant: variant,
                        size: size,
                        required: required,
                        error: isError,
                        helperText: isError ? error : helperText
                     }
                  }}
               />
            )}
         </FormControl>
      </Grid>
   );
};

export default DateTimePicker;
