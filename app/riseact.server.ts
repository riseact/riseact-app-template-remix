import Riseact from "./lib/riseact";
import type { RiseactSession, SessionStorage } from "./lib/riseact/auth";
import { sessionByUuid, sessionCreate } from "./models/session.server";
import { getUserSession } from "./session.server";

function PrismaSessionStorage(): SessionStorage {
  return {
    save: async (session: RiseactSession) => {
      await sessionCreate(session)  
    },
    load: async (request: Request) => {
      const userSession = await getUserSession(request)

      if(!userSession) return null

      return sessionByUuid(userSession.uuid)
    }
  }
}

const riseact = Riseact({
  clientId: process.env.CLIENT_ID || "",
  clientSecret: process.env.CLIENT_SECRET || "",
  appUrl: process.env.RISEACT_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: PrismaSessionStorage()
})

export default riseact