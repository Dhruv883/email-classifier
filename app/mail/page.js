"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import _ from "lodash";
import EmailPreview from "@/components/EmailPreview";

export default function EmailComponent() {
  const { data: session, status } = useSession();
  const [limit, setLimit] = useState(10);
  const [mails, setMails] = useState([]);
  const [mailIDs, setMailIDs] = useState([]);
  const [loading, setLoading] = useState(false);

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
        return decodeMail(pt.body.data);
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
    const emailContent = mail.msg;
    try {
      const res = await fetch(`/api/classify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailContent }),
      });
      const data = await res.json();
      return data.answer;
    } catch (error) {
      console.error("Error classifying mail:", error);
    }
    return null;
  };

  const classifyMail = async () => {
    for (let i = 0; i < mails.length; i++) {
      let mail = mails[i];

      const type = await fetchMailType(mail);
      const newMail = { ...mail, type: type };

      setMails((prevMails) => {
        let newMails = [...prevMails];
        console.log(newMails);
        newMails[i] = newMail;
        return newMails;
      });
    }
  };

  useEffect(() => {
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
          }
          newMails.push({ ...mail, msg: mailBody });
        });

        setMails(newMails);
      })
      .catch((error) => {
        console.error("Failed to fetch mails:", error);
      });

    // setMails(newMails);
  }, [mailIDs, limit]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchMailID();
    };
    fetchInitialData();
  }, [limit]);

  // console.log(mails);
  // console.log(limit);
  if (loading) return <Loader />;

  return (
    <div className="h-full bg-black">
      <div className="py-4 px-8 flex items-center justify-between">
        <div>
          <label htmlFor="limit" className="text-white mr-4 text-xl ">
            No. of Emails :
          </label>

          <select
            onChange={(e) => setLimit(e.target.value)}
            value={limit}
            id="limit"
            className="px-10 py-2  rounded-md text-white bg-black border border-[#27272A] appearance-none [&>option]:font-notoSans"
          >
            <option value="10">10 Emails</option>
            <option value="20">20 Emails</option>
            <option value="30">30 Emails</option>
            <option value="40">40 Emails</option>
            <option value="50">50 Emails</option>
          </select>
        </div>
        <button
          className="px-6 py-2 rounded-md text-xl text-white bg-gray hover:bg-gray/85 font-notoSans"
          onClick={() => classifyMail()}
        >
          Classify
        </button>
      </div>
      <div className="flex bg-black text-white">
        <div className="w-1/2 border-2 border-red-500">
          {mails.map((mail, index) => {
            return <EmailPreview mail={mail} key={index} />;
          })}
        </div>
        <div className="w-1/2 border-2 border-blue-500"></div>
      </div>
    </div>
  );
}
