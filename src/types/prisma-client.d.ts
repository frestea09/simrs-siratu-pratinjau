declare module '@prisma/client' {
  export class PrismaClient {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export namespace Prisma {
    export type UserCreateInput = any;
  }
  export type RiskCategory = any;
  export type RiskLevel = any;
  export type RiskSource = any;
  export type RiskStatus = any;
}
