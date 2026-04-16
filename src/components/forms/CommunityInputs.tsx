//#region INPUTS COMUNNITY COMPONENT
//#region IMPORTS
import { Grid } from "@mui/material";
import { AxiosCP } from "../../utils/Api";
import Toast from "../../utils/Toast";
import { useGlobalContext } from "../../context/GlobalContext";
import React, { useEffect } from "react";
import { useFormikContext } from "formik";
import Input from "./Input";
import Select2 from "./Select2_MUI";
// import { Field } from "formik";
// import { CircularProgress, TextField } from "@mui/material";
// import { handleInputFormik } from "../../utils/Formats";
// import { useEffect } from "react";
// import axios from "axios";
// import { useGlobalContext } from "../../context/GlobalContext";
// import Select2Component from "./Select2Component";
//#endregion IMPORTS

/** ESTRUCTURTAS PARA IMPORTAR EL COMPONENTE
 * hay que importar ciertos sets de GlobalContext
  const {
      setDisabledState,
      setDisabledCity,
      setDisabledColony,
      setShowLoading,
      setDataStates,
      setDataCities,
      setDataColonies,
      // setDataColoniesComplete
   } = useGlobalContext();


 * esta es la estructura del componente a insertar
   <InputsCommunityComponent
      formData={formData}
      setFormData={setFormData}
      values={values}
      setValues={setValues}
      setFieldValue={setFieldValue}
      handleChange={handleChange}
      handleBlur={handleBlur}
      errors={errors}
      touched={touched}
   />

   * esta es la estructura para la funcion getCommunity al editar (handleModify)
   getCommunity(
      formData.zip,
      setFieldValue,
      formData.community_id,
      formData,
      setFormData,
      setDisabledState,
      setDisabledCity,
      setDisabledColony,
      setShowLoading,
      setDataStates,
      setDataCities,
      setDataColonies,
      // setDataColoniesComplete
   );
*/

