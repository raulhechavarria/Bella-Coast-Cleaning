// AWS Lambda (Node.js 20+) — receives the estimate form and emails it with Amazon SES.
// Env vars: TO_EMAIL (bellacoastcleaning@yahoo.com), FROM_EMAIL (a SES-verified address/domain),
//           ALLOWED_ORIGIN (https://www.bellacoastcleaning.com)
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({});
const FIELDS = {
  name: "Full name", phone: "Phone", email: "Email", address: "Address",
  cleaning_type: "Type of cleaning", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
  preferred_date: "Preferred date", notes: "Notes",
};

const cors = () => ({
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept",
});

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === "OPTIONS") return { statusCode: 204, headers: cors() };

  let data;
  try {
    data = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: "Invalid JSON" }) };
  }
  if (data._gotcha) return { statusCode: 200, headers: cors(), body: "{}" }; // spam bot

  const clean = (v) => String(v ?? "").slice(0, 1000).trim();
  for (const k of ["name", "phone", "email", "address", "cleaning_type"]) {
    if (!clean(data[k])) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: `Missing ${k}` }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.email))) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: "Invalid email" }) };
  }

  const text = Object.entries(FIELDS)
    .filter(([k]) => clean(data[k]))
    .map(([k, label]) => `${label}: ${clean(data[k])}`)
    .join("\n");

  await ses.send(new SendEmailCommand({
    Source: process.env.FROM_EMAIL,
    Destination: { ToAddresses: [process.env.TO_EMAIL] },
    ReplyToAddresses: [clean(data.email)],
    Message: {
      Subject: { Data: `New estimate request: ${clean(data.name)}` },
      Body: { Text: { Data: `New free estimate request from the website:\n\n${text}\n` } },
    },
  }));

  return { statusCode: 200, headers: { ...cors(), "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
};
