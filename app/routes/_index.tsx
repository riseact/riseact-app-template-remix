import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

interface LoaderData {
  username: string;
  email: string;
  organization: string;
}

export async function loader({ request }: LoaderArgs) {
  const admin = await requireAdmin(request);

  return json<LoaderData>({
    username: admin.user.username,
    email: admin.user.email,
    organization: admin.user.organization,
  });
}

export default function Index() {
  const data = useLoaderData<LoaderData>();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      Hello {data.username} ({data.email}) on - {data.organization}
    </main>
  );
}
