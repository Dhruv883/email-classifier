"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import _ from "lodash";

export default function EmailComponent() {
  const { data: session, status } = useSession();
  const [limit, setLimit] = useState(10);
  const [mails, setMails] = useState([]);
  const [mailIDs, setMailIDs] = useState([]);
  const targetMimeTypes = ["text/html", "text/plain"];

  const fetchMailID = async () => {
    const response = await fetch(`/api/email?limit=${limit}`);
    const data = await response.json();
    setMailIDs(data.messages);
  };

  const fetchMail = async (id) => {
    const response = await fetch(`/api/email/${id}`);
    const mail = await response.json();
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
  }, []);
  // console.log(mails);
  return (
    <>
      <div className="bg-black">
        <button
          className="p-4 border-2 border-red-500"
          onClick={() => classifyMail()}
        >
          Classify
        </button>
      </div>
      <div className="flex flex-col bg-black text-white">
        {mails.map((mail, idx) => {
          return (
            <div key={idx}>
              <div className="border-2 border-red-500 my-5 mx-5 overflow-hidden p-5">
                <pre>{mail.snippet}</pre>
              </div>
              <div>{mail.type}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
