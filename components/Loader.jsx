import React from "react";

const Loader = () => {
  return (
    <div className="absolute z-50 top-0 left-0 h-screen w-screen overflow-hidden bg-black flex flex-col gap-6 items-center justify-center">
      <div
        className=" inline-block h-20 w-20 animate-spin rounded-full border-4 border-white border-current border-r-white align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span className="text-white !absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
      <div className="text-white text-xl">Fetching Mails...</div>
    </div>
  );
};

export default Loader;
