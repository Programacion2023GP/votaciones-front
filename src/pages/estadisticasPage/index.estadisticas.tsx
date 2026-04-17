import React, { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatDatetime } from "../../utils/helpers";
import useAuthData from "../../hooks/useAuthData";
import useParticipationsData from "../../hooks/useParticipationsData";
import useBallotsData from "../../hooks/useBallotsData";
import useProjectsData from "../../hooks/useProjectsData";
import sAlert from "../../utils/sAlert";
import { icons } from "../../constant";
import useUsersData from "../../hooks/useUsersData";

const Estadisticas: React.FC = () => {
   // --- Hooks ---
   const userAuth = useAuthData().persist.auth;
   const usersContext = useUsersData();
   const participationContext = useParticipationsData();
   const projectsContext = useProjectsData();
   const ballotsContext = useBallotsData();

   // --- Estados locales ---
   const [search, setSearch] = useState("");
   const [filtroTipo, setFiltroTipo] = useState<"todos" | "INE" | "Carta Identidad">("todos");
   const [filtroCasilla, setFiltroCasilla] = useState<string>("todas");
   const [refreshing, setRefreshing] = useState(false);

   // --- Refrescar todos los datos ---
   const refreshAll = useCallback(async () => {
      setRefreshing(true);
      try {
         await Promise.all([participationContext.fetchData(), projectsContext.fetchData(), ballotsContext.fetchData()]);
         sAlert.Customizable("Actualizado", "Los datos se han actualizado correctamente", "success", true);
      } catch (error) {
         console.error(error);
         sAlert.Customizable("Error", "No se pudieron actualizar los datos", "error", true);
      } finally {
         setRefreshing(false);
      }
   }, [participationContext, projectsContext, ballotsContext]);

   // --- Datos derivados ---
   const casillas = useMemo(() => [...new Set(participationContext.items.map((p) => p.user_id))], [participationContext.items]);

   // Participaciones filtradas
   const filtered = useMemo(() => {
      return participationContext.items.filter((p) => {
         const s = search.toLowerCase();
         const matchS = p.curp.toLowerCase().includes(s) || String(p.user_id).toLowerCase().includes(s);
         const matchT = filtroTipo === "todos" || p.type === filtroTipo;
         const matchC = filtroCasilla === "todas" || String(p.user_id) === filtroCasilla;
         return matchS && matchT && matchC;
      });
   }, [participationContext.items, search, filtroTipo, filtroCasilla]);

   // Estadísticas básicas
   const totalParticipaciones = participationContext.items.length;
   const totalINE = participationContext.items.filter((p) => p.type === "INE").length;
   const totalDOC = totalParticipaciones - totalINE;
   const casillasActivas = casillas.length;

   // Estadísticas de boletas
   const totalBallots = ballotsContext.items.length;
   const avgVotesPerBallot = useMemo(() => {
      if (totalBallots === 0) return 0;
      const totalVotes = ballotsContext.items.reduce((sum, b) => {
         const votes = [b.vote_1, b.vote_2, b.vote_3, b.vote_4, b.vote_5].filter((v) => v && v > 0).length;
         console.log("🚀 ~ Estadisticas ~ votes:", votes)
         return sum + votes;
      }, 0);
      return (totalVotes / totalBallots).toFixed(1);
   }, [ballotsContext.items, totalBallots]);

   const fullBallots = ballotsContext.items.filter((b) => {
      const votes = [b.vote_1, b.vote_2, b.vote_3, b.vote_4, b.vote_5].filter((v) => v && v > 0).length;
      return votes === 5;
   }).length;
   const fullPercent = totalBallots ? ((fullBallots / totalBallots) * 100).toFixed(1) : 0;

   // --- TOP 10 proyectos más votados ---
   const topProjects = useMemo(() => {
      const votes: Record<number, number> = {};
      // Inicializar contadores
      projectsContext.items.forEach((proj) => {
         votes[proj.id] = 0;
      });
      // Contar apariciones en todas las boletas
      ballotsContext.items.forEach((ballot) => {
         const voteFields = [ballot.vote_1, ballot.vote_2, ballot.vote_3, ballot.vote_4, ballot.vote_5];
         voteFields.forEach((projId) => {
            if (projId && projId > 0 && votes[projId] !== undefined) {
               votes[projId]++;
            }
         });
      });
      // Convertir a array, ordenar y tomar top 10
      return Object.entries(votes)
         .map(([id, count]) => ({
            id: parseInt(id),
            count,
            name: projectsContext.items.find((p) => p.id === parseInt(id))?.project_name || "Sin nombre",
            district: projectsContext.items.find((p) => p.id === parseInt(id))?.assigned_district
         }))
         .sort((a, b) => b.count - a.count)
         .slice(0, 10);
   }, [projectsContext.items, ballotsContext.items]);

   // Datos para gráficas
   const pieData = [
      { name: "INE", value: totalINE, color: "#9B2242" },
      { name: "Carta Identidad", value: totalDOC, color: "#474C55" }
   ];

   const barData = casillas.map((c) => ({
      name: `Casilla ${c}`,
      participaciones: participationContext.items.filter((p) => p.user_id === c).length
   }));

   const topProjectsData = topProjects.map((p, idx) => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + "…" : p.name,
      votos: p.count,
      fullName: p.name,
      district: p.district
   }));

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
            <div>
               <div className="breadcrumb">
                  Catálogos <span>›</span> <span>Estadísticas</span>
               </div>
               <h1 className="page-title">Tablero de Análisis</h1>
               <p className="page-subtitle">Monitoreo integral de participación y votación</p>
            </div>
         </div>

         {/* STATS GRID */}
         <div className="stats-grid">
            <div className="stat-card">
               <div className="stat-accent" />
               <div className="stat-icon">🗳️</div>
               <div className="stat-value">{totalParticipaciones}</div>
               <div className="stat-label">Participaciones</div>
            </div>
            <div className="stat-card">
               <div className="stat-accent blue" />
               <div className="stat-icon blue">🪪</div>
               <div className="stat-value">{totalINE}</div>
               <div className="stat-label">INE</div>
               <div className="stat-change" style={{ color: "#2980B9" }}>
                  {totalParticipaciones ? Math.round((totalINE / totalParticipaciones) * 100) : 0}%
               </div>
            </div>
            <div className="stat-card">
               <div className="stat-accent green" />
               <div className="stat-icon green">📄</div>
               <div className="stat-value">{totalDOC}</div>
               <div className="stat-label">Carta Identidad</div>
               <div className="stat-change" style={{ color: "#27AE60" }}>
                  {totalParticipaciones ? Math.round((totalDOC / totalParticipaciones) * 100) : 0}%
               </div>
            </div>
            <div className="stat-card">
               <div className="stat-accent orange" />
               <div className="stat-icon orange">🏛️</div>
               <div className="stat-value">{casillasActivas}</div>
               <div className="stat-label">Casillas activas</div>
            </div>
            <div className="stat-card">
               <div className="stat-accent purple" />
               <div className="stat-icon purple">📋</div>
               <div className="stat-value">{totalBallots}</div>
               <div className="stat-label">Boletas emitidas</div>
            </div>
            <div className="stat-card">
               <div className="stat-accent purple" />
               <div className="stat-icon purple">⭐</div>
               <div className="stat-value">{avgVotesPerBallot}</div>
               <div className="stat-label">Promedio votos/boleta</div>
            </div>
            <div className="stat-card">
               <div className="stat-accent purple" />
               <div className="stat-icon purple">✅</div>
               <div className="stat-value">{fullPercent}%</div>
               <div className="stat-label">Boletas completas</div>
            </div>
            <div className="stat-card">
               <div className="stat-accent" />
               <div className="stat-icon">📦</div>
               <div className="stat-value">{projectsContext.items.length}</div>
               <div className="stat-label">Proyectos registrados</div>
            </div>
         </div>

         {/* GRÁFICAS */}
         <div className="chart-grid mb-6">
            <div className="card">
               <div className="card-header">
                  <span className="card-title-text">Por tipo de documento</span>
               </div>
               <div className="card-body">
                  <div className="chart-wrap">
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                           <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={2} dataKey="value">
                              {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ fontFamily: "Nunito Sans", borderRadius: 8, border: "1px solid #eee" }} />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontFamily: "Nunito Sans", fontSize: 12 }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="card">
               <div className="card-header">
                  <span className="card-title-text">Participaciones por casilla</span>
               </div>
               <div className="card-body">
                  <div className="chart-wrap">
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                           <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Nunito Sans" }} />
                           <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: "Nunito Sans" }} />
                           <Tooltip contentStyle={{ fontFamily: "Nunito Sans", borderRadius: 8, border: "1px solid #eee" }} />
                           <Bar dataKey="participaciones" fill="#9B2242" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </div>

         {/* TOP 10 PROYECTOS MÁS VOTADOS */}
         <div className="card mb-6">
            <div className="card-header">
               <span className="card-title-text">🏆 Top 10 proyectos más votados</span>
            </div>
            <div className="card-body">
               <div className="chart-wrap" style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={topProjectsData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, width: 100 }} width={120} />
                        <Tooltip
                           contentStyle={{ fontFamily: "Nunito Sans", borderRadius: 8 }}
                           formatter={(value, name, props) => [`${value} votos`, props.payload.fullName]}
                        />
                        <Bar dataKey="votos" fill="#9B2242" radius={[0, 6, 6, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* TABLA DE PARTICIPACIONES */}
         <div className="card">
            <div className="card-header">
               <div className="search-wrap">
                  <div className="search-input-wrap">
                     <span className="search-icon">🔍</span>
                     <input className="search-input" placeholder="Buscar por CURP o casilla..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <select className="filter-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "todos" | "INE" | "Carta Identidad")}>
                     <option value="todos">Todos los tipos</option>
                     <option value="INE">INE</option>
                     <option value="Carta Identidad">Carta Identidad</option>
                  </select>
                  <select className="filter-select" value={filtroCasilla} onChange={(e) => setFiltroCasilla(e.target.value)}>
                     <option value="todas">Todas las casillas</option>
                     {casillas.map((c) => (
                        <option key={c} value={String(c)}>
                           Casilla {c}
                        </option>
                     ))}
                  </select>
               </div>
               <span style={{ fontSize: 12, color: "var(--blanco)", fontWeight: 600 }}>{filtered.length} registros</span>
            </div>
            <div className="table-wrap">
               <table className="w-full">
                  <thead>
                     <tr>
                        <th>#</th>
                        <th>Tipo</th>
                        <th>CURP</th>
                        <th>Casilla</th>
                        <th>Fecha y Hora</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.length === 0 ? (
                        <tr>
                           <td colSpan={5}>
                              <div className="empty-state">
                                 <div className="empty-icon">📊</div>
                                 <div className="empty-title">Sin registros</div>
                                 <div className="empty-desc">No hay participaciones que coincidan</div>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        filtered.map((p, i) => (
                           <tr key={p.id}>
                              <td style={{ color: "var(--gris-claro)", fontSize: 12 }}>{String(i + 1).padStart(3, "0")}</td>
                              <td>
                                 <span className={`badge ${p.type === "INE" ? "badge-ine" : "badge-doc"}`}>
                                    {p.type === "INE" ? "🪪" : "📄"} {p.type}
                                 </span>
                              </td>
                              <td>
                                 <span className="font-mono" style={{ fontSize: 12, color: "var(--negro)", fontWeight: 700 }}>
                                    {p.curp}
                                 </span>
                              </td>
                              <td>
                                 <span className="casilla-tag">🏛️ {usersContext.items.find((u) => u.id === p.user_id)?.full_name}</span>
                              </td>
                              <td style={{ color: "var(--gris)", fontSize: 12 }}>{formatDatetime(p.created_at, true)}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default Estadisticas;
