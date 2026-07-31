type BrandSymbolProps = {
  className?: string;
  title?: string;
};

export default function BrandSymbol({ className, title }: BrandSymbolProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 5.5 37.3 14l9.7-2.1-.7 9.9 9 4.2-6.5 7.5 6.5 7.4-9 4.2.7 9.9-9.7-2.1L32 61.5l-5.3-8.6L17 55l.7-9.9-9-4.2 6.5-7.4L8.7 26l9-4.2-.7-9.9 9.7 2.1L32 5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 13.5v34M27.5 47.5h9M29.5 51h5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="m32 11-4.2 8h8.4L32 11Z"
        fill="currentColor"
      />
      <path
        d="M23.5 22c8-5.2 17.4-1.1 17.4 5.3 0 7.8-17.8 4.6-17.8 12.8 0 5.1 7 7.8 14.1 4.1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="23.2" cy="22.1" r="2.2" fill="currentColor" />
    </svg>
  );
}
