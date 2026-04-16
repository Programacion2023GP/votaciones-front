import React from "react";
import { NavLink } from "react-router-dom";
import { env, icons } from "../constant";

const navItems = [
   { to: "/registro", label: "Registrar Participación", icon: icons.Lu.LuClipboardList, section: "Principal" },
   { to: "/boleta", label: "Boleta", icon: icons.Gi.GiPaperTray, section: "Principal" },
   { to: "/usuarios", label: "Usuarios", icon: icons.Lu.LuUsers, section: "Catálogos" },
   { to: "/casillas", label: "Casillas", icon: icons.Lu.LuMapPin, section: "Catálogos" },
   { to: "/estadisticas", label: "Participaciones y Estadísticas", icon: icons.Lu.LuChartBar, section: "Catálogos" }
];
const sections = [...new Set(navItems.map((i) => i.section))];

const Sidebar = (
   {
      /* open, onClose */
   }
) => {
   return (
      <>
         <div className="drawer-side is-drawer-close:overflow-visible">
            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="flex min-h-full flex-col items-start bg-negro is-drawer-close:w-18 is-drawer-open:w-64 ">
               {/* Sidebar content here */}
               <ul className="menu w-full grow">
                  <div className="sidebar-logo">
                     <div className="logo-icon">📣</div>
                     <div className="is-drawer-close:hidden">
                        <div className="logo-text">Sistema de Votaciones</div>
                        <div className="logo-sub">Sistema de Votaciones GP</div>
                     </div>
                  </div>
                  <div className="divider"></div>

                  {sections.map((sec) => (
                     <div key={sec}>
                        <div className="nav-section-label is-drawer-close:hidden">{sec}</div>
                        {navItems
                           .filter((i) => i.section === sec)
                           .map((item) => (
                              <NavLink
                                 key={item.to}
                                 to={item.to}
                                 // onClick={onClose}
                                 className={({ isActive }) =>
                                    `is-drawer-close:tooltip is-drawer-close:tooltip-right nav-item ${
                                       isActive ? "active" : "text-gris hover:bg-guinda/5 hover:text-guinda"
                                    }
                                    is-drawer-close:pl-0!`
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
         {/* {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
         <aside
            className={`fixed top-[62px] left-0 bottom-0 w-[260px] bg-white border-r border-gray-100 z-40 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
         >
            <nav className="flex flex-col p-4 gap-1">
               <div className="text-[0.65rem] uppercase tracking-wider text-gris-claro font-bold px-4 pb-2">Módulos</div>
               {navItems.map((item) => (
                  <NavLink
                     key={item.to}
                     to={item.to}
                     onClick={onClose}
                     className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-l-full rounded-r-full text-sm font-semibold transition ${
                           isActive
                              ? "bg-guinda/10 text-guinda before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-guinda before:rounded-r"
                              : "text-gris hover:bg-guinda/5 hover:text-guinda"
                        }`
                     }
                  >
                     <item.icon size={18} />
                     <span>{item.label}</span>
                  </NavLink>
               ))}
            </nav>
         </aside> */}
      </>
   );
};

export default Sidebar;
