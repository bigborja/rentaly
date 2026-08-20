export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#8f1d2c" />
      <path d="M8 18.5 16 11l8 7.5V24a1 1 0 0 1-1 1h-4.2v-5.2h-5.6V25H9a1 1 0 0 1-1-1v-5.5Z" fill="#f4efe4" />
      <path d="M11.2 14.2h2.1v1.6h-2.1zm3.75 0h2.1v1.6h-2.1zm3.75 0h2.1v1.6h-2.1z" fill="#c4a36a" />
    </svg>
  );
}
