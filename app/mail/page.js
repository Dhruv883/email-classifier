"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
export default function EmailComponent() {
  const { data: session, status } = useSession();

  const [mails, setMails] = useState([]);

  const handleFetch = async () => {
    const response = await fetch("/api/email");
    const data = await response.json();
    const mailIDs = data.messages;
    console.log(mailIDs);

    mailIDs?.forEach(async (mail) => {
      const res = await fetchMail(mail.id);
      setMails((prevMails) => {
        return [...prevMails, res];
      });
    });
  };

  const fetchMail = async (id) => {
    const response = await fetch(`/api/email/${id}`);
    const mail = await response.json();
    return mail;
  };

  return (
    <>
      {status === "authenticated" && (
        <>
          <p>Welcome, {session.user.name}!</p>
          <button onClick={() => handleFetch()}>Fetch Emails</button>
        </>
      )}
      {status === "loading" && <p>Loading...</p>}
      {status === "unauthenticated" && <p>Please sign in</p>}
    </>
  );
}
