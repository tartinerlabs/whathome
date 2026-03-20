export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      <a href="/" className="flex items-center gap-3 mb-8">
        <div className="size-8 bg-foreground" />
        <span className="font-sans text-xl font-extrabold tracking-[2px]">
          WHATHOME
        </span>
      </a>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
