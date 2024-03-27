import * as dotenv from "dotenv";

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface EnvironmentVariables {
  PORT: number;
  DB_NAME: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  ROOT_DOCS_PATH: string;
  USER_SECRET: string;
  RECRUITER_SECRET: string;
}

export function env(): EnvironmentVariables {
  dotenv.config({ override: true });

  const ans: EnvironmentVariables = {
    PORT: Number(process.env.PORT),
    DB_NAME: process.env.DB_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: Number(process.env.DB_PORT),
    ROOT_DOCS_PATH: process.env.ROOT_DOCS_PATH || "/api/v1",
    USER_SECRET: process.env.USER_SECRET,
    RECRUITER_SECRET: process.env.RECRUITER_SECRET,
  };

  for (const key in ans) {
    if (ans[key] === undefined) throw new Error(`${key} not found in environment variables`);
  }

  return ans;
}
