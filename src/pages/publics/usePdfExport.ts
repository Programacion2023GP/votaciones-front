import { useCallback } from "react";
import type { Project } from "../../domains/models/project.model";
import type { Casilla } from "../../domains/models/casilla.model";

// ─── Estilos base del PDF ─────────────────────────────────────────────────
const PDF_STYLES = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #130D0E; padding: 24px; }
    h1 { font-size: 18px; color: #651D32; margin-bottom: 4px; }
    .subtitle { font-size: 10px; color: #727372; margin-bottom: 18px; }
    .meta { display: flex; gap: 24px; margin-bottom: 16px; font-size: 10px; color: #474C55; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    thead th {
      background: #651D32;
      color: #fff;
      padding: 7px 10px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    tbody tr:nth-child(even) { background: #f9f5f5; }
    tbody td { padding: 6px 10px; border-bottom: 1px solid #eee; }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-true  { background: #d4edda; color: #155724; }
    .badge-false { background: #f8d7da; color: #721c24; }
    footer { margin-top: 20px; font-size: 9px; color: #B8B6AF; text-align: center; }
    @media print { body { padding: 12px; } }
  </style>
`;

const now = () =>
  new Date().toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

// ─── Hook ─────────────────────────────────────────────────────────────────
export function usePdfExport() {
  /**
   * Abre una ventana emergente con el HTML generado y dispara window.print().
   * El navegador maneja el diálogo de guardar como PDF.
   */
  const printWindow = useCallback((html: string, title: string) => {
    const win = window.open("", "_blank");
    if (!win) {
      alert("Activa las ventanas emergentes para descargar el PDF.");
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>${title}</title>
        ${PDF_STYLES}
      </head>
      <body>
        ${html}
        <script>window.onload = () => { window.print(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  }, []);

  // ── Exportar proyectos ─────────────────────────────────────────────────
  const exportProyectos = useCallback(
    (projects: Project[], districtFilter: number | null) => {
      const filtered = districtFilter != null
        ? projects.filter((p) => p.assigned_district === districtFilter)
        : projects;

      const rows = filtered
        .map(
          (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.folio}</td>
          <td>${p.assigned_district}</td>
          <td>${p.project_name}</td>
          <td>${p.project_place}</td>
          <td>
            <span class="badge badge-${p.viability}">
              ${p.viability ? "Viable" : "No viable"}
            </span>
          </td>
        </tr>`
        )
        .join("");

      const html = `
        <h1>🦅 Catálogo de Proyectos — Presupuesto Participativo 2025</h1>
        <div class="subtitle">Sistema de Participación Ciudadana · Gobierno de México</div>
        <div class="meta">
          <span>📅 Generado: ${now()}</span>
          <span>📊 Total: ${filtered.length} proyectos</span>
          ${districtFilter != null ? `<span>🗺 Distrito: ${districtFilter}</span>` : ""}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Folio</th><th>Distrito</th>
              <th>Nombre del Proyecto</th><th>Lugar</th><th>Viabilidad</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <footer>Documento generado automáticamente · Solo para consulta</footer>
      `;

      printWindow(html, "Proyectos-Participacion-Ciudadana");
    },
    [printWindow]
  );

  // ── Exportar casillas ──────────────────────────────────────────────────
  const exportCasillas = useCallback(
    (casillas: Casilla[]) => {
      const rows = casillas
        .map(
          (c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${c.district}</td>
          <td>${c.type ?? "—"}</td>
          <td>${c.place}</td>
          <td>${c.perimeter}</td>
          <td>${c.location}</td>
          <td>
            <span class="badge badge-${c.active ?? true}">
              ${c.active !== false ? "Activa" : "Inactiva"}
            </span>
          </td>
        </tr>`
        )
        .join("");

      const html = `
        <h1>🦅 Catálogo de Casillas — Presupuesto Participativo 2025</h1>
        <div class="subtitle">Sistema de Participación Ciudadana · Gobierno de México</div>
        <div class="meta">
          <span>📅 Generado: ${now()}</span>
          <span>📊 Total: ${casillas.length} casillas</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Distrito</th><th>Tipo</th>
              <th>Nombre / Lugar</th><th>Perímetro</th><th>Ubicación</th><th>Estatus</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <footer>Documento generado automáticamente · Solo para consulta</footer>
      `;

      printWindow(html, "Casillas-Participacion-Ciudadana");
    },
    [printWindow]
  );

  return { exportProyectos, exportCasillas };
}
