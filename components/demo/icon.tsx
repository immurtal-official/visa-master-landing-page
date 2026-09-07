export function DemoIcon({
  name,
  className = "",
}: {
  name:
    | "arrow"
    | "back"
    | "check"
    | "close"
    | "file"
    | "globe"
    | "list"
    | "chat"
    | "external"
    | "spark"
    | "user"
    | "logout";
  className?: string;
}) {
  const paths = {
    logout: <><path d="M10 4H5v16h5M9 12h12m-5-5 5 5-5 5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    arrow: (
      <>
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </>
    ),
    back: (
      <>
        <path d="M19 12H5m5-5-5 5 5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    file: (
      <>
        <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h4" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c4 4 4 14 0 18-4-4-4-14 0-18Z" />
      </>
    ),
    list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
    chat: <path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 1 1 19 0Z" />,
    external: (
      <>
        <path d="M14 3h7v7M21 3l-11 11M10 3H4v17h17v-6" />
      </>
    ),
    spark: (
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
