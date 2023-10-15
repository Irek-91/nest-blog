import { ObjectId } from "mongoose";

export type CreatUserInputModel = {
    login: string;
    password: string;
    email: string;
  };

  export type userViewModel = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}


export type userMongoModel = {
    _id: ObjectId,
    accountData: {
        login: string,
        email: string,
        salt: string,
        hash: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expiritionDate: any,
        isConfirmed: boolean,
        recoveryCode: string
    }
}
