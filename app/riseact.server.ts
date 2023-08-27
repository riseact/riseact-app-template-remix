import Riseact from "./lib/riseact";
import type { RiseactSession, SessionStorage } from "./lib/riseact/auth";
import { sessionByToken, sessionCreate } from "./models/session.server";

function PrismaSessionStorage(): SessionStorage {
  return {
    save: async (session: RiseactSession) => {
      await sessionCreate(session)  
    },
    load: async (organization: string) => {
      return await sessionByToken(organization)
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