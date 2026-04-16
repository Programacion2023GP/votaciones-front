import React, { useState, useMemo } from "react";
import useUsersData from "../../hooks/useUsersData";
import useRolesData from "../../hooks/useRolesData";
import UserTable from "./table.users";
import UserForm from "./form.users";

const Usuarios: React.FC = () => {
   const userContext = useUsersData();
   const roleContext = useRolesData();
   // const [search, setSearch] = useState("");
   // const [filter, setFilter] = useState<"todas" | "activas" | "inactivas">("todas");

   // // Filtrar y buscar
   // const filtered = useMemo(() => {
   //    let filteredList = userContext.items.filter((c) => {
   //       const s = search.toLowerCase();
   //       const match =
   //          c.username.toLowerCase().includes(s) ||
   //          (c.email && c.email.includes(s)) ||
   //          (c.role_name && c.role_name.toLowerCase().includes(s)) ||
   //          (c.casilla_location && c.casilla_location.toLowerCase().includes(s));
   //       if (!match) return false;
   //       if (filter === "activas") return c.active;
   //       if (filter === "inactivas") return !c.active;
   //       return true;
   //    });
   //    return filteredList;
   // }, [userContext.items, search, filter]);

   // Manejar envío (agregar o editar)

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Catálogos <span>›</span> <span>{userContext.pluralName}</span>
               </div>
               <h1 className="page-title">{userContext.pluralName}</h1>
               <p className="page-subtitle">19 de abril - 8:00 a 16:00 h.</p>
            </div>
            <button className="btn-secondary" onClick={() => userContext.setOpen()}>
               {userContext.open ? "✕ Cancelar" : "+ Nuevo Centro"}
            </button>
         </div>

         <UserForm />

         <UserTable />
      </div>
   );
};

export default Usuarios;
