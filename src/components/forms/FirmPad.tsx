import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
// import Input from "./Input";
import { base64ToFile } from "../../utils/Formats.js";
import { imageCompress } from "./FileInput";
import { Button, Grid, SxProps } from "@mui/material";
import DialogComponent from "../DialogComponent";
import { FormikValues, useFormikContext } from "formik";

// const saveFirm = async (data) => {
//    setIsLoading(true);
//    situation.img_firm_requester = data;
//    const res = await saveFirmRequester(situation);
//    // console.log('🚀 ~ handleClickLogout ~ res:', res);
//    if (!res) return setIsLoading(false);
//    if (res.status_code !== 200) {
//       setIsLoading(false);
//       return Toast.Customizable(res.alert_text, res.alert_icon);
//    }
//    setOpenDialogFirm(false);
//    await refreshSituations();
//    setIsLoading(false);
//    if (res.alert_text) Toast.Success(res.alert_text);
//    setIsLoading(false);
// };

interface FirmPadProps {
   xsOffset?: number | null;
   // loading?: true | false; // Indica que la información se esta procesando
   col?: number;
   sizeCols?: {
      xs: number;
      sm: number;
      md: number;
   };
   idName: string;
   label: string;
   variant?: "filled" | "outlined" | "standard"; //"classic" | "floating" | "icon-start-inside" | "icon-end-inside" | "start-inside" | "end-inside"; // Estilo del input
   size?: "small" | "medium";
   className?: string;
   sx?: SxProps<Theme> | undefined;
   hidden?: boolean;
   mb?: number;
   onSave: (signatureData: File) => void;
   fullWidth?: boolean;
   width?: number;
   height?: number;
   penColor?: string;
   penWidth?: number;
   inDialog?: boolean;
}

