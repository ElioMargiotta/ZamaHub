export const runtime = "nodejs";
import crypto from "crypto";

function hmac(ts, method, path, body = "") {
  return crypto.createHmac("sha256", process.env.SUMSUB_APP_SECRET)
               .update(ts + method + path + body).digest("hex");
}

export async function POST(req) {
  try {
    const { externalUserId, applicantId } = await req.json();
    if (!externalUserId && !applicantId) {
      return new Response(JSON.stringify({ error: "missing externalUserId or applicantId" }), { status: 400 });
    }

    let path = applicantId
      ? `/resources/applicants/${encodeURIComponent(applicantId)}/one`
      : `/resources/applicants/-;externalUserId=${encodeURIComponent(externalUserId)}/one`;

    const ts = Math.floor(Date.now() / 1000).toString();
    const sig = hmac(ts, "GET", path);

    console.log('Fetching Sumsub applicant data:', { path, externalUserId, applicantId });

    const resp = await fetch("https://api.sumsub.com" + path, {
      method: "GET",
      headers: {
        "X-App-Token": process.env.SUMSUB_APP_TOKEN,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const text = await resp.text();
    console.log('Sumsub response:', { status: resp.status, text: text.substring(0, 500) }); // log first 500 chars
    if (!resp.ok) {
      return new Response(JSON.stringify({
        status: resp.status,
        reason: text,
        path, externalUserId, applicantId,
      }), { status: resp.status, headers: { "Content-Type": "application/json" } });
    }

    return new Response(text, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}