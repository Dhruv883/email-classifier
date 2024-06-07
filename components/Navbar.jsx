"use client";
import { useSession, signOut, signIn } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="bg-black text-white flex justify-between items-center px-8 h-1/6">
      <div className="text-md sm:text-3xl font-medium tracking-wide">
        InboxClassifier
      </div>

      {session && session.user ? (
        <button
          className="sm:text-xl border-2 px-8 py-1 rounded-xl flex items-center justify-center bg-white text-black"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      ) : (
        <button
          className="sm:text-xl border-2 px-8 py-1 rounded-xl flex items-center justify-center bg-white text-black"
          onClick={() => signIn("google")}
        >
          Sign in
        </button>
      )}
    </div>
  );
};

export default Navbar;
