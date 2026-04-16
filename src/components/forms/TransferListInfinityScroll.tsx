import React, { useEffect, useCallback, useMemo, memo, useState, useRef } from "react";
import { useFormikContext, FormikValues } from "formik";
import {
   Grid,
   Card,
   CardHeader,
   List,
   ListItemButton,
   ListItemText,
   ListItemIcon,
   Checkbox,
   Button,
   Divider,
   SxProps,
   Box,
   TextField,
   InputAdornment,
   CircularProgress,
   Tooltip,
   IconButton,
   Typography
} from "@mui/material";
import { Theme } from "@emotion/react";
import { KeyboardArrowLeftRounded, KeyboardArrowRightRounded, Search, Refresh, ExpandMore } from "@mui/icons-material";

interface PaginationInfo {
   current_page: number;
   total: number;
   per_page: number;
   last_page: number;
   data: ChipItem[];
}

interface ChipItem {
   id: number;
   label: string;
   location_status: string;
   folio: number;
}

interface TransferListProps {
   xsOffset?: number | null;
   col: number;
   sizeCols?: { xs: number; sm: number; md: number };
   idNameLeft: string;
   idNameRight: string;
   labelLeft: string;
   labelRight: string;
   heightList: number | string | null;
   sx?: SxProps<Theme>;
   disabled?: boolean;
   data: ChipItem[];
   handleClickLeft?: () => void;
   handleClickRight?: () => void;
   onRefetch?: () => Promise<void> | void;
   isLoading?: boolean;

   // Props para pre-carga inteligente
   onLoadMore?: (page: number, search?: string) => Promise<{ items: ChipItem[]; hasMore: boolean; total?: number }>;
   initialLoadCount?: number; // Cuántos items cargar inicialmente
   searchDebounceMs?: number;
}

// Funciones utilitarias puras (sin hooks)
const not = (a: readonly number[], b: readonly number[]) => {
   return a.filter((value) => !b.includes(value));
};

const intersection = (a: readonly number[], b: readonly number[]) => {
   return a.filter((value) => b.includes(value));
};

const union = (a: readonly number[], b: readonly number[]) => {
   return [...a, ...not(b, a)];
};

// Componente memoizado para items de la lista
interface TransferListItemProps {
   value: number;
   checked: boolean;
   data: ChipItem[];
   disabled: boolean;
   onToggle: (value: number) => () => void;
}

const TransferListItem: React.FC<TransferListItemProps> = memo(({ value, checked, data, disabled, onToggle }) => {
   const item = useMemo(() => data.find((d) => d.id === value), [data, value]);

   return (
      <ListItemButton role="listitem" onClick={onToggle(value)} disabled={disabled}>
         <ListItemIcon>
            <Checkbox checked={checked} tabIndex={-1} disableRipple />
         </ListItemIcon>
         <ListItemText primary={item?.label || `Item ${value}`} secondary={`Estado: ${item?.location_status ?? " "}  |  Folio: ${item?.folio ?? " "}`} />
      </ListItemButton>
   );
});

TransferListItem.displayName = "TransferListItem";

// Hook para debounce
const useDebounce = (value: string, delay: number) => {
   const [debouncedValue, setDebouncedValue] = useState(value);

   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedValue(value);
      }, delay);

      return () => {
         clearTimeout(handler);
      };
   }, [value, delay]);

   return debouncedValue;
};

interface CustomListProps {
   title: string;
   items: readonly number[];
   search: string;
   setSearch: (value: string) => void;
   checked: readonly number[];
   allData: ChipItem[]; // Todos los datos cargados
   filteredData: ChipItem[]; // Datos filtrados localmente
   disabled: boolean;
   sx?: SxProps<Theme>;
   heightList: number | string | null;
   labelLeft: string;
   onRefetch?: () => Promise<void> | void;
   isRefetching: boolean;
   isLoading?: boolean;
   handleToggleAll: (items: readonly number[]) => () => void;
   handleToggle: (value: number) => () => void;
   onScroll: (e: React.UIEvent<HTMLUListElement>) => void;
   isLoadingMore: boolean;
   hasMore: boolean;
   totalItems?: number;
   loadedCount: number;
   onLoadMore: () => void;
   searchMode: "local" | "server";
}

