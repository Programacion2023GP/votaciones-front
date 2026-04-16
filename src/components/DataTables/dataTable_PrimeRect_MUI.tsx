import React, { JSX, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import "primereact/resources/primereact.min.css"; // PrimeReact CSS
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
// import "../../assets/styles/styles-dt-headers-filters.css";
import { Button as ButtonPrime } from "primereact/button";

import { DataTable } from "primereact/datatable";
import { Column, ColumnBodyOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast as ToastPrime } from "primereact/toast";

// import { Button, ButtonGroup, Card, IconButton, Tooltip } from "@mui/material";
// import { IconEdit, IconFile, IconFileSpreadsheet, IconPlus, IconSearch } from "@tabler/icons";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Box, padding } from "@mui/system";
import { AddCircleOutlineOutlined, CancelOutlined, DescriptionSharp, PaddingSharp } from "@mui/icons-material";

// import withReactContent from "sweetalert2-react-content";
// import Swal from "sweetalert2";
// import { QuestionAlertConfig } from "../utils/sAlert";
import Toast from "../utils/Toast";
import { Toolbar } from "primereact/toolbar";
// import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import * as XLSX from "xlsx";
import { isMobile } from "react-device-detect";
import { Button, Card, DialogActions, IconButton, LinearProgress, Switch, Tooltip, Typography } from "@mui/material";
// import icons from "../../constant/icons";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { ROLE_SUPER_ADMIN, useGlobalContext, colorTableHeader } from "../context/GlobalContext";
import { getKeys } from "../utils/Formats.js";
import { bool } from "@techstark/opencv-js";
import { MenuItem } from "primereact/menuitem";
import DialogComponent from "./DialogComponent";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";
import TableSkeleton from "./TableSkeleton";
import ColumnSelector from "./ColumnSelector";

/* COMO IMPROTAR
*    columns={columns}
         data={data}
         globalFilterFields={globalFilterFields}
         headerFilters={false}
         handleClickAdd={handleClickAdd}
         refreshTable={getUsers}
         btnAdd={true}
         showGridlines={false}
         btnsExport={true}
         rowEdit={false}
         // handleClickDeleteContinue={handleClickDeleteContinue}
         // ELIMINAR MULTIPLES REGISTROS
         btnDeleteMultiple={false}
         // handleClickDeleteMultipleContinue={handleClickDeleteMultipleContinue}
         // PARA HACER FORMULARIO EN LA TABLA
         // AGREGAR
         // createData={createUser}
         // newRow={newRow}
         // EDITAR
         // setData={setUsers}
         // updateData={updateUser}
      />
*/

/* FUNCIONES DE COMPLEMENTO
*  FUNCION PARA ELIMINAR MULTIPLES REGISTROS
   const handleClickDeleteContinue = async (selectedData) => {
      try {
         let ids = selectedData.map((d) => d.id);
         if (ids.length < 1) console.log("no hay registros");
         let msg = `¿Estas seguro de eliminar `;
         if (selectedData.length === 1) msg += `al familiar registrado como tu ${selectedData[0].relationship}?`;
         else if (selectedData.length > 1) msg += `a los familiares registrados como tu ${selectedData.map((d) => d.relationship)}?`;
         mySwal.fire(QuestionAlertConfig(msg)).then(async (result) => {
            if (result.isConfirmed) {
               setLoadingAction(true);
               const axiosResponse = await deleteFamily(ids);
               setLoadingAction(false);
               Toast.Customizable(axiosResponse.alert_text, axiosResponse.alert_icon);
            }
         });
      } catch (error) {
         console.log(error);
         Toast.Error(error);
      }
   };
*/

function CustomLoadingOverlay() {
   const text = "CARGANDO";
   return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
         <div className="relative">
            {/* Círculo exterior pulsante */}
            <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-ping opacity-75"></div>

            {/* Círculo intermedio giratorio */}
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary-500 rounded-full animate-spin border-t-transparent"></div>

            {/* Círculo interior con gradiente */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
         </div>

         <p className="mt-6 text-4xl font-bold ">
            {text}
            <span className="inline-flex ml-1">
               <span className="animate-[bounce_1s_infinite]">.</span>
               <span className="animate-[bounce_1s_infinite_0.2s]">.</span>
               <span className="animate-[bounce_1s_infinite_0.4s]">.</span>
            </span>
         </p>

         {/* Ola decorativa en la parte inferior */}
         {/* <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg className="relative block w-full h-8" viewBox="0 0 1200 120" preserveAspectRatio="none">
               <path
                  d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                  className="fill-primary-100 dark:fill-primary-900 opacity-30 animate-wave"
               ></path>
            </svg>
         </div> */}
      </div>
   );
}

interface ActionItem {
   label: string;
   iconName: string;
   permission: boolean;
   handleOnClick: (obj?: any) => void;
   color?: string;
   multiple?: (objs?: any) => void;
}

interface RowDataWithActions {
   id: string | number;
   active?: boolean;
   actions?: ActionItem[];
   [key: string]: any;
}

interface MenuItemModel {
   label: string;
   icon: string;
   command: () => void;
   style?: React.CSSProperties;
}

interface DataTableComponentProps {
   idName?: string;
   columns: Array<{
      filterField: string | undefined;
      body: ReactNode | ((data: any, options: ColumnBodyOptions) => ReactNode);
      field: string;
      header: string;
      sortable?: boolean;
      filter?: boolean;
      functionEdit?: Function;
      width?: string;
   }>;
   globalFilterFields: string[];
   defaultGlobalFilter?: string;
   data: any[];
   setData: (data: any[]) => void;
   rowsPerPage?: number;
   headerFilters?: boolean;
   rowEdit?: boolean;
   handleClickAdd?: () => void;
   createData?: (newData: any, folio?: any) => Promise<any>;
   onRowEditCompleteContinue?: (newData: any) => void;
   toolBar?: boolean;
   toolbarContentStart?: JSX.Element;
   toolbarContentCenter?: JSX.Element;
   toolbarContentEnd?: JSX.Element;
   updateData?: (newData: any, folio?: any) => Promise<any>;
   refreshTable?: () => Promise<void>;
   fetchLazyData?: (lazyEvent: any) => Promise<{ data: any[]; totalRecords: number }>;
   btnAdd?: boolean;
   titleBtnAdd?: string;
   // handleClickEdit?: (params: any) => void;
   handleClickDisEnable?: (params: any) => void;
   newRow?: any;
   btnsExport?: boolean;
   fileNameExport?: string;
   singularName?: string;
   indexColumnName?: number;
   showGridlines?: boolean;
   btnDeleteMultiple?: boolean;
   handleClickDeleteMultipleContinue?: (selectedData: any[]) => Promise<void>;
   btnMultipleActions?: boolean;
   scrollHeight?: string;
   showLoading?: boolean;
   // actionItems?: ActionItem[];
}

/**
 * DataTableComponent
 *
 * Componente que muestra una tabla con funcionalidades avanzadas como edición en línea, exportación de datos, filtros globales y herramientas de barra.
 *
 * @param {string} [idName='table'] - El ID del componente de tabla.
 * @param {Array} columns - Definición de columnas, incluyendo los campos y encabezados.
 * @param {Array} globalFilterFields - Campos a los que aplica el filtro global.
 * @param {Array} data - Datos a mostrar en la tabla.
 * @param {function} setData - Función para actualizar los datos de la tabla.
 * @param {boolean} [headerFilters=true] - Indica si los filtros se muestran en la cabecera.
 * @param {boolean} [rowEdit=false] - Define si el modo de edición es por fila.
 * @param {function} handleClickAdd - Acción para añadir nuevas filas.
 * @param {function} createData - Función para crear nuevos registros.
 * @param {function} onRowEditCompleteContinue - Acción a ejecutar tras completar la edición de una fila.
 * @param {boolean} [toolBar=false] - Indica si se muestra la barra de herramientas.
 * @param {JSX.Element} toolbarContentStart - Contenido inicial de la barra de herramientas.
 * @param {JSX.Element} toolbarContentCenter - Contenido central de la barra de herramientas.
 * @param {JSX.Element} toolbarContentEnd - Contenido final de la barra de herramientas.
 * @param {function} updateData - Función para actualizar registros existentes.
 * @param {function} refreshTable - Función para refrescar los datos de la tabla.
 * @param {function} [fetchLazyData] - Función AJAX para obtener datos paginados. Recibe lazyState y devuelve {data: any[], totalRecords: number}. Si no se proporciona, usa slice local de datos.
 * @param {boolean} [btnAdd=true] - Indica si se muestra el botón de añadir.
 * @param {string} titleBtnAdd - Título del botón de añadir.
 * @param {any} newRow - Objeto que representa una nueva fila para añadir.
 * @param {boolean} [btnsExport=true] - Indica si se muestran los botones de exportación.
 * @param {string} [fileNameExport="datos"] - Indica el nombre del archivo a exportar (NO incluir extensión de arhcivo).
 * @param {boolean} [showGridlines=false] - Define si se muestran las líneas de la cuadrícula.
 * @param {boolean} [btnDeleteMultiple=false] - Indica si se muestra la opción de eliminar múltiples registros.
 * @param {function} handleClickDeleteMultipleContinue - Acción a ejecutar al eliminar múltiples registros.
 * @param {string} [scrollHeight='65vh'] - Altura de scroll para la tabla.
 * @param {boolean} [showLoading=false] - Mostrar un cargando desde una propiedad.
 */

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
   // actionItems = []
}) => {
   // console.log("🚀 ~ DataTableComponent ~ data:", data)
   const { auth } = useAuthContext();

   const { folio } = useParams();
   // const { setLoadingAction, setOpenDialog } = useGlobalContext();
   const [selectedData, setSelectedData] = useState<any[]>([]);
   const [updating, setUpdating] = useState(false);
   const [updatingIndex, setUpdatingIndex] = useState(null);
   const [selectedProduct, setSelectedProduct] = useState(null);
   // const [theme, setTheme] = useState(localStorage.getItem("theme"));
   // const [themeColor, setThemeColor] = useState({ bg: theme == "dif" ? "#E9ECEF" : "#141B24", text: theme == "dif" ? "dark" : "whitesmoke" });
   // const colorHeader = { bg: theme == "dif" ? "#E9ECEF" : "#141B24", text: theme == "dif" ? "dark" : "whitesmoke" };
   // const { colorTableHeader, setColorTableHeader } = useGlobalContext();

   const [showModal, setShowModal] = useState(false);
   const [selectedCols, setSelectedCols] = useState<string[]>([]);
   const [customLabels, setCustomLabels] = useState<{ [key: string]: string }>({});
   const [titleFileExport, setTitleFileExport] = useState(fileNameExport);
   const [dataColumns, setDataColumns] = useState(data);
   const [orderedColumns, setOrderedColumns] = useState<string[]>([]);

   const dt: any = useRef(null);
   // columns.unshift({ id: 0, label: "Selecciona una opción..." });

   // FILTROS
   // build filter object using `filterField` when available so nested values work
   let filtersColumns: any;
   filtersColumns = columns.map((c) => {
      const key = c.filterField || c.field;
      return [key, { value: null, matchMode: FilterMatchMode.CONTAINS }];
   });
   filtersColumns = Object.fromEntries(filtersColumns);
   filtersColumns.global = { value: defaultGlobalFilter, matchMode: FilterMatchMode.CONTAINS };
   // const [filters, setFilters] = useState(filtersColumns);
   // const [globalFilterValue, setGlobalFilterValue] = useState("");
   // FILTROS

   // Para datos remotos, mantener estado finalData
   const [finalData, setFinalData] = useState<any[]>([]);
   const [totalRecords, setTotalRecords] = useState(0);
   const [selectAll, setSelectAll] = useState(false);
   const [loading, setLoading] = useState(true);
   // Reemplaza la declaración de filters y lazyState inicial
   const [lazyState, setLazyState] = useState({
      first: 0,
      rows: rowsPerPage,
      page: 1,
      sortField: null,
      sortOrder: null,
      filters: {
         global: { value: defaultGlobalFilter || "", matchMode: FilterMatchMode.CONTAINS },
         ...columns.reduce((acc, col) => {
            if (col.field !== "actions") {
               acc[col.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
            }
            return acc;
         }, {})
      }
   });

   // Estado para el input de búsqueda global (sincronizado)
   const [globalFilterValue, setGlobalFilterValue] = useState(defaultGlobalFilter || "");

   let networkTimeout = null;

   // Determinar si usamos lazy remoto o local
   const isLazyRemote = !!fetchLazyData;

   // helper to access nested values (path can be "foo.bar.baz")
   const getRowValue = (row: any, path: string) => {
      if (row == null || path == null) return null;
      if (path.indexOf(".") === -1) return row[path];
      return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), row);
   };

   const loadLazyData = useCallback(async () => {
      setLoading(true);
      try {
         if (isLazyRemote) {
            const response = await fetchLazyData(lazyState);
            setTotalRecords(response.totalRecords);
            setFinalData(response.data);
         } else {
            // Calcular datos locales
            let filtered = data.filter((rowData) => {
               return Object.entries(lazyState.filters).every(([key, filter]: any) => {
                  if (key === "global") {
                     const val = filter.value;
                     if (!val) return true;
                     return globalFilterFields.some((field) => {
                        const v = getRowValue(rowData, field);
                        return v?.toString().toLowerCase().includes(val.toLowerCase());
                     });
                  }
                  const filterVal = filter.value;
                  if (!filterVal) return true;
                  const v = getRowValue(rowData, key);
                  return v?.toString().toLowerCase().includes(filterVal.toLowerCase());
               });
            });
            if (lazyState.sortField) {
               filtered = [...filtered].sort((a, b) => {
                  const fa = getRowValue(a, lazyState.sortField);
                  const fb = getRowValue(b, lazyState.sortField);
                  if (fa == null) return 1;
                  if (fb == null) return -1;
                  if (fa < fb) return lazyState.sortOrder;
                  if (fa > fb) return -lazyState.sortOrder;
                  return 0;
               });
            }
            setTotalRecords(filtered.length);
            setFinalData(filtered.slice(lazyState.first, lazyState.first + lazyState.rows));
         }
      } catch (error) {
         setLoading(false);
         console.error("Error loading data", error);
         Toast.Error("Error al cargar datos");
      } finally {
         setLoading(false);
      }
   }, [lazyState, isLazyRemote, fetchLazyData, data, globalFilterFields]);

   useEffect(() => {
      loadLazyData();
   }, [loadLazyData]);

   const onPage = (event: any) => setLazyState(event);
   const onSort = (event: any) => {
      setLazyState((prev) => ({ ...prev, ...event }));
   };
   const onFilter = (event: any) => setLazyState({ ...event, first: 0 });

   const onSelectionChange = (event) => {
      const value = event.value;

      setSelectedData(value);
      setSelectAll(value.length === finalData.length);
   };

   const onSelectAllChange = (event) => {
      const selectAll = event.checked;

      if (selectAll) {
         setSelectAll(true);
         setSelectedData(finalData);
      } else {
         setSelectAll(false);
         setSelectedData([]);
      }
   };
   // #endregion LAYZY LOADING

   const getSeverity = (value: any) => {
      switch (value) {
         case "INSTOCK":
            return "success";

         case "LOWSTOCK":
            return "warning";

         case "OUTOFSTOCK":
            return "danger";

         default:
            return null;
      }
   };
   const [updateTrigger, setUpdateTrigger] = useState(0);

   const forceUpdate = () => {
      console.log("🚀 ~ forceUpdate ~ forceUpdate:");
      setUpdateTrigger((prev) => prev + 1);
   };
   const addRow = () => {
      // console.log("data", data);
      // console.log("newRow", newRow);

      if (!newRow) {
         console.error("newRow no está definido");
         return;
      }

      let _data = [...data];
      _data.unshift(newRow); // Agregar la nueva fila al principio
      setData(_data);
      // forceUpdate();
      // setData((prevData: any) => [...prevData, newRow]); // Cambia la referencia del array
      // setData((prev: any) => [...prev, newRow]);

      // forceUpdate();
      // Intentar seleccionar y editar la primera celda
      setTimeout(() => {
         const tbody: any = document.querySelector(`#${idName} tbody`);
         console.log("🚀 ~ setTimeout ~ tbody:", tbody);
         if (tbody && tbody.childNodes.length > 0) {
            const firstRow = tbody.childNodes[0];
            firstRow.querySelector("button")?.click();
         }
      }, 500);
   };
   // useEffect(() => {
   //    console.log("🚀 DataTable ~ data:", data);
   // }, [data, setData]);

   const handleOnRowEditIinit = (e: any) => {
      console.log("🚀 ~ handleOnRowEditIinit ~ handleOnRowEditIinit: inicia la edicion?");
      setUpdating(true);
      setUpdatingIndex(e.index);
      const firtsColumn = e.originalEvent.target.closest("tr").childNodes[1];
      firtsColumn.querySelector(".p-inputtext");
   };
   const handleOnRowEditCancel = (e: any) => {
      setUpdating(false);
      setUpdatingIndex(null);
      const dataSelected = e.data;
      if (dataSelected.relationship == "" && dataSelected.age == "" && dataSelected.occupation == "" && dataSelected.monthly_income == null) {
         let _data = data.filter((val) => val.id !== dataSelected.id);
         setData(_data);
      }
   };

   const onRowEditComplete = async (e: any) => {
      try {
         // console.log(e);
         // console.log(data);
         let _data = [...data];
         let { newData, index } = e;

         _data[index] = newData;

         setData(_data);
         // onRowEditCompleteContinue(newData);
         const newNewData = newData;
         delete newNewData.actions;
         let ajaxResponse: any;
         if (newNewData.id > 0) {
            if (updateData) ajaxResponse = await updateData(newNewData, folio);
         } else {
            if (createData) ajaxResponse = await createData(newNewData, folio);
         }
         Toast.Customizable(ajaxResponse.alert_text, ajaxResponse.alert_icon);
         setUpdating(false);
         setUpdatingIndex(null);
      } catch (error) {
         console.log(error);
         Toast.Error(error);
         setUpdating(false);
         setUpdatingIndex(null);
      }
   };

   // const textEditor = (options) => {
   //    return <InputText type="text" value={options.value} onChange={(e:any) => options.editorCallback(e.target.value)} />;
   // };

   // const statusEditor = (options) => {
   //    return (
   //       <Dropdown
   //          value={options.value}
   //          options={statuses}
   //          onChange={(e:any) => options.editorCallback(e.value)}
   //          placeholder="Select a Status"
   //          itemTemplate={(option) => {
   //             return <Tag value={option} severity={getSeverity(option)}></Tag>;
   //          }}
   //       />
   //    );
   // };

   // const priceEditor = (options) => {
   //    return <InputNumber value={options.value} onValueChange={(e:any) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />;
   // };

   //#region EXPORTAR
   const exportColumns = columns.map((col) => {
      if (col.field !== "actions") return { title: col.header, dataKey: col.field };
   });

   // const exportCSV = (selectionOnly: any) => {
   //    if (dt.current) dt.current.exportCSV({ selectionOnly });
   // };

   const exportPdf = async () => {
      import("jspdf").then((jsPDF) => {
         import("jspdf-autotable").then(() => {
            const doc = new jsPDF.default("portrait", "px");

            (doc as any).autoTable(exportColumns, data);
            doc.save("data.pdf");
         });
      });
   };

   const handleClickOpenModalExport = () => {
      if (data.length === 0) {
         Toast.Info("No hay datos para exportar.");
         return;
      }

      const { actions, ...newDataByColumns } = data[0];
      setDataColumns(getKeys(newDataByColumns));

      setShowModal(true);
   };
   // Inicializar orden cuando dataColumns cambie
   useEffect(() => {
      setOrderedColumns(dataColumns);
   }, [dataColumns]);

   // Función para manejar cambio de orden
   const handleOrderChange = (newOrder: string[]) => {
      setOrderedColumns(newOrder);
   };
   const handleClickExportData = () => {
      // Validar que haya columnas seleccionadas
      if (selectedCols.length === 0) {
         Toast.Info("Selecciona al menos una columna para exportar.");
         return;
      }

      // Aplicar filtros si es necesario (descomentar si se desea)
      // const dataToExport = filteredData.length > 0 ? filteredData : data;
      const dataToExport = data; // por defecto todos los datos

      // Construir headers en el orden definido por el usuario
      const columnsInOrder = orderedColumns.filter((col) => selectedCols.includes(col));
      const headers = columnsInOrder.map((col) => customLabels[col] || col);

      // Construir array de arrays para la hoja de cálculo
      const sheetData = [headers];

      dataToExport.forEach((row) => {
         const rowValues = columnsInOrder.map((col) => {
            const [prop, subprop] = col.split(".");
            const value = subprop === undefined ? row[prop] : row[prop]?.[subprop];
            return value !== undefined ? value : "";
         });
         sheetData.push(rowValues);
      });

      // Crear libro y hoja
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
      XLSX.writeFile(workbook, `${titleFileExport || "export"}.xlsx`);

      setShowModal(false);
   };

   const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
      if (e.target.checked) {
         setSelectedCols([...selectedCols, key]);
      } else {
         setSelectedCols(selectedCols.filter((col) => col !== key));
      }
   };
   //#endregion EXPORTAR

   const toastMultiple = useRef<ToastPrime>(null);
   const MoreActionsMultiple = (): JSX.Element => {
      const actionItems: ActionItem[] = data[0]?.actions;
      const menuRef = useRef<Menu>(null);
      // console.log("🚀 ~ ActionsBodyTemplate ~ columns:", columns);
      // console.log("selectedData", selectedData);

      useEffect(() => {
         return () => {
            if (menuRef.current) {
               menuRef?.current?.hide();
            }
         };
      }, []);

      const itemsActions = (actionItems || [])
         .filter((action) => action?.permission && action.multiple)
         .map((action) => ({
            label: action?.label,
            icon: `pi ${action?.iconName.toLowerCase()}`,
            // use closure over component state so the current array of selected
            // rows is passed whenever the menu item is invoked
            command: async () => {
               await action?.multiple(selectedData);
               setSelectedData([]);
            },
            style: { color: action?.color || "inherit" }
         }));

      const items: MenuItem[] = [
         {
            label: `${singularName}s seleccionados`,
            items: itemsActions
         }
      ];

      return (
         <div className="flex justify-center">
            <Tooltip title={"Opciones para registros seleccionados"}>
               <ButtonPrime
                  icon="pi pi-ellipsis-v"
                  onClick={(e) => menuRef.current?.toggle(e)}
                  severity="secondary"
                  text
                  // disabled={itemsActions.length === 0}
                  disabled={!selectedData || !selectedData.length}
                  style={{ color: !selectedData || !selectedData.length ? "gray" : "ButtonText", fontSize: "1.5rem" }}
                  aria-haspopup={"menu"}
               />
            </Tooltip>
            <Menu model={items} popup ref={menuRef} onAuxClickCapture={(e) => console.log(e)} />
            {/* <ButtonPrime
               key={`btn-actions-${rowData.id}`}
               icon="pi pi-ellipsis-v"
               onClick={(e) => menuRef.current?.toggle(e)}
               severity="secondary"
               text
               disabled={itemsActions.length === 0}
               aria-haspopup={"menu"}
            /> */}
            {/* OverlayPanel estilizado como Menu de PrimeReact */}
            {/* <OverlayPanel ref={op} dismissable showCloseIcon={false} style={{ padding: " 0 !important" }} className="p-0 menu-context-datatable">
               <div
                  className="p-menu"
                  style={{
                     minWidth: "250px",
                     border: "none",
                     boxShadow: "var(--overlay-shadow)",
                     background: "var(--surface-overlay)"
                  }}
               >
                  {/* Encabezado con el nombre del registro * /}
                  {nameElement && (
                     <>
                        <Tooltip key={`key-${nameElement}`} title={nameElement}>
                           <div className="p-submenu-header text-base" style={{ fontWeight: "bold", padding: "0 0.5rem" }}>
                              {singularName}: {String(nameElement).substring(0, 20)}
                              {String(nameElement).length > 20 ? "..." : ""}
                           </div>
                        </Tooltip>
                        <Divider style={{ paddingBlock: 0, margin: 0 }} />
                     </>
                  )}

                  {/* Lista de acciones * /}
                  <ul className="p-menu-list p-0 m-0" style={{ listStyle: "none" }}>
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
                                 className="p-menuitem-link hover:p-menuitem-link-active"
                                 style={{
                                    justifyContent: "flex-start",
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    fontSize: "1rem",
                                    borderRadius: 0,
                                    color: action.color || "MenuText"
                                 }}
                              />
                           </li>
                        ))}
                  </ul>
               </div>
            </OverlayPanel> */}
         </div>
      );
   };

   // const onGlobalFilterChange = (e) => {
   //    try {
   //       let value = e.target.value;
   //       if (value === undefined || value === null) value = "";
   //       let _filters = { ...filters };

   //       _filters["global"].value = value;

   //       setFilters(_filters);
   //       setGlobalFilterValue(value);

   //       // Aplicar filtros globales inmediatamente
   //       const filteredData = applyFilters(data);
   //       setTotalRecords(filteredData.length);
   //       setFinalData(filteredData.slice(lazyState.first, lazyState.first + lazyState.rows));
   //    } catch (error) {
   //       console.log(error);
   //       Toast.Error(error);
   //    }
   // };
   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setGlobalFilterValue(value);
      setLazyState((prev) => ({
         ...prev,
         first: 0,
         filters: {
            ...prev.filters,
            global: { ...prev.filters.global, value }
         }
      }));
   };

   const handleClickRefresh = async () => {
      try {
         setLoading(true);
         if (refreshTable) await refreshTable();
         setLoading(false);
         Toast.Success("Tabla Actualizada");
      } catch (error) {
         console.log(error);
         Toast.Error(error);
      }
   };
   const confirmDeleteSelected = () => {
      console.log("click en confirmSelecteds");
      // setDeleteDataDialog(true);
   };
   const leftToolbarTemplate = () => {
      return (
         <div className="flex flex-wrap gap-2">
            {/* <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} /> */}
            <Button
               // variant="contained"
               color="error"
               startIcon={<i className="pi pi-trash"></i>}
               onClick={confirmDeleteSelected} /* disabled={!selectedData || !selectedData.length} */
            >
               Eliminar Seleccionados
            </Button>
         </div>
      );
   };

   const handleClickDeleteMultiple = async () => {
      // console.log(selectedData);
      if (handleClickDeleteMultipleContinue) await handleClickDeleteMultipleContinue(selectedData);
      setSelectedData([]);
   };

   const header = (
      <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center", paddingInline: 1 }}>
         {btnMultipleActions && <MoreActionsMultiple />}
         {btnDeleteMultiple && (
            <Tooltip title="Eliminar Seleccionados" placement="top">
               <span>
                  <IconButton
                     type="button"
                     color="error"
                     onClick={handleClickDeleteMultiple}
                     disabled={!selectedData || !selectedData.length}
                     sx={{ borderRadius: "12px", mr: 1 }}
                  >
                     <i className="pi pi-trash" style={{ color: !selectedData || !selectedData.length ? "gray" : "red", fontSize: "1.5rem" }}></i>
                  </IconButton>
               </span>
            </Tooltip>
         )}

         {btnsExport && (
            <>
               <Tooltip title="Exportar a Excel" placement="top">
                  <IconButton
                     type="button"
                     color="success"
                     className="hover:scale-95 transition-all duration-500"
                     sx={{ borderRadius: "12px", mr: 1 }}
                     onClick={handleClickOpenModalExport}
                  >
                     <i className="pi pi-file-excel" style={{ color: "green", fontSize: "1.5rem" }}></i>
                  </IconButton>
               </Tooltip>

               {/* <Tooltip title="Exportar a PDF" placement="top">
                  <IconButton type="button" variant="text" color="error" sx={{ borderRadius: "12px", mr: 1 }} onClick={exportPdf}>
                     <PictureAsPdfIcon />
                  </IconButton>
               </Tooltip> */}
            </>
         )}

         <Tooltip title="Refrescar Tabla" placement="top">
            <IconButton
               type="button"
               color="secondary"
               sx={{ borderRadius: "12px", mr: 1 }}
               onClick={handleClickRefresh}
               className="duration-500 rotate-0 hover:rotate-90 active:rotate-180 hover:transition-all active:transition-all"
            >
               <i className="pi pi-refresh" style={{ color: "var(--primary-color)", fontSize: "1.5rem" }}></i>
               {/* <i className="pi pi-refetch"></i> */}
            </IconButton>
         </Tooltip>
         <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} type="search" onChange={onGlobalFilterChange} placeholder="Buscador General" />
         </span>
         {btnAdd && (
            <Tooltip title={titleBtnAdd ? `AGREGAR ${titleBtnAdd}` : "AGREGAR"} placement="top">
               {isMobile ? (
                  <IconButton
                     color="secondary"
                     /* sx={{ backgroundColor: colorPrimaryMain }} */ disabled={updating}
                     onClick={() => (rowEdit ? addRow() : handleClickAdd ? handleClickAdd() : null)}
                  >
                     {/* {<icons.Tb.TbPlus />} */}
                     <i className="pi pi-plus-circle" style={{ color: "green", fontSize: "2rem" }}></i>
                  </IconButton>
               ) : (
                  <div className="">
                     <Button
                        variant="contained"
                        // className={`w-[250px]`}
                        startIcon={<AddCircleOutlineOutlined sx={{ mr: 0.2, mb: 0 }} />}
                        size="medium"
                        disabled={updating}
                        onClick={() => (rowEdit ? addRow() : handleClickAdd ? handleClickAdd() : null)}
                     >
                        {titleBtnAdd ? titleBtnAdd : "AGREGAR"}
                     </Button>
                  </div>
               )}
            </Tooltip>
         )}
      </Box>
   );

   const toast = useRef<ToastPrime>(null);
   const ActionsBodyTemplate = (rowData: RowDataWithActions): JSX.Element => {
      // const menuRef = useRef<Menu>(null);
      const op = useRef<OverlayPanel>(null);
      const nameElement = rowData[columns[indexColumnName]?.field] || "";
      // console.log("🚀 ~ ActionsBodyTemplate ~ columns:", columns);

      // useEffect(() => {
      //    return () => {
      //       if (menuRef.current) {
      //          menuRef?.current?.hide();
      //       }
      //    };
      // }, []);

      const itemsActions = (rowData.actions || [])
         .filter((action) => action.permission)
         .map((action) => ({
            label: action.label,
            icon: `pi ${action.iconName.toLowerCase()}`,
            command: action.handleOnClick,
            style: { color: action.color || "inherit" }
         }));

      // const items: MenuItem[] = [
      //    {
      //       label: `${singularName}: ${String(nameElement).substring(0, 20)}${String(nameElement).length > 20 ? "..." : ""}`,
      //       items: itemsActions
      //    }
      // ];

      return (
         <div className="flex justify-center">
            {auth.role_id === ROLE_SUPER_ADMIN && (
               <Tooltip title={rowData.active ? "Desactivar" : "Reactivar"} placement="left" arrow>
                  <Button color="primary" onClick={() => handleClickDisEnable?.(rowData.id)} sx={{ p: 0 }}>
                     <Switch checked={Boolean(rowData.active)} />
                  </Button>
               </Tooltip>
            )}

            <ButtonPrime
               key={`btn-actions-${rowData.id}`}
               icon="pi pi-ellipsis-v"
               onClick={(e) => op.current?.toggle(e)}
               severity="secondary"
               text
               disabled={itemsActions.length === 0}
               aria-haspopup={"menu"}
            />
            {/* OverlayPanel estilizado como Menu de PrimeReact */}
            <OverlayPanel ref={op} dismissable showCloseIcon={false} style={{ padding: " 0 !important" }} className="p-0 menu-context-datatable">
               <div
                  className="p-menu"
                  style={{
                     minWidth: "250px",
                     border: "none",
                     boxShadow: "var(--overlay-shadow)",
                     background: "var(--surface-overlay)"
                  }}
               >
                  {/* Encabezado con el nombre del registro */}
                  {nameElement && (
                     <>
                        <Tooltip key={`key-${nameElement}`} title={nameElement}>
                           <div className="p-submenu-header text-base" style={{ fontWeight: "bold", padding: "0 0.5rem" }}>
                              {singularName}: {String(nameElement).substring(0, 20)}
                              {String(nameElement).length > 20 ? "..." : ""}
                           </div>
                        </Tooltip>
                        <Divider style={{ paddingBlock: 0, margin: 0 }} />
                     </>
                  )}

                  {/* Lista de acciones */}
                  <ul className="p-menu-list p-0 m-0" style={{ listStyle: "none" }}>
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
                                 className="p-menuitem-link hover:p-menuitem-link-active"
                                 style={{
                                    justifyContent: "flex-start",
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    fontSize: "1rem",
                                    borderRadius: 0,
                                    color: action.color || "MenuText"
                                 }}
                              />
                           </li>
                        ))}
                  </ul>
               </div>
            </OverlayPanel>

            {/* <Menu key={`<actions-${rowData.id}`} model={items} popup ref={menuRef} onAuxClickCapture={(e) => console.log(e)} />
            <ButtonPrime
               key={`btn-actions-${rowData.id}`}
               icon="pi pi-ellipsis-v"
               onClick={(e) => menuRef.current?.toggle(e)}
               severity="secondary"
               text
               disabled={itemsActions.length === 0}
               aria-haspopup={"menu"}
            /> */}
         </div>
      );
   };

   useEffect(() => {
      // Actualizar dataColumns cuando data cambia
      setDataColumns(data);
   }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
      // console.log("🚀 ~ useEffect ~ window.innerWidth:", window.innerWidth);
   }, [window]);
   // let rowIndex = 0;

   return (
      <div className="card p-fluid card-table-container">
         {/* <Tooltip target=".export-buttons>button" position="bottom" /> */}
         <Card sx={{ borderRadius: 2 }}>
            {toolBar && (
               <Toolbar
                  className="mb-4"
                  start={toolbarContentStart}
                  center={toolbarContentCenter}
                  end={toolbarContentEnd}
                  style={{ marginBottom: "1px", paddingBlock: "10px", zIndex: 10 }}
               ></Toolbar>
            )}
            <ToastPrime ref={toast} position="top-right" />
            <DataTable
               id={idName}
               name={idName}
               ref={dt}
               style={{ borderRadius: "20px" /* zIndex: 10 */ }}
               stripedRows
               onLoadedDataCapture={() => console.log("onLoadedDataCapture")}
               onLoad={() => console.log("onLoad")}
               onLoadStart={() => console.log("onLoadStart")}
               onLoadedData={() => console.log("onLoadedData")}
               onEnded={() => console.log("onEnded")}
               // rowHover
               showGridlines={showGridlines}
               removableSort
               size="small"
               value={finalData}
               // onLoadCapture={(e) => console.log("onLoadCapture" + e)}
               // onLoadStartCapture={(e) => console.log("onLoadStartCapture" + e)}
               // onLoadedMetadata={(e) => console.log("onLoadedMetadata" + e)}
               // onLoadedMetadataCapture={(e) => console.log("onLoadedMetadataCapture" + e)}
               editMode="row"
               header={header}
               dataKey="key"
               // virtualScrollerOptions={{
               //    lazy: true,
               //    itemSize: finalData.length
               // }}
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
               filters={lazyState.filters /* filters */}
               selection={selectedData}
               onSelectionChange={(e: any) => setSelectedData(e.value)}
               selectAll={selectAll}
               onSelectAllChange={onSelectAllChange}
               loading={loading /* || showLoading */}
               // loadingIcon={<TableSkeleton rows={5} columns={columns.length} hasHeader hasPagination hasSearch />}
               loadingIcon={<CustomLoadingOverlay />}
               scrollable={true}
               scrollHeight={scrollHeight}
               globalFilter={globalFilterValue}
               globalFilterFields={globalFilterFields}
               filterDisplay={headerFilters ? "row" : "menu"}
               tableStyle={{ minWidth: "5rem" }}
               paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
               emptyMessage="No se encontraron registros."
               currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} registros"
               // selectionMode="single"
               onRowEditComplete={onRowEditComplete}
               onRowEditInit={handleOnRowEditIinit}
               onRowEditCancel={handleOnRowEditCancel}
               metaKeySelection={true}
               className=" hover:bg-slate-500 text-xs"
            >
               {(btnDeleteMultiple || btnMultipleActions) && <Column selectionMode="multiple" exportable={false}></Column>}
               {columns.map((col, index) => {
                  // console.log("🚀 ~ rowIndex:", rowIndex);
                  // const textMuted = ["", null, undefined].includes(data[rowIndex]?.id);
                  // console.log("🚀 ~ textMuted:", textMuted);
                  // if (col.field == "id") rowIndex++;
                  // console.log("🚀 ~ {columns.map ~ col:", col);
                  // console.log("🚀 ~ {columns.map ~ data:", data[rowIndex]);
                  return (
                     <Column
                        key={index}
                        field={col.field}
                        header={col.header}
                        headerStyle={{ /* backgroundColor: colorTableHeader.bg, color: colorTableHeader.text, */ textAlign: "center" }}
                        headerClassName="text-center"
                        filter={col.filter && headerFilters}
                        filterField={col.filterField || col.field}
                        filterHeaderStyle={
                           {
                              /*backgroundColor: colorTableHeader.bg, color: colorTableHeader.text,*/
                           }
                        }
                        filterHeaderClassName="custom-filter-header"
                        editor={(options) => {
                           if (col.functionEdit) return col.functionEdit(options);
                        }}
                        sortable={col.sortable}
                        body={col.body}
                        style={{ minWidth: col.width ? col.width : col.filter ? "12rem" : "auto" }}
                        // bodyClassName={["", null, undefined].includes(col["field"]) && !updating && "text-slate-700"}
                        footerStyle={
                           {
                              /*backgroundColor: colorTableHeader.bg, color: colorTableHeader.text,*/
                           }
                        }
                     ></Column>
                  );
               })}
               {rowEdit ? (
                  <Column
                     rowEditor
                     // headerStyle={{ width: "10%", minWidth: "8rem" }}
                     headerStyle={{ backgroundColor: colorTableHeader.bg, color: colorTableHeader.text, textAlign: "center" }}
                     headerClassName="text-center"
                     filter={false}
                     filterHeaderStyle={
                        {
                           /*backgroundColor: colorTableHeader.bg, color: colorTableHeader.text,*/
                        }
                     }
                     bodyStyle={{ textAlign: "center" }}
                  ></Column>
               ) : (
                  <Column
                     // key={`key-${index}`}
                     field={"actions"}
                     header={"Acciones"}
                     headerClassName="text-center"
                     headerStyle={{ /*backgroundColor: colorTableHeader.bg, color: colorTableHeader.text,*/ textAlign: "center" }}
                     filterHeaderStyle={
                        {
                           /*backgroundColor: colorTableHeader.bg, color: colorTableHeader.text,*/
                        }
                     }
                     // // editor={(options) => col.functionEdit(options)}
                     // // body={col.body}
                     body={ActionsBodyTemplate}
                     sortable={false}
                     bodyStyle={{ textAlign: "center" }}
                     filter={false}
                     style={{ width: "auto" }}
                     footerStyle={
                        {
                           /*backgroundColor: colorTableHeader.bg, color: colorTableHeader.text,*/
                        }
                     }
                     alignFrozen="right"
                     frozen={window.innerWidth > 900 ? true : false}
                  ></Column>
               )}
            </DataTable>
         </Card>

         {/* Modal Seleccionar columnas */}
         {showModal && (
            <>
               <DialogComponent open={showModal} setOpen={setShowModal} maxWidth="xl" dialogActions={true} modalTitle="SELECCIÓN DE COLUMNAS A EXPORTAR">
                  <ColumnSelector
                     columns={dataColumns}
                     selectedColumns={selectedCols}
                     onSelectionChange={setSelectedCols}
                     customLabels={customLabels}
                     onLabelsChange={setCustomLabels}
                     onOrderChange={handleOrderChange}
                     title={titleFileExport}
                     onTitleChange={setTitleFileExport}
                  />
                  <DialogActions>
                     <Button variant="outlined" color="error" fullWidth startIcon={<CancelOutlined />} onClick={() => setShowModal(false)}>
                        Cancelar
                     </Button>
                     <Button variant="contained" fullWidth startIcon={<DescriptionSharp />} onClick={handleClickExportData}>
                        Exportar
                     </Button>
                  </DialogActions>
               </DialogComponent>

               {/* <DialogComponent
                  open={showModal}
                  // onClose={() => setShowModal(false)}
                  setOpen={setShowModal}
                  maxWidth={"xl"}
                  dialogActions={true}
                  modalTitle={"SELECCION DE COLUMNAS A EXPORTAR"}
               >
                  <label className="flex items-center gap-2 mb-2 input input-bordered">
                     <b>Titulo del Archivo:</b>
                     <input
                        type="text"
                        className="grow"
                        placeholder={"Escribe el nombre del archivo"}
                        value={titleFileExport || ""}
                        onChange={(e) => setTitleFileExport(e.currentTarget.value)}
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
               </DialogComponent> */}

               {/* <input type="checkbox" id="modal-export" className="modal-toggle" checked={showModal} onChange={() => setShowModal(!showModal)} />
               <div className="modal">
                  <div className="w-11/12 max-w-5xl modal-box">
                     <label className="flex items-center gap-2 mb-2 input input-bordered">
                        <b>Titulo del Archivo:</b>
                        <input
                           type="text"
                           className="grow"
                           placeholder={"Escribe el nombre del archivo"}
                           value={titleFileExport || ""}
                           onChange={(e) => setTitleFileExport(e.currentTarget.value)}
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
                           Cancelar
                        </button>
                        <button className="btn btn-success" onClick={handleClickExportData}>
                           Exportar
                        </button>
                     </div>
                  </div>
               </div> */}
            </>
         )}
      </div>
   );
};
export default DataTableComponent;
