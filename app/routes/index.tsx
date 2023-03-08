import { Form, useLoaderData } from '@remix-run/react';
import createServerSupabase from "utils/supabase.server";
import { json } from '@remix-run/node';
import Login from '~/components/login';

import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { createServerClient } from '@supabase/auth-helpers-remix';
import RealtimeMessages from '~/components/realtimeMessages';

export const action = async ({ request }: ActionArgs) => {
  console.log('ACTION XXXXXXXXXXXXXXX');
  const response = new Response();
  const supabase = createServerSupabase({ request, response});

  const { message } = Object.fromEntries(await request.formData());

  const { error } = await supabase.from("messages").insert({ content: String(message) });
  if(error) {
    console.log(error);
  } else {
    console.log('No error from insert message');
  }
  return json(null, { headers: response.headers });
};

export const loader = async ({ request } : LoaderArgs) => {
  const response = new Response();
  const supabaseClient = createServerSupabase({request, response});
  const {data, error } = await supabaseClient.from('messages').select();
  return json({messages:data ?? [], error}, { headers: response.headers });
}

export default function Index() {
  const { messages, error } = useLoaderData<typeof loader>();
  // console.log({error});
  return (
  <>
  <Login />
  <RealtimeMessages serverMessages={messages} />
  <Form method="post">
    <input type="text" name="message" />
    <button type="submit"><strong>Send</strong></button>
  </Form>
  </>
  ) ;
  // return <pre>hello eggies 🥚</pre>;

}
