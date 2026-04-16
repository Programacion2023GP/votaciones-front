import React from "react";
import icons from "./../constant/icons";

const DocVisual: React.FC = () => (
   <div className="space-y-2 animate-fade-up">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-guinda">
         <icons.Lu.LuArrowRight size={14} />
         Ingresa tu <strong>CURP</strong> tal como aparece en tu documento
      </div>
      <div className="rounded-xl overflow-hidden border-2 border-guinda/15 shadow-md">
         <div className="bg-gradient-to-br from-[#f5f1ee] to-[#ede8e3] p-5 flex gap-4 items-start">
            <div className="w-14 h-14 rounded-full border-3 border-guinda flex items-center justify-center text-2xl bg-guinda/10">📋</div>
            <div className="flex-1">
               <div className="font-playfair text-guinda-dark font-bold mb-2">DOCUMENTO OFICIAL MEXICANO</div>
               <div className="flex gap-2 items-center mb-1">
                  <span className="bg-guinda text-white text-[0.65rem] px-2 py-0.5 rounded uppercase font-bold">Folio</span>
                  <div className="h-3 bg-gris-claro/30 flex-1 rounded" />
               </div>
               <div className="flex gap-2 items-center mb-2">
                  <span className="bg-guinda text-white text-[0.65rem] px-2 py-0.5 rounded uppercase font-bold">CURP</span>
                  <div className="h-3 bg-gris-claro/30 flex-1 rounded" />
               </div>
               <div className="mt-2 p-2 border border-dashed border-guinda rounded bg-guinda/10">
                  <div className="text-[0.65rem] uppercase text-guinda-dark font-bold">◀ CURP</div>
                  <div className="font-mono font-bold text-guinda-dark">EJMP800101HDFRRN00</div>
               </div>
            </div>
         </div>
      </div>
   </div>
);

export default DocVisual;