const CustomList: React.FC<CustomListProps> = memo(
   ({
      title,
      items,
      search,
      setSearch,
      checked,
      allData,
      filteredData,
      disabled,
      sx,
      heightList,
      labelLeft,
      onRefetch,
      isRefetching,
      isLoading,
      handleToggleAll,
      handleToggle,
      onScroll,
      isLoadingMore,
      hasMore,
      totalItems,
      loadedCount,
      onLoadMore,
      searchMode
   }) => {
      const numberOfChecked = useMemo(() => intersection(checked, items).length, [checked, items]);
      const allChecked = useMemo(() => numberOfChecked === items.length && items.length !== 0, [numberOfChecked, items.length]);
      const indeterminate = useMemo(() => numberOfChecked !== items.length && numberOfChecked !== 0, [numberOfChecked, items.length]);

      const dataItems = useMemo(() => filteredData.filter((d) => items.includes(d.id)), [filteredData, items]);

      return (
         <Card sx={{ width: "100%", ...sx }}>
            <CardHeader
               sx={{ px: 2, py: 1 }}
               avatar={
                  <Checkbox
                     onClick={handleToggleAll(items)}
                     checked={allChecked}
                     indeterminate={indeterminate}
                     disabled={items.length === 0 || disabled}
                     inputProps={{ "aria-label": "todos los artículos seleccionados" }}
                  />
               }
               title={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                     <span>{title}</span>
                     {onRefetch && title === labelLeft && (
                        <Tooltip title="Recargar datos">
                           <IconButton size="small" onClick={onRefetch} disabled={disabled || isRefetching || isLoading}>
                              {isRefetching || isLoading ? <CircularProgress size={20} /> : <Refresh fontSize="small" />}
                           </IconButton>
                        </Tooltip>
                     )}
                  </Box>
               }
               subheader={
                  <Box>
                     <div>{`${numberOfChecked}/${items.length} seleccionado(s)`}</div>
                     {totalItems && (
                        <Typography variant="caption" color="text.secondary">
                           {searchMode === "server" ? `Buscando en servidor...` : `Mostrando ${loadedCount} de ${totalItems} (${search ? "filtrados" : "total"})`}
                        </Typography>
                     )}
                  </Box>
               }
            />
            <Box sx={{ px: 2, pt: 0, pb: 1 }}>
               <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar chips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={disabled}
                  slotProps={{
                     input: {
                        startAdornment: (
                           <InputAdornment position="start">
                              <Search fontSize="small" />
                           </InputAdornment>
                        )
                     }
                  }}
               />
            </Box>
            <Divider />
            <List
               sx={{
                  width: "100%",
                  height: heightList,
                  bgcolor: "background.paper",
                  overflow: "auto"
               }}
               dense
               role="list"
               onScroll={onScroll}
            >
               {dataItems.length === 0 ? (
                  <ListItemButton disabled>
                     <ListItemText primary={isLoading ? "Cargando..." : "No hay elementos"} sx={{ textAlign: "center", color: "text.secondary" }} />
                  </ListItemButton>
               ) : (
                  <>
                     {dataItems.map((item) => (
                        <TransferListItem
                           key={item.id}
                           value={item.id}
                           checked={checked.includes(item.id)}
                           data={allData}
                           disabled={disabled}
                           onToggle={handleToggle}
                        />
                     ))}

                     {/* Botón para cargar más (si hay búsqueda activa, no mostrar) */}
                     {!search && hasMore && (
                        <ListItemButton onClick={onLoadMore} disabled={isLoadingMore} sx={{ justifyContent: "center" }}>
                           <ListItemIcon>{isLoadingMore ? <CircularProgress size={20} /> : <ExpandMore />}</ListItemIcon>
                           <ListItemText
                              primary={isLoadingMore ? "Cargando más..." : `Cargar más (${loadedCount}/${totalItems || "?"})`}
                              sx={{ textAlign: "center" }}
                           />
                        </ListItemButton>
                     )}

                     {/* Indicador cuando no hay más */}
                     {!hasMore && dataItems.length > 0 && !search && (
                        <Box display="flex" justifyContent="center" py={2}>
                           <Typography variant="caption" color="text.secondary">
                              {totalItems ? `Todos los ${totalItems} elementos cargados` : "No hay más elementos"}
                           </Typography>
                        </Box>
                     )}
                  </>
               )}
            </List>
         </Card>
      );
   }
);

