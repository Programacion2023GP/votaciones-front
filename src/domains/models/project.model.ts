export interface Project {
   [x: string]: any;
   id: number;
   folio: number;
   assigned_district: number;
   project_name: string;
   project_place: string;
   viability: boolean;

   active?: boolean;
   created_at?: Date | string;
   updated_at?: Date;
   deleted_at?: Date;

   casilla_district?: number;
}

// export interface Project {
//    id: number;
//    username: string ;
//    email: string ;
//    password: string ;
//    role_id: bigint UN ;
//    casilla_id: bigint UN ;
//    active: boolean1 ;
//    created_at?: timestamp ;
//    updated_at?: timestamp ;
//    deleted_at?: datetime;
// }
