import CustomButton from "../../components/customButtom";
import CustomTable, { renderColActive } from "../../components/CustomTable";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useAuthData from "../../hooks/useAuthData";
import useUsersData from "../../hooks/useUsersData";
import { formatDatetime } from "../../utils/helpers";

const UserTable = ({}) => {
   const UserAuth = useAuthData();
   const userContext = useUsersData();

   function handleClickEdit(_id: any): void {
      throw new Error("Function not implemented.");
   }

   function handleClickDelete(_id: any, _product_type: any): void {
      throw new Error("Function not implemented.");
   }

   return (
      <>
         <CustomTable
            data={userContext.items}
            columns={[
               {
                  headerName: "Nombre de Usuario",
                  field: "username"
               },
               {
                  headerName: "Correo",
                  field: "email"
               },
               {
                  headerName: "Rol",
                  field: "role_name",
                  groupable: true
               },
               // {
               //    headerName: "Rol",
               //    field: "role",
               //    renderField: (value, row) => {
               //       return <>{value?.["role"]}</>;
               //    },
               //    getFilterValue: (value: any) => {
               //       return <>{value?.["role"]}</>;
               //    },
               //    groupable: true
               // },
               {
                  headerName: "Casilla Vinculada",
                  field: "casilla_place"
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
               // console.log("🚀 ~ UserTable ~ row:", row);
               return (
                  <div className="grid grid-flow-col gap-1">
                     <Tooltip title="Editar registro">
                        <CustomButton
                           color="blue"
                           size="sm"
                           onClick={async () => {
                              userContext.setOpen();
                              userContext.handleChangeItem(row);
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
                              userContext.removeItemData(row);
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
                  permission: UserAuth.persist?.auth?.permissions?.update
               },
               {
                  label: "Eliminar",
                  iconName: "pi-trash",
                  tooltip: "",
                  handleOnClick: () => handleClickDelete(row.id, row.username),
                  color: "red",
                  permission: UserAuth.persist?.auth?.permissions?.delete
               }
            ]} // pasa las acciones de cada fila
            singularName={userContext.singularName}
            onRefresh={userContext.fetchData}
            loading={userContext.loading}
            headerActions={() => <></>}
         />
      </>
   );
};

export default UserTable;
