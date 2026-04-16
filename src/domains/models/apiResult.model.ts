export interface ApiResult<T> {
   status_code: number;
   status: boolean;
   message: string;
   alert_icon: string;
   alert_title: string;
   alert_text: string;
   result: T | T[];
   toast: boolean;
   errors?: any | any[] | null;
}

// export type Result<T> = | {
//    status:true
// } | {}
