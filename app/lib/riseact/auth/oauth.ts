import { Issuer, TokenSet, generators } from "openid-client";

export type AuthConfig = {
  host: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

interface AuthorizationData {
  url: string;
  codeVerifier: string;
}

interface UserInfo {
  sub: string;
  name: string;
  email: string;
  organization: string;
  organization_name: string;
}

export async function OAuthClient(config: AuthConfig) {
  const issuer = await Issuer.discover(
    config.host + "/oauth/.well-known/openid-configuration/",
  );

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw Error("OAuth client not valid. Check OAuth credentials");
  }

  const client = new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [config.redirectUri],
    response_types: ["code"],
  });

  function getAuthorizationData(organization?: string): AuthorizationData {
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    return {
      codeVerifier,
      url: client.authorizationUrl({
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        ...(organization && {
          __organization: organization,
        }),
      }),
    };
  }

  async function getAccessToken(code: string, codeVerified: string) {
    return client.callback(process.env.REDIRECT_URI, { code }, {
      code_verifier: codeVerified,
    })
  }

  async function getUserInfo(token: TokenSet) {
    return client.userinfo<UserInfo>(token)
  }

  return {
    getAuthorizationData,
    getAccessToken,
    getUserInfo
  };
}

