import { userMeViewModel, userMongoModel } from "./types/user";
declare global {
    namespace Express {
        export interface Request {
            user: userMongoModel | false
            userId: string | null
        }
    }
   
}

declare namespace NodeJS {
    interface Global {
      __TESTCONTAINER__: any;
    }
  }