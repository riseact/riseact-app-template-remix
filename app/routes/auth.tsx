import { redirect } from "@remix-run/node";
import { cookie } from "~/cookie.server";
import riseact from "~/riseact.server";


export async function loader() {

  const authorizationData = await riseact.authorization.getAuthorization()

  return redirect(authorizationData.url, {
    status: 302,
    headers: {
      "Set-Cookie": await cookie.serialize({
        codeVerifier: authorizationData.codeVerifier
      })
    }
  })
}
