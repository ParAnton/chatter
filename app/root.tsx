import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import createServerSupabase from 'utils/supabase.server';

import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "db_types";
import { createBrowserClient } from "@supabase/auth-helpers-remix";

type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseOutletCntext = {
  supabase: TypedSupabaseClient;
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const loader =async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const response = new Response();
  const supabaseClient = createServerSupabase({ request, response});
  const {
    data: {session},
  } = await supabaseClient.auth.getSession();
  return json({env, session}, {headers: response.headers});
}

export default function App() {
  const { env, session: serverSession } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [supabase] = useState(() => createBrowserClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
  ));

  const serverAccessToken = serverSession?.access_token;
  useEffect(() => {
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((event, session) => {
      if(session?.access_token !== serverAccessToken){
        revalidator.revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    }
  }, [supabase, serverAccessToken, revalidator]);

  // useEffect(() => {
  //   supabase.auth
  //   .getSession()
  //   .then((session) => console.log({ client: {session}}))
  // }, []);
  
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase }}/>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
