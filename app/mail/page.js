"use client";
import { useSession } from "next-auth/react";
export default function EmailComponent() {
  const { data: session, status } = useSession();

  const handleFetch = async () => {
    const response = await fetch("/api/email");
    const data = await response.json();
    console.log(data);
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
