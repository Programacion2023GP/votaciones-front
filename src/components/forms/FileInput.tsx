import React, { useCallback, useEffect, useRef, useState } from "react";
import { Field, useFormikContext } from "formik";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Toast from "../../utils/Toast";
import { QuestionAlertConfig } from "../../utils/sAlert";
import { Grid, FormControl, Typography, Box, FormLabel } from "@mui/material";
import { isMobile } from "react-device-detect";
import CameraInput from "./CameraInput";
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

/**
 * Componente `FileInput`
 *
 * Este componente permite al usuario cargar y previsualizar archivos, ya sea a través de una interfaz de "arrastrar y soltar"
 * o usando un diálogo de selección de archivos. Incluye opciones de compresión de imagen, validación de tamaño y
 * restricciones en el tipo de archivo y cantidad máxima de archivos.
 *
 * @component
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {number} [props.xsOffset=null] - El offset horizontal para pantallas pequeñas.
 * @param {number} [props.col] - El número de columnas que ocupa el componente en pantallas medianas.
 * @param {string} props.idName - El identificador único del campo, usado en Formik.
 * @param {string} props.label - El texto de la etiqueta que se muestra en el campo.
 * @param {string} [props.helperText] - Texto de ayuda que se muestra debajo del campo.
 * @param {boolean} [props.disabled=false] - Si es `true`, el campo se deshabilita para impedir interacciones.
 * @param {boolean} [props.hidden=false] - Si es `true`, oculta el componente visualmente.
 * @param {number} [props.marginBottom=0] - Margen inferior opcional para el componente.
 * @param {string} [props.color='default'] - Color del texto de la etiqueta.
 * @param {boolean} [props.required=false] - Define si el campo es obligatorio.
 * @param {Array<Object>} [props.filePreviews=[]] - Lista de vistas previas de archivos seleccionados.
 * @param {function} props.setFilePreviews - Función para actualizar la lista de vistas previas.
 * @param {boolean} [props.multiple=false] - Si es `true`, permite seleccionar varios archivos.
 * @param {number} [props.maxImages=-1] - Número máximo de imágenes que se pueden cargar (-1 es sin límite).
 * @param {string} [props.accept="*"] - Tipos de archivos aceptados (ej. `"image/*"` para solo imágenes).
 * @param {number} [props.fileSizeMax=1] - Tamaño máximo del archivo en MB.
 * @param {boolean} [props.showBtnCamera=false] - Si es `true`, permite capturar una imagen desde la cámara.
 * @param {function} [props.handleUploadingFile] - Función para manejar el archivo durante la carga.
 * @param {boolean} [props.showDialogFileOrPhoto=false] - Si es `true`, permite abrir un diálogo para elegir entre archivo o foto.
 * @param {boolean} [props.caputureINE=false] - Si es `true`, permite abrir un diálogo para elegir entre archivo o foto.
 * @param {boolean} [props.zoomLeft=false] - Si es `true`, la imagen de Zoom saldra del lado izquierdo.
 *
 * @returns {JSX.Element} Componente `FileInput` renderizado.
 *
 * @example
 * <FileInput
 *    col={6}
 *    idName="img_photo"
 *    label="Subir archivo"
 *    filePreviews={imgPhoto}
 *    setFilePreviews={setImgPhoto}
 *    helperText="Seleccione una imagen"
 *    // handleUploadingFile={handleUpload}
 *    multiple={false}
 *    maxImages={1}
 *    accept={"image/*"}
 *    fileSizeMax={2}
 *    showBtnCamera={true}
 *    // showDialogFileOrPhoto={true}
 *    required
 * />
 */

const MB = 1048576; //2621440=2.5MB -- const MB = 1024 * 1024; // Constante para convertir a MB
const mySwal = withReactContent(Swal);

export const imageCompress = async (file: File | Blob | any, INE: boolean = false): Promise<File> => {
   return new Promise((resolve, reject) => {
      new Compressor(file, {
         quality: INE ? 0.3 : 0.6,
         convertSize: 2.5 * MB, // 3MB
         maxWidth: INE ? 1080 : 1920,
         maxHeight: INE ? 720 : 1080,
         success(result: any) {
            // Convertir el Blob a un File
            const compressedFile = new File([result], file.name, {
               type: result.type,
               lastModified: Date.now()
            });

            resolve(compressedFile); // Resolver la promesa con el archivo comprimido
         },
         error(err: any) {
            reject(err); // Rechazar la promesa si ocurre un error
         }
      });
   });
};

