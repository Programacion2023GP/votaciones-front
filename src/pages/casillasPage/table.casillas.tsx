import CustomButton from "../../components/CustomButtom";
import CustomTable, { renderColActive } from "../../components/CustomTable";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useAuthData from "../../hooks/useAuthData";
import useCasillasData from "../../hooks/useCasillasData";
import { formatDatetime } from "../../utils/helpers";

const CasillaTable = ({}) => {
   const CasillaAuth = useAuthData();
   const casillaContext = useCasillasData();

   function handleClickEdit(_id: any): void {
      throw new Error("Function not implemented.");
   }

   function handleClickDelete(_id: any, _product_type: any): void {
      throw new Error("Function not implemented.");
   }

   return (
      <>
         <CustomTable
            data={casillaContext.items}
            columns={[
               {
                  headerName: "Tipo",
                  field: "type",
                  renderField: (value, _row) => {
                     return (
                        <div className="w-full text-center">
                           <span
                              className={`badge ${value?.toString().toLocaleLowerCase() === "rural" ? "badge-rural" : value === "urbana" ? "badge-urbana" : "badge-especial"}`}
                           >
                              {value === "rural" ? "🌾 Rural" : value === "urbana" ? "🏙️ Urbana" : "✨ Especial"}
                           </span>
                        </div>
                     );
                  }
               },
               {
                  headerName: "Distrito",
                  field: "district",
                  groupable: true
               },
               {
                  headerName: "Perímetro / Colonía",
                  field: "perimeter",
                  groupable: true
               },
               {
                  headerName: "Lugar",
                  field: "place"
               },
               {
                  headerName: "Ubicación",
                  field: "location"
               },

               {
                  headerName: "Activo",
                  field: "active",
                  renderField: (value, _row) => {
                     return renderColActive(value as boolean);
                  }
               },
               {
                  headerName: "Fecha Creada",
                  field: "created_at",
                  renderField: (value, _row) => {
                     return <>{formatDatetime(value as Date, true)}</>;
                  }
               }
            ]}
            enableRowSelection={false}
            onRowSelect={(_rows) => {}}
            actions={(row) => {
               // console.log("🚀 ~ CasillaTable ~ row:", row);
               return (
                  <div className="grid grid-flow-col gap-1">
                     <Tooltip title="Editar registro">
                        <CustomButton
                           color="blue"
                           size="sm"
                           onClick={async () => {
                              casillaContext.setOpen();
                              casillaContext.handleChangeItem(row);
                           }}
                        >
                           <icons.Lu.LuPencil />
                        </CustomButton>
                     </Tooltip>
                     <Tooltip title="Eliminar registro">
                        <CustomButton
                           color="rose"
                           size="sm"
                           onClick={async () => {
                              casillaContext.removeItemData(row);
                           }}
                        >
                           <icons.Lu.LuTrash2 />
                        </CustomButton>
                     </Tooltip>
                  </div>
               );
            }}
            getRowActions={(row) => [
               {
                  label: "Editar",
                  iconName: "pi-pen-to-square",
                  tooltip: "",
                  handleOnClick: () => handleClickEdit(row.id),
                  color: "blue",
                  permission: CasillaAuth.persist?.auth?.permissions?.update
               },
               {
                  label: "Eliminar",
                  iconName: "pi-trash",
                  tooltip: "",
                  handleOnClick: () => handleClickDelete(row.id, row.place),
                  color: "red",
                  permission: CasillaAuth.persist?.auth?.permissions?.delete
               }
            ]} // pasa las acciones de cada fila
            singularName={casillaContext.singularName}
            onRefresh={casillaContext.fetchData}
            loading={casillaContext.loading}
            headerActions={() => <></>}
         />
      </>
   );
};

export default CasillaTable;
