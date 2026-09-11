// ============================================
// GIZDODOSPECIALS — send-push Edge Function
// Handles three things the admin/customer front-end already calls:
//   1. POST with x-push-endpoint/x-push-auth/x-push-p256dh headers
//      → register (upsert) an admin device's push subscription
//   2. POST with a JSON body { title, body, url, tag }
//      → fan out a Web Push notification to every registered device
//   3. DELETE with x-push-endpoint header
//      → remove a subscription (e.g. on admin logout)
//
// Deploy with:
//   supabase functions deploy send-push --no-verify-jwt
//
// Required secrets (supabase secrets set ...):
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   SUPABASE_URL                (auto-provided by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY   (auto-provided by Supabase)
// ============================================

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VAPID_SUBJECT = "mailto:admin@gizdodospecials.com.ng";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-push-endpoint, x-push-auth, x-push-p256dh",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return json({ ok: false, error: "VAPID keys not configured" }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ---- DELETE: unsubscribe a device ----
  if (req.method === "DELETE") {
    const endpoint = req.headers.get("x-push-endpoint");
    if (!endpoint) return json({ ok: false, error: "Missing x-push-endpoint" }, 400);
    const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  // ---- POST with subscription headers: register a device ----
  const subEndpoint = req.headers.get("x-push-endpoint");
  const subAuth = req.headers.get("x-push-auth");
  const subP256dh = req.headers.get("x-push-p256dh");

  if (subEndpoint && subAuth && subP256dh) {
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { endpoint: subEndpoint, auth: subAuth, p256dh: subP256dh },
        { onConflict: "endpoint" }
      );
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true, registered: true });
  }

  // ---- POST with JSON body: fan out a notification to every device ----
  let payload: { title?: string; body?: string; url?: string; tag?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { data: subs, error: fetchErr } = await supabase.from("push_subscriptions").select("*");
  if (fetchErr) return json({ ok: false, error: fetchErr.message }, 500);
  if (!subs || subs.length === 0) return json({ ok: true, sent: 0, note: "No registered devices" });

  const notificationPayload = JSON.stringify({
    title: payload.title || "New Order!",
    body: payload.body || "A new order has been placed.",
    url: payload.url || "/admin/",
    tag: payload.tag || String(Date.now()),
  });

  let sent = 0;
  const results = await Promise.allSettled(
    subs.map(async (s: { endpoint: string; auth: string; p256dh: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { auth: s.auth, p256dh: s.p256dh } },
          notificationPayload
        );
        sent++;
      } catch (err: unknown) {
        // 404/410 = subscription is dead (browser unsubscribed, device reset, etc.) — clean it up
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return json({ ok: true, sent, failed, total: subs.length });
});
