export interface User {
   id: number;
   username: string;
   password: string;
   email: string;
   role_id: number;
   casilla_id: number;
   active?: boolean;
   created_at?: Date | string;
   role?: Object;
   role_name?: string;
   role_description?: string;
   role_read?: string;
   role_create?: string;
   role_update?: string;
   role_delete?: string;
   role_more_permissions?: string;
   casilla_type?: "Rural" | "Urbana" | "Especial" | null;
   casilla_district?: number;
   casilla_perimeter?: string;
   casilla_place?: string;
   casilla_location?: string;
   casilla_active?: boolean;

   // VARIABLES DE LOGICA (Solo frontend)
   confirmPassword: string;
   changePassword: boolean;
}

// export interface User {
//    id: number;
//    username: varchar(255) ;
//    email: varchar(255) ;
//    password: varchar(255) ;
//    role_id: bigint UN ;
//    casilla_id: bigint UN ;
//    active: tinyint(1) ;
//    created_at?: timestamp ;
//    updated_at?: timestamp ;
//    deleted_at?: datetime;
// }
