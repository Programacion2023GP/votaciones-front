import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
// import useStore from "../store/useStore";
import { fmtFecha, formatDatetime } from "../utils/helpers";
import useAuthData from "../hooks/useAuthData";
import useParticipationsData from "../hooks/useParticipationsData";

const Participaciones: React.FC = () => {
   const userAuth = useAuthData().persist.auth;
   const participationContext = useParticipationsData();

   // State for filters
   const [search, setSearch] = useState("");
   const [filtroTipo, setFiltroTipo] = useState<"todos" | "INE" | "Carta Identidad">("todos");
   const [filtroCasilla, setFiltroCasilla] = useState<string>("todas");

   // Derived data
   const casillas = useMemo(() => [...new Set(participationContext.items.map((p) => p.user_id))], [participationContext.items]);

   const filtered = useMemo(() => {
      return participationContext.items.filter((p) => {
         const s = search.toLowerCase();
         const matchS = p.curp.toLowerCase().includes(s) || String(p.user_id).toLowerCase().includes(s);
         const matchT = filtroTipo === "todos" || p.type === filtroTipo;
         const matchC = filtroCasilla === "todas" || String(p.user_id) === filtroCasilla;
         return matchS && matchT && matchC;
      });
   }, [participationContext.items, search, filtroTipo, filtroCasilla]);

   // Stats
   const totalINE = participationContext.items.filter((p) => p.type === "INE").length;
   const totalDOC = participationContext.items.filter((p) => p.type === "Carta Identidad").length;
   const byCasilla = casillas.map((c) => ({
      casilla: c,
      count: participationContext.items.filter((p) => p.user_id === c).length
   }));

   // Data for pie chart (doughnut style)
   const pieData = [
      { name: "INE", value: totalINE, color: "#9B2242" },
      { name: "Carta Identidad", value: totalDOC, color: "#474C55" }
   ];

   // Data for bar chart
   const barData = byCasilla.map(({ casilla, count }) => ({ name: casilla, participaciones: count }));

   return (
      <>
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Catálogos <span>›</span> <span>Participaciones</span>
               </div>
               <h1 className="page-title">Listado de Participaciones</h1>
               <p className="page-subtitle">Monitoreo y estadísticos de participación electoral</p>
            </div>
         </div>

         {/* STATS */}
         <div className="stats-grid">
            <div className="stat-card">
               <div className="stat-accent" />
               <div className="stat-icon">🗳️</div>
               <div className="stat-value">{participationContext.items.length}</div>
               <div className="stat-label">Total Participaciones</div>
               <div className="stat-change">↑ Actualizado ahora</div>
            </div>
            <div className="stat-card">
               <div className="stat-accent blue" />
               <div className="stat-icon blue">🪪</div>
               <div className="stat-value">{totalINE}</div>
               <div className="stat-label">Via INE</div>
               <div className="stat-change" style={{ color: "#2980B9" }}>
                  {participationContext.items.length ? Math.round((totalINE / participationContext.items.length) * 100) : 0}% del total
               </div>
            </div>
            <div className="stat-card">
               <div className="stat-accent green" />
               <div className="stat-icon green">📄</div>
               <div className="stat-value">{totalDOC}</div>
               <div className="stat-label">Via Carta Identidad</div>
               <div className="stat-change" style={{ color: "#27AE60" }}>
                  {participationContext.items.length ? Math.round((totalDOC / participationContext.items.length) * 100) : 0}% del total
               </div>
            </div>
            <div className="stat-card">
               <div className="stat-accent orange" />
               <div className="stat-icon orange">🏛️</div>
               <div className="stat-value">{casillas.length}</div>
               <div className="stat-label">Casillas con actividad</div>
            </div>
         </div>

         {/* CHARTS */}
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
                           <Tooltip
                              contentStyle={{
                                 fontFamily: "Nunito Sans",
                                 borderRadius: 8,
                                 border: "1px solid #eee"
                              }}
                           />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontFamily: "Nunito Sans", fontSize: 12 }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
            <div className="card">
               <div className="card-header">
                  <span className="card-title-text">Por casilla</span>
               </div>
               <div className="card-body">
                  <div className="chart-wrap">
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                           <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Nunito Sans" }} />
                           <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: "Nunito Sans" }} />
                           <Tooltip
                              contentStyle={{
                                 fontFamily: "Nunito Sans",
                                 borderRadius: 8,
                                 border: "1px solid #eee"
                              }}
                           />
                           <Bar dataKey="participationContext.items" fill="#9B2242" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </div>

         {/* TABLE */}
         <div className="card">
            <div className="card-header">
               <div className="search-wrap">
                  <div className="search-input-wrap">
                     <span className="search-icon">🔍</span>
                     <input className="search-input" placeholder="Buscar por curp o casilla..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <select className="filter-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "todos" | "INE" | "Carta Identidad")}>
                     <option value="todos">Todos los tipos</option>
                     <option value="INE">INE</option>
                     <option value="Carta Identidad">Carta Identidad</option>
                  </select>
                  <select className="filter-select" value={filtroCasilla} onChange={(e) => setFiltroCasilla(e.target.value)}>
                     <option value="todas">Todas las casillas</option>
                     {casillas.map((c) => (
                        <option key={c} value={c}>
                           {c}
                        </option>
                     ))}
                  </select>
               </div>
               <span style={{ fontSize: 12, color: "var(--blanco)", fontWeight: 600 }}>{filtered.length} registros</span>
            </div>
            <div className="table-wrap">
               <table>
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
                     {filtered.length === 0 && (
                        <tr>
                           <td colSpan={5}>
                              <div className="empty-state">
                                 <div className="empty-icon">📊</div>
                                 <div className="empty-title">Sin registros</div>
                                 <div className="empty-desc">No hay participationContext.items que coincidan</div>
                              </div>
                           </td>
                        </tr>
                     )}
                     {filtered.map((p, i) => (
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
                              <span className="casilla-tag">🏛️ {p.user_id}</span>
                           </td>
                           <td style={{ color: "var(--gris)", fontSize: 12 }}>{formatDatetime(p.created_at, false)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </>
   );
};

export default Participaciones;
