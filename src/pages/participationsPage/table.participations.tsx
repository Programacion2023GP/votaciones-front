// pages/Participations/ParticipationsTable.tsx
import React from "react";
import CustomButton from "../../components/customButtom";
import CustomTable, { renderColActive } from "../../components/CustomTable";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useAuthData from "../../hooks/useAuthData";
import useParticipationsData from "../../hooks/useParticipationsData";
import { formatDatetime } from "../../utils/helpers";

const ParticipationsTable: React.FC = () => {
   const authContext = useAuthData();
   const participationsContext = useParticipationsData();

   const handleClickEdit = (row: any) => {
      participationsContext.handleChangeItem(row);
      participationsContext.setOpen();
   };

   const handleClickDelete = (row: any) => {
      participationsContext.removeItemData(row);
   };

   return (
      <CustomTable
         data={participationsContext.items}
         columns={[
            {
               headerName: "Tipo",
               field: "type",
               renderField: (value) => {
                  const isINE = value === "INE";
                  return (
                     <div className="w-full text-center">
                        <span className={`badge ${isINE ? "badge-ine" : "badge-doc"}`}>{isINE ? "🪪 INE" : "📄 Carta Identidad"}</span>
                     </div>
                  );
               }
            },
            {
               headerName: "CURP",
               field: "curp"
            },
            {
               headerName: "Usuario / Casilla",
               field: "user_id",
               renderField: (_, row) => {
                  // Idealmente aquí obtendrías el nombre de la casilla desde el store de usuarios
                  // Por simplicidad, mostramos el user_id y la casilla del usuario autenticado
                  // Puedes mejorar esto si tienes una relación en el backend
                  return (
                     <span>
                        {authContext.persist?.auth?.username} - {authContext.persist?.auth?.casilla_place || "Sin casilla"}
                     </span>
                  );
               }
            },
            {
               headerName: "Fecha Registro",
               field: "created_at",
               renderField: (value) => formatDatetime(value as Date, true)
            },
            {
               headerName: "Activo",
               field: "active",
               renderField: (value) => renderColActive(value as boolean)
            }
         ]}
         enableRowSelection={false}
         onRowSelect={() => {}}
         actions={(row) => (
            <div className="grid grid-flow-col gap-1">
               <Tooltip title="Editar registro">
                  <CustomButton color="blue" size="sm" onClick={() => handleClickEdit(row)}>
                     <icons.Lu.LuPencil />
                  </CustomButton>
               </Tooltip>
               <Tooltip title="Eliminar registro">
                  <CustomButton color="rose" size="sm" onClick={() => handleClickDelete(row)}>
                     <icons.Lu.LuTrash2 />
                  </CustomButton>
               </Tooltip>
            </div>
         )}
         getRowActions={(row) => [
            {
               label: "Editar",
               iconName: "pi-pen-to-square",
               handleOnClick: () => handleClickEdit(row),
               color: "blue",
               permission: authContext.persist?.auth?.permissions?.update
            },
            {
               label: "Eliminar",
               iconName: "pi-trash",
               handleOnClick: () => handleClickDelete(row),
               color: "red",
               permission: authContext.persist?.auth?.permissions?.delete
            }
         ]}
         singularName={participationsContext.singularName}
         onRefresh={participationsContext.fetchData}
         loading={participationsContext.loading}
         headerActions={() => <></>}
      />
   );
};

export default ParticipationsTable;