export const getCommunityById = async (community_id: number | null, street: string | null, num_ext: string | null, num_int: string | null) => {
   // console.log("🚀 ~ getCommunityById ~ community_id:", community_id);
   const { data } = await AxiosCP.get(`/cp/colonia/${community_id}`);
   // console.log(data.data);
   const community = data.data.result;
   community.address = await `${community.Tipo} ${community.Colonia}, ${community.Municipio} ${community.Estado}, C.P. ${community.CodigoPostal}`.toUpperCase();
   community.full_address = await `${street} ${["", "S/N", null, undefined].includes(num_ext) ? "S/N" : `#${num_ext?.trim()}`} ${
      ["", "S/N", null, undefined].includes(num_int) ? "" : `int. ${num_int} `
   } ${community.address}`.trim();

   // console.log("🚀 ~ getCommunityById ~ community:", community);
   //    {
   //       "id": 10141,
   //       "Colonia": "Residencial Paraíso del Nazas",
   //       "CodigoPostal": "27100",
   //       "Tipo": "fraccionamiento",
   //       "Zona": "urbana",
   //       "MunicipioId": 67,
   //       "Municipio": "Torreón",
   //       "Estado": "Coahuila de Zaragoza",
   //       "PerimetroId": 1,
   //       "Perimetro": "NO ASIGNADO"
   //   }
   if (community.length < 1) Toast.Info("el C.P. no corresponde a Gómez Palacio Durango");
   return community;
};

export const getCommunity = async (
   zip,
   setFieldValue,
   community_id = null,
   formData,
   setFormData,
   setDisabledState,
   setDisabledCity,
   setDisabledColony,
   setShowLoading,
   setDataStates,
   setDataCities,
   setDataColonies,
   registerCommunity = false
   // setDataColoniesComplete
) => {
   try {
      // console.log("getCommunity ~ a verrr..");
      // let _community_id = null;
      setShowLoading(true);
      setDisabledState(true);
      setDisabledCity(true);
      setDisabledColony(true);
      let states: any = []; //["Selecciona una opción..."];
      let cities: any = []; //["Selecciona una opción..."];
      let colonies: any = []; // ["Selecciona una opción..."];
      // let coloniesComplete = ["Selecciona una opción..."];
      await setDataStates(states);
      await setDataCities(cities);
      await setDataColonies(colonies);
      // setDataColoniesComplete(coloniesComplete);
      setFieldValue("state", 0);
      setFieldValue("city", 0);
      setFieldValue("colony", 0); //"Selecciona una opción...");
      formData.street !== "" && setFieldValue("street", formData.street);
      formData.num_ext !== "" && setFieldValue("num_ext", formData.num_ext);
      formData.num_int !== "" && setFieldValue("num_int", formData.num_int);
      if (community_id) {
         const { data } = await AxiosCP.get(`/cp/colonia/${community_id}`);
         if (data.data.result.length < 1) Toast.Info("el C.P. no corresponde a Gómez Palacio Durango");

         if (data.data.status_code != 200) return Toast.Error(data.data.alert_text);
         formData.zip = data.data.result.CodigoPostal;
         formData.state = data.data.result.Estado;
         formData.city = data.data.result.Municipio;
         formData.colony = `${data.data.result.Tipo} - ${data.data.result.Colonia}`;
         if (registerCommunity) formData.municipalities_id = data.data.result.MunicipioId;
         // formData.colony = community_id;
         // console.log("🚀 ~ formData:", formData);
         // await setFormData(formData);
         zip = formData.zip;
      }
      if (zip.length > 1) {
         const axiosRes = await AxiosCP.get(`/cp/${zip}`);
         if (axiosRes.data.data.result.length < 1) Toast.Info("el C.P. no corresponde a Gómez Palacio Durango");

         if (axiosRes.data.data.status_code != 200) return Toast.Error(axiosRes.data.data.alert_text);
         await axiosRes.data.data.result.map((d: { Tipo: any; Estado: any; MunicipioId: any; Municipio: any; id: any; Colonia: any }) => {
            states.push({ id: d.Estado, label: d.Estado });
            cities.push({ id: d.MunicipioId, label: d.Municipio });
            colonies.push({ id: d.id, label: `${d.Tipo} - ${d.Colonia}` });
            // coloniesComplete.push({ id: d.id, label: d.Colonia });
         });
      }

      // LIMPIAR DUPLICADOS
      // states = [...new Set(states)];
      // cities = [...new Set(cities)];
      // colonies = [...new Set(colonies)];
      // coloniesComplete = [...new Set(coloniesComplete)];
      states = await Array.from(new Map(states.map((item) => [item.id, item])).values());
      cities = await Array.from(new Map(cities.map((item) => [item.id, item])).values());
      colonies = await Array.from(new Map(colonies.map((item) => [item.id, item])).values());
      // console.log("🚀 ~ states:", states);
      // console.log("🚀 ~ cities:", cities);
      // console.log("🚀 ~ colonies:", colonies);

      // if (zip !== "" && states.length === 1) {
      //    setShowLoading(false);
      //    return Toast.Info("No hay comunidades registradas con este C.P.");
      // }
      if (states.length > 0) setDisabledState(false);
      if (cities.length > 0) setDisabledCity(false);
      // if (colonies.length > 1)
      setDisabledColony(false);
      await setDataStates(states);
      await setDataCities(cities);
      await setDataColonies(colonies);
      console.log("🚀 ~ states:", states.length);
      console.log("🚀 ~ cities:", cities);
      // setDataColoniesComplete(coloniesComplete);
      console.log("🚀 ~ community_id:", community_id);
      // console.log("🚀 ~ states[0]:", states[0]);
      // console.log("🚀 ~ cities[0]:", cities[0]);
      // console.log("🚀 ~ colonies[0]:", colonies[0]);
      setFieldValue("zip", community_id ? formData.zip : zip);
      setFieldValue("state", community_id ? formData.state : states.length == 1 ? states[0].label : states[1].label);
      setFieldValue("city", community_id ? formData.city : cities.length == 1 ? cities[0].label : cities[1].label);
      setFieldValue("colony", community_id ? formData.colony : colonies.length == 1 ? colonies[0] : 0);
      // if (!community_id) setFieldValue("community_id", colonies.length == 2 && coloniesComplete[1].id);
      // setFieldValue("colony", community_id ? community_id : colonies[0]["id"]);
      // console.log(
      //    "🚀 ~ community_id ? formData.state : states.length == 1 ? states[0] : states[1]:",
      //    community_id ? formData.state : states.length == 1 ? states[0] : states[1]
      // );
      // console.log("fomrik", formData);
      setShowLoading(false);
   } catch (error) {
      console.log(error);
      Toast.Error(error);
      setShowLoading(false);
   }
};

/**
 * Estos Inputs, deben de estar dentro de Formik, validados con Yup y dentro de grillas
 * @param {*} param0
 * @returns community_id: int
 */
// =================== COMPONENTE =======================

interface CommunityInputsProps {
   formData: any;
   setFormData: React.Dispatch<React.SetStateAction<any>>;
   hidden?: true | false;
   variant?: "classic" | "modern"; // ejemplo de variantes, ajustar según tus variantes reales
   marginBottom?: string;
   columnsByTextField?: number;
   registerCommunity?: true | false;
   captureINE?: true | false;
   inputZipRef?: any;
   [key: string]: any; // para permitir props adicionales si es necesario
}

const CommunityInputs: React.FC<CommunityInputsProps> = ({
   // loading = false,
   // setLoading,
   formData,
   setFormData,
   hidden,
   variant = "classic",
   marginBottom,
   columnsByTextField = 6,
   registerCommunity = false,
   captureINE = false,
   inputZipRef,
   ...props
}) => {
   const {
      setCursorLoading,
      disabledState,
      setDisabledState,
      disabledCity,
      setDisabledCity,
      disabledColony,
      setDisabledColony,
      showLoading,
      setShowLoading,
      dataStates,
      setDataStates,
      dataCities,
      setDataCities,
      dataColonies,
      setDataColonies
      // dataColoniesComplete,
      // setDataColoniesComplete
   } = useGlobalContext();
   const formik = useFormikContext();

   const handleKeyUpZip = async (e: { target: { value: string | any[] }; key: string; keyCode: number }, community_id = null) => {
      console.log("🚀 ~ handleKeyUpZip ~ e:", e);
      try {
         const zip = e.target.value;
         console.log("🚀 ~ handleKeyUpZip ~ zip:", zip);
         if (zip == "0") {
            console.log("el 0");
            await getCommunity(
               zip,
               formik.setFieldValue,
               community_id,
               formData,
               setFormData,
               setDisabledState,
               setDisabledCity,
               setDisabledColony,
               setShowLoading,
               setDataStates,
               setDataCities,
               setDataColonies
               // setDataColoniesComplete
            );
         } else {
            setDisabledColony(true);
            formik.setFieldValue("state", 0); //"Selecciona una opción...");
            formik.setFieldValue("city", 0); //"Selecciona una opción...");
            formik.setFieldValue("colony", 0); //"Selecciona una opción...");
         }
         if (zip.length > 0 && zip.length < 5 && (e.key === "Enter" || e.keyCode === 13)) return;
         if (zip.length == 0) return Toast.Info("C.P. vacio.");

         if (zip.length == 5) {
            await getCommunity(
               zip,
               formik.setFieldValue,
               community_id,
               formData,
               setFormData,
               setDisabledState,
               setDisabledCity,
               setDisabledColony,
               setShowLoading,
               setDataStates,
               setDataCities,
               setDataColonies
               // setDataColoniesComplete
            );
         } else {
            setDisabledColony(true);
            formik.setFieldValue("state", 0); //"Selecciona una opción...");
            formik.setFieldValue("city", 0); //"Selecciona una opción...");
            formik.setFieldValue("colony", 0); //"Selecciona una opción...");
         }
      } catch (error) {
         console.log(error);
         Toast.Error(error);
         // setCursorLoading(false);
         setShowLoading(false);
      }
   };
   const handleChangeColony = async ({ idName, value }) => {
      // console.log("🚀 ~ handleChangeColony ~ idName:", idName);
      // console.log("🚀 ~ handleChangeColony ~ value:", value);
      try {
         // console.log(dataColonies);
         // // const community_selected = dataColoniesComplete.find((c) => c.label === value);
         // const community_selected = dataColonies.find((c) => c.id === value.id);
         // values.community_id = community_selected.id;
         // setFieldValue("community_id", community_selected.id);
         formik.setFieldValue("community_id", value.id);
      } catch (error) {
         console.log(error);
         Toast.Error(error);
      }
   };

   useEffect(() => {
      // console.log("🚀 ~ inputZipRef:", inputZipRef);
   }, [formData, formik.values]);

   return (
      <>
         {/* community_id */}
         <Input col={12} idName={"community_id"} label={"Id Comunidad"} placeholder={""} hidden={true} />

         {/* Comunidad */}
         <Grid container spacing={2} size={{ xs: 12 }} sx={{ p: 1 }}>
            {/* C.P. */}
            <Input
               col={columnsByTextField}
               inputRef={inputZipRef}
               idName={"zip"}
               label={"Código Postal"}
               // type="number"
               placeholder={"35000"}
               maxLength={5}
               onKeyUp={(e) => handleKeyUpZip(e)}
               onChange={(e) => handleKeyUpZip(e)}
               disabled={showLoading}
               loading={showLoading}
               required
            />
            {/* Estado */}
            <Select2
               col={columnsByTextField}
               idName={"state"}
               label={"Estado"}
               options={dataStates}
               /* refreshSelect={} helperText={''} size={''} */ disabled={showLoading}
               required
            />
            {/* Ciduad */}
            <Select2
               col={columnsByTextField}
               idName={"city"}
               label={"Ciudad"}
               options={dataCities || []}
               /* refreshSelect={} helperText={''} size={''} */ disabled={showLoading}
               required
            />
            {/* Colonia */}
            {!registerCommunity && (
               <Select2
                  col={columnsByTextField}
                  idName={"colony"}
                  label={"Colonia"}
                  options={dataColonies || []}
                  onChangeExtra={handleChangeColony}
                  /* refreshSelect={} helperText={''} size={''} */ disabled={disabledColony}
                  required
               />
            )}
         </Grid>
         {/* Calle */}
         {!registerCommunity && (
            <Input col={4} idName={"street"} label={"Calle"} placeholder={"escribe tu calle"} type={"text"} helperText={""} textStyleCase={true} required />
         )}
         {/* No. Ext. */}
         {!registerCommunity && (
            <Input col={4} idName={"num_ext"} label={"No. Ext."} placeholder={"S/N"} type={"text"} helperText={""} textStyleCase={true} required />
         )}
         {/* No. Int. */}
         {!registerCommunity && <Input col={4} idName={"num_int"} label={"No. Int."} placeholder={"S/N"} type={"text"} helperText={""} textStyleCase={true} />}
      </>
   );
};
export default CommunityInputs;
//#endregion INPUTS COMMUNITY COMPONENT
