"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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

  const classifyMail = async () => {
    for (let i = 0; i < mails.length; i++) {
      let mail = mails[i];
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
        const newMail = { ...mail, type: data.answer };

        setMails((prevMails) => {
          let newMails = [...prevMails];
          console.log(newMails);
          newMails[i] = newMail;
          return newMails;
        });
      } catch (error) {
        console.error("Error classifying mail:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, 750));
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
            mailBody = decodeMail(mail.payloadBody.data);
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
      {status === "authenticated" && (
        <>
          <p className="bg-red-400">Welcome, {session.user.name}!</p>
        </>
      )}
      {status === "loading" && <p>Loading...</p>}
      {status === "unauthenticated" && <p>Please sign in</p>}

      <div className="">
        <button
          className="p-4 border-2 border-red-500"
          onClick={() => classifyMail()}
        >
          Classify
        </button>
      </div>
      <div className="flex flex-col w-[90%]">
        {mails.map((mail, idx) => {
          return (
            <>
              <div
                key={idx}
                className="border-2 border-red-500 my-5 overflow-hidden p-5"
              >
                <pre>{mail.snippet}</pre>
              </div>
              <div>{mail.type}</div>
            </>
          );
        })}
      </div>
    </>
  );
}
