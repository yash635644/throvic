import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean };

/** Square icon button with an accessible label and a native tooltip. */
export function IconButton({ label, active, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      {...rest}
      className={cn(
        "grid h-10 w-10 shrink-0 pointer-coarse:h-11 pointer-coarse:w-11 place-items-center rounded-xl text-muted transition hover:bg-surface-hover hover:text-fg active:scale-95 disabled:opacity-35 disabled:hover:bg-transparent [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-[1.75]",
        active && "bg-purple/15 text-purple-light hover:bg-purple/20 hover:text-purple-light",
        className,
      )}
    >
      {children}
    </button>
  );
}
