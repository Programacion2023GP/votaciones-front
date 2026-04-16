import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { Box, Button, Typography } from "@mui/material";
import DialogComponent from "../DialogComponent";
import { CameraRounded, PhotoCamera } from "@mui/icons-material";

interface EvidenceCaptureProps {
   idName: string;
   label: string;
   required?: boolean;
   helperText?: string;
   getFile?: (file: File | null) => void;
}

const EvidenceCapture: React.FC<EvidenceCaptureProps> = ({ idName, label, required = false, helperText, getFile }) => {
   const videoRef = useRef<HTMLVideoElement | null>(null);
   const canvasRef = useRef<HTMLCanvasElement | null>(null);
   const [photo, setPhoto] = useState<string | null>(null);
   const [stream, setStream] = useState<MediaStream | null>(null);
   const [openCamera, setOpenCamera] = useState(false);
   const [showVideo, setShowVideo] = useState(false);
   const [showCanvas, setShowCanvas] = useState(false);
   const [hasCamera, setHasCamera] = useState(true);

   const videoWidth = isMobile ? 1080 : 1920;
   const videoHeight = isMobile ? 780 : 1080;

   const startCamera = async () => {
      try {
         const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: isMobile ? { width: videoWidth, height: videoHeight, facingMode: "environment" } : { width: videoWidth, height: videoHeight }
         });
         setStream(mediaStream);
         if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
         }
         setShowVideo(true);
         setShowCanvas(false);
      } catch (error) {
         console.error("No se pudo acceder a la cámara:", error);
         setHasCamera(false);
      }
   };

   const capturePhoto = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
         canvas.width = 300;
         canvas.height = 200;
         const context = canvas.getContext("2d");
         if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/png");
            setPhoto(dataUrl);

            // Crear archivo tipo File
            fetch(dataUrl)
               .then((res) => res.blob())
               .then((blob) => {
                  const file = new File([blob], "evidence.png", { type: "image/png" });
                  if (getFile) getFile(file);
               });

            // Detener cámara
            if (stream) {
               stream.getTracks().forEach((track) => track.stop());
               setStream(null);
            }
            setShowVideo(false);
            setShowCanvas(true);
            setOpenCamera(false);
         }
      }
   };

   useEffect(() => {
      return () => {
         if (stream) {
            stream.getTracks().forEach((track) => track.stop());
         }
      };
   }, [stream]);

   return (
      <div className="mb-4">
         <label htmlFor={idName} className="font-semibold">
            {label} {required && "*"}
         </label>
         <div>
            {!photo ? (
               <>
                  <Button
                     variant="contained"
                     size="small"
                     startIcon={<PhotoCamera />}
                     onClick={() => {
                        setOpenCamera(true);
                        startCamera();
                     }}
                  >
                     Abrir Cámara
                  </Button>

                  <DialogComponent open={openCamera} setOpen={setOpenCamera} modalTitle="Captura de Evidencia" fullScreen={isMobile}>
                     <Box
                        sx={{
                           backgroundColor: "black",
                           display: "flex",
                           justifyContent: "center",
                           alignItems: "center",
                           width: "100%",
                           height: "100%",
                           borderRadius: 2,
                           p: 2
                        }}
                     >
                        {showVideo && <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: "10px" }} />}
                        {showCanvas && <canvas ref={canvasRef} style={{ width: "100%" }} />}
                     </Box>
                     {showVideo && (
                        <Button variant="contained" color="success" onClick={capturePhoto}>
                           <CameraRounded /> Tomar Foto
                        </Button>
                     )}
                  </DialogComponent>
               </>
            ) : (
               <img src={photo} alt="Evidencia" width="300" height="200" className="border" />
            )}
         </div>
         {helperText && <Typography variant="caption">{helperText}</Typography>}
         <input type="hidden" name={idName} value={photo || ""} />
      </div>
   );
};

export default EvidenceCapture;
