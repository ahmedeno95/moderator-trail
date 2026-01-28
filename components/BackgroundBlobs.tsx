export function BackgroundBlobs() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute -top-28 right-[-10rem] -z-20 h-[26rem] w-[26rem] rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-[18rem] left-[-12rem] -z-20 h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-[-14rem] right-[10%] -z-20 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,.35) 1px, transparent 0)",
          backgroundSize: "18px 18px"
        }}
      />
    </>
  );
}
