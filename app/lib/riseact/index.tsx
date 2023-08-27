import type { RiseactSession, SessionStorage } from "./auth";
import { authorization } from "./auth";

export interface RiseactConfig {
  clientId: string;
  clientSecret: string;
  appUrl: string;
  authPathPrefix: string;
  sessionStorage: SessionStorage;
}

const defaultConfig: RiseactConfig = {
  clientId: "",
  clientSecret: "",
  appUrl: "",
  authPathPrefix: "/auth",
  sessionStorage: {
    save: async (session: RiseactSession) => {},
    load: async (organization: string) => null,
  },
};

export default function Riseact(config: RiseactConfig) {
  config = { ...defaultConfig, ...config };

  if (!config.clientId || !config.clientSecret || !config.appUrl) {
    throw Error("Riseact configuration not valid. Check OAuth credentials");
  }

  return {
    authorization: authorization(config),
  };
}
