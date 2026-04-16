import React, { JSX, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { Button as ButtonPrime } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnBodyOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast as ToastPrime } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { Toolbar } from "primereact/toolbar";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";
import * as XLSX from "xlsx";
import { isMobile } from "react-device-detect";
import { useParams } from "react-router-dom";
import Toast from "../utils/Toast";
import { getKeys } from "../utils/Formats";
import DialogComponent from "./DialogComponent";
import ColumnSelector from "./ColumnSelector";
import TableSkeleton from "./TableSkeleton";
import icons from "./../constant/icons"; // Ajusta la ruta según tu proyecto

// Asumiendo que tienes estos íconos en icons.Lu
const { LuPlusCircle, LuX, LuFileSpreadsheet, LuFileText, LuRefreshCw } = icons.Lu;

// Función auxiliar para tooltips con DaisyUI
const TooltipWrapper = ({ children, content, position = "top" }: { children: ReactNode; content: string; position?: "top" | "bottom" | "left" | "right" }) => (
   <div className={`tooltip tooltip-${position}`} data-tip={content}>
      {children}
   </div>
);

// Componente de carga personalizado (ya estaba con Tailwind)
function CustomLoadingOverlay() {
   const text = "CARGANDO";
   return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
         <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
         </div>
         <p className="mt-6 text-4xl font-bold">
            {text}
            <span className="inline-flex ml-1">
               <span className="animate-[bounce_1s_infinite]">.</span>
               <span className="animate-[bounce_1s_infinite_0.2s]">.</span>
               <span className="animate-[bounce_1s_infinite_0.4s]">.</span>
            </span>
         </p>
      </div>
   );
}

// ... (interfaces ActionItem, RowDataWithActions, MenuItemModel, DataTableComponentProps se mantienen igual, solo se elimina la dependencia de MUI)

