import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOption } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOption);
  if (!session) {
    return Response(JSON.stringify({ error: "Unauthorized" }), {});
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/"
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = res.data.messages;
    return Response.json({ messages });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
