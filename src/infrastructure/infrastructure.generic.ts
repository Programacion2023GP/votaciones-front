import type { Options } from "../components/forms/Select2";
import type { GenericRepository, RequestOptions, Result } from "../domains/repositories/generic.repository";
import { AxiosRequest, GetAxios } from "../utils/Axios";
import { genericConfig } from "../utils/generic.config";

export class GenericApi<T extends object> implements GenericRepository<T> {
   private cfg = genericConfig;

   private mapError(error: any): string {
      return error?.response?.data?.message ?? error?.message ?? this.cfg.messages.networkError;
   }

   async getAll(prefix: string): Promise<Result<T[]>> {
      try {
         const url = `${this.cfg.baseUrl}/${this.cfg.endpoints.getAll(prefix)}`;
         const res = await GetAxios(url);
         // console.log("🚀 ~ GenericApi ~ getAll ~ res:", res);
         const response = res.data ?? res;
         // console.log("🚀 ~ GenericApi ~ getAll ~ response:", response);

         const ok = this.cfg.responseMap.ok(response);
         const rawData = this.cfg.responseMap.data(response);
         const data = this.cfg.middlewares.afterResponse?.(rawData) ?? rawData;
         // console.log("🚀 ~ GenericApi ~ getAll ~ data:", data);
         const message = this.cfg.responseMap.message(response);

         if (ok) {
            return { ok: true, data, message };
         } else {
            return { ok: false, error: new Error(message), message };
         }
      } catch (error: any) {
         const message = this.mapError(error);
         return { ok: false, error: new Error(message), message };
      }
   }

   async getSelectIndex(prefix: string): Promise<Result<Options[]>> {
      try {
         const url = `${this.cfg.baseUrl}/${this.cfg.endpoints.getSelectIndex(prefix)}`;
         const res = await GetAxios(url);
         const response = res.data ?? res;

         const ok = this.cfg.responseMap.ok(response);
         const rawData = this.cfg.responseMap.data(response);
         const data = this.cfg.middlewares.afterResponse?.(rawData) ?? rawData;
         const message = this.cfg.responseMap.message(response);

         if (ok) {
            return { ok: true, data, message };
         } else {
            return { ok: false, error: new Error(message), message };
         }
      } catch (error: any) {
         const message = this.mapError(error);
         return { ok: false, error: new Error(message), message };
      }
   }

   async create(data: T | T[], prefix: string, formData = false): Promise<Result<T | T[]>> {
      try {
         const url = `${this.cfg.baseUrl}/${this.cfg.endpoints.create(prefix)}`;
         const payload = this.cfg.middlewares.beforeRequest?.(data) ?? data;
         const res = await AxiosRequest(url, "POST", payload, formData);
         // console.log("🚀 ~ GenericApi ~ create ~ res:", res);
         const response = res.data ?? res;
         // console.log("🚀 ~ GenericApi ~ create ~ response:", response);

         const ok = this.cfg.responseMap.ok(response);
         const rawData = this.cfg.responseMap.data(response);
         const message = this.cfg.responseMap.message(response) || this.cfg.messages.createSuccess;
         const errors = this.cfg.responseMap.errors(response) || this.cfg.messages.unknownError;

         if (ok) {
            return { ok: true, data: rawData, message };
         } else {
            return { ok: false, error: errors, message };
         }
      } catch (error: any) {
         const message = this.mapError(error);
         return { ok: false, error: new Error(message), message };
      }
   }

   async delete(data: T, prefix: string): Promise<Result<void>> {
      try {
         const url = `${this.cfg.baseUrl}/${this.cfg.endpoints.delete(prefix)}/${data?.id}`;
         const payload = this.cfg.middlewares.beforeRequest?.(data) ?? data;
         const res = await AxiosRequest(url, "DELETE", payload);
         const response = res.data ?? res;

         const ok = this.cfg.responseMap.ok(response);
         const message = this.cfg.responseMap.message(response) || this.cfg.messages.deleteSuccess;

         if (ok) {
            return { ok: true, data: undefined, message };
         } else {
            return { ok: false, error: new Error(message), message };
         }
      } catch (error: any) {
         const message = this.mapError(error);
         return { ok: false, error: new Error(message), message };
      }
   }

   async request<R = T>(options: RequestOptions<T>): Promise<Result<R>> {
      const { data, prefix, method, formData = false } = options;
      try {
         const url = `${this.cfg.baseUrl}/${this.cfg.endpoints.request(prefix)}`;
         const payload = data ? (this.cfg.middlewares.beforeRequest?.(data) ?? data) : data;

         const res = method === "GET" ? await GetAxios(url) : await AxiosRequest(url, method, payload, formData);
         // console.log("🚀 ~ GenericApi ~ request ~ res:", res)
         const response = res.data ?? res;

         const ok = this.cfg.responseMap.ok(response);
         const rawData = this.cfg.responseMap.data(response);
         const resData = this.cfg.middlewares.afterResponse?.(rawData) ?? rawData;
         const message = this.cfg.responseMap.message(response);
         const errors = this.cfg.responseMap.errors(response) || this.cfg.messages.unknownError;

         if (ok) {
            return { ok: true, data: resData as R, message };
         } else {
            return { ok: false, error: errors, message };
         }
      } catch (error: any) {
         const message = this.mapError(error);
         return { ok: false, error: new Error(message), message };
      }
   }
}