export const setObjImg = (img: string | null | undefined, setImg: (arg0: { file: { name: string }; dataURL: string }[]) => void) => {
   if (["", null, undefined].includes(img)) return setImg([]);
   // console.log("setObjImg --> ", img, " <--");
   const imgObj = {
      file: {
         name: `${img}`
      },
      dataURL: `${env.API_URL_IMG}/${img}`
   };
   setImg([imgObj]);
};

const FileInput: React.FC<FileInputProps> = ({
   xsOffset = null,
   // loading = false,
   col,
   idName,
   label,
   helperText,
   disabled,
   hidden,
   marginBottom,
   color,
   required,
   // styleInput = 1,
   filePreviews = [],
   setFilePreviews,
   multiple,
   maxImages = -1,
   accept = "*",
   fileSizeMax = 1, // en MB
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
   // const [filePreviews, setFilePreviews] = useState([]);
   const [ttShow, setTtShow] = useState("");
   const [fileSizeExceeded, setFileSizeExceeded] = useState(fileSizeMax * MB);
   const [confirmRemove, setConfirmRemove] = useState(true);
   const [fileInfo, setFileInfo] = useState(null);

   const inputFileRefMobile: any = useRef<HTMLInputElement | null>(null);
   const [openCameraFile, setOpenCameraFile] = useState(false);
   const [openDialog, setOpenDialog] = useState(false);

   const validationQuantityImages = () => {
      if (multiple) {
         if (maxImages != -1) {
            if (filePreviews.length >= maxImages) {
               console.log("maxImages", maxImages);
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
         if (!confirmRemove) return; // Solo permite la carga de archivos si la eliminación fue confirmada
         setConfirmRemove(false); // Resetear la confirmación después de la carga
         // else setConfirmRemove(true);

         setFilePreviews([]);
         // if (multiple) if (!validationQuantityImages()) return
         // Puedes manejar los archivos aceptados aquí y mostrar las vistas previas.

         if (acceptedFiles && acceptedFiles.length > 0) {
            acceptedFiles.forEach((file: File | Blob | any) => {
               // console.log("🚀 ~ acceptedFiles.forEach ~ file:", file);
               handleSetFile(file);
            });
         } else {
            console.log("No hay archivos en el acceptedFiles", acceptedFiles);
            Toast.Error("No hay archivos en el acceptedFiles");
         }
      },
      [confirmRemove, setFilePreviews]
   );
   const readFileAsDataURL = (file: File | Blob | any) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result);
         reader.onerror = (error) => reject(error);
         reader.readAsDataURL(file);
      });
   };

   const handleSetFile = async (file: File | Blob | any) => {
      // console.log("🚀 ~ handleSetFile ~ file:", file);
      // alert("entre al handleSetFile()");
      // console.log("🚀 ~ handleSetFile ~ file:", file);

      if (file.size >= fileSizeExceeded) {
         if (filePreviews.length == 0) setConfirmRemove(true);
         Toast.Info(`el archivo pesa más de ${fileSizeMax}MB, su calidad bajara.`);
         // return Toast.Info(`el archivo es demasiado pesado, intenta con un archivo menor a ${fileSizeMax}MB`);
      }
      if (!file.type.includes("image")) {
         if (filePreviews.length == 0) setConfirmRemove(true);
         return Toast.Info("el tipo de archivo no es una imagen.");
      }
      // alert("handleSetFile() ~ pase los filtros");

      try {
         // console.log("🚀 ~ handleSetFile ~ file:", file);
         let newFile = file;
         if (file.size >= fileSizeExceeded) {
            const fileCompressed = await imageCompress(file);
            // console.log("🚀 ~ handleSetFile ~ fileCompressed:", fileCompressed);
            newFile = fileCompressed;
         }

         // console.log("🚀 ~ handleSetFile ~ newFile:", newFile);
         const dataURL = await readFileAsDataURL(newFile);
         const preview = {
            original: file,
            file: newFile,
            dataURL
         };
         // console.log("🚀 ~ handleSetFile ~ preview:", preview);
         setFilePreviews([preview]);
         filePreviews = [preview];
         if (handleUploadingFile) handleUploadingFile(filePreviews);
      } catch (error) {
         console.error("Error al leer el archivo:", error);
         Toast.Error(`Error al leer el archivo: ${error}`);
      }
   };

   const handleGetFileCamera = async (camFile: { file: File; dataUrl: any } | File | Blob | any) => {
      try {
         // console.log("🚀 ~ handleGetFileCamera ~ camFile:", camFile);
         // alert("entre al handleGetFileCamera()");
         setFilePreviews([]);
         setConfirmRemove(true);

         // if (!confirmRemove) return; // Solo permite la carga de archivos si la eliminación fue confirmada
         setConfirmRemove(false); // Resetear la confirmación después de la carga

         // alert("voy al handleSetFile(file)");
         handleSetFile(camFile.file ? camFile.file : camFile);
      } catch (error) {
         console.log("🚀 ~ handleGetFileCamera ~ error:", error);
      }
   };
   const handleOnChangeFileInput = (e: { target: { files: string | any[] } } | any) => {
      // console.log("🚀 ~ handleOnChangeFileInput ~ e.target.files:", e.target.files);
      const file = e.target.files.length > 0 ? e.target.files[0] : null;
      // console.log("🚀 ~ handleOnChangeFileInput ~ file:", file);
      if (!file) return;
      // setFileInfo(file);
      // console.log("🚀 ~ handleOnChangeFileInput ~ fileInfo:", fileInfo);
      handleGetFileCamera(file);
   };

   // const simulateUpload = () => {
   //    // Simulamos la carga con un temporizador.
   //    setTimeout(() => {
   //       const progress = uploadProgress + 10;
   //       setUploadProgress(progress);

   //       if (progress < 100) {
   //          // Si no se ha alcanzado el 100% de progreso, simulamos más carga.
   //          simulateUpload();
   //       } else {
   //          // Cuando se completa la carga, restablecemos el progreso.
   //          setUploadProgress(0);
   //       }
   //    }, 1000);
   // };
   const handleRemoveImage = async (fileToRemove: File) => {
      if (disabled) return;
      // Filtra la lista de vistas previas para eliminar el archivo seleccionado.
      // console.log(filePreviews);
      // setFilePreviews((prevPreviews) => prevPreviews.filter((preview) => preview.file !== fileToRemove));
      mySwal.fire(QuestionAlertConfig(`¿Estas seguro de eliminar la imágen?`, "CONFIRMAR")).then(async (result) => {
         if (result.isConfirmed) {
            // formik.setValues(idName, null);
            // inputFileRefMobile.current.value = null;
            setFilePreviews([]);
            setConfirmRemove(true); // Establecer la confirmación para permitir la carga de nuevos archivos
         }
      });
      // console.log(filePreviews);
   };

   const { getRootProps, getInputProps } = useDropzone({
      onDrop
   });

   const handleMouseEnter = () => {
      setTtShow("tt_show");
   };
   const handleMouseLeave = () => {
      setTtShow("");
   };

   const handleOpenDialog = () => {
      console.log("🚀 ~ handleOpenDialog ~ handleOpenDialog:", handleOpenDialog);
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
      // console.log("🚀 ~ useEffect ~ filePreviews:", filePreviews);
      if (filePreviews.length == 0) setConfirmRemove(true);
      else setConfirmRemove(false);
   }, [idName, formik.values[idName], filePreviews]);

   // const RenderFileComponent = ({ file }) => {
   //    console.log("🚀 ~ RenderFileComponent ~ filePreviews:", filePreviews);
   //    return (
   //       <div>
   //          <h3>Detalles del Archivo</h3>
   //          <p>
   //             <strong>Nombre:</strong> {file.name}
   //          </p>
   //          <p>
   //             <strong>Tamaño:</strong> {(file.size / 1024).toFixed(2)} KB
   //          </p>
   //          <p>
   //             <strong>Tipo:</strong> {file.type}
   //          </p>
   //          <br />
   //          <h3>filePreviews</h3>
   //          <strong>dataURL:</strong> {filePreviews[0].dataURL} <br />
   //          <strong>file.name:</strong> {filePreviews[0].file.name}
   //       </div>
   //    );
   // };

   return (
      <>
         <Grid
            size={{ xs: 12, md: col }}
            offset={{ xs: xsOffset }}
            sx={{ display: hidden ? "none" : "flex", flexDirection: "column", alignItems: "center", mb: marginBottom ? marginBottom : 0 }}
         >
            <FormControl fullWidth sx={{}}>
               <Typography
                  mb={0}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  component={"label"}
                  htmlFor={idName}
                  variant="caption"
                  // color={color}
               >
                  <span className={`text-${color} ${isError && "text-error"}`}>{label}</span>
                  <span className={`${isError ? "text-error" : "text-gray-400"}`}>{required ? "Requerido" : "Opcional"}</span>
               </Typography>

               <Field name={idName} id={idName}>
                  {({ field, form }) => (
                     <>
                        <div className={"dropzone-container"} onClick={isMobile && showDialogFileOrPhoto ? handleOpenDialog : undefined}>
                           <div {...getRootProps({ className: color === "red" || isError ? "dropzone-error" : "dropzone border-primary" })}>
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
                                 />
                              ) : (
                                 <input
                                    {...getInputProps()}
                                    onChange={confirmRemove ? handleOnChangeFileInput : undefined}
                                    type={confirmRemove ? "file" : "text"}
                                    // ref={isMobile && showDialogFileOrPhoto ? inputFileRefMobile : null}
                                    multiple={multiple}
                                    accept={accept}
                                    disabled={disabled}
                                 />
                              )}

                              <p style={{ display: filePreviews.length > 0 ? "none" : "block", fontStyle: "italic" }} className="text-base-content">
                                 "Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos"
                              </p>

                              {/* Vista previa de la imagen o PDF */}
                              <aside className={`file-preview bg-base-200`} style={{ paddingBlock: 5 }}>
                                 {filePreviews.map((preview) => (
                                    <div key={preview.file.name} className={"preview-item"}>
                                       {preview.file.name.includes(".pdf") || preview.file.name.includes(".PDF") ? (
                                          <>
                                             <embed
                                                className={"preview-pdf"}
                                                src={preview.dataURL}
                                                type="application/pdf"
                                                width="100%"
                                                height="500px"
                                                onMouseEnter={handleMouseEnter}
                                                onMouseLeave={handleMouseLeave}
                                             />
                                             {preview.file.name !== "undefined" && (
                                                <embed
                                                   className={`tooltip_imagen ${zoomLeft ? "tooltip_imagen_right" : ""} ${ttShow}`}
                                                   src={preview.dataURL}
                                                   type="application/pdf"
                                                   width="50%"
                                                   height="80%"
                                                   onMouseEnter={handleMouseEnter}
                                                   onMouseLeave={handleMouseLeave}
                                                />
                                             )}
                                             <div
                                                className={"remove-pdf-button text-error-content"}
                                                onClick={(e) => {
                                                   e.preventDefault();
                                                   handleRemoveImage(preview.file);
                                                }}
                                                aria-disabled={disabled}
                                             >
                                                {!disabled && "Eliminar"}
                                             </div>
                                          </>
                                       ) : (
                                          <>
                                             <img className={"preview-img"} src={preview.dataURL} alt={preview.file.name} />
                                             {preview.file.name !== "undefined" && (
                                                <img
                                                   width={"50%"}
                                                   src={preview.dataURL}
                                                   alt={preview.file.name}
                                                   srcSet=""
                                                   className={`tooltip_imagen ${zoomLeft ? "tooltip_imagen_right" : ""} ${ttShow}`}
                                                   onMouseEnter={handleMouseEnter}
                                                   onMouseLeave={handleMouseLeave}
                                                />
                                             )}
                                             <div
                                                className={"remove-button hover:bg-base-300/5 text-base text-error/75 hover:text-error"}
                                                onClick={(e) => {
                                                   e.preventDefault();
                                                   handleRemoveImage(preview.file);
                                                }}
                                                onMouseEnter={handleMouseEnter}
                                                onMouseLeave={handleMouseLeave}
                                             >
                                                {!disabled && "Eliminar"}
                                             </div>
                                          </>
                                       )}
                                    </div>
                                 ))}
                              </aside>
                           </div>
                           <small style={{ marginTop: "-10px", fontStyle: "italic", fontSize: "11px", textAlign: "center" }} className="text-base-content">
                              Tamaño maximo del archivo soportado: <b>{fileSizeMax}MB MAX.</b>
                              {!disabled && showBtnCamera && <CameraInput getFile={handleGetFileCamera} caputureINE={caputureINE} />}
                              {/* {fileInfo && filePreviews.length > 0 && <RenderFileComponent file={fileInfo} />} */}
                           </small>
                        </div>
                        <Typography variant="body1" component="label" htmlFor={idName} ml={1}>
                           <span className={`label-text-alt ${!isError && !helperText && "text-transparent"} ${isError && "text-red-500 text-xs"}`}>
                              {isError ? error : helperText ? helperText : "."}
                           </span>
                        </Typography>
                     </>
                  )}
               </Field>
            </FormControl>
         </Grid>

         {isMobile && showDialogFileOrPhoto && (
            <DialogSelectMode open={openDialog} onClose={handleCloseDialog} onSelectFile={handleSelectFile} onSelectPhoto={handleSelectPhoto} />
         )}
      </>
   );
};
export default FileInput;
