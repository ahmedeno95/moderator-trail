# أكاديمية القرآن المنير — Landing Page + نموذج تقديم المعلمين (Next.js + Vercel)

Landing Page عربية RTL + Wizard متعدد الخطوات لتقديم المعلمين، مع ربط البيانات بـ Google Sheet عبر **Google Apps Script Web App**
من خلال **API Route** داخل Next.js (بدون كشف الـ URL أو الـ Secret في الواجهة).

---

## ✅ التقنيات المستخدمة
- Next.js (App Router) + TypeScript
- TailwindCSS + UI Components (مشابهة لـ shadcn/ui)
- React Hook Form + Zod
- Framer Motion (أنيميشن ناعم)
- API Routes فقط (بدون Server Actions)

---

## 🖼️ إضافة الهوية البصرية (مهم)
ضع الصور يدويًا داخل:
- `public/assets/logo.png`
- `public/assets/header.jpg` أو `public/assets/header.png`

---

## 🔐 الأمان (مهم جدًا)
- ممنوع وضع `APPS_SCRIPT_WEBAPP_URL` أو `APPS_SCRIPT_SECRET` في كود الواجهة (Client).
- الإرسال يتم من الواجهة إلى: `POST /api/submit`
- السيرفر فقط يضيف `secret` ثم يعمل forward للـ Apps Script Web App.
- يوجد Rate Limit بسيط: **10 طلبات / 10 دقائق لكل IP**
- Validation على السيرفر باستخدام **Zod** (وبنفس الـ Schema على العميل).

---

## ⚙️ المتطلبات
- Node.js: يفضل 18.17+ (أو 20+)
- npm

---

## 🚀 تشغيل محليًا
1) تثبيت الحزم:
```bash
npm i
```

2) إعداد المتغيرات البيئية محليًا (للاختبار):
- أنشئ ملف `.env.local`
- أضف:
```bash
APPS_SCRIPT_WEBAPP_URL="https://script.google.com/macros/s/REPLACE_ME/exec"
APPS_SCRIPT_SECRET="REPLACE_ME"
```

3) تشغيل السيرفر:
```bash
npm run dev
```

افتح:
- http://localhost:3000

---

## ✅ أمر الفحص المطلوب
حسب طلبك، شغّل الأمر التالي قبل النشر أو بعد أي تحديثات:
```bash
npx fix-react2shell-next --dry-run
```

---

## ☁️ النشر على Vercel
1) ارفع المشروع على GitHub.
2) أنشئ مشروع جديد في Vercel واربطه بالمستودع.
3) من: **Project Settings → Environment Variables** أضف:
- `APPS_SCRIPT_WEBAPP_URL`
- `APPS_SCRIPT_SECRET`

4) Deploy.

---

## 🧾 تنسيق البيانات المرسلة للـ Apps Script
الواجهة ترسل إلى `/api/submit`، ثم السيرفر يعمل forward إلى Apps Script ويرسل JSON بالشكل التالي:
```json
{
  "secret": "من ENV",
  "full_name_3": "...",
  "age": 25,
  "marital_status": "...",
  "whatsapp_number": "..."
}
```

> تأكد أن Web App في Apps Script يستقبل POST JSON ويُرجع 200 عند النجاح.
