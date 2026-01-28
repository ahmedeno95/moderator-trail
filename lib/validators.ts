import { z } from "zod";

/**
 * Helpers (Arabic-friendly)
 */
const required = (label: string, min = 2) =>
  z
    .string()
    .trim()
    .min(min, `من فضلك اكتب ${label} بشكل صحيح.`);

const requiredChoice = (label: string) =>
  z.string().trim().min(1, `من فضلك اختر إجابة لـ "${label}".`);

/**
 * Accepts:
 * - "25"
 * - 25
 * and validates as English digits only
 */
const englishDigitsOnly = (label: string) =>
  z.preprocess(
    (v) => (typeof v === "number" ? String(v) : v),
    z
      .string({
        invalid_type_error: `من فضلك اكتب ${label} بالأرقام الإنجليزية فقط.`,
        required_error: `من فضلك اكتب ${label}.`
      })
      .trim()
      .min(1, `من فضلك اكتب ${label}.`)
      .refine((v) => /^[0-9]+$/.test(v), {
        message: `من فضلك اكتب ${label} بالأرقام الإنجليزية فقط.`
      })
  );

const numberFromEnglishDigits = (label: string, min: number, max: number) =>
  englishDigitsOnly(label)
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), { message: `من فضلك اكتب ${label} بشكل صحيح.` })
    .refine((n) => n >= min && n <= max, {
      message: `من فضلك اكتب ${label} رقمًا بين ${min} و ${max}.`
    });

export const whatsappRegex = /^\+?[0-9]{10,15}$/;

/**
 * ✅ Server + Client shared schema
 * - Note: Zod output types:
 *    age becomes number after transform
 */
export const TeacherApplicationSchema = z.object({
  /* -------------------- Step 2: بيانات شخصية -------------------- */
  full_name_3: required("الاسم الثلاثي", 3),

  age: numberFromEnglishDigits("السن", 16, 80),

  marital_status: requiredChoice("الحالة الاجتماعية").refine(
    (v) => ["عزباء", "مخطوبة", "متزوجة", "متزوجة وحامل", "أرملة", "مطلقة"].includes(v),
    { message: "من فضلك اختاري الحالة الاجتماعية من الخيارات المتاحة." }
  ),

  whatsapp_number: z
    .string()
    .trim()
    .min(1, "من فضلك اكتبِي رقم الواتساب.")
    .refine((v) => whatsappRegex.test(v), {
      message: "رقم واتساب غير صالح. اكتبيه بالأرقام الإنجليزية فقط (مثال: +201234567890)."
    }),

  education: required("المؤهل العلمي", 2),

  finished_study: requiredChoice("هل أنهيتِ الدراسة؟").refine((v) => ["نعم", "لا"].includes(v), {
    message: "من فضلك اختاري نعم أو لا."
  }),

  /* -------------------- Step 1: الشروط والجاهزية -------------------- */
  agree_all_conditions: requiredChoice("الموافقة على الشروط").refine((v) => v === "موافقة", {
    message: "لا يمكن إرسال الطلب دون الموافقة على الشروط المذكورة."
  }),

  salary_acceptance: requiredChoice("الراتب").refine((v) => v === "موافقة", {
    message: "يلزم الموافقة على الراتب لاستكمال التقديم."
  }),

  daily_work_no_weekly_off: requiredChoice("العمل يوميًا").refine((v) => v === "موافقة", {
    message: "يلزم الموافقة على نظام العمل اليومي (بدون إجازة أسبوعية)."
  }),

  all_day_availability: requiredChoice("التواجد طوال اليوم").refine(
    (v) => v === "متفرغة وأستطيع التواجد والعمل على مدار اليوم",
    { message: "يشترط التواجد للرد على الرسائل ومتابعة دخول الحلقات على مدار اليوم." }
  ),

  can_use_tools: requiredChoice("ZOOM + Google Meet").refine((v) => v === "نعم", {
    message: "يشترط القدرة على التعامل مع ZOOM و Google Meet."
  }),

  agree_no_stopping_policy: requiredChoice("شرط عدم التوقف قبل 6 أشهر").refine((v) => v === "موافقة", {
    message: "يلزم الموافقة على شرط عدم التوقف لاستكمال الإرسال."
  }),

  /* -------------------- Step 3: خبرات العمل الأساسية -------------------- */
  supervision_experience_details: required("هل تم العمل قبل ذلك في الإشراف وما هي المهام التي كنتِ تقومين بها؟", 10),

  current_job_and_hours: required("الوظيفة الحالية وأوقات العمل", 5),

  previous_jobs: required("الوظائف السابقة", 5),

  agree_attend_trial_sessions: requiredChoice("حضور الحصص التجريبية").refine((v) => v === "موافقة", {
    message: "يلزم الموافقة على حضور الحصص التجريبية لتقييم الحلقات."
  }),

  internet_stability: requiredChoice("الإنترنت المستقر").refine(
    (v) => ["واي فاي منزلي (Wi-Fi)", "باقة بيانات (Data)", "كلاهما"].includes(v),
    { message: "من فضلك اختاري نوع الإنترنت من الخيارات."
  }),

  /* -------------------- Step 4: أسئلة تمييزية -------------------- */
  why_choose_you: required("ما الذي يُميزك عن غيرك لنختارك للعمل معنا؟", 10),

  supervision_role_idea: required("ما هي فكرتك عن عمل الإشراف أو عن مهامه؟", 10),

  convince_parent_message: required("رسالة لإقناع والدة بتجربة حلقة أونلاين", 20)
});

export type TeacherApplicationFormInput = z.input<typeof TeacherApplicationSchema>;
export type TeacherApplicationFormOutput = z.output<typeof TeacherApplicationSchema>;

/**
 * Used by the wizard to validate only the current step before moving next.
 */
export const stepFields = [
  // Step 1
  [
    "agree_all_conditions",
    "salary_acceptance",
    "daily_work_no_weekly_off",
    "all_day_availability",
    "can_use_tools",
    "agree_no_stopping_policy"
  ],
  // Step 2
  ["full_name_3", "age", "marital_status", "whatsapp_number", "education", "finished_study"],
  // Step 3
  [
    "supervision_experience_details",
    "current_job_and_hours",
    "previous_jobs",
    "agree_attend_trial_sessions",
    "internet_stability"
  ],
  // Step 4
  ["why_choose_you", "supervision_role_idea", "convince_parent_message", "agree_no_stopping_policy"]
] as const;
