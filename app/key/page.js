"use client";
import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";

const page = () => {
  const { data: session, status } = useSession();
  const [key, setKey] = useState("");
  if (status != "authenticated") redirect("/");

  const handleClick = () => {
    localStorage.setItem("GEMINI_API_KEY", key);
  };

  return (
    <div className="h-5/6 w-full bg-black p-4 flex flex-col  gap-10 items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <label htmlFor="limit" className="text-white mr-4 text-xl ">
          Enter your Gemini API key :
        </label>
        <input
          type="text"
          id="key"
          size="50"
          placeholder="GEMINI API KEY"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="border border-white py-2 rounded-md text-white bg-black appearance-none font-notoSans text-center placeholder:font-notoSans placeholder:text-textGray"
        />
        <button
          className="border bg-white text-black w-full py-2 rounded-md text-xl font-meduim"
          onClick={handleClick}
        >
          Submit
        </button>
      </div>
      <div>
        <div className="flex flex-col items-start justify-center gap-3 text-white">
          <h2 className="text-xl">Steps:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Log in to Google AI Studio{" "}
              <a
                href="https://aistudio.google.com/"
                className="underline"
                target="_blank"
              >
                Google AI website{" "}
              </a>
            </li>
            <li>Click on "Get API Key".</li>
            <li>You can create a new project or select an existing one.</li>
            <li>Choose "Create API key.</li>
            <li>Copy the API key and paste it in the input field</li>
            <li>Click Submit</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default page;
