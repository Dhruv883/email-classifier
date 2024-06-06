"use client";
import { useSession, signOut, signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  if (session && session.user) {
    console.log(session.user);

    return (
      <>
        {/* <Image width={50} height={50} src={session.user?.image} /> */}
        <button
          className="border-2 border-red-500 p-4"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <button
      className="border-2 border-red-500 p-4"
      onClick={() => signIn("google")}
    >
      Sign In with google
    </button>
  );
}
