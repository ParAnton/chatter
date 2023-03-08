import { useEffect } from 'react';
import { useOutletContext } from '@remix-run/react';
import type { Database } from 'db_types';
import { useState } from 'react';
import { SupabaseOutletCntext } from '~/root';

type Message = Database["public"]["Tables"]["messages"]["Row"];

const RealtimeMessages = ({serverMessages}:{serverMessages: Message[]})=>{
  console.log("Are we rendering RealtimeMessages ");
  console.log("Are we reniering Realtime "+serverMessages);
  const [messages, setMessages] = useState(serverMessages);
  const { supabase } = useOutletContext<SupabaseOutletCntext>();

  useEffect(() => {
    setMessages(serverMessages);
  }, [serverMessages]);

  useEffect(() => {
    const channel = supabase.channel('*').on('postgres_changes', {event: 'INSERT', schema: 'public', table:'messages'}, (payload) =>{
      const newMessage = payload.new as Message;
      if(!messages.find(message  => message.id === newMessage.id)){
        setMessages([...messages, newMessage])
      }
    }). subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, messages, setMessages])
  return <pre>{JSON.stringify(messages, null, 2)}</pre>;
}

export default RealtimeMessages;
// export default function RealtimeMessages({
//   serverMessages
// }: {
//   serverMesages: any
// }) {
//   console.log("Are we rendering RealtimeMessages ")
//   console.log("Are we reniering Realtime "+serverMessages)
//   return <pre>{JSON.stringify(serverMessages, null, 2)}</pre>;
// };