export const DataTableComponent: React.FC<DataTableComponentProps> = ({
   idName = "table",
   columns = [],
   globalFilterFields,
   defaultGlobalFilter = null,
   data,
   setData,
   rowsPerPage = 100,
   headerFilters = true,
   rowEdit = false,
   handleClickAdd,
   createData,
   onRowEditCompleteContinue = null,
   toolBar = false,
   toolbarContentStart,
   toolbarContentCenter,
   toolbarContentEnd,
   updateData,
   handleClickDisEnable,
   refreshTable,
   fetchLazyData,
   btnAdd = true,
   titleBtnAdd = null,
   newRow = null,
   btnsExport = true,
   showGridlines = false,
   btnDeleteMultiple = false,
   handleClickDeleteMultipleContinue,
   btnMultipleActions = false,
   scrollHeight = "65vh",
   fileNameExport = "datos",
   singularName = "Registro",
   indexColumnName = 2,
   showLoading = false
}) => {
   // ... (toda la lógica de estado, lazy loading, etc. se mantiene exactamente igual)

   // Reemplazar MUI Button y Tooltip en el header
   const header = (
      <div className="flex gap-2 justify-between items-center px-1">
         {btnMultipleActions && <MoreActionsMultiple />}
         {btnDeleteMultiple && (
            <TooltipWrapper content="Eliminar Seleccionados" position="top">
               <button
                  type="button"
                  className="btn btn-circle btn-ghost text-error"
                  onClick={handleClickDeleteMultiple}
                  disabled={!selectedData || !selectedData.length}
               >
                  <i className="pi pi-trash" style={{ fontSize: "1.5rem", color: !selectedData || !selectedData.length ? "gray" : "red" }}></i>
               </button>
            </TooltipWrapper>
         )}
         {btnsExport && (
            <>
               <TooltipWrapper content="Exportar a Excel" position="top">
                  <button type="button" className="btn btn-circle btn-ghost text-success" onClick={handleClickOpenModalExport}>
                     <i className="pi pi-file-excel" style={{ fontSize: "1.5rem", color: "green" }}></i>
                  </button>
               </TooltipWrapper>
            </>
         )}
         <TooltipWrapper content="Refrescar Tabla" position="top">
            <button
               type="button"
               className="btn btn-circle btn-ghost text-secondary duration-500 rotate-0 hover:rotate-90 active:rotate-180 transition-all"
               onClick={handleClickRefresh}
            >
               <i className="pi pi-refresh" style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}></i>
            </button>
         </TooltipWrapper>
         <div className="relative">
            <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <InputText value={globalFilterValue} type="search" onChange={onGlobalFilterChange} placeholder="Buscador General" className="pl-8" />
         </div>
         {btnAdd && (
            <TooltipWrapper content={titleBtnAdd ? `AGREGAR ${titleBtnAdd}` : "AGREGAR"} position="top">
               {isMobile ? (
                  <button
                     className="btn btn-circle btn-ghost text-success"
                     disabled={updating}
                     onClick={() => (rowEdit ? addRow() : handleClickAdd ? handleClickAdd() : null)}
                  >
                     <i className="pi pi-plus-circle" style={{ fontSize: "2rem", color: "green" }}></i>
                  </button>
               ) : (
                  <button className="btn btn-primary" disabled={updating} onClick={() => (rowEdit ? addRow() : handleClickAdd ? handleClickAdd() : null)}>
                     <LuPlusCircle className="mr-1" size={18} />
                     {titleBtnAdd ? titleBtnAdd : "AGREGAR"}
                  </button>
               )}
            </TooltipWrapper>
         )}
      </div>
   );

   // Reemplazar ActionsBodyTemplate (tooltips, switch, botones)
   const ActionsBodyTemplate = (rowData: RowDataWithActions): JSX.Element => {
      const op = useRef<OverlayPanel>(null);
      const nameElement = rowData[columns[indexColumnName]?.field] || "";
      const itemsActions = (rowData.actions || [])
         .filter((action) => action.permission)
         .map((action) => ({
            label: action.label,
            icon: `pi ${action.iconName.toLowerCase()}`,
            command: action.handleOnClick,
            style: { color: action.color || "inherit" }
         }));

      return (
         <div className="flex justify-center items-center gap-2">
            {auth.role_id === ROLE_SUPER_ADMIN && (
               <TooltipWrapper content={rowData.active ? "Desactivar" : "Reactivar"} position="left">
                  <label className="cursor-pointer">
                     <input
                        type="checkbox"
                        className="toggle toggle-sm toggle-primary"
                        checked={Boolean(rowData.active)}
                        onChange={() => handleClickDisEnable?.(rowData.id)}
                     />
                  </label>
               </TooltipWrapper>
            )}
            <ButtonPrime
               key={`btn-actions-${rowData.id}`}
               icon="pi pi-ellipsis-v"
               onClick={(e) => op.current?.toggle(e)}
               severity="secondary"
               text
               disabled={itemsActions.length === 0}
               aria-haspopup="menu"
            />
            <OverlayPanel ref={op} dismissable showCloseIcon={false} className="p-0 menu-context-datatable">
               <div className="p-menu" style={{ minWidth: "250px", border: "none", boxShadow: "var(--overlay-shadow)", background: "var(--surface-overlay)" }}>
                  {nameElement && (
                     <>
                        <div className="p-submenu-header text-base font-bold px-2 py-1">
                           {singularName}: {String(nameElement).substring(0, 20)}
                           {String(nameElement).length > 20 ? "..." : ""}
                        </div>
                        <Divider className="my-0" />
                     </>
                  )}
                  <ul className="p-menu-list p-0 m-0 list-none">
                     {rowData?.actions
                        ?.filter((action) => action.permission)
                        .map((action, idx) => (
                           <li key={idx} className="p-menuitem">
                              <ButtonPrime
                                 label={action.label}
                                 icon={`pi ${action.iconName}`}
                                 onClick={() => {
                                    action.handleOnClick();
                                    op.current?.hide();
                                 }}
                                 text
                                 className="p-menuitem-link hover:p-menuitem-link-active w-full justify-start px-4 py-2 rounded-none"
                                 style={{ color: action.color || "MenuText" }}
                              />
                           </li>
                        ))}
                  </ul>
               </div>
            </OverlayPanel>
         </div>
      );
   };

   // Reemplazar MoreActionsMultiple (botón de menú)
   const MoreActionsMultiple = (): JSX.Element => {
      const actionItems: ActionItem[] = data[0]?.actions;
      const menuRef = useRef<Menu>(null);

      useEffect(() => {
         return () => menuRef.current?.hide();
      }, []);

      const itemsActions = (actionItems || [])
         .filter((action) => action?.permission && action.multiple)
         .map((action) => ({
            label: action?.label,
            icon: `pi ${action?.iconName.toLowerCase()}`,
            command: async () => {
               await action?.multiple(selectedData);
               setSelectedData([]);
            },
            style: { color: action?.color || "inherit" }
         }));

      const items: MenuItem[] = [{ label: `${singularName}s seleccionados`, items: itemsActions }];

      return (
         <div className="flex justify-center">
            <TooltipWrapper content="Opciones para registros seleccionados" position="top">
               <ButtonPrime
                  icon="pi pi-ellipsis-v"
                  onClick={(e) => menuRef.current?.toggle(e)}
                  severity="secondary"
                  text
                  disabled={!selectedData || !selectedData.length}
                  className="text-2xl"
               />
            </TooltipWrapper>
            <Menu model={items} popup ref={menuRef} />
         </div>
      );
   };

   // Reemplazar el Card de MUI por un div con estilo Tailwind
   // Reemplazar el modal de exportación con DaisyUI modal nativo
   return (
      <div className="card p-fluid card-table-container">
         <div className="bg-white rounded-xl shadow-md border border-gray-100">
            {toolBar && <Toolbar className="mb-1 py-2 z-10" start={toolbarContentStart} center={toolbarContentCenter} end={toolbarContentEnd} />}
            <ToastPrime ref={toast} position="top-right" />
            <DataTable
               // ... todas las props iguales
               id={idName}
               name={idName}
               ref={dt}
               stripedRows
               showGridlines={showGridlines}
               removableSort
               size="small"
               value={finalData}
               editMode="row"
               header={header}
               dataKey="key"
               lazy
               paginator
               rowsPerPageOptions={[5, 10, 50, 100, 500, 1000]}
               rows={rowsPerPage}
               first={lazyState.first}
               totalRecords={totalRecords}
               onPage={onPage}
               onSort={onSort}
               sortField={lazyState.sortField}
               sortOrder={lazyState.sortOrder}
               onFilter={onFilter}
               filters={lazyState.filters}
               selection={selectedData}
               onSelectionChange={(e) => setSelectedData(e.value)}
               selectAll={selectAll}
               onSelectAllChange={onSelectAllChange}
               loading={loading}
               loadingIcon={<CustomLoadingOverlay />}
               scrollable
               scrollHeight={scrollHeight}
               globalFilter={globalFilterValue}
               globalFilterFields={globalFilterFields}
               filterDisplay={headerFilters ? "row" : "menu"}
               tableStyle={{ minWidth: "5rem" }}
               paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
               emptyMessage="No se encontraron registros."
               currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} registros"
               onRowEditComplete={onRowEditComplete}
               onRowEditInit={handleOnRowEditIinit}
               onRowEditCancel={handleOnRowEditCancel}
               metaKeySelection={true}
               className="hover:bg-slate-500 text-xs"
            >
               {(btnDeleteMultiple || btnMultipleActions) && <Column selectionMode="multiple" exportable={false} />}
               {columns.map((col, index) => (
                  <Column
                     key={index}
                     field={col.field}
                     header={col.header}
                     headerClassName="text-center"
                     filter={col.filter && headerFilters}
                     filterField={col.filterField || col.field}
                     editor={(options) => col.functionEdit?.(options)}
                     sortable={col.sortable}
                     body={col.body}
                     style={{ minWidth: col.width ? col.width : col.filter ? "12rem" : "auto" }}
                  />
               ))}
               {rowEdit ? (
                  <Column rowEditor headerClassName="text-center" bodyStyle={{ textAlign: "center" }} />
               ) : (
                  <Column
                     field="actions"
                     header="Acciones"
                     headerClassName="text-center"
                     body={ActionsBodyTemplate}
                     sortable={false}
                     bodyStyle={{ textAlign: "center" }}
                     filter={false}
                     style={{ width: "auto" }}
                     alignFrozen="right"
                     frozen={window.innerWidth > 900}
                  />
               )}
            </DataTable>
         </div>

         {/* Modal de exportación con DaisyUI */}
         {showModal && (
            <>
               <input type="checkbox" id="modal-export" className="modal-toggle" checked={showModal} readOnly />
               <div className="modal modal-open" onClick={() => setShowModal(false)}>
                  <div className="modal-box max-w-5xl w-11/12" onClick={(e) => e.stopPropagation()}>
                     <label className="flex items-center gap-2 mb-4 input input-bordered">
                        <b>Título del Archivo:</b>
                        <input
                           type="text"
                           className="grow"
                           placeholder="Escribe el nombre del archivo"
                           value={titleFileExport || ""}
                           onChange={(e) => setTitleFileExport(e.target.value)}
                        />
                     </label>
                     <h3 className="text-lg font-bold">Seleccionar columnas para exportar</h3>
                     <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3 max-h-[65vh] overflow-auto p-2">
                        {dataColumns.map((key) => (
                           <label key={key} className="flex items-center gap-2">
                              <input
                                 type="checkbox"
                                 className="checkbox checkbox-sm"
                                 checked={selectedCols.includes(key)}
                                 onChange={(e) => handleCheckboxChange(e, key)}
                              />
                              <input
                                 type="text"
                                 className="w-full input input-bordered input-sm"
                                 placeholder={key}
                                 value={customLabels[key] || ""}
                                 onChange={(e) => setCustomLabels({ ...customLabels, [key]: e.target.value })}
                                 disabled={!selectedCols.includes(key)}
                              />
                           </label>
                        ))}
                     </div>
                     <div className="modal-action">
                        <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                           <LuX className="mr-1" size={16} />
                           Cancelar
                        </button>
                        <button className="btn btn-success" onClick={handleClickExportData}>
                           <LuFileSpreadsheet className="mr-1" size={16} />
                           Exportar
                        </button>
                     </div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
};

export default DataTableComponent;
