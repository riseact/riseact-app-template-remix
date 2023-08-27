import { v4 as uuidv4 } from 'uuid';
import type { RiseactConfig } from "..";
import { OAuthClient } from "./oauth";


export const CODE_VERIFIER_COOKIE = "X-Code-Verifier";

export interface RiseactSession {
  uuid: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  username: string;
  email: string;
  organization: string;
  organizationName: string;
}

export interface SessionStorage {
  save: (session: RiseactSession) => Promise<void>;
  load: (organization: string) => Promise<RiseactSession | null>;
}

export function authorization(config: RiseactConfig) {
  async function session(): Promise<RiseactSession | null> {
    return await config.sessionStorage.load("riseact");
  }

  async function getAuthorization() {
    const conf = getOAuthClientConfig();
    const client = await OAuthClient(conf);

    return client.getAuthorizationData();
  }

  async function initSession(
    code: string,
    codeVerified: string,
  ): Promise<RiseactSession> {
    const conf = getOAuthClientConfig();
    const client = await OAuthClient(conf);

    const token = await client.getAccessToken(code, codeVerified);

    if (!token.access_token || !token.refresh_token || !token.expires_at) {
      throw Error("OAuth token not valid. Check OAuth credentials");
    }

    const userInfo = await client.getUserInfo(token);

    const session = {
      uuid: uuidv4(),
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_at,
      userId: userInfo.sub,
      username: userInfo.name,
      email: userInfo.email,
      organization: userInfo.organization,
      organizationName: userInfo.organization_name,
    };

    config.sessionStorage.save(session);

    return session;
  }

  function getOAuthClientConfig() {
    return {
      host: process.env.ACCOUNTS_HOST || "http://accounts.riseact.org",
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.appUrl + config.authPathPrefix + "/callback",
    };
  }

  return {
    session,
    getAuthorization,
    initSession,
  };
}
