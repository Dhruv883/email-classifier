"use client";
import { useSession, signOut, signIn } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="bg-black text-white flex justify-between items-center px-8 h-1/6">
      <div className="text-lg sm:text-3xl font-medium tracking-wide">
        InboxClassifier
      </div>

      {session && session.user ? (
        <button
          className="sm:text-lg border-2 border-white px-3 sm:px-6 py-1 rounded-md flex items-center justify-center bg-white text-black hover:bg-white/85"
          onClick={() => {
            signOut();
            localStorage.removeItem("GEMINI_API_KEY");
          }}
        >
          Sign Out
        </button>
      ) : (
        <button
          className="sm:text-lg border-2 border-white px-3 sm:px-6 py-1 rounded-md flex items-center justify-center bg-white text-black hover:bg-white/85"
          onClick={() => signIn("google")}
        >
          Sign in
        </button>
      )}
    </div>
  );
};

export default Navbar;
