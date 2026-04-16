export interface Participation {
   id: number;
   type: "INE" | "Carta Identidad" | null;
   curp: string;
   user_id: number;

   active?: boolean;
   created_at?: Date | string;
   updated_at?: Date;
   deleted_at?: Date;
}

// export interface Participation {
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
