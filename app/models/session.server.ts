import type { Session } from "@prisma/client";
import { prisma } from "~/db.server";

export type SessionCreateData = Omit<Session, "uuid">;

export async function sessionCreate(data: SessionCreateData) {
  return prisma.session.create({
    data,
  });
}

export async function sessionByToken(token: string) {
  return prisma.session.findUnique({
    where: { accessToken: token },
  });
}

export async function sessionByUuid(uuid: string) {
  return prisma.session.findUnique({
    where: { uuid },
  });
}