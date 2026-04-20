import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ProjectVote {
   id: number;
   project_name: string;
   assigned_district: number;
   votos: number;
}

interface TopProjectsListProps {
   projects: ProjectVote[];
   title?: string;
   exportable?: boolean; // nueva prop: si se muestra botón de exportar
}

const TopProjectsList: React.FC<TopProjectsListProps> = ({ projects, title = "Proyectos más votados", exportable = true }) => {
   // Función para exportar a PDF
   const exportToPDF = () => {
      if (projects.length === 0) return;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(title, pageWidth / 2, 15, { align: "center" });

      // Subtítulo (fecha de generación)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const today = new Date().toLocaleDateString("es-MX");
      doc.text(`Generado: ${today}`, pageWidth / 2, 22, { align: "center" });

      // Construir datos para la tabla
      // const tableData = projects.map((proj, idx) => [(idx + 1).toString(), proj.project_name, proj.assigned_district.toString() ?? "-", proj.votos.toString()]);

      if (projects[0]?.assigned_district) {
         const tableData = projects.map((proj, idx) => [
            (proj.project_name.split(" - ")?.[0] ?? "0").toString(),
            `${proj.project_name.split(" - ")?.[1]} - ${proj.project_name.split(" - ")?.[2]}`,
            proj?.assigned_district.toString() ?? "-",
            proj.votos.toString()
         ]);

         // Generar tabla
         autoTable(doc, {
            startY: 30,
            head: [["Folio", "Proyecto", "Distrito", "Votos"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [155, 34, 66], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 12, right: 12 },
            columnStyles: {
               0: { cellWidth: 12 },
               1: { cellWidth: "auto" },
               2: { cellWidth: 20, halign: "center" },
               3: { cellWidth: 20, halign: "right", fontStyle: "bold" }
            },
            didParseCell: function (data) {
               // Si es la celda del encabezado y es la columna 3 (Votos)
               if (data.section === "head" && data.column.index === 3) {
                  data.cell.styles.halign = "right"; // Solo el encabezado a la derecha
                  data.cell.styles.fontStyle = "bold";
               }
               // Opcional: si quieres que el cuerpo de esa columna vaya a la derecha también, lo quitas.
            }
         });
      } else {
         const tableData = projects.map((proj, idx) => [
            (proj.project_name.split(" - ")?.[0] ?? "0").toString(),
            `${proj.project_name.split(" - ")?.[1]} - ${proj.project_name.split(" - ")?.[2]}`,
            proj.votos.toString()
         ]);

         // Generar tabla
         autoTable(doc, {
            startY: 30,
            head: [["Folio", "Proyecto", "Votos"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [155, 34, 66], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 12, right: 12 },
            columnStyles: {
               0: { cellWidth: 12 },
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
      }

      // Guardar PDF
      doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
   };

   return (
      <div className="card">
         <div className="card-header" style={{ justifyContent: "space-between" }}>
            <span className="card-title-text">🏆 {title}</span>
            {exportable && projects.length > 0 && (
               <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: ".7rem" }} onClick={exportToPDF} type="button">
                  📄 Exportar PDF
               </button>
            )}
         </div>
         <div className="card-body">
            <div className="overflow-x-auto">
               <table className="min-w-full">
                  <thead>
                     <tr>
                        <th>#</th>
                        <th>Proyecto</th>
                        <th>Distrito</th>
                        <th>Votos</th>
                     </tr>
                  </thead>
                  <tbody>
                     {projects.map((proj, idx) => (
                        <tr key={proj.id}>
                           <td className="font-bold text-guinda">{idx + 1}</td>
                           <td>{proj.project_name}</td>
                           <td>{proj.assigned_district}</td>
                           <td>{proj.votos}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default TopProjectsList;
