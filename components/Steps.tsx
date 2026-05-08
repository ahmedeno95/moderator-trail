"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Info, ShieldAlert } from "lucide-react";

import { BASIC_CONDITIONS, NO_STOPPING_POLICY } from "@/lib/content";
import type { TeacherApplicationFormInput } from "@/lib/validators";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Option = { label: string; value: string };

function FieldBlock({
  name,
  label,
  hint,
  children,
  wrapperClassName,
  labelClassName
}: {
  name: keyof TeacherApplicationFormInput;
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}) {
  const {
    formState: { errors }
  } = useFormContext<TeacherApplicationFormInput>();

  const message = (errors as any)?.[name]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      <Label className={cn("text-sm font-semibold", labelClassName)} htmlFor={String(name)}>
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}

function RadioCards({
  name,
  options,
  columns = 2
}: {
  name: keyof TeacherApplicationFormInput;
  options: Option[];
  columns?: 1 | 2 | 3;
}) {
  const { register, watch } = useFormContext<TeacherApplicationFormInput>();
  const value = watch(name) as string;

  const gridCols = useMemo(() => {
    if (columns === 1) return "";
    if (columns === 2) return "sm:grid-cols-2";
    return "sm:grid-cols-3";
  }, [columns]);

  return (
    <div className={cn("grid gap-2", gridCols)}>
      {options.map((opt) => {
        const id = `${String(name)}-${opt.value}`;
        const selected = value === opt.value;

        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3 text-sm shadow-sm transition",
              "hover:bg-muted/60",
              selected && "border-primary ring-2 ring-primary/20"
            )}
          >
            <span className="leading-relaxed">{opt.label}</span>
            <input
              id={id}
              type="radio"
              value={opt.value}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
              {...register(name as any)}
            />
          </label>
        );
      })}
    </div>
  );
}

function AgreementCheckbox({
  name,
  label,
  policyText,
  acceptedValue
}: {
  name: keyof TeacherApplicationFormInput;
  label: string;
  policyText: string;
  acceptedValue: string;
}) {
  const { setValue, watch } = useFormContext<TeacherApplicationFormInput>();
  const current = watch(name) as string;
  const checked = current === acceptedValue;

  return (
    <div className="space-y-3">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>سياسة الأكاديمية</AlertTitle>
        <AlertDescription className="leading-relaxed">{policyText}</AlertDescription>
      </Alert>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 p-4 hover:bg-muted/40">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
          checked={checked}
          onChange={(e) =>
            setValue(name as any, e.target.checked ? acceptedValue : "", { shouldValidate: true })
          }
        />
        <span className="text-sm leading-relaxed">
          {label} <span className="font-semibold text-primary">{acceptedValue}</span>
        </span>
      </label>
    </div>
  );
}

