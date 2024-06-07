import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOption } from "../../auth/[...nextauth]/route";

export async function GET(request) {
  const url = request.url.split("/");
  const messageId = url.slice(-1);

  const session = await getServerSession(authOption);
  if (!session) {
    return Response(JSON.stringify({ error: "Unauthorized" }));
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/callback/google"
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const data = res.data;
    return Response.json({
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet,
      payloadBody: data.payload.body,
      headers: {
        from: data.payload.headers.find((header) => header.name === "From")
          .value,
        subject: data.payload.headers.find(
          (header) => header.name === "Subject"
        ).value,
        date: data.payload.headers.find((header) => header.name === "Date")
          .value,
      },
      parts: data.payload.parts,
    });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
