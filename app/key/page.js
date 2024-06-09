"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const [key, setKey] = useState("");

  const router = useRouter();

  const validKey = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      const { error } = data;
      if (error) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const handleClick = () => {
    if (validKey()) {
      localStorage.setItem("GEMINI_API_KEY", key);
      router.push("/mail");
    } else {
      alert("Enter a valid api key");
    }
  };

  return (
    <div className="h-5/6 w-screen overflow-x-hidden bg-black p-4 flex flex-col  gap-10 items-center justify-center">
      <div className="h-full flex flex-col items-center justify-center gap-4">
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
              Log in to{" "}
              <a
                href="https://aistudio.google.com/"
                className="underline"
                target="_blank"
              >
                Google AI Studio{" "}
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
