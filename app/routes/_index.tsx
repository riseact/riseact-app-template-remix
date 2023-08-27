import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireSession } from "~/session.server";


export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export async function loader({request}: LoaderArgs) {
  const session = await requireSession(request)

  return json({
    username: session.username,
    email: session.email,
    organization: session.organization,
  })
}

export default function Index() {
  const data = useLoaderData();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      Hello {data.username} ({data.email}) on {data.organization}
    </main>
  );
}
