import CustomButton from "../../components/CustomButtom";
import CustomTable, { renderColActive } from "../../components/CustomTable";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useAuthData from "../../hooks/useAuthData";
import useProjectsData from "../../hooks/useProjectsData";
import { formatDatetime } from "../../utils/helpers";

const ProjectsTable: React.FC = () => {
   const authContext = useAuthData();
   const projectsContext = useProjectsData();

   const handleClickEdit = (row: any) => {
      console.log("🚀 ~ handleClickEdit ~ row:", row)
      projectsContext.setOpen();
      projectsContext.handleChangeItem(row);
   };

   const handleClickDelete = (row: any) => {
      projectsContext.removeItemData(row);
   };

   return (
      <CustomTable
         data={projectsContext.items}
         columns={[
            {
               headerName: "Folio",
               field: "folio",
               groupable: true
            },
            {
               headerName: "Distrito",
               field: "assigned_district",
               groupable: true
            },
            {
               headerName: "Nombre del Proyecto",
               field: "project_name"
            },
            {
               headerName: "Ubicación",
               field: "project_place"
            },
            {
               headerName: "Viabilidad",
               field: "viability",
               renderField: (value) => <span className={`badge ${value ? "badge-active" : "badge-inactive"}`}>{value ? "✅ Viable" : "❌ No viable"}</span>
            },
            {
               headerName: "Activo",
               field: "active",
               renderField: (value) => renderColActive(value as boolean)
            },
            {
               headerName: "Fecha Creada",
               field: "created_at",
               renderField: (value) => <>{formatDatetime(value as Date, true)}</>
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
         singularName={projectsContext.singularName}
         onRefresh={projectsContext.fetchData}
         loading={projectsContext.loading}
         headerActions={() => <></>}
      />
   );
};

export default ProjectsTable;
