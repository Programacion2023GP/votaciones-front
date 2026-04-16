export interface Role {
   id: number;
   role: string;
   description: string;
   read: string;
   create: string;
   update: string;
   delete: string;
   more_permissions: string;
   page_index: string;
   active?: boolean;
   created_at?: Date | string;
   updated_at?: Date;
   deleted_at?: Date;
}

// export interface Role {
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
