import { GraphQLClient } from "graphql-request";

export interface RiseactGraphQlOptions {
  access_token: string;
}

export function initGraphqlClient(accessToken: string) {
  const client = new GraphQLClient("http://core.localhost:8000/admin/graphql/", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  return client;
}
