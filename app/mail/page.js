"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import EmailPreview from "@/components/EmailPreview";
import SelectedMail from "@/components/SelectedMail";
import { htmlToText } from "html-to-text";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function EmailComponent() {
  const { data: session, status } = useSession();
  const [limit, setLimit] = useState(15);
  const [mails, setMails] = useState([]);
  const [mailIDs, setMailIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [classifying, setClassifying] = useState(false);

  if (status !== "authenticated") redirect("/");

  let API_KEY;
  if (typeof window !== "undefined" && window.localStorage) {
    API_KEY = localStorage.getItem("GEMINI_API_KEY");
    if (!API_KEY) redirect("/key");
  }

  const targetMimeTypes = ["text/html", "text/plain"];

  const fetchMailID = async () => {
    const response = await fetch(`/api/email?limit=${limit}`);
    const data = await response.json();
    setMailIDs(data.messages);
  };

  const fetchMail = async (id) => {
    const response = await fetch(`/api/email/${id}`);
    const mail = await response.json();
    setLoading(false);
    return mail;
  };

  const findTargetMimeType = (part) => {
    if (!Array.isArray(part) || !part.length) {
      return;
    }

    for (const pt of part) {
      if (targetMimeTypes.includes(pt.mimeType)) {
        let body = decodeMail(pt.body.data);
        if (pt.mimeType == "text/html")
          body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        {
          body = htmlToText(body);
        }
        return body;
      }
    }

    for (const pt of part) {
      if (pt.partId.startsWith("0")) {
        const result = findTargetMimeType(pt.parts);
        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  };

  const decodeMail = (base64url) => {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    base64 += padding;

    const string = atob(base64);

    return string;
  };

  const fetchMailType = async (mail) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const emailContent = mail.msg;
    try {
      const res = await fetch(`/api/classify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailContent, API_KEY }),
      });
      const data = await res.json();
      return data.answer;
    } catch (error) {
      console.error("Error classifying mail:", error);
    }
    return null;
  };

  const classifyMail = async () => {
    setClassifying(true);
    const SIZE = 5;
    for (let i = 0; i < mails.length; i++) {
      let mail = mails[i];
      if (mail.type) continue;
      let type = await fetchMailType(mail);
      if (type === undefined) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      // console.log(i, " ", type);
      const newMail = { ...mail, type: type };
      if (mail.id == selectedMail.id) setSelectedMail(newMail);
      setMails((prevMails) => {
        let newMails = [...prevMails];
        newMails[i] = newMail;
        return newMails;
      });

      if (i % SIZE == 0)
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    await classifyRestMails();
    setClassifying(false);
  };

  const classifyRestMails = async () => {
    let unclassifiedEmails = mails
      .map((mail, index) => (mail.type === undefined ? index : undefined))
      .filter((index) => index !== undefined);
    let itr = 1;
    while (unclassifiedEmails.length > 0 && itr++ <= 5) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const i = unclassifiedEmails.shift();
      const mail = mails[i];
      const type = await fetchMailType(mail);

      if (type === undefined) {
        unclassifiedEmails.push(i);
        continue;
      }

      const updatedMail = { ...mail, type };

      setMails((prevMails) => {
        const newMails = [...prevMails];
        newMails[i] = updatedMail;
        return newMails;
      });

      // setUnclassifiedEmails((prev) => prev.filter((id) => id !== i));
    }
  };

  const setLocalMails = () => {
    localStorage.setItem("mails", JSON.stringify(mails));
  };

  useEffect(() => {
    setLoading(true);
    let newMails = [];
    Promise.all(
      mailIDs?.map(async (mail) => {
        const res = await fetchMail(mail.id);
        return res;
      })
    )
      .then((results) => {
        results.forEach((mail) => {
          // console.log(mail);
          const topLevelParts = mail.parts?.filter((part) =>
            part.partId.startsWith("0")
          );

          let mailBody;
          mailBody = findTargetMimeType(topLevelParts);
          if (!mail.parts) {
            mailBody = decodeMail(mail.payloadBody?.data);
            mailBody = mailBody.replace(/<[^>]*>/g, "");
          }
          newMails.push({ ...mail, msg: mailBody });
          setSelectedMail(newMails[0]);
        });

        setMails(newMails);
        localStorage.setItem("mails", JSON.stringify(newMails));
      })
      .catch((error) => {
        console.error("Failed to fetch mails:", error);
      });

    setLoading(false);
    // setMails(newMails);
  }, [mailIDs]);

  useEffect(() => {
    const initialFetch = async () => {
      if (typeof window !== undefined) {
        const localMails = localStorage.getItem("mails");
        if (localMails && localMails.length != 0) {
          const finalMails = await JSON.parse(localMails);
          setMails(finalMails);
          setLimit(finalMails.length);
          setSelectedMail(finalMails[0]);
        } else fetchMailID();
      }
    };
    initialFetch();
  }, []);

  // useEffect(() => {
  //   fetchMailID();
  // }, [limit]);

  useEffect(() => {
    if (mails.length > 0) setLocalMails();
  }, [mails]);
  // if (loading) return <Loader />;
  // console.log(mails);

  return (
    <div className="h-full bg-black">
      <div className="flex items-center px-8 gap-4 mb-4">
        <Image
          src={session.user.image}
          width={45}
          height={45}
          alt="Profile Image"
          className="rounded-full"
        />
        <div className="flex flex-col text-white">
          <span className="text-2xl font-semibold">{session.user.name}</span>
          <span className="text-base font-light">{session.user.email}</span>
        </div>
      </div>
      <div className="py-4 px-8 flex flex-col mobile:flex-row items-center mobile:justify-between gap-4">
        <div className="flex flex-col mobile:flex-row items-center justify-center gap-4">
          <label htmlFor="limit" className="text-white mr-4 text-xl ">
            No. of Emails :
          </label>

          <select
            onChange={(e) => {
              setLimit(e.target.value);
              fetchMailID();
            }}
            value={limit}
            id="limit"
            className="px-10 py-2  rounded-md text-white bg-black border border-[#27272A] appearance-none [&>option]:font-notoSans"
          >
            <option value="5">5 Emails</option>
            <option value="10">10 Emails</option>
            <option value="15">15 Emails</option>
            <option value="20">20 Emails</option>
            <option value="25">25 Emails</option>
          </select>

          <button
            className="sm:text-lg border-2 border-white px-3 sm:px-6 py-1 rounded-md flex items-center justify-center bg-white text-black hover:bg-white/85"
            onClick={() => fetchMailID()}
          >
            Fetch Emails
          </button>
        </div>
        <button
          className="sm:text-xl border-2 border-white px-3 sm:px-10 py-1 rounded-md flex items-center justify-center bg-white text-black hover:bg-white/85 disabled:pointer-events-none"
          disabled={classifying}
          onClick={async () => classifyMail()}
        >
          {classifying ? "Classifying..." : "Classify"}
        </button>
      </div>
      <div className="flex gap-4 bg-black text-white lg:px-4">
        <div className="w-full lg:w-1/2 h-screen overflow-y-scroll scroll-smooth scrollbar-hidden flex flex-col gap-4 p-4 md:border border-gray rounded-lg">
          {mails.map((mail, index) => {
            return (
              <EmailPreview
                mail={mail}
                key={index}
                setSelectedMail={setSelectedMail}
                selectedMailID={selectedMail.id}
                setShowModal={setShowModal}
              />
            );
          })}
        </div>
        <div
          className={`w-full bg-black absolute z-50 lg:relative lg:w-1/2 h-screen overflow-y-scroll scroll-smooth scrollbar-hidden ${
            showModal ? "block" : "hidden"
          } lg:block`}
        >
          <SelectedMail
            selectedMail={selectedMail}
            setShowModal={setShowModal}
          />
        </div>
      </div>
    </div>
  );
}
