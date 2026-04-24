import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RankingTable } from "../../pages/publics/PublicAtoms";
import { Project } from "../../domains/models/project.model";
import { icons } from "../../constant";

export interface VoteByCasillaEntry {
   casilla_id: number;
   casilla_place: string | null;
   project_id: number;
   project_name: string;
   folio: number;
   assigned_district: number;
   votes: number;
}

export type VotesByCasilla = Record<string, VoteByCasillaEntry[]>;

interface RankingTablesByCasillasProps {
   votesByCasillaGrouped: VotesByCasilla;
   title?: string;
   exportable?: boolean;
}

const RankingTablesByCasillas: React.FC<RankingTablesByCasillasProps> = ({ votesByCasillaGrouped, title = "Votos por Casilla", exportable = true }) => {
   // Estado para saber qué casillas están colapsadas (por defecto ninguna)
   const [collapsedTable, setCollapsedTable] = useState<boolean>(false);
   const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

   const toggleCollapse = (casillaKey: string) => {
      setCollapsed((prev) => ({ ...prev, [casillaKey]: !prev[casillaKey] }));
   };

   const exportToPDF = () => {
      const entries = Object.entries(votesByCasillaGrouped);
      if (entries.length === 0) return;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(title, pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const today = new Date().toLocaleDateString("es-MX");
      doc.text(`Generado: ${today}`, pageWidth / 2, 22, { align: "center" });

      let y = 30;

      entries.forEach(([casillaPlace, proyectos], idx) => {
         if (idx > 0 && y > 250) {
            doc.addPage();
            y = 20;
         }

         const displayName = casillaPlace === "null" ? "Casilla sin nombre" : casillaPlace;
         const district = proyectos[0].assigned_district;
         doc.setFontSize(14);
         doc.setFont("helvetica", "bold");
         doc.text(`${displayName} • Distrito:${district}`, 14, y);
         y += 6;

         const tableData = proyectos.map((p) => [p.folio?.toString() ?? "-", `${p.project_name || ""}`, p.votes.toLocaleString()]);

         autoTable(doc, {
            startY: y,
            head: [["Folio", "Proyecto", "Votos"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [155, 34, 66], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 12, right: 12 },
            columnStyles: {
               0: { cellWidth: 15 },
               1: { cellWidth: "auto" },
               2: { cellWidth: 20, halign: "right", fontStyle: "bold" }
            },
            didParseCell: function (data) {
               // Si es la celda del encabezado y es la columna 3 (Votos)
               if (data.section === "head" && data.column.index === 2) {
                  data.cell.styles.halign = "right"; // Solo el encabezado a la derecha
                  data.cell.styles.fontStyle = "bold";
               }
               // Opcional: si quieres que el cuerpo de esa columna vaya a la derecha también, lo quitas.
            }
         });

         y = (doc as any).lastAutoTable.finalY + 8;
      });

      doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
   };

   return (
      <div className="card">
         <div className="card-header" style={{ justifyContent: "space-between", cursor: "pointer" }} onClick={() => setCollapsedTable(!collapsedTable)}>
            <span className="card-title-text cursor-pointer flex justify-between items-center">
               🏆 {title}&nbsp;
               <span className={`transition-all ease-in-out ${collapsedTable && "rotate-180"}`}>
                  <icons.Lu.LuChevronUp size={18} />
               </span>
            </span>
            {exportable && (
               <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: ".7rem" }} onClick={exportToPDF} type="button">
                  📄 Exportar PDF
               </button>
            )}
         </div>
         {!collapsedTable && (
            <div className="card-body">
               <div className="overflow-x-auto grid-2">
                  {Object.entries(votesByCasillaGrouped).map(([casilla, proyectos]) => {
                     const isCollapsed = collapsed[casilla] ?? false;
                     const displayName = casilla === "null" ? "Casilla sin nombre" : casilla;
                     const votesByProject = proyectos.map((p) => Number(p.votes)).filter((v) => !isNaN(v));

                     return (
                        <div key={casilla} className="card mb-4">
                           <div
                              className="card-header cursor-pointer flex justify-between items-center"
                              onClick={() => toggleCollapse(casilla)}
                              style={{ cursor: "pointer" }}
                           >
                              <span className="card-title-text">🏛️ {displayName}</span>
                              <span className="badge badge-primary ml-2" style={{ marginInline: 5 }}>
                                 {"Votos"}: {Number(votesByProject.reduce((a, b) => a + b, 0)).toLocaleString()}
                              </span>
                              <span className={`transition-all ease-in-out ${isCollapsed && "rotate-180"}`}>
                                 <icons.Lu.LuChevronUp size={18} />
                              </span>
                           </div>
                           {!isCollapsed && (
                              <div className="card-body overflow-y-auto max-h-[51vh]">
                                 <RankingTable
                                    entries={proyectos.map((p) => ({
                                       project: {
                                          id: p.project_id,
                                          project_name: p.project_name || p.project_name,
                                          folio: p.folio,
                                          assigned_district: p.assigned_district
                                       },
                                       votes: p.votes
                                    }))}
                                 />
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
};

export default RankingTablesByCasillas;
