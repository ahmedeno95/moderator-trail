"use client";

import { useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { StepOne, StepTwo, StepThree, StepFour } from "@/components/Steps";
import { Success } from "@/components/Success";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  TeacherApplicationSchema,
  stepFields,
  type TeacherApplicationFormInput,
  type TeacherApplicationFormOutput
} from "@/lib/validators";

const stepsMeta = [
  { title: "الشروط والالتزام", description: "تأكيد المتطلبات الأساسية" },
  { title: "البيانات الشخصية", description: "معلومات التواصل" },
  { title: "خبرات العمل", description: "أسئلة عن الخبرة والدوام" },
  { title: "أسئلة تمييزية", description: "طريقة التفكير والتواصل" }
];

export function FormWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const topRef = useRef<HTMLDivElement | null>(null);

  const methods = useForm<TeacherApplicationFormInput, any, TeacherApplicationFormOutput>({
    resolver: zodResolver(TeacherApplicationSchema),
    mode: "onTouched",
    defaultValues: {
      // Step 1
      agree_all_conditions: "",
      salary_acceptance: "",
      daily_work_no_weekly_off: "",
      all_day_availability: "",
      can_use_tools: "",
      agree_no_stopping_policy: "",

      // Step 2
      full_name_3: "",
      age: "",
      marital_status: "",
      whatsapp_number: "",
      education: "",
      finished_study: "",

      // Step 3
      supervision_experience_details: "",
      current_job_and_hours: "",
      previous_jobs: "",
      agree_attend_trial_sessions: "",
      internet_stability: "",

      // Step 4
      why_choose_you: "",
      supervision_role_idea: "",
      convince_parent_message: ""
    }
  });

  const progress = useMemo(() => Math.round(((step + 1) / stepsMeta.length) * 100), [step]);

  const stepComponent = useMemo(() => {
    switch (step) {
      case 0:
        return <StepOne />;
      case 1:
        return <StepTwo />;
      case 2:
        return <StepThree />;
      case 3:
        return <StepFour />;
      default:
        return null;
    }
  }, [step]);

  async function goNext() {
    setServerError(null);
    const fields = stepFields[step] as unknown as (keyof TeacherApplicationFormInput)[];
    const ok = await methods.trigger(fields, { shouldFocus: true });
    if (!ok) return;

    setDirection(1);
    setStep((s) => Math.min(s + 1, stepsMeta.length - 1));
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function goPrev() {
    setServerError(null);
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function onSubmit(values: TeacherApplicationFormOutput) {
    setServerError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const json = (await res.json().catch(() => null)) as
        | null
        | { ok?: boolean; message?: string; errors?: Record<string, string[]> };

      if (!res.ok) {
        if (json?.errors) {
          for (const [field, msgs] of Object.entries(json.errors)) {
            const msg = msgs?.[0];
            if (msg) methods.setError(field as any, { type: "server", message: msg });
          }
        }
        setServerError(json?.message || "تعذر الإرسال الآن. جرّبي مرة أخرى بعد قليل.");
        return;
      }

      setSuccess(true);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch {
      setServerError("حدث خطأ في الاتصال. تأكدي من الإنترنت ثم أعيدي المحاولة.");
    }
  }

  if (success) {
    return (
      <Card ref={topRef}>
        <CardContent className="p-6 sm:p-8">
          <Success
            onNew={() => {
              setSuccess(false);
              setStep(0);
              setDirection(1);
              setServerError(null);
              methods.reset();
              requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={topRef} className="border-primary/15">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span>تقديم مشرفات خدمة العملاء</span>
          <span className="text-sm font-semibold text-muted-foreground">{progress}%</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-5 sm:p-7">
        <Stepper steps={stepsMeta} currentStep={step} />

        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>تنبيه لطيف</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: direction === 1 ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? 24 : -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                {stepComponent}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={step === 0 || methods.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                السابق
              </Button>

              {step < stepsMeta.length - 1 ? (
                <Button type="button" onClick={goNext} disabled={methods.formState.isSubmitting} className="w-full sm:w-auto">
                  التالي
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={methods.formState.isSubmitting} className="w-full sm:w-auto">
                  {methods.formState.isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جارٍ الإرسال...
                    </>
                  ) : (
                    <>
                      إرسال الطلب
                      <Send className="mr-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
