export interface Ballot {
   id: number;
   user_id: number; // que es la casilla
   vote_1: number; //id del proyecto que se dio en el voto1
   vote_2: number; //id del proyecto que se dio en el voto2
   vote_3: number; //id del proyecto que se dio en el voto3
   vote_4: number; //id del proyecto que se dio en el voto4
   vote_5: number; //id del proyecto que se dio en el voto5

   active?: boolean;
   created_at?: Date | string;
   updated_at?: Date;
   deleted_at?: Date;
}
