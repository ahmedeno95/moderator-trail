import { NextResponse } from "next/server";
import { TeacherApplicationSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const limit = rateLimit(ip, { intervalMs: 10 * 60 * 1000, max: 10 });
  if (!limit.ok) {
    const retryAfterSeconds = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { ok: false, message: "تم تجاوز الحد المسموح من المحاولات. الرجاء المحاولة لاحقًا." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.resetAt)
        }
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "تعذر قراءة البيانات المرسلة. الرجاء إعادة المحاولة." },
      { status: 400 }
    );
  }

  const parsed = TeacherApplicationSchema.safeParse(body);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return NextResponse.json(
      {
        ok: false,
        message: "هناك بعض الحقول تحتاج مراجعة بسيطة قبل الإرسال.",
        errors: flattened.fieldErrors
      },
      { status: 400 }
    );
  }

  const url = process.env.APPS_SCRIPT_WEBAPP_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!url || !secret) {
    return NextResponse.json(
      { ok: false, message: "إعدادات الخادم غير مكتملة. (ENV Variables مفقودة)" },
      { status: 500 }
    );
  }

  try {
    const upstreamRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({ secret, ...parsed.data })
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { ok: false, message: "تعذر إرسال البيانات إلى Google Sheet. الرجاء المحاولة لاحقًا." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "حدث خطأ أثناء الإرسال. الرجاء المحاولة لاحقًا." }, { status: 502 });
  }
}
