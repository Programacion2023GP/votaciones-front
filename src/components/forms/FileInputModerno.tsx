import React, { useCallback, useEffect, useRef, useState } from "react";
import { Field, useFormikContext } from "formik";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Toast from "../../utils/Toast";
import { QuestionAlertConfig } from "../../utils/sAlert";
import { Grid, FormControl, Typography, Box, FormLabel, Backdrop } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { isMobile } from "react-device-detect";
import CameraInput from "./CameraInput2";
import Compressor from "compressorjs";
import DialogSelectMode from "../DialogSelectMode";
import env from "../../constant/env";

// Definición de la interfaz para las props
interface FileInputProps {
   xsOffset?: number | null;
   col: number;
   idName: string;
   label: string;
   helperText?: string;
   disabled?: boolean;
   hidden?: boolean;
   marginBottom?: number;
   color?: string;
   required?: boolean;
   filePreviews: Array<{ original: File; file: File; dataURL: any }>;
   setFilePreviews: React.Dispatch<React.SetStateAction<Array<{ original: File; file: File; dataURL: any }>>>;
   multiple?: boolean;
   maxImages?: number;
   accept?: string;
   fileSizeMax?: number;
   showBtnCamera?: boolean;
   handleUploadingFile?: (filePreviews: Array<{ original: File; file: File; dataURL: any }>) => void;
   showDialogFileOrPhoto?: boolean;
   caputureINE?: boolean;
   zoomLeft?: boolean;
}

const MB = 1048576;
const mySwal = withReactContent(Swal);

export const imageCompress = async (file: File | Blob | any, INE: boolean = false): Promise<File> => {
   return new Promise((resolve, reject) => {
      new Compressor(file, {
         quality: INE ? 0.3 : 0.6,
         convertSize: 2.5 * MB,
         maxWidth: INE ? 1080 : 1920,
         maxHeight: INE ? 720 : 1080,
         success(result: any) {
            const compressedFile = new File([result], file.name, {
               type: result.type,
               lastModified: Date.now()
            });
            resolve(compressedFile);
         },
         error(err: any) {
            reject(err);
         }
      });
   });
};

export const setObjImg = (img: string | null | undefined, setImg: (arg0: { file: { name: string }; dataURL: string }[]) => void) => {
   if (["", null, undefined].includes(img)) return setImg([]);
   const imgObj = {
      file: {
         name: `${img}`
      },
      dataURL: `${env.API_URL_IMG}/${img}`
   };
   setImg([imgObj]);
};

