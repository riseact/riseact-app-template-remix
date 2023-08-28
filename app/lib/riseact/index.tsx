import { GraphQLClient } from "graphql-request";
import type { RiseactSession, SessionStorage } from "./auth";
import { authorization } from "./auth";
import { initGraphqlClient } from "./clients/graphql/index.server";

export interface RiseactConfig {
  clientId: string;
  clientSecret: string;
  appUrl: string;
  authPathPrefix: string;
  sessionStorage: SessionStorage;
}

export interface RiseactAdmin {
  user: {
    username: string;
    email: string;
    organization: string;
  }
  graphql: GraphQLClient;
}

const defaultConfig: RiseactConfig = {
  clientId: "",
  clientSecret: "",
  appUrl: "",
  authPathPrefix: "/auth",
  sessionStorage: {
    save: async (session: RiseactSession) => {},
    load: async (request: Request) => null,
  },
};


export default function Riseact(config: RiseactConfig) {
  config = { ...defaultConfig, ...config };

  if (!config.clientId || !config.clientSecret || !config.appUrl) {
    throw Error("Riseact configuration not valid. Check OAuth credentials");
  }

  async function admin(request: Request): Promise<RiseactAdmin | null> {
    const session = await config.sessionStorage.load(request);
    console.log("admin session", session?.accessToken);

    if (session?.accessToken) {
      const graphql = initGraphqlClient(session.accessToken);

      return {
        user: {
          username: session.username,
          email: session.email,
          organization: session.organization,
        },
        graphql,
      }
    }

    return null
  }

  return {
    authorization: authorization(config),
    admin,
  };
}
