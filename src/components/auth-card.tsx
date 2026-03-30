export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_80px_rgba(48,57,37,0.08)]">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-8">{children}</div>
    </div>
  );
}
