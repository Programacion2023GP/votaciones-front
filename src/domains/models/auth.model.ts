export interface Auth {
   id: number;
   username: string;
   email: string;
   password: string;
   active: boolean;
   user_created_at: string;
   role_id: number;
   role_name: string;
   role_description: string;
   role_read: string; // "si" o "no" (o boolean dependiendo de tu BD)
   role_create: string;
   role_update: string;
   role_delete: string;
   role_more_permissions: string; // puede ser JSON o texto
   casilla_id: number | null;
   casilla_type: "Rural" | "Urbana" | "Especial" | null;
   casilla_district: number | null;
   casilla_perimeter: string | null;
   casilla_place: string | null;
   casilla_location: string | null;
   casilla_active: boolean | null;
   page_index: string;
   full_name: string;
   token?: string;
   // Permisos derivados (opcional, para facilitar uso en frontend)
   permissions?: {
      read: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      more_permissions: string;
   };
}

// export interface Auth {
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
