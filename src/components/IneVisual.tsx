import React from "react";
import icons from "./../constant/icons";

const IneVisual = () => (
   <div className="space-y-2 animate-fade-up">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-guinda">
         <icons.Lu.LuArrowRight size={14} />
         Localiza tu <strong>Clave de Elector</strong> en tu INE
      </div>
      <div className="rounded-xl overflow-hidden border-2 border-guinda/15 shadow-md">
         <div className="h-1.5 bg-gradient-to-r from-guinda to-guinda-dark" />
         <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white p-5 relative overflow-hidden">
            <span className="absolute top-2 right-3 text-xl">🇲🇽</span>
            <div className="flex gap-4 items-start">
               <div className="w-14 h-20 bg-white/10 rounded border-2 border-white/20 flex items-center justify-center text-2xl">👤</div>
               <div className="flex-1">
                  <div className="text-[0.65rem] uppercase tracking-wider text-white/60">INSTITUTO NACIONAL ELECTORAL</div>
                  <div className="font-playfair text-lg font-bold mb-2">CIUDADANO EJEMPLO</div>
                  <div className="text-[0.62rem] uppercase text-white/50">DOMICILIO</div>
                  <div className="text-xs">C. REPÚBLICA MX 100, COL. CENTRO</div>
                  <div className="mt-2 p-2 border border-dashed border-guinda/80 rounded bg-guinda/40">
                     <div className="text-[0.62rem] uppercase text-white/80">◀ CLAVE DE ELECTOR</div>
                     <div className="font-mono text-sm font-bold">EJMPLO80010112H600</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
);

export default IneVisual;
