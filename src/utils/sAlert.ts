import Swal, { type SweetAlertIcon, type SweetAlertOptions, type SweetAlertResult } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// import { env } from "../constant";

// Tipado del tema (puedes ajustar si tienes types propios)
const colorPrimaryDark: string = "#e3e3e3";
// localStorage.getItem("mui-mode") === "dark" ? env.THEME.colorSchemes.dark.palette.primary.main : env.THEME.colorSchemes.light.palette.primary.main;

// Instancia tipada
const MySwal = withReactContent(Swal);

// Helpers
const buildHtml = (msg: string): string => `<h3>${msg}</h3>`;

// Métodos
const Success = (msg: string, timer: number | null = 1500): void => {
   MySwal.fire({
      icon: "success",
      html: buildHtml(msg),
      confirmButtonColor: colorPrimaryDark,
      showConfirmButton: timer === null,
      timer: timer ?? undefined,
      confirmButtonText: "<b>OK</b>"
   });
};

const Error = (msg: string): void => {
   MySwal.fire({
      icon: "error",
      title: "Error!",
      html: msg,
      confirmButtonColor: colorPrimaryDark,
      confirmButtonText: "<b>OK</b>"
   });
};

const Info = (msg: string, useHTML: boolean = false): void => {
   MySwal.fire({
      icon: "info",
      html: useHTML
         ? `
      <div
        style="
          max-height: 400px;
          overflow-y: auto;
          text-align: left;
          padding: 10px 15px;
          border-radius: 8px;
          background-color: #f9fafb;
          color: #333;
          font-family: 'Segoe UI', sans-serif;
        "
      >
        ${msg}
      </div>`
         : buildHtml(msg),
      confirmButtonColor: colorPrimaryDark,
      confirmButtonText: "<b>OK</b>",
      customClass: {
         popup: "swal-wide"
      }
   });
};

const Warning = (msg: string, width: string = "600px"): void => {
   MySwal.fire({
      icon: "warning",
      html: buildHtml(msg),
      confirmButtonColor: colorPrimaryDark,
      confirmButtonText: "<b>OK</b>",
      width
   });
};

// ⚠️ FIX IMPORTANTE: ahora retorna Promise correctamente
const Question = async (msg: string, confirmText: string = "Si, eliminar!", cancelText: string = "No, cancelar!"): Promise<SweetAlertResult<any>> => {
   return await MySwal.fire({
      icon: "question",
      html: buildHtml(msg),
      confirmButtonText: `<b>${confirmText}</b>`,
      confirmButtonColor: colorPrimaryDark,
      showCancelButton: true,
      cancelButtonText: `<b>${cancelText}</b>`,
      reverseButtons: true
   });
};

const Customizable = (msg: string, icon: SweetAlertIcon, showConfirmButton: boolean = false, timer: number = 1500): void => {
   MySwal.fire({
      icon,
      html: buildHtml(msg),
      confirmButtonColor: colorPrimaryDark,
      showConfirmButton,
      timer: showConfirmButton ? undefined : timer,
      confirmButtonText: "<b>OK</b>"
   });
};

// Config reutilizable
export const QuestionAlertConfig = (
   msg: string,
   confirmText: string = "Si, eliminar!",
   cancelText: string = "No, cancelar!",
   showCancelButton: boolean = true,
   showDenyButton: boolean = false,
   denyText: string = "Rechazar!"
): SweetAlertOptions => {
   return {
      icon: "question",
      html: buildHtml(msg),
      confirmButtonText: `<b>${confirmText}</b>`,
      confirmButtonColor: colorPrimaryDark,
      showCancelButton,
      showDenyButton,
      denyButtonText: `<b>${denyText}</b>`,
      cancelButtonText: `<b>${cancelText}</b>`,
      reverseButtons: true
   };
};

// Export
export default {
   Success,
   Error,
   Info,
   Warning,
   Question,
   Customizable
};