/* -------------------- STEP 1 -------------------- */
export function StepOne() {
  const { watch } = useFormContext<TeacherApplicationFormInput>();

  const agreeAll = watch("agree_all_conditions");
  const salary = watch("salary_acceptance");
  const daily = watch("daily_work_no_weekly_off");
  const tools = watch("can_use_tools");

  const blocked =
    agreeAll && agreeAll !== "موافقة"
      ? "لا يمكن إكمال التقديم دون الموافقة على الشروط المذكورة."
      : salary && salary !== "موافقة"
      ? "يلزم الموافقة على الراتب لاستكمال التقديم."
      : daily && daily !== "موافقة"
      ? "يلزم الموافقة على نظام العمل اليومي (بدون إجازة أسبوعية)."
      : tools && tools !== "نعم"
      ? "يشترط القدرة على التعامل مع ZOOM و Google Meet."
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-card p-5 sm:p-7">
        <h3 className="mb-3 text-lg font-extrabold">الشروط الأساسية</h3>
        <p className="mb-4 text-sm text-muted-foreground">نرجو قراءة الشروط التالية قبل التقديم لضمان توافق المتطلبات.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {BASIC_CONDITIONS.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                •
              </span>
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {blocked ? (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>تنبيه مهم</AlertTitle>
          <AlertDescription>{blocked}</AlertDescription>
        </Alert>
      ) : null}

      <FieldBlock name="agree_all_conditions" label="1) هل توافق على جميع الشروط المذكورة أعلاه؟">
        <RadioCards
          name="agree_all_conditions"
          options={[
            { label: "موافقة", value: "موافقة" },
            { label: "غير موافقة", value: "غير موافقة" }
          ]}
        />
      </FieldBlock>

      <FieldBlock name="salary_acceptance" label="2) الراتب 2300 جنيه وزيادة لـ 2600 جنيه بعد شهرين">
        <RadioCards
          name="salary_acceptance"
          options={[
            { label: "موافقة", value: "موافقة" },
            { label: "غير موافقة", value: "غير موافقة" }
          ]}
        />
      </FieldBlock>

      <FieldBlock name="daily_work_no_weekly_off" label="3) عمل الإشراف يوميًا (لا يوجد إجازة أسبوعية)">
        <RadioCards
          name="daily_work_no_weekly_off"
          options={[
            { label: "موافقة", value: "موافقة" },
            { label: "غير موافقة", value: "غير موافقة" }
          ]}
        />
      </FieldBlock>

      <FieldBlock name="shift_hours_acceptance" label="4) عمل الإشراف من الساعة 8 صباحا للساعة 12 منتصف الليل">
        <RadioCards
          name="shift_hours_acceptance"
          options={[
            { label: "موافقة وأستطيع التواجد طول فترة الشيفت", value: "موافقة وأستطيع التواجد طول فترة الشيفت" },
            { label: "لا أستطيع التواجد طول هذه المدة لانشغالي ببعض الأمور", value: "لا أستطيع التواجد طول هذه المدة لانشغالي ببعض الأمور" }
          ]}
          columns={1}
        />
      </FieldBlock>

      <FieldBlock
        name="all_day_availability"
        label="5) هل لديك شيء يشغلك في فترة الشيفت مثل كورس أو عمل أو غير ذلك"
      >
        <RadioCards
          name="all_day_availability"
          options={[
            { label: "نعم لدي بعض الأشغال", value: "نعم لدي بعض الأشغال" },
            { label: "متفرغة تماما طول فترة الشيفت", value: "متفرغة تماما طول فترة الشيفت" }
          ]}
          columns={1}
        />
      </FieldBlock>

      <FieldBlock name="can_use_tools" label="6) هل تستطيعين التعامل مع ZOOM + Google meet ؟">
        <RadioCards
          name="can_use_tools"
          options={[
            { label: "نعم", value: "نعم" },
            { label: "لا", value: "لا" }
          ]}
        />
      </FieldBlock>

      <FieldBlock
        name="agree_no_stopping_policy"
        label="7) تمنع الأكاديمية التوقف قبل 6 أشهر من بدء العمل وتمنع التوقف المفاجئ..."
      >
        <AgreementCheckbox
          name="agree_no_stopping_policy"
          label="أوافق على هذه السياسة:"
          policyText={NO_STOPPING_POLICY}
          acceptedValue="موافقة"
        />
      </FieldBlock>
    </div>
  );
}

