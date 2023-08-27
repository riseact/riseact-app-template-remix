import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { Session } from "@prisma/client";
import { sessionByUuid } from "./models/session.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const SESSION_KEY = "sessionUuid";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserSessionUUID(
  request: Request,
): Promise<Session["uuid"] | undefined> {
  const session = await getSession(request);
  const userSessionUuid = session.get(SESSION_KEY);
  return userSessionUuid;
}

export async function getUserSession(request: Request) {
  const userSessionUuid = await getUserSessionUUID(request);
  if (userSessionUuid === undefined) return null;

  const userSession = await sessionByUuid(userSessionUuid);
  if (userSession) return userSession;

  throw await logout(request);
}

export async function requireSessionUUID(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userSessionUuid = await getUserSessionUUID(request);
  if (!userSessionUuid) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth?${searchParams}`);
  }
  return userSessionUuid;
}

export async function requireSession(request: Request) {
  const userSession = await getUserSession(request);

  if(userSession) return userSession;
  
  throw await logout(request);
}

export async function createUserSession({
  request,
  userSessionUuid,
  remember,
  redirectTo,
}: {
  request: Request;
  userSessionUuid: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(SESSION_KEY, userSessionUuid);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