const FileInputModerno: React.FC<FileInputProps> = ({
   xsOffset = null,
   col,
   idName,
   label,
   helperText,
   disabled,
   hidden,
   marginBottom,
   color,
   required,
   filePreviews = [],
   setFilePreviews,
   multiple,
   maxImages = -1,
   accept = "*",
   fileSizeMax = 1,
   showBtnCamera = false,
   handleUploadingFile,
   showDialogFileOrPhoto = false,
   caputureINE = false,
   zoomLeft = false,
   ...props
}) => {
   const formik: any = useFormikContext<any>();
   const error = formik.touched[idName] && formik.errors[idName] ? formik.errors[idName].toString() : null;
   const isError = Boolean(error);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [fileSizeExceeded, setFileSizeExceeded] = useState(fileSizeMax * MB);
   const [confirmRemove, setConfirmRemove] = useState(true);
   const [fileInfo, setFileInfo] = useState(null);
   const [isDragging, setIsDragging] = useState(false);
   const [zoomImage, setZoomImage] = useState<{ open: boolean; imageUrl: string; fileName: string }>({
      open: false,
      imageUrl: "",
      fileName: ""
   });

   const inputFileRefMobile: any = useRef<HTMLInputElement | null>(null);
   const [openCameraFile, setOpenCameraFile] = useState(false);
   const [openDialog, setOpenDialog] = useState(false);

   // Animaciones
   const dropzoneVariants = {
      initial: { scale: 1, y: 0 },
      dragEnter: { scale: 1.02, y: -2, borderColor: "#3b82f6" },
      hover: { scale: 1.01, y: -1 },
      tap: { scale: 0.99 }
   };

   const filePreviewVariants = {
      initial: { opacity: 0, scale: 0.8, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.8, y: -20 }
   };

   const zoomModalVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 }
   };

   const validationQuantityImages = () => {
      if (multiple) {
         if (maxImages != -1) {
            if (filePreviews.length >= maxImages) {
               Toast.Info(`Solo se permiten cargar ${maxImages} imagenes.`);
               return false;
            }
         }
      } else {
         if (filePreviews.length >= 1) {
            Toast.Info(`Solo se permite cargar una imagen.`);
            return false;
         }
      }
      return true;
   };

   const onDrop = useCallback(
      (acceptedFiles: File[]) => {
         setIsDragging(false);
         if (!confirmRemove) return;
         setConfirmRemove(false);

         setFilePreviews([]);

         if (acceptedFiles && acceptedFiles.length > 0) {
            acceptedFiles.forEach((file: File | Blob | any) => {
               handleSetFile(file);
            });
         } else {
            Toast.Error("No hay archivos en el acceptedFiles");
         }
      },
      [confirmRemove, setFilePreviews]
   );

   const onDragEnter = useCallback(() => {
      if (!disabled) {
         setIsDragging(true);
      }
   }, [disabled]);

   const onDragLeave = useCallback(() => {
      setIsDragging(false);
   }, []);

   const readFileAsDataURL = (file: File | Blob | any) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result);
         reader.onerror = (error) => reject(error);

         if (!file.type.includes("image")) {
            const objectURL = URL.createObjectURL(file);
            resolve(objectURL);
         } else {
            reader.readAsDataURL(file);
         }
      });
   };

   const handleSetFile = async (file: File | Blob | any) => {
      if (file.size >= fileSizeExceeded) {
         if (filePreviews.length == 0) setConfirmRemove(true);
         Toast.Info(`el archivo pesa más de ${fileSizeMax}MB, su calidad bajara.`);
      }

      if (file.type.includes("image")) {
         try {
            let newFile = file;

            if (file.size >= fileSizeExceeded) {
               const fileCompressed = await imageCompress(file);
               newFile = fileCompressed;
            }

            const dataURL = await readFileAsDataURL(newFile);
            const preview = {
               original: file,
               file: newFile,
               dataURL
            };

            setFilePreviews([preview]);
            filePreviews = [preview];
            if (handleUploadingFile) handleUploadingFile(filePreviews);
         } catch (error) {
            console.error("Error al procesar la imagen:", error);
            Toast.Error(`Error al procesar la imagen: ${error}`);
         }
      } else {
         try {
            const dataURL = await readFileAsDataURL(file);
            const preview = {
               original: file,
               file: file,
               dataURL
            };

            setFilePreviews([preview]);
            filePreviews = [preview];
            if (handleUploadingFile) handleUploadingFile(filePreviews);
         } catch (error) {
            console.error("Error al leer el archivo:", error);
            Toast.Error(`Error al leer el archivo: ${error}`);
         }
      }
   };

   const handleGetFileCamera = async (camFile: { file: File; dataUrl: any } | File | Blob | any) => {
      try {
         setFilePreviews([]);
         setConfirmRemove(true);
         handleSetFile(camFile.file ? camFile.file : camFile);
      } catch (error) {
         console.log("🚀 ~ handleGetFileCamera ~ error:", error);
      }
   };

   const handleOnChangeFileInput = (e: { target: { files: string | any[] } } | any) => {
      const file = e.target.files.length > 0 ? e.target.files[0] : null;
      if (!file) return;
      handleGetFileCamera(file);
   };

   const handleRemoveImage = async (fileToRemove: File) => {
      if (disabled) return;

      mySwal.fire(QuestionAlertConfig(`¿Estas seguro de eliminar el archivo?`, "CONFIRMAR")).then(async (result) => {
         if (result.isConfirmed) {
            filePreviews.forEach((preview) => {
               if (preview.dataURL && preview.dataURL.startsWith("blob:")) {
                  URL.revokeObjectURL(preview.dataURL);
               }
            });

            setFilePreviews([]);
            setConfirmRemove(true);
         }
      });
   };

   const handleZoomImage = (imageUrl: string, fileName: string) => {
      setZoomImage({
         open: true,
         imageUrl,
         fileName
      });
   };

   const handleCloseZoom = () => {
      setZoomImage({
         open: false,
         imageUrl: "",
         fileName: ""
      });
   };

   const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      onDragEnter,
      onDragLeave
   });

   const handleOpenDialog = () => {
      confirmRemove && setOpenDialog(true);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
   };

   const handleSelectFile = async () => {
      setOpenCameraFile(false);
      setOpenDialog(false);
      inputFileRefMobile.current.click();
   };

   const handleSelectPhoto = async () => {
      setOpenCameraFile(true);
      setOpenDialog(false);
      inputFileRefMobile.current.click();
   };

   useEffect(() => {
      // console.log("🚀 ~ FileInputModerno ~ filePreviews:", filePreviews);
      if (filePreviews.length == 0) setConfirmRemove(true);
      else setConfirmRemove(false);
   }, [idName, formik.values[idName], filePreviews]);

   const getFileType = (file: File | string | { name: string }): string => {
      // console.log("🚀 ~ getFileType ~ file:", file);
      // Si es un string (URL), determinar el tipo por la extensión del archivo
      if (["string", "object"].includes(typeof file)) {
         let url = typeof file === "object" ? file.name.toLocaleLowerCase() : file.toLowerCase();

         // Extraer la extensión del archivo de la URL
         const extension = url.split(".").pop()?.split("?")[0]; // Manejar URLs con parámetros

         // Mapeo de extensiones a tipos
         const extensionMap: { [key: string]: string } = {
            // Imágenes
            jpg: "image",
            jpeg: "image",
            png: "image",
            gif: "image",
            webp: "image",
            svg: "image",
            bmp: "image",
            ico: "image",
            tiff: "image",
            tif: "image",
            avif: "image",

            // PDF
            pdf: "pdf",

            // Excel/Spreadsheets
            xls: "excel",
            xlsx: "excel",
            xlsm: "excel",
            xlsb: "excel",
            csv: "excel",
            ods: "excel",

            // Word/Documents
            doc: "document",
            docx: "document",
            docm: "document",
            odt: "document",
            rtf: "document",
            txt: "text",

            // Texto
            text: "text",
            log: "text",
            md: "text",
            json: "text",
            xml: "text",
            html: "text",
            htm: "text",
            css: "text",
            js: "text",
            ts: "text",

            // Archivos comprimidos
            zip: "archive",
            rar: "archive",
            "7z": "archive",
            tar: "archive",
            gz: "archive",
            bz2: "archive"
         };

         if (extension && extensionMap[extension]) {
            return extensionMap[extension];
         }

         // Si no se encuentra por extensión, intentar determinar por patrones en la URL
         if (url.includes("/images/") || url.includes("/img/") || url.includes("image/")) {
            return "image";
         }
         if (url.includes("/documents/") || url.includes("/docs/")) {
            return "document";
         }
         if (url.includes("/pdf/") || url.includes(".pdf")) {
            return "pdf";
         }

         return "other";
      }

      // Si es un objeto File, usar la lógica original
      if (file.type.includes("image")) return "image";
      if (file.type.includes("pdf")) return "pdf";
      if (file.type.includes("excel") || file.type.includes("csv") || file.type.includes("sheet")) return "excel";
      if (file.type.includes("word") || file.type.includes("document")) return "document";
      if (file.type.includes("text")) return "text";
      if (file.type.includes("zip") || file.type.includes("rar") || file.type.includes("7z")) return "archive";

      return "other";
   };

   const getDropzoneClasses = () => {
      const baseClasses = `
         relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ease-in-out
         cursor-pointer text-center
         ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "bg-white"}
      `;

      if (isDragActive || isDragging) {
         return `${baseClasses} border-blue-500 bg-blue-100 shadow-lg scale-105`;
      }

      if (isError || color === "red") {
         return `${baseClasses} border-red-500 bg-red-50 hover:bg-red-100`;
      }

      return `${baseClasses} border-blue-400 bg-blue-50 hover:bg-blue-100 hover:shadow-md`;
   };

   return (
      <>
         <Grid
            size={{ xs: 12, md: col }}
            offset={{ xs: xsOffset }}
            sx={{ display: hidden ? "none" : "flex", flexDirection: "column", alignItems: "center", mb: marginBottom ? marginBottom : 0 }}
         >
            <FormControl fullWidth>
               <div className="flex justify-between items-center mb-2">
                  <label htmlFor={idName} className={`text-sm font-medium ${isError ? "text-red-600" : color === "red" ? "text-red-600" : "text-gray-700"}`}>
                     {label}
                  </label>
                  <span className={`text-xs ${isError ? "text-red-600" : "text-gray-400"}`}>{required ? "Requerido" : "Opcional"}</span>
               </div>

               <Field name={idName} id={idName}>
                  {({ field, form }) => (
                     <>
                        <div className="w-full" onClick={isMobile && showDialogFileOrPhoto ? handleOpenDialog : undefined}>
                           <motion.div
                              {...getRootProps()}
                              className={getDropzoneClasses()}
                              style={{ pointerEvents: disabled ? "none" : "auto" }}
                              variants={dropzoneVariants}
                              initial="initial"
                              whileHover={!disabled ? "hover" : "initial"}
                              whileTap={!disabled ? "tap" : "initial"}
                              animate={isDragActive ? "dragEnter" : "initial"}
                           >
                              {isMobile && showDialogFileOrPhoto ? (
                                 <input
                                    {...getInputProps()}
                                    onChange={confirmRemove ? handleOnChangeFileInput : undefined}
                                    type={confirmRemove ? "file" : "text"}
                                    ref={inputFileRefMobile}
                                    multiple={multiple}
                                    accept={accept}
                                    disabled={disabled}
                                    capture={openCameraFile ? "environment" : undefined}
                                    className="hidden"
                                 />
                              ) : (
                                 <input
                                    {...getInputProps()}
                                    onChange={confirmRemove ? handleOnChangeFileInput : undefined}
                                    type={confirmRemove ? "file" : "text"}
                                    multiple={multiple}
                                    accept={accept}
                                    disabled={disabled}
                                    className="hidden"
                                 />
                              )}

                              {/* Indicador de arrastre */}
                              {isDragActive && (
                                 <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl flex items-center justify-center"
                                 >
                                    <div className="text-center">
                                       <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                             />
                                          </svg>
                                       </div>
                                       <p className="text-blue-600 font-semibold">Suelta los archivos aquí</p>
                                    </div>
                                 </motion.div>
                              )}

                              {/* Contenido normal del dropzone */}
                              <div className="flex flex-col items-center justify-center space-y-4">
                                 {/* Icono de upload */}
                                 <motion.div
                                    className={`p-3 rounded-full ${isError ? "bg-red-100" : "bg-blue-100"}`}
                                    animate={{
                                       scale: isDragActive ? 1.1 : 1,
                                       rotate: isDragActive ? 5 : 0
                                    }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                 >
                                    <svg className={`w-6 h-6 ${isError ? "text-red-500" : "text-blue-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                       />
                                    </svg>
                                 </motion.div>

                                 {/* Texto principal */}
                                 {filePreviews.length === 0 && (
                                    <div className="text-center">
                                       <p className="text-gray-600 font-medium mb-1">Arrastra y suelta tus archivos aquí</p>
                                       <p className="text-gray-500 text-sm">
                                          o <span className="text-blue-600 font-medium">haz clic para seleccionar</span>
                                       </p>
                                    </div>
                                 )}

                                 {/* Vista previa de archivos */}
                                 <AnimatePresence>
                                    {filePreviews.length > 0 && (
                                       <div className="w-full space-y-4">
                                          {filePreviews.map((preview, index) => {
                                             const fileType = getFileType(preview.file);

                                             return (
                                                <motion.div
                                                   key={preview.file.name}
                                                   className="relative group"
                                                   variants={filePreviewVariants}
                                                   initial="initial"
                                                   animate="animate"
                                                   exit="exit"
                                                   transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                   {fileType === "image" ? (
                                                      // Preview para imágenes
                                                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                                                         <div className="flex items-center space-x-3 mb-3">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                  <path
                                                                     strokeLinecap="round"
                                                                     strokeLinejoin="round"
                                                                     strokeWidth={2}
                                                                     d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                  />
                                                               </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                               <p className="text-sm font-medium text-gray-900 truncate">{preview.file.name}</p>
                                                               <p className="text-sm text-gray-500">{Math.round(preview.file.size / 1024)} KB</p>
                                                            </div>
                                                         </div>
                                                         <div className="relative">
                                                            <img
                                                               className="w-full h-64 object-contain rounded-lg border bg-gray-50 cursor-pointer hover:shadow-md transition-shadow duration-300"
                                                               src={preview.dataURL || null}
                                                               alt={preview.file.name}
                                                               onClick={() => handleZoomImage(preview.dataURL, preview.file.name)}
                                                            />
                                                         </div>
                                                      </div>
                                                   ) : fileType === "pdf" ? (
                                                      // Preview para PDFs
                                                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                                                         <div className="flex items-center space-x-3 mb-3">
                                                            <div className="p-2 bg-red-100 rounded-lg">
                                                               <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                  <path
                                                                     strokeLinecap="round"
                                                                     strokeLinejoin="round"
                                                                     strokeWidth={2}
                                                                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                  />
                                                               </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                               <p className="text-sm font-medium text-gray-900 truncate">{preview.file.name}</p>
                                                               <p className="text-sm text-gray-500">{Math.round(preview.file.size / 1024)} KB</p>
                                                            </div>
                                                         </div>
                                                         <div className="relative">
                                                            <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 rounded border cursor-pointer hover:bg-gray-200 transition-colors duration-300">
                                                               <svg className="w-16 h-16 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                  <path
                                                                     strokeLinecap="round"
                                                                     strokeLinejoin="round"
                                                                     strokeWidth={2}
                                                                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                  />
                                                               </svg>
                                                               <p className="text-sm text-gray-600">PDF Document</p>
                                                               <p className="text-xs text-gray-500 mt-1">Haz clic para ver el contenido</p>
                                                            </div>
                                                         </div>
                                                      </div>
                                                   ) : (
                                                      // Preview para otros tipos de archivos
                                                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                                                         <div className="flex items-center space-x-3 mb-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                               <svg
                                                                  className={`w-6 h-6 ${fileType === "excel" ? "text-green-600" : "text-blue-600"}`}
                                                                  fill="none"
                                                                  stroke="currentColor"
                                                                  viewBox="0 0 24 24"
                                                               >
                                                                  <path
                                                                     strokeLinecap="round"
                                                                     strokeLinejoin="round"
                                                                     strokeWidth={2}
                                                                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                  />
                                                               </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                               <p className="text-sm font-medium text-gray-900 truncate">{preview.file.name}</p>
                                                               <p className="text-sm text-gray-500">
                                                                  {Math.round(preview.file.size / 1024)} KB • {fileType.toUpperCase()}
                                                               </p>
                                                            </div>
                                                         </div>
                                                         <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded border">
                                                            <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                               <path
                                                                  strokeLinecap="round"
                                                                  strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                               />
                                                            </svg>
                                                            <p className="text-sm text-gray-600">{fileType.toUpperCase()} File</p>
                                                            <p className="text-xs text-gray-500 mt-1">No hay preview disponible</p>
                                                         </div>
                                                      </div>
                                                   )}

                                                   {/* Botones de acción */}
                                                   {!disabled && (
                                                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                         {fileType === "image" && (
                                                            <motion.button
                                                               type="button"
                                                               onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleZoomImage(preview.dataURL, preview.file.name);
                                                               }}
                                                               className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
                                                               whileHover={{ scale: 1.1 }}
                                                               whileTap={{ scale: 0.9 }}
                                                               title="Ampliar imagen"
                                                            >
                                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                  <path
                                                                     strokeLinecap="round"
                                                                     strokeLinejoin="round"
                                                                     strokeWidth={2}
                                                                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v0"
                                                                  />
                                                               </svg>
                                                            </motion.button>
                                                         )}
                                                         <motion.button
                                                            type="button"
                                                            onClick={(e) => {
                                                               e.stopPropagation();
                                                               handleRemoveImage(preview.file);
                                                            }}
                                                            className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            title="Eliminar archivo"
                                                         >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                         </motion.button>
                                                      </div>
                                                   )}
                                                </motion.div>
                                             );
                                          })}
                                       </div>
                                    )}
                                 </AnimatePresence>
                              </div>
                           </motion.div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-2 flex flex-col items-center space-y-2">
                           <p className="text-xs text-gray-500 text-center">
                              Tamaño máximo del archivo: <b>{fileSizeMax}MB MAX.</b>
                           </p>

                           {!disabled && showBtnCamera && (
                              <div className="flex justify-center">
                                 <CameraInput getFile={handleGetFileCamera} caputureINE={caputureINE} />
                              </div>
                           )}
                        </div>

                        {/* Mensaje de error/helper */}
                        <p className={`mt-1 text-xs ${isError ? "text-red-600" : helperText ? "text-gray-500" : "text-transparent"}`}>
                           {isError ? error : helperText ? helperText : "."}
                        </p>
                     </>
                  )}
               </Field>
            </FormControl>
         </Grid>

         {/* Modal de Zoom para imágenes */}
         <Backdrop
            sx={{
               color: "#fff",
               zIndex: (theme) => theme.zIndex.drawer + 1,
               backdropFilter: "blur(12px)",
               backgroundColor: "rgba(0, 0, 0, 0.8)"
            }}
            open={zoomImage.open}
            onClick={handleCloseZoom}
         >
            <motion.div
               variants={zoomModalVariants}
               initial="hidden"
               animate="visible"
               exit="exit"
               className="max-w-4xl max-h-[90vh] mx-4"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header del modal */}
               <div className="relative top-2 left-4 right-4 z-10 flex justify-between items-center">
                  <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
                     <p className="text-white font-medium  truncate max-w-md">{zoomImage.fileName}</p>
                  </div>
                  <motion.div
                     onClick={handleCloseZoom}
                     className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200 hover:cursor-pointer"
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </motion.div>
               </div>

               {/* Imagen ampliada */}
               <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                  <img src={zoomImage.imageUrl} alt={zoomImage.fileName} className="w-full h-auto max-h-[80vh] object-contain" />
               </div>

               {/* Controles de zoom (opcional) */}
               {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <motion.button
                     className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors duration-200"
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                  </motion.button>
                  <motion.button
                     className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors duration-200"
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                     </svg>
                  </motion.button>
               </div> */}
            </motion.div>
         </Backdrop>

         {isMobile && showDialogFileOrPhoto && (
            <DialogSelectMode open={openDialog} onClose={handleCloseDialog} onSelectFile={handleSelectFile} onSelectPhoto={handleSelectPhoto} />
         )}
      </>
   );
};

export default FileInputModerno;
