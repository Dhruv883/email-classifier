"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
export default function EmailComponent() {
  const { data: session, status } = useSession();
  const [limit, setLimit] = useState(2);
  const [mails, setMails] = useState([]);
  const [mailIDs, setMailIDs] = useState([]);

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

  const targetMimeTypes = ["text/plain", "text/html"];

  function findTargetMimeType(part) {
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
  }

  function decodeMail(base64url) {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    base64 += padding;

    const string = atob(base64);

    return string;
  }

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
          const topLevelParts = mail.parts.filter((part) =>
            part.partId.startsWith("0")
          );

          const mailBody = findTargetMimeType(topLevelParts);
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

  console.log(mails);

  return (
    <>
      {status === "authenticated" && (
        <>
          <p>Welcome, {session.user.name}!</p>
        </>
      )}
      {status === "loading" && <p>Loading...</p>}
      {status === "unauthenticated" && <p>Please sign in</p>}

      <div>
        {mails.map((mail, idx) => {
          return <div key={idx}>{mail.msg}</div>;
        })}
      </div>
    </>
  );
}
