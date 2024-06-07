"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="w-full bg-black text-white flex items-center justify-center h-5/6">
      <div className="flex flex-col gap-4 justify-center items-center px-2">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
            Effortlessly Manage Your Inbox
          </h1>
          <p className="max-w-[600px] mx-auto text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Classify, filter, and organize your emails with our powerful email
            management app. Streamline your workflow and stay on top of your
            inbox.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Link
            href="/mail"
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-8 py-2 text-2xl font-medium text-gray-900 disabled:pointer-events-none "
          >
            Get Started
            <Image
              src="/icons/arrow.svg"
              width={30}
              height={15}
              className="mt-[1px]"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
