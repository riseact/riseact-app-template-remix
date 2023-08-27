import { type LoaderArgs } from "@remix-run/node";
import { cookie } from "~/cookie.server";
import riseact from "~/riseact.server";
import { createUserSession } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  // parse the search params for `?q=`
  const url = new URL(request.url);

  const cookies = await cookie.parse(request.headers.get("cookie"));
  const codeVerifier = cookies.codeVerifier;
  const code = url.searchParams.get("code");

  if (codeVerifier === null) throw new Error("codeVerifier is null");
  if (code === null) throw new Error("code is null");

  // store session
  const riseactSession = await riseact.authorization.initSession(
    code,
    codeVerifier,
  );

  return await createUserSession({
    request,
    userSessionUuid: riseactSession.uuid,
    redirectTo: "/",
    remember: true,
  });
}
