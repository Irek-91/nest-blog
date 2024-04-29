declare global {
  namespace Express {
    export interface Request {
      //user: string | false
      userId: string | null;
    }
  }
}

declare namespace NodeJS {
  interface Global {
    __TESTCONTAINER__: any;
  }
}
