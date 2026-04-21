import React, { useCallback, useEffect, useState } from "react";
import StatCard from "../../components/dashboard/statCard";
import ChartWrapper from "../../components/dashboard/ChartWrapper";
import TopProjectsList, { ProjectVote } from "../../components/dashboard/TopProjectsList";
import { icons } from "../../constant";
import { formatDatetime } from "../../utils/helpers";
import useParticipationsData from "../../hooks/useParticipationsData";
import sAlert from "../../utils/sAlert";
import dayjs from "dayjs";
import { PublicSelect, RankingTable } from "../publics/PublicAtoms";
import RankingTablesByCasillas from "../../components/dashboard/RankingTablesByCasillas";

const Estadisticas: React.FC = () => {
   const participationsContext = useParticipationsData();
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);

   const fetchData = () => {
      setLoading(true);
      participationsContext
         .request({ method: "GET", url: `statistics/dashboard`, getData: false })
         .then((res: any) => {
            // console.log("🚀 ~ Estadisticas ~ res[0]:", res[0].data);
            setStats(res[0].data);
         })
         .catch((err) => console.error(err))
         .finally(() => setLoading(false));
   };
   // --- Refrescar todos los datos ---
   const refreshAll = useCallback(async () => {
      setRefreshing(true);
      try {
         await fetchData();
         sAlert.Customizable("Actualizado", "Los datos se han actualizado correctamente", "success", false);
      } catch (error) {
         console.error(error);
         sAlert.Customizable("Error", "No se pudieron actualizar los datos", "error", true);
      } finally {
         setRefreshing(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
   }, []);

   if (loading)
      return (
         <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
         </div>
      );

   const {
      totals,
      participations_by_type,
      participations_by_casilla,
      ballots_by_casilla,
      ballots_by_district,
      top_projects,
      participations_by_hour,
      votes_by_district,
      null_votes_by_district,
      top_projects_by_district,
      votes_by_casilla
   } = stats;

   // const grouped = {};
   // votes_by_casilla.forEach((item: { casilla_place: string | number; project_name: any; votes: any }) => {
   //    if (!grouped[item.casilla_place]) grouped[item.casilla_place] = [];
   //    grouped[item.casilla_place].push({
   //       project: item.project_name,
   //       votes: item.votes
   //    });
   // });
   // const topProjectsData = top_projects.map((p: { project_name: string; votos: any }) => ({
   //    name: p.project_name.length > 25 ? p.project_name.substring(0, 25) + "…" : p.project_name,
   //    votos: p.votos,
   //    fullName: p.project_name
   // }));

   // const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

   // // Preparar opciones de distrito a partir de `votes_by_district` o `ballots_by_district`
   // const districtOptions = ballots_by_district.map((d) => d.casilla_district).filter((d) => d !== "Casilla Especial");

   // // Obtener proyectos del distrito seleccionado
   // const projectsByDistrict = selectedDistrict ? (top_projects_by_district[selectedDistrict] ?? []) : [];

   // // Transformar a formato que espera RankingTable
   // const rankingEntries = projectsByDistrict.map((p) => ({
   //    project: { id: p.id, project_name: p.project_name, folio: p.id, assigned_district: selectedDistrict },
   //    votes: p.votos
   // }));

   // Agrupar por casilla
   const votesByCasillaGrouped = votes_by_casilla.reduce((acc: { [x: string]: any[] }, item: { casilla_place: string | number }) => {
      if (!acc[item.casilla_place]) acc[item.casilla_place] = [];
      acc[item.casilla_place].push(item);
      return acc;
   }, {});

   // const casillaProyectos = votes_by_casilla.filter((v: { casilla_place: string }) => v.casilla_place === "Brittingham");
   // const chartData = casillaProyectos.map((p: { project_name: any; votes: any }) => ({ name: p.project_name, votos: p.votes }));

   return (
      <div className="page">
         {/* Botón flotante de refrescar */}
         <div className="fab">
            {/* <div className="tooltip tooltip-top" data-tip="ACTUALIZAR ESTADISTICOS"> */}
            <button className="btn btn-lg btn-circle btn-primary" onClick={refreshAll} disabled={refreshing}>
               {refreshing ? (
                  <span className="loading loading-spinner loading-md"></span>
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                     />
                  </svg>
                  // <span className="w-full">
                  //   <icons.Fi.FiRefreshCw fontWeight={800} />
                  // </span>
               )}
            </button>
            {/* </div> */}
         </div>
         <div className="page-header">
            <h1 className="page-title">Tablero de Análisis</h1>
            <p className="page-subtitle">Estadísticas generales del proceso electoral</p>
         </div>
         {/* Stats generales */}
         <div className="stats-grid">
            <StatCard label="Proyectos" value={totals.projects.toLocaleString()} icon={<icons.Lu.LuFileText />} />
            <StatCard label="Participaciones" value={totals.participations.toLocaleString()} icon={<icons.Lu.LuUsers />} />
            <StatCard label="Boletas emitidas" value={totals.ballots.toLocaleString()} icon={<icons.Lu.LuVote />} />
            <StatCard label="Casillas activas" value={totals.active_casillas.toLocaleString()} icon={<icons.Lu.LuMapPin />} />
            <StatCard label="Votos" value={totals.total_votes.toLocaleString()} icon={<icons.Lu.LuCheckCheck />} />
            <StatCard label="Votos nulos" value={totals.null_votes.toLocaleString()} icon={<icons.Lu.LuCircleX />} />
            {/* <StatCard label="INE" value={participations_by_type[0].total ?? 0} icon={"🪪"} />
            <StatCard label="Carta Identidad" value={participations_by_type[1].total ?? 0} icon={"📄"} /> */}
         </div>
         {/* Gráficas principales */}
         <div className="chart-grid mb-6">
            <ChartWrapper
               type="pie"
               data={participations_by_type.map((t: any) => ({ name: t.type, value: t.total }))}
               dataKey="value"
               nameKey="name"
               colors={["#9B2242", "#474C55"]}
               title="🪪 Participaciones por tipo de documento"
               showTotal
               totalLabel="Total"
            />
            <ChartWrapper
               type="bar"
               data={ballots_by_district}
               dataKey="total"
               nameKey="casilla_district"
               title="🎫 Boletas por distrito"
               layout="horizontal"
               xLabel="Distritos"
               yLabel="Bolletas"
               showTotal
               totalLabel="Total"
            />
         </div>
         <ChartWrapper
            type="bar"
            data={participations_by_casilla.map((item: any) => ({
               name: `${item.casilla_place} (${item.casilla_type})`,
               value: item.total
            }))}
            dataKey="value"
            nameKey="name"
            title="Participaciones por casilla"
            xLabel="Casilla"
            yLabel="Número de participaciones"
            showTotal
            totalLabel="Total participaciones"
         />

         <ChartWrapper
            type="bar"
            data={ballots_by_casilla}
            dataKey="total"
            nameKey="casilla_place"
            title="🗳️ Boletas por casilla"
            layout="horizontal"
            xLabel="Casillas"
            yLabel="Bolletas"
            showTotal
            totalLabel="Total"
            height={300}
         />

         {/* Evolución temporal */}
         {/* <ChartWrapper
            type="line"
            data={participations_by_hour.map((h: any) => ({
               name: dayjs(h.hour).format("HH:mm"), // Ej: "14:30"
               fullDate: dayjs(h.hour).format("DD/MM HH:mm"), // Para tooltip si quieres más detalle
               value: h.total
            }))}
            dataKey="value"
            nameKey="name"
            title="🕛 Participaciones por horas"
            height={300}
            tooltipFormatter={(value, name, props) => {
               // Personalizar tooltip para mostrar fecha completa
               return [`${value} participaciones`, props.payload.fullDate];
            }}
            xLabel="Horas"
            yLabel="Participaciones"
            showTotal
            totalLabel="Total"
         /> */}
         {/* Top 10 proyectos y votos por distrito */}
         <div className="chart-grid mb-6">
            <ChartWrapper
               type="bar"
               data={votes_by_district}
               dataKey="votos"
               nameKey="assigned_district"
               title="🗳️ Votos acumulados por distrito"
               layout="horizontal"
               xLabel="Distritos"
               yLabel="Votos"
               showTotal
               totalLabel="Total"
               height={300}
            />
            <ChartWrapper
               type="bar"
               data={null_votes_by_district}
               dataKey="nulos"
               nameKey="district"
               title="🚫 Nulos por distrito"
               layout="horizontal"
               xLabel="Distrito"
               yLabel="Nulos"
               showTotal
               totalLabel="Total"
               height={300}
            />
         </div>

         {/* <ChartWrapper type="bar" data={chartData} dataKey="votos" nameKey="name" title="Proyectos votados en casilla Vergel" layout="vertical" height={300} /> */}

         {/* <PublicSelect label="Distrito" value={selectedDistrict ?? ""} onChange={(e) => setSelectedDistrict(Number(e.target.value))}>
            <option value="">Selecciona un distrito</option>
            {districtOptions.map((d) => (
               <option key={d} value={d}>
                  Distrito {d}
               </option>
            ))}
         </PublicSelect>

         <RankingTable entries={rankingEntries} emptyMsg="No hay votos en este distrito" /> */}

         {/* <TopProjectsList projects={grouped} title="Proyectos con votos (general)" /> */}

         <RankingTablesByCasillas votesByCasillaGrouped={votesByCasillaGrouped} exportable={true} />

         <TopProjectsList projects={top_projects} title="Proyectos con votos (general)" />
         {/* // Mostrar top 10 por distrito (puedes iterar sobre las claves) */}
         {/* <div className="chart-grid mb-6"> */}
         {Object.entries(top_projects_by_district).map(([district, projects]) => (
            <div key={district}>
               <TopProjectsList key={district} projects={projects as ProjectVote[]} title={`Distrito ${district} – Proyectos más votados`} />
            </div>
         ))}
         {/* </div> */}
      </div>
   );
};

export default Estadisticas;