CustomList.displayName = "CustomList";

const TransferList: React.FC<TransferListProps> = ({
   xsOffset = null,
   col,
   sizeCols = { xs: 12, sm: 12, md: col },
   idNameLeft,
   idNameRight,
   labelLeft,
   labelRight,
   heightList = 430,
   sx,
   disabled = false,
   data = [],
   handleClickLeft,
   handleClickRight,
   onRefetch,
   isLoading = false,

   // Props para pre-carga
   onLoadMore,
   initialLoadCount = 50,
   searchDebounceMs = 500
}) => {
   const formik = useFormikContext<FormikValues>();
   const [checked, setChecked] = useState<readonly number[]>([]);
   const [left, setLeft] = useState<readonly number[]>([]);
   const [right, setRight] = useState<readonly number[]>([]);
   const [searchLeft, setSearchLeft] = useState("");
   const [searchRight, setSearchRight] = useState("");
   const [isRefetching, setIsRefetching] = useState(false);

   // Estados para pre-carga inteligente
   const [allData, setAllData] = useState<ChipItem[]>(data);
   const [page, setPage] = useState(1);
   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [hasMore, setHasMore] = useState(true);
   const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
   const [searchMode, setSearchMode] = useState<"local" | "server">("local");

   // Debounce para búsqueda
   const debouncedSearchLeft = useDebounce(searchLeft, searchDebounceMs);
   const debouncedSearchRight = useDebounce(searchRight, searchDebounceMs);

   // Memoizar cálculos
   const leftChecked = useMemo(() => intersection(checked, left), [checked, left]);
   const rightChecked = useMemo(() => intersection(checked, right), [checked, right]);

   // Filtrar datos localmente
   const filteredDataLeft = useMemo(() => {
      if (!debouncedSearchLeft) return allData;

      const searchLower = debouncedSearchLeft.toLowerCase();
      return allData.filter(
         (item) =>
            item.label.toLowerCase().includes(searchLower) || item.location_status?.toLowerCase().includes(searchLower) || item.folio?.toString().includes(searchLower)
      );
   }, [allData, debouncedSearchLeft]);

   const filteredDataRight = useMemo(() => {
      if (!debouncedSearchRight) return allData;

      const searchLower = debouncedSearchRight.toLowerCase();
      return allData.filter(
         (item) =>
            item.label.toLowerCase().includes(searchLower) || item.location_status?.toLowerCase().includes(searchLower) || item.folio?.toString().includes(searchLower)
      );
   }, [allData, debouncedSearchRight]);

   // Función para cargar más datos
   const loadMoreData = useCallback(
      async (search?: string) => {
         if (!onLoadMore || isLoadingMore || !hasMore) return;

         try {
            setIsLoadingMore(true);

            // Usar el estado actual de page
            setPage((currentPage) => {
               const nextPage = currentPage;

               // Ejecutar la carga con la página actual
               onLoadMore(nextPage, search)
                  .then((result) => {
                     console.log("🚀 ~ TransferList ~ result:", result);

                     if (result.items.length > 0) {
                        setAllData((prev) => {
                           console.log("🚀 ~ TransferList ~ prev:", prev);
                           // Evitar duplicados
                           const existingIds = new Set(prev.map((item) => item.id));
                           console.log("🚀 ~ TransferList ~ existingIds:", existingIds);
                           const newItems = result.items.filter((item) => !existingIds.has(item.id));
                           console.log("🚀 ~ TransferList ~ newItems:", newItems);
                           console.log("🚀 ~ setAllData ~ newItems:", newItems);
                           return [...prev, ...newItems];
                        });

                        setHasMore(result.hasMore);

                        if (result.total !== undefined) {
                           setTotalItems(result.total);
                        }

                        // Incrementar página después de cargar
                        setPage((p) => p + 1);
                     } else {
                        setHasMore(false);
                     }
                  })
                  .catch((error) => {
                     console.error("Error cargando más datos:", error);
                     setHasMore(false);
                  })
                  .finally(() => {
                     setIsLoadingMore(false);
                  });

               return currentPage;
            });
         } catch (error) {
            console.error("Error cargando más datos:", error);
            setHasMore(false);
            setIsLoadingMore(false);
         }
      },
      [onLoadMore, isLoadingMore, hasMore]
   );

   // Carga inicial
   useEffect(() => {
      if (allData.length === 0 && onLoadMore) {
         loadMoreData();
      }
   }, []);

   // Cuando cambia la búsqueda, determinar si buscar local o en servidor
   useEffect(() => {
      const isLongSearch = debouncedSearchLeft.length >= 3;

      if (isLongSearch && onLoadMore) {
         // Búsqueda en servidor para términos largos
         setSearchMode("server");
         // Reiniciar y buscar desde el servidor
         setAllData([]);
         setPage(1);
         setHasMore(true);
         loadMoreData(debouncedSearchLeft);
      } else if (debouncedSearchLeft.length === 0) {
         // Vaciar búsqueda, volver a modo normal
         setSearchMode("local");
         if (allData.length < initialLoadCount && hasMore) {
            // Cargar más datos si no tenemos suficientes
            loadMoreData();
         }
      }
   }, [debouncedSearchLeft]);

   // Mismo efecto para búsqueda derecha
   useEffect(() => {
      const isLongSearch = debouncedSearchRight.length >= 3;

      if (isLongSearch && onLoadMore) {
         setSearchMode("server");
         setAllData([]);
         setPage(1);
         setHasMore(true);
         loadMoreData(debouncedSearchRight);
      } else if (debouncedSearchRight.length === 0) {
         setSearchMode("local");
         if (allData.length < initialLoadCount && hasMore) {
            loadMoreData();
         }
      }
   }, [debouncedSearchRight]);

   // Handlers para scroll infinito (solo en modo local)
   const handleLeftScroll = useCallback(
      (e: React.UIEvent<HTMLUListElement>) => {
         if (searchMode === "server" || !hasMore || isLoadingMore) return;

         const element = e.currentTarget;
         const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 200; // 200px de margen

         if (isNearBottom) {
            loadMoreData();
         }
      },
      [searchMode, hasMore, isLoadingMore, loadMoreData]
   );

   const handleRightScroll = useCallback(
      (e: React.UIEvent<HTMLUListElement>) => {
         if (searchMode === "server" || !hasMore || isLoadingMore) return;

         const element = e.currentTarget;
         const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 200;

         if (isNearBottom) {
            loadMoreData();
         }
      },
      [searchMode, hasMore, isLoadingMore, loadMoreData]
   );

   // Memoizar handlers
   const handleToggle = useCallback(
      (value: number) => () => {
         setChecked((prev) => {
            const currentIndex = prev.indexOf(value);
            const newChecked = [...prev];
            currentIndex === -1 ? newChecked.push(value) : newChecked.splice(currentIndex, 1);
            return newChecked;
         });
      },
      []
   );

   const handleToggleAll = useCallback(
      (items: readonly number[]) => () => {
         const checkedCount = intersection(checked, items).length;
         setChecked((prev) => (checkedCount === items.length ? not(prev, items) : union(prev, items)));
      },
      [checked]
   );

   const handleCheckedRight = useCallback(() => {
      const newRight = right.concat(leftChecked);
      const newLeft = not(left, leftChecked);

      setRight(newRight);
      setLeft(newLeft);
      setChecked((prev) => not(prev, leftChecked));

      formik.setFieldValue(idNameLeft, newLeft);
      formik.setFieldValue(idNameRight, newRight);

      if (handleClickRight) handleClickRight();
   }, [left, right, leftChecked, formik, idNameLeft, idNameRight, handleClickRight]);

   const handleCheckedLeft = useCallback(() => {
      const newLeft = left.concat(rightChecked);
      const newRight = not(right, rightChecked);

      setLeft(newLeft);
      setRight(newRight);
      setChecked((prev) => not(prev, rightChecked));

      formik.setFieldValue(idNameLeft, newLeft);
      formik.setFieldValue(idNameRight, newRight);

      if (handleClickLeft) handleClickLeft();
   }, [left, right, rightChecked, formik, idNameLeft, idNameRight, handleClickLeft]);

   // // Función para recargar data
   // const handleRefetch = useCallback(async () => {
   //    if (!onRefetch || isRefetching) return;

   //    try {
   //       setIsRefetching(true);
   //       await onRefetch();
   //    } catch (error) {
   //       console.error("Error al recargar datos:", error);
   //    } finally {
   //       setIsRefetching(false);
   //    }
   // }, [onRefetch, isRefetching]);

   // Efecto para sincronización
   // useEffect(() => {
   //    const availableIds = data.map((d) => d.id);

   //    // Valores actuales de Formik
   //    const currentFormLeft = (formik.values[idNameLeft] || []) as number[];
   //    const currentFormRight = (formik.values[idNameRight] || []) as number[];

   //    // Filtrar solo IDs válidos
   //    const validLeft = currentFormLeft.filter((id) => availableIds.includes(id));
   //    const validRight = currentFormRight.filter((id) => availableIds.includes(id));

   //    // Determinar si necesitamos inicializar con todos los chips
   //    const shouldUseAllChips = validLeft.length === 0 && validRight.length === 0 && availableIds.length > 0;

   //    const finalLeft = shouldUseAllChips ? availableIds : validLeft;
   //    const finalRight = shouldUseAllChips ? [] : validRight;

   //    // Actualizar estado local
   //    if (JSON.stringify(left) !== JSON.stringify(finalLeft)) {
   //       setLeft(finalLeft);
   //    }
   //    if (JSON.stringify(right) !== JSON.stringify(finalRight)) {
   //       setRight(finalRight);
   //    }

   //    // Sincronizar con Formik si hay diferencias
   //    if (JSON.stringify(currentFormLeft) !== JSON.stringify(finalLeft)) {
   //       formik.setFieldValue(idNameLeft, finalLeft);
   //    }
   //    if (JSON.stringify(currentFormRight) !== JSON.stringify(finalRight)) {
   //       formik.setFieldValue(idNameRight, finalRight);
   //    }
   // }, [data, formik.values, idNameLeft, idNameRight]);

   // Efecto para sincronización - VERSIÓN CORREGIDA
   useEffect(() => {
      const availableIds = allData.map((d) => d.id);
      const currentFormLeft = (formik.values[idNameLeft] || []) as number[];
      const currentFormRight = (formik.values[idNameRight] || []) as number[];

      const validLeft = currentFormLeft.filter((id) => availableIds.includes(id));
      const validRight = currentFormRight.filter((id) => availableIds.includes(id));

      const shouldUseAllChips = validLeft.length === 0 && validRight.length === 0 && availableIds.length > 0;

      // Cuando se cargan nuevos datos, añadir nuevos IDs a left (lado disponible)
      let finalLeft: number[];
      let finalRight: number[];

      if (shouldUseAllChips) {
         // Primera carga: todos los elementos en left
         finalLeft = availableIds;
         finalRight = [];
      } else {
         // Cargas posteriores: mantener los seleccionados, pero añadir nuevos IDs a left
         const currentLeftIds = new Set(left);
         const newAvailableIds = availableIds.filter((id) => !currentLeftIds.has(id) && !right.includes(id));

         finalLeft = [...left, ...newAvailableIds];
         finalRight = [...right];
      }

      if (JSON.stringify(left) !== JSON.stringify(finalLeft)) {
         setLeft(finalLeft);
      }
      if (JSON.stringify(right) !== JSON.stringify(finalRight)) {
         setRight(finalRight);
      }

      if (JSON.stringify(currentFormLeft) !== JSON.stringify(finalLeft)) {
         formik.setFieldValue(idNameLeft, finalLeft);
      }
      if (JSON.stringify(currentFormRight) !== JSON.stringify(finalRight)) {
         formik.setFieldValue(idNameRight, finalRight);
      }
   }, [allData, formik.values, idNameLeft, idNameRight]);

   // Función para recargar data
   const handleRefetch = useCallback(async () => {
      if (!onRefetch || isRefetching) return;

      try {
         setIsRefetching(true);
         await onRefetch();
         // También reiniciar la pre-carga
         setAllData([]);
         setLeft(allData.map((d) => d.id));
         setPage(1);
         setHasMore(true);
         await loadMoreData();
      } catch (error) {
         console.error("Error al recargar datos:", error);
      } finally {
         setIsRefetching(false);
      }
   }, [onRefetch, isRefetching, loadMoreData]);

   return (
      <Grid container spacing={2} sx={{ justifyContent: "center", alignItems: "center", width: "100%", px: 0, mx: 0 }} size={sizeCols}>
         <Grid size={{ md: 5 }} sx={{ px: 0, mx: 0 }} offset={{ xs: xsOffset }}>
            <CustomList
               title={labelLeft}
               items={left}
               search={searchLeft}
               setSearch={setSearchLeft}
               checked={checked}
               allData={allData}
               filteredData={filteredDataLeft}
               disabled={disabled}
               sx={sx}
               heightList={heightList}
               labelLeft={labelLeft}
               onRefetch={handleRefetch}
               isRefetching={isRefetching}
               isLoading={isLoading || isLoadingMore}
               handleToggleAll={handleToggleAll}
               handleToggle={handleToggle}
               onScroll={handleLeftScroll}
               isLoadingMore={isLoadingMore}
               hasMore={hasMore}
               totalItems={totalItems}
               loadedCount={allData.length}
               onLoadMore={() => loadMoreData()}
               searchMode={searchMode}
            />
         </Grid>

         <Grid>
            <Grid container direction="column" sx={{ alignItems: "center" }}>
               <Button
                  sx={{ my: 0.5 }}
                  variant="outlined"
                  size="small"
                  onClick={handleCheckedRight}
                  disabled={leftChecked.length === 0 || disabled || isLoading}
                  startIcon={<KeyboardArrowRightRounded />}
               >
                  Mover
               </Button>
               <Button
                  sx={{ my: 0.5 }}
                  variant="outlined"
                  size="small"
                  onClick={handleCheckedLeft}
                  disabled={rightChecked.length === 0 || disabled || isLoading}
                  startIcon={<KeyboardArrowLeftRounded />}
               >
                  Mover
               </Button>
            </Grid>
         </Grid>

         <Grid size={{ md: 5 }} sx={{ px: 0, mx: 0 }}>
            <CustomList
               title={labelRight}
               items={right}
               search={searchRight}
               setSearch={setSearchRight}
               checked={checked}
               allData={allData}
               filteredData={filteredDataRight}
               disabled={disabled}
               sx={sx}
               heightList={heightList}
               labelLeft={labelLeft}
               onRefetch={handleRefetch}
               isRefetching={isRefetching}
               isLoading={isLoading || isLoadingMore}
               handleToggleAll={handleToggleAll}
               handleToggle={handleToggle}
               onScroll={handleRightScroll}
               isLoadingMore={isLoadingMore}
               hasMore={hasMore}
               totalItems={totalItems}
               loadedCount={allData.length}
               onLoadMore={() => loadMoreData()}
               searchMode={searchMode}
            />
         </Grid>
      </Grid>
   );
};

export default memo(TransferList);
