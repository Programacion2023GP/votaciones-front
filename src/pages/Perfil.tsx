import React from "react";
import { env } from "../constant";
import useAuthData from "../hooks/useAuthData";

const Perfil: React.FC = () => {
   // const user = useStore((state) => state.user);
   const userAuth = useAuthData().persist.auth;

   if (!userAuth) return null; // Should not happen as route is protected

   return (
      <>
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Cuenta <span>›</span> <span>Mi Perfil</span>
               </div>
               <h1 className="page-title">Mi Perfil</h1>
               <p className="page-subtitle">Información del funcionario electoral</p>
            </div>
         </div>

         <div className="profile-header-card">
            <div className="profile-avatar-big">{userAuth?.id}</div>
            <div className="profile-info">
               <div className="profile-name">{userAuth?.username}</div>
               <div className="profile-cargo">{userAuth?.role_name}</div>
               <div className="profile-casilla">🏛️ {userAuth?.casilla_location}</div>
            </div>
         </div>

         <div className="grid-2">
            <div className="card">
               <div className="card-header">
                  <span className="card-title-text">👤 Datos Personales</span>
               </div>
               <div className="card-body">
                  {[
                     ["Nombre de usuario", userAuth?.username],
                     ["Role", userAuth?.role_name],
                     ["Correo electrónico", userAuth?.email]
                     // ["Estado", userAuth?.estado],
                     // ["Municipio", userAuth?.municipio]
                  ].map(([label, val]) => (
                     <div key={label} className="info-row">
                        <span className="info-row-label">{label}</span>
                        <span className="info-row-val">{val}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="card">
               <div className="card-header">
                  <span className="card-title-text">🏛️ Asignación Electoral</span>
               </div>
               <div className="card-body">
                  {[
                     ["Área", userAuth?.casilla_type],
                     ["Distrito", userAuth?.casilla_district],
                     ["Perímetro", userAuth?.casilla_perimeter],
                     ["Lugar", userAuth?.casilla_place],
                     ["Ubicación", userAuth?.casilla_location],
                     ["Periodo", "Proceso Electoral 2026"],
                     ["Tipo de casilla", "Básica"]
                  ].map(([label, val]) => (
                     <div key={label} className="info-row">
                        <span className="info-row-label">{label}</span>
                        <span className="info-row-val">{val}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="card mt-4">
            <div className="card-header">
               <span className="card-title-text">ℹ️ Información del Sistema</span>
            </div>
            <div className="card-body">
               <div className="grid-3">
                  {[
                     ["Versión del sistema", `v ${env.VERSION}`],
                     ["Última sesión", new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })],
                     ["Navegador", navigator.userAgent.split(" ").slice(-1)[0] || "Desconocido"]
                  ].map(([label, val]) => (
                     <div key={label}>
                        <div className="text-[11px] uppercase tracking-wider font-bold text-gris mb-1">{label}</div>
                        <div className="text-sm font-bold text-negro">{val}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </>
   );
};

export default Perfil;