const FirmPad: React.FC<FirmPadProps> = ({
   xsOffset = null,
   col = 12,
   sizeCols = { xs: 12, sm: 12, md: col }, // 97% Altura máxima del formulario
   // loading,
   idName,
   label,
   variant = "outlined", // Estilo del input
   size = "medium",
   className = "",
   sx,
   hidden = false,
   mb = 0,
   onSave,
   fullWidth,
   width = 400,
   height = 200,
   penColor = "#0000FF",
   penWidth = 2,
   inDialog = true
}) => {
   const sigCanvas = useRef<SignatureCanvas | null>(null);
   const [currentColor, setCurrentColor] = useState(penColor);
   const [currentWidth, setCurrentWidth] = useState(penWidth);
   const [isEmpty, setIsEmpty] = useState(true);
   const [openDialogFirm, setOpenDialogFirm] = useState(false);
   const [firmFile, setFirmFile] = useState(null);
   const [signed, setSigned] = useState(false);
   const formik = useFormikContext<FormikValues>();

   const clearSignature = () => {
      sigCanvas.current?.clear();
      setIsEmpty(true);
      setFirmFile(null);
   };

   const getTrimmedCanvas = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      let top = height,
         bottom = 0,
         left = width,
         right = 0;

      for (let y = 0; y < height; y++) {
         for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 0) {
               if (x < left) left = x;
               if (x > right) right = x;
               if (y < top) top = y;
               if (y > bottom) bottom = y;
            }
         }
      }

      const trimmedWidth = right - left;
      const trimmedHeight = bottom - top;
      if (trimmedWidth <= 0 || trimmedHeight <= 0) return canvas;

      const trimmedCanvas = document.createElement("canvas");
      trimmedCanvas.width = trimmedWidth;
      trimmedCanvas.height = trimmedHeight;
      const trimmedCtx = trimmedCanvas.getContext("2d");
      if (!trimmedCtx) return canvas;

      trimmedCtx.putImageData(ctx.getImageData(left, top, trimmedWidth, trimmedHeight), 0, 0);
      return trimmedCanvas;
   };

   const saveSignature = async () => {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
      setSigned(true);
      const originalCanvas = sigCanvas.current.getCanvas();
      const trimmedCanvas = getTrimmedCanvas(originalCanvas);
      const signatureDataBase64String = trimmedCanvas.toDataURL("image/png");

      // Mostrar inmediatamente la firma en la interfaz
      setFirmFile(signatureDataBase64String);

      // Convertir a File, comprimir y enviar al callback
      const file = await base64ToFile(signatureDataBase64String, "firm.png");
      const fileCompress = await imageCompress(file);
      if (onSave) onSave(fileCompress);

      console.log("🚀 ~ saveSignature ~ fileCompress:", fileCompress);
      // Actualizar el valor en Formik
      formik?.setFieldValue(idName, fileCompress);
      console.log("🚀 ~ saveSignature ~ formik:", formik);

      // limpiar el canvas y cerrar el diálogo
      // clearSignature();
      setOpenDialogFirm(false);
   };

   const Content = () => (
      <div className="flex flex-col items-center w-full h-full p-2 mb-2 bg-white border shadow-md rounded-xl">
         <h1 className="mb-2 text-lg font-semibold">Firma Digital</h1>
         <div className="w-full border-2 border-gray-300 rounded-md h-5/6">
            <SignatureCanvas
               ref={sigCanvas}
               penColor={currentColor}
               minWidth={currentWidth}
               maxWidth={currentWidth}
               canvasProps={{ className: "w-full h-full border border-gray-400" }}
               onBegin={() => setIsEmpty(false)}
               onEnd={() => setIsEmpty(false)}
            />
         </div>
         <div className="flex gap-4 mt-4">
            <h3>Color</h3>
            <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} className="w-20 p-1 border rounded-md input" />
            <h3>Grosor</h3>
            <div className="w-full max-w-xs mr-5">
               <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={currentWidth}
                  onChange={(e) => setCurrentWidth(Number(e.target.value))}
                  className="w-full range active:range-primary range-xs"
               />
               <div className="flex justify-between px-2.5 -mt-1 text-xs">
                  <span>|</span>
                  <span>|</span>
                  <span>|</span>
                  <span>|</span>
                  <span>|</span>
               </div>
               <div className="flex justify-between px-2.5 mt-0 text-xs">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
               </div>
            </div>
            <Button sx={{ py: 0, my: 0, px: 4 }} onClick={clearSignature} variant="outlined" disabled={isEmpty}>
               LIMPIAR
            </Button>
            <Button
               sx={{ py: 0, my: 0, px: 4 }}
               onClick={() => {
                  saveSignature();
                  setOpenDialogFirm(false);
               }}
               variant="contained"
               disabled={isEmpty}
            >
               GUARDAR
            </Button>
         </div>
      </div>
   );

   // useEffect(() => {
   //    clearSignature();
   //    setSigned(false);
   //    setFirmFile(null);
   // }, []);

   return (
      <>
         {inDialog ? (
            <>
               <Grid size={sizeCols} offset={{ xs: xsOffset }} hidden={hidden} mb={mb} px={{}} sx={sx} /* className={`pt-2 mb-[${mb}]`} */>
                  <Button
                     className="btn hover:cursor-pointer"
                     variant="outlined"
                     color={!signed ? "primary" : "success"}
                     sx={{ fontWeight: "bold", fontSize: "large" }}
                     onClick={() => {
                        clearSignature();
                        setSigned(false);
                        setFirmFile(null);
                        setOpenDialogFirm(true);
                     }}
                     fullWidth={signed ? true : fullWidth}
                  >
                     {!signed ? "Dibujar Firmar" : "Firmado"}
                  </Button>
                  {/* <input type="file" name={idName} id={idName} value={formik.values[idName]} /> */}
                  {firmFile ? <img src={firmFile} alt="firma" className="mt-2 p-1 rounded-md border" style={{ maxWidth: "100%", maxHeight: 140 }} /> : null}
               </Grid>
               <DialogComponent
                  open={openDialogFirm}
                  setOpen={setOpenDialogFirm}
                  fullScreen={true}
                  modalTitle=""
                  height={"100vh"}
                  formikRef={undefined}
                  textBtnSubmit={undefined}
               >
                  <Content />
               </DialogComponent>
            </>
         ) : (
            <Content />
         )}
      </>
   );
};

export default FirmPad;
