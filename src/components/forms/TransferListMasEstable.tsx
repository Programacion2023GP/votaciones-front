import React, { useEffect, useCallback, useMemo, memo, useState } from "react";
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
   IconButton
} from "@mui/material";
import { Theme } from "@emotion/react";
import { KeyboardArrowLeftRounded, KeyboardArrowRightRounded, Search, Refresh } from "@mui/icons-material";

interface ChipItem {
   id: number;
   label: string;
   destination: string;
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
         <ListItemText primary={item?.label || `Item ${value}`} secondary={`Estado: ${item?.destination ?? " "}  |  Folio: ${item?.folio ?? " "}`} />
      </ListItemButton>
   );
});

TransferListItem.displayName = "TransferListItem";

interface CustomListProps {
   title: string;
   items: readonly number[];
   search: string;
   setSearch: (value: string) => void;
   checked: readonly number[];
   data: ChipItem[];
   disabled: boolean;
   sx?: SxProps<Theme>;
   heightList: number | string | null;
   labelLeft: string;
   onRefetch?: () => Promise<void> | void;
   isRefetching: boolean;
   isLoading?: boolean;
   handleToggleAll: (items: readonly number[]) => () => void;
   handleToggle: (value: number) => () => void;
}

const CustomList: React.FC<CustomListProps> = memo(
   ({ title, items, search, setSearch, checked, data, disabled, sx, heightList, labelLeft, onRefetch, isRefetching, isLoading, handleToggleAll, handleToggle }) => {
      const numberOfChecked = useMemo(() => intersection(checked, items).length, [checked, items]);

      const allChecked = useMemo(() => numberOfChecked === items.length && items.length !== 0, [numberOfChecked, items.length]);

      const indeterminate = useMemo(() => numberOfChecked !== items.length && numberOfChecked !== 0, [numberOfChecked, items.length]);

      const dataItems = useMemo(() => data.filter((d) => items.includes(d.id)), [data, items]);

      const filteredItems = useMemo(() => {
         if (!search) return dataItems;
         const searchLower = search.toLowerCase();
         return dataItems.filter(
            (chip) =>
               chip.label.toLowerCase().includes(searchLower) || chip.destination?.toLowerCase().includes(searchLower) || chip.folio?.toString().includes(searchLower)
         );
      }, [dataItems, search]);

      const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
         if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();

            if (filteredItems.length > 0) {
               const firstId = filteredItems[0].id;
               handleToggle(firstId)();
            }
         }
      };

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
               subheader={`${numberOfChecked}/${items.length} seleccionado(s)`}
            />
            <Box sx={{ px: 2, pt: 0, pb: 1 }}>
               <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar chips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
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
               component="div"
               role="list"
            >
               {filteredItems.length === 0 ? (
                  <ListItemButton disabled>
                     <ListItemText primary="No hay elementos" sx={{ textAlign: "center", color: "text.secondary" }} />
                  </ListItemButton>
               ) : (
                  filteredItems.map((item) => (
                     <TransferListItem key={item.id} value={item.id} checked={checked.includes(item.id)} data={data} disabled={disabled} onToggle={handleToggle} />
                  ))
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
   isLoading = false
}) => {
   const formik = useFormikContext<FormikValues>();
   const [checked, setChecked] = useState<readonly number[]>([]);
   const [left, setLeft] = useState<readonly number[]>([]);
   const [right, setRight] = useState<readonly number[]>([]);
   const [searchLeft, setSearchLeft] = useState("");
   const [searchRight, setSearchRight] = useState("");
   const [isRefetching, setIsRefetching] = useState(false);

   // Memoizar cálculos
   const leftChecked = useMemo(() => intersection(checked, left), [checked, left]);
   const rightChecked = useMemo(() => intersection(checked, right), [checked, right]);
   const availableIds = useMemo(() => data.map((d) => d.id), [data]);

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

   // Función para recargar data
   const handleRefetch = useCallback(async () => {
      if (!onRefetch || isRefetching) return;

      try {
         setIsRefetching(true);
         await onRefetch();
      } catch (error) {
         console.error("Error al recargar datos:", error);
      } finally {
         setIsRefetching(false);
      }
   }, [onRefetch, isRefetching]);

   // Efecto para sincronización
   // useEffect(() => {
   //    const formLeft = (formik.values[idNameLeft] || availableIds) as number[];
   //    const formRight = (formik.values[idNameRight] || []) as number[];

   //    const validLeft = formLeft.filter((id) => availableIds.includes(id));
   //    const validRight = formRight.filter((id) => availableIds.includes(id));

   //    setLeft(validLeft);
   //    setRight(validRight);

   //    // Solo actualizar Formik si hay cambios
   //    if (JSON.stringify(formik.values[idNameLeft]) !== JSON.stringify(validLeft)) {
   //       formik.setFieldValue(idNameLeft, validLeft);
   //    }
   //    if (JSON.stringify(formik.values[idNameRight]) !== JSON.stringify(validRight)) {
   //       formik.setFieldValue(idNameRight, validRight);
   //    }
   // }, [formik.values, data, idNameLeft, idNameRight, availableIds]);
   // Efecto para sincronización - VERSIÓN CORREGIDA
   useEffect(() => {
      const availableIds = data.map((d) => d.id);

      // Valores actuales de Formik
      const currentFormLeft = (formik.values[idNameLeft] || []) as number[];
      const currentFormRight = (formik.values[idNameRight] || []) as number[];

      // Filtrar solo IDs válidos
      const validLeft = currentFormLeft.filter((id) => availableIds.includes(id));
      const validRight = currentFormRight.filter((id) => availableIds.includes(id));

      // Determinar si necesitamos inicializar con todos los chips
      const shouldUseAllChips = validLeft.length === 0 && validRight.length === 0 && availableIds.length > 0;

      const finalLeft = shouldUseAllChips ? availableIds : validLeft;
      const finalRight = shouldUseAllChips ? [] : validRight;

      // Actualizar estado local
      if (JSON.stringify(left) !== JSON.stringify(finalLeft)) {
         setLeft(finalLeft);
      }
      if (JSON.stringify(right) !== JSON.stringify(finalRight)) {
         setRight(finalRight);
      }

      // Sincronizar con Formik si hay diferencias
      if (JSON.stringify(currentFormLeft) !== JSON.stringify(finalLeft)) {
         formik.setFieldValue(idNameLeft, finalLeft);
      }
      if (JSON.stringify(currentFormRight) !== JSON.stringify(finalRight)) {
         formik.setFieldValue(idNameRight, finalRight);
      }
   }, [data, formik.values, idNameLeft, idNameRight]);

   // useEffect(() => {
   //    console.log("Data recibida:", data);
   //    console.log(
   //       "IDs disponibles:",
   //       data.map((d) => d.id)
   //    );
   //    console.log("Formik left:", formik.values[idNameLeft]);
   //    console.log("Formik right:", formik.values[idNameRight]);
   //    console.log("Estado left:", left);
   //    console.log("Estado right:", right);

   //    // ... resto del código
   // }, [data, formik.values, left, right]);

   return (
      <Grid container spacing={2} sx={{ justifyContent: "center", alignItems: "center", width: "100%", px: 0, mx: 0 }} size={sizeCols}>
         <Grid size={{ md: 5 }} sx={{ px: 0, mx: 0 }} offset={{ xs: xsOffset }}>
            <CustomList
               title={labelLeft}
               items={left}
               search={searchLeft}
               setSearch={setSearchLeft}
               checked={checked}
               data={data}
               disabled={disabled}
               sx={sx}
               heightList={heightList}
               labelLeft={labelLeft}
               onRefetch={handleRefetch}
               isRefetching={isRefetching}
               isLoading={isLoading}
               handleToggleAll={handleToggleAll}
               handleToggle={handleToggle}
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
               data={data}
               disabled={disabled}
               sx={sx}
               heightList={heightList}
               labelLeft={labelLeft}
               onRefetch={handleRefetch}
               isRefetching={isRefetching}
               isLoading={isLoading}
               handleToggleAll={handleToggleAll}
               handleToggle={handleToggle}
            />
         </Grid>
      </Grid>
   );
};

export default memo(TransferList);
