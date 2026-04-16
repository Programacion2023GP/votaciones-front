import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
// import { Button, DialogComponent, Typography } from "../basics";
import icons from "../../constant/icons";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import cv from "@techstark/opencv-js";
import Swal from "sweetalert2";
import env from "../../constant/env";
import axios from "axios";
import DialogComponent from "../DialogComponent";
import { CameraRounded, PhotoCamera } from "@mui/icons-material";

const CameraInput = ({ getFile, caputureINE }) => {
   // const videoRef: any = useRef(null);
   // const canvasTakePictureRef: any = useRef(null);
   const processCanvasRef = useRef(null); // Canvas para procesamiento
   const [hasCamera, setHasCamera] = useState(true);
   const [cameraReady, setCameraReady] = useState(false);
   const [openCamera, setOpenCamera] = useState(false);
   // const [facingMode, setFacingMode] = useState("environment");
   const [photo, setPhoto]: any = useState(null);
   const [fullScreenDialog, useFullScreenDialog] = useState(true);
   const [pictureCounter, setPictureCounter] = useState(3);
   const [aligned, setAligned] = useState(false);
   const [isAnimating, setIsAnimating] = useState(false);

   const videoWidth = isMobile ? 1080 : 1920; //720 : 1080;
   const videoHeight = isMobile ? 780 : 1080; //1080 : 720;

   // Coordenadas y tamaño del recorte en proporción a la resolución del video
   const cropWidth = videoWidth * (isMobile ? 0.8 : 0.5); // 20% del ancho total
   const cropHeight = videoHeight * (isMobile ? 0.8 : 0.5); // 15% del alto total
   const cropX = videoWidth * 0.5; // 10% desde la izquierda
   const cropY = videoHeight * 0.5; // 7% desde la parte superior

   const videoRef = useRef<HTMLVideoElement | null>(null);
   const canvaRef = useRef<HTMLCanvasElement | null>(null);

   const [stream, setStream] = useState<MediaStream | null>(null);
   const [nameBtn, setNameBtn] = useState("CAMARA");
   const [showCanvas, setShowCanvas] = useState(false);
   const [showVideo, setShowVideo] = useState(false);

   // const cargarImagenYProcesarOCR = async (base64Image: string) => {
   //    try {
   //       const apiKey = env.API_KEY_ORC;
   //       const visionResponse = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
   //          requests: [
   //             {
   //                image: { content: base64Image },
   //                features: [{ type: "TEXT_DETECTION" }]
   //             }
   //          ]
   //       });

   //       const informacionINE = visionResponse.data.responses[0].textAnnotations;
   //       const IndexClaveElector = informacionINE.findIndex((OCR: any) => OCR.description === "ELECTOR");

   //       if (IndexClaveElector !== -1) {
   //          const voter_codeOCR = informacionINE[IndexClaveElector + 1]["description"];

   //          verificarVoterCode(voter_codeOCR);
   //       } else {
   //          Swal.fire({
   //             title: "Error",
   //             text: "No se encontró la clave de elector en la imagen.",
   //             icon: "error",
   //             confirmButtonText: "Aceptar"
   //          });
   //       }
   //    } catch (error) {
   //       Swal.fire({
   //          title: "Error",
   //          text: "No se encontró la clave de elector en la imagen.",
   //          icon: "error",
   //          confirmButtonText: "Aceptar"
   //       });
   //    }
   // };
   useEffect(() => {
      const detectCameraAndStartVideo = async () => {
         console.log("🚀 ~ detectCameraAndStartVideo ~ detectCameraAndStartVideo:");
         setShowVideo(true);
         setShowCanvas(false);
         const constraints = {
            video: isMobile
               ? { width: videoWidth, height: videoHeight, facingMode: { exact: "environment" } } // Cámara trasera en móviles
               : { width: videoWidth, height: videoHeight } // Cámara por defecto en escritorio
         };

         navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
               setStream(stream);
               const miVideo = videoRef.current;
               if (miVideo) {
                  miVideo.srcObject = stream;
                  miVideo.play();
                  setHasCamera(true);
               }
            })
            .catch((err) => {
               console.error("Error al acceder a la cámara:", err);
               setHasCamera(false);
            });
      };
      setIsAnimating(false);
      setPhoto(null);
      detectCameraAndStartVideo();

      return () => {
         setHasCamera(false);
      };
   }, [openCamera]);

   const tomarFoto = () => {
      setIsAnimating(true);
      setShowCanvas(true);
      setTimeout(() => {
         const video = videoRef.current;
         const canva = canvaRef.current;

         if (video && canva) {
            const videoWidth = video.videoWidth; // Obtener ancho real del video
            const videoHeight = video.videoHeight; // Obtener alto real del video

            // Definir el área de recorte (ejemplo: 40% del tamaño total)
            const cropWidth = videoWidth * (isMobile ? 0.8 : 0.5); // 40% del ancho total del video
            const cropHeight = videoHeight * (isMobile ? 0.8 : 0.5); // 40% del alto total del video
            const cropX = (videoWidth - cropWidth) / 2; // Centrar en X
            const cropY = (videoHeight - cropHeight) / 2; // Centrar en Y

            // Ajustar el tamaño del canvas
            canva.width = cropWidth;
            canva.height = cropHeight;
            const context = canva.getContext("2d");

            if (context) {
               if (caputureINE) {
                  // Capturar solo la región del video que se marcó visualmente
                  context.drawImage(
                     video,
                     cropX,
                     cropY,
                     cropWidth,
                     cropHeight, // Recorte desde el video
                     0,
                     0,
                     cropWidth,
                     cropHeight // Dibujado en el canvas
                  );
               } else context.drawImage(video, 0, 0, canva.width, canva.height);

               const dataUrl = canva.toDataURL("image/jpeg", 1.0).split(",")[1];
               // cargarImagenYProcesarOCR(dataUrl);
               fetch(`data:image/jpeg;base64,${dataUrl}`)
                  .then((res) => res.blob())
                  .then((blob) => {
                     const file = new File([blob], "random.jpg", { type: "image/jpeg" });
                     setPhoto("photo", file);
                     if (getFile) getFile({ file, dataUrl }, true);
                  });
               // const file = new File([dataURLtoBlob(dataUrl)], "photo.jpeg", { type: "image/jpeg" });
               setShowVideo(false);

               if (stream) {
                  stream.getTracks().forEach((track) => track.stop());
                  setStream(null);
               }

               if (videoRef.current) {
                  videoRef.current.srcObject = null;
               }

               setTimeout(() => setIsAnimating(false), 500);
               setTimeout(() => {
                  // setPhoto(null);
                  // setShowCanvas(false);
                  setShowVideo(false);
                  setShowCanvas(true);
                  setOpenCamera(false);
               }, 1500);
            } else {
               console.error("No se pudo obtener el contexto 2D del canvas.");
            }
         } else {
            console.error("El video o el canvas no están disponibles.");
         }
      }, 300);
   };

   return (
      <div className="">
         {hasCamera ? (
            <>
               <Button variant="contained" size="small" onClick={() => setOpenCamera(true)}>
                  <PhotoCamera fontSize="medium" /> &nbsp; Abrir cámara
               </Button>
               <DialogComponent
                  open={openCamera}
                  setOpen={setOpenCamera}
                  modalTitle={"CÁMARA"}
                  fullScreen={fullScreenDialog}
                  height={undefined}
                  formikRef={undefined}
                  textBtnSubmit={undefined}
               >
                  <Box
                     sx={{
                        backgroundColor: "black",
                        display: "flex",
                        justifyContent: "center",
                        width: fullScreenDialog ? "100%" : "75%",
                        maxHeight: fullScreenDialog ? "100%" : "90%",
                        border: `5px solid`,
                        borderRadius: "15px"
                     }}
                  >
                     <div className="flex flex-col gap-6">
                        {showVideo && (
                           <div style={{ position: "relative", width: "100%", height: "100%" }}>
                              <video
                                 ref={videoRef}
                                 autoPlay
                                 playsInline
                                 style={{
                                    // position: caputureINE ? "absolute" : "relative",
                                    opacity: 1,
                                    height: "100%",
                                    width: "100%",
                                    borderRadius: "15px"
                                 }}
                              />

                              <CameraRounded
                                 className={`text-slate-800 ${isAnimating ? "photo-animation" : ""}`}
                                 size="large"
                                 sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 100,
                                    display: `${isAnimating ? "block" : "none"}`
                                 }}
                              />
                              {caputureINE && (
                                 <>
                                    <div
                                       className="rounded-lg"
                                       style={{
                                          position: "absolute",
                                          top: `${(cropY / videoHeight) * 100}%`,
                                          left: `${(cropX / videoWidth) * 100}%`,
                                          width: `${(cropWidth / videoWidth) * 100}%`,
                                          height: `${(cropHeight / videoHeight) * 100}%`,
                                          border: "10px solid red",
                                          transform: "translate(-50%, -50%)"
                                       }}
                                    />
                                    <Typography
                                       className={`z-20 ${
                                          aligned ? "text-success" : "text-warning "
                                       } absolute bg-slate-800 p-2 top-0 left-1/2 transform -translate-x-1/2`}
                                    >
                                       {aligned ? "INE correctamente alineada" : "Por favor, alinee la INE dentro del marco"}
                                    </Typography>
                                    <Typography variant="h1" className={`z-50 text-success absolute bg-slate-800 mt-10`}>
                                       {aligned && pictureCounter}
                                    </Typography>
                                 </>
                              )}
                           </div>
                        )}
                        {showCanvas && <canvas ref={canvaRef} style={{ width: "100%", height: "100%" }}></canvas>}
                        {showVideo && <Button onClick={tomarFoto}>TOMAR FOTO</Button>}
                        {/* {!showVideo && <Button onClick={verCamara}>{nameBtn}</Button>} */}
                     </div>
                  </Box>
               </DialogComponent>
            </>
         ) : (
            <Typography variant="caption">No se detectó una cámara.</Typography>
         )}
      </div>
   );
};

export default CameraInput;
