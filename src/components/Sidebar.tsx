import React from "react";
import { NavLink } from "react-router-dom";
import { env, icons } from "../constant";
import useAuthData from "../hooks/useAuthData";

// Definir los items con permisos por rol
const allNavItems = [
   { to: "/registro", label: "Registrar Participación", icon: icons.Lu.LuClipboardList, section: "Principal", roles: [1, 2, 3] },
   { to: "/boleta", label: "Boleta", icon: icons.Gi.GiPaperTray, section: "Principal", roles: [1, 2, 3] },
   { to: "/usuarios", label: "Usuarios", icon: icons.Lu.LuUsers, section: "Catálogos", roles: [1, 2] },
   { to: "/casillas", label: "Casillas", icon: icons.Lu.LuMapPin, section: "Catálogos", roles: [1, 2] },
   { to: "/proyectos", label: "Proyectos", icon: icons.Lu.LuFolderOpen, section: "Catálogos", roles: [1, 2] },
   { to: "/participaciones", label: "Participaciones", icon: icons.Gi.GiBoxingGlove, section: "Catálogos", roles: [1, 2, 4] },
   { to: "/estadisticas", label: "Participaciones y Estadísticas", icon: icons.Lu.LuChartBar, section: "Resultados", roles: [1, 2, 4] },
   { to: "/listado-casillas", label: "Listadoo de casillas Pública", icon: icons.Lu.LuList, section: "Resultados", roles: [1, 2, 4] },
   { to: "/listado-proyectos", label: "Listadoo de proyectos Pública", icon: icons.Lu.LuList, section: "Resultados", roles: [1, 2, 4] },
   { to: "/listado-resultados", label: "Listadoo de resultados Pública", icon: icons.Lu.LuList, section: "Resultados", roles: [1, 2] }
];

const Sidebar = () => {
   const { persist } = useAuthData();
   const userRole = persist?.auth?.role_id ?? 0;

   // Filtrar según el rol
   const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

   // Obtener secciones únicas de los items filtrados
   const sections = [...new Set(navItems.map((i) => i.section))];

   return (
      <>
         <div className="drawer-side is-drawer-close:overflow-visible">
            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="flex min-h-full flex-col items-start bg-negro is-drawer-close:w-18 is-drawer-open:w-64">
               <ul className="menu w-full grow">
                  <div className="sidebar-logo">
                     <div className="logo-icon">📣</div>
                     <div className="is-drawer-close:hidden">
                        <div className="logo-text">Tu Voz Transforma</div>
                        <div className="logo-sub">Sistema de Votaciones GP</div>
                     </div>
                  </div>
                  <div className="divider"></div>

                  {sections.map((sec) => (
                     <div key={sec}>
                        <div className="nav-section-label is-drawer-close:hidden">{sec}</div>
                        {navItems
                           .filter((item) => item.section === sec)
                           .map((item) => (
                              <NavLink
                                 key={item.to}
                                 to={item.to}
                                 className={({ isActive }) =>
                                    `is-drawer-close:tooltip is-drawer-close:tooltip-right nav-item ${
                                       isActive ? "active" : "text-gris hover:bg-guinda/5 hover:text-guinda"
                                    } is-drawer-close:pl-0!`
                                 }
                                 data-tip={item.label}
                              >
                                 <item.icon className="nav-icon is-drawer-close:ml-4!" size={18} />
                                 <span className="nav-label is-drawer-close:hidden">{item.label}</span>
                                 {item.label === "Participaciones y Estadísticas" && <span className="nav-badge is-drawer-close:hidden">{0}</span>}
                              </NavLink>
                           ))}
                     </div>
                  ))}

                  <div className="sidebar-footer is-drawer-close:hidden">
                     Sistema de Votaciones v {env.VERSION}
                     <br />© 2026 Gómez Palacio
                  </div>
                  <div className="sidebar-footer is-drawer-open:hidden is-drawer-close:text-center! is-drawer-close:px-0.5!">v {env.VERSION}</div>
               </ul>
            </div>
         </div>
      </>
   );
};

export default Sidebar;