/* -------------------- STEP 2 -------------------- */
export function StepTwo() {
  const { register } = useFormContext<TeacherApplicationFormInput>();

  return (
    <div className="space-y-6">
      <FieldBlock name="full_name_3" label="1) الاسم ثلاثي">
        <Input id="full_name_3" placeholder="مثال: فاطمة أحمد علي" {...register("full_name_3")} />
      </FieldBlock>

      <FieldBlock name="age" label="2) السن" hint="اكتبيه بالأرقام الإنجليزية فقط (مثال: 25).">
        <Input id="age" inputMode="numeric" placeholder="مثال: 25" {...register("age" as any)} />
      </FieldBlock>

      <FieldBlock name="marital_status" label="3) الحالة الاجتماعية">
        <RadioCards
          name="marital_status"
          options={[
            { label: "عزباء", value: "عزباء" },
            { label: "مخطوبة", value: "مخطوبة" },
            { label: "متزوجة", value: "متزوجة" },
            { label: "متزوجة وحامل", value: "متزوجة وحامل" },
            { label: "أرملة", value: "أرملة" },
            { label: "مطلقة", value: "مطلقة" }
          ]}
          columns={3}
        />
      </FieldBlock>

      <FieldBlock
        name="whatsapp_number"
        label="4) رقم واتساب بالإنجليزي"
        hint="اكتبيه بصيغة صحيحة (مثال: +201234567890) أو (01234567890)."
      >
        <Input
          id="whatsapp_number"
          dir="ltr"
          className="text-left"
          inputMode="tel"
          placeholder="+201234567890"
          {...register("whatsapp_number")}
        />
      </FieldBlock>

      <FieldBlock name="education" label="5) المؤهل العلمي">
        <Input id="education" placeholder="مثال: ليسانس / بكالوريوس ..." {...register("education")} />
      </FieldBlock>

      <FieldBlock name="finished_study" label="6) هل أنهيتِ الدراسة؟">
        <RadioCards
          name="finished_study"
          options={[
            { label: "نعم", value: "نعم" },
            { label: "لا", value: "لا" }
          ]}
        />
      </FieldBlock>
    </div>
  );
}

/* -------------------- STEP 3 -------------------- */
export function StepThree() {
  const { register } = useFormContext<TeacherApplicationFormInput>();

  return (
    <div className="space-y-6">
      <FieldBlock
        name="supervision_experience_details"
        label="1) هل تم العمل قبل ذلك في الإشراف؟ وما هي المهام التي كنتِ تقومين بها؟"
        hint="اكتبي بإيجاز ووضوح (أو اكتبي: لم أعمل من قبل في الإشراف)."
      >
        <Textarea
          id="supervision_experience_details"
          rows={5}
          placeholder="اكتبي التفاصيل هنا..."
          {...register("supervision_experience_details")}
        />
      </FieldBlock>

      <FieldBlock name="current_job_and_hours" label="2) الوظيفة الحالية لكِ وأوقات العمل فيها">
        <Textarea
          id="current_job_and_hours"
          rows={4}
          placeholder="مثال: لا يوجد / أو اذكري الوظيفة وساعات العمل..."
          {...register("current_job_and_hours")}
        />
      </FieldBlock>

      <FieldBlock name="previous_jobs" label="3) الوظائف السابقة لكِ">
        <Textarea
          id="previous_jobs"
          rows={4}
          placeholder="اذكري الوظائف السابقة باختصار..."
          {...register("previous_jobs")}
        />
      </FieldBlock>

      <FieldBlock name="agree_attend_trial_sessions" label="4) يشترط حضور الحصص التجريبية للمعلمين والمعلمات لتقييم الحلقات">
        <RadioCards
          name="agree_attend_trial_sessions"
          options={[
            { label: "موافقة", value: "موافقة" },
            { label: "غير موافقة", value: "غير موافقة" }
          ]}
        />
      </FieldBlock>

      <FieldBlock name="internet_stability" label="5) هل متوفر إنترنت مستقر (واي فاي) على مدار اليوم؟">
        <RadioCards
          name="internet_stability"
          options={[
            { label: "واي فاي منزلي (Wi-Fi)", value: "واي فاي منزلي (Wi-Fi)" },
            { label: "باقة بيانات (Data)", value: "باقة بيانات (Data)" },
            { label: "كلاهما", value: "كلاهما" }
          ]}
          columns={3}
        />
      </FieldBlock>
    </div>
  );
}

/* -------------------- STEP 4 -------------------- */
export function StepFour() {
  return (
    <div className="space-y-6">
      <FieldBlock name="final_agree_no_stopping_policy" label="1) تأكيد: شرط عدم التوقف قبل 6 أشهر">
        <AgreementCheckbox
          name="final_agree_no_stopping_policy"
          label="أوافق على هذا الشرط النهائي:"
          policyText={NO_STOPPING_POLICY}
          acceptedValue="موافقة"
        />
      </FieldBlock>
    </div>
  );
}
