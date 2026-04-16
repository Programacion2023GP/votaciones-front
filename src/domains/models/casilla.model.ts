export interface Casilla {
   id: number;
   type: "Rural" | "Urbana" | "Especial" | null;
   district: number;
   perimeter: string;
   place: string;
   location: string;

   active?: boolean;
   created_at?: Date | string;
   updated_at?: Date;
   deleted_at?: Date;
}

// export interface Casilla {
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
