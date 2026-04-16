import React from "react";
import { icons } from "../../constant";
import { BoletaStep, STEP_LABELS, type ProgressBarProps } from "./boleta.types";

const STEPS = [BoletaStep.Identidad, BoletaStep.Seleccion, BoletaStep.Revision, BoletaStep.Exito];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => (
   <div className="boleta-progress">
      {STEPS.map((stepValue, i) => (
         <React.Fragment key={stepValue}>
            <div className={`progress-step ${currentStep === stepValue ? "active" : currentStep > stepValue ? "done" : ""}`}>
               <div className="progress-step-circle">{currentStep > stepValue ? <icons.Lu.LuCheck size={15} color="#fff" /> : i + 1}</div>
               <div className="progress-step-label">{STEP_LABELS[stepValue]}</div>
            </div>
            {i < STEPS.length - 1 && (
               <div className="progress-line">
                  <div className="progress-line-fill" style={{ width: currentStep > stepValue ? "100%" : "0%" }} />
               </div>
            )}
         </React.Fragment>
      ))}
   </div>
);

export default ProgressBar;
