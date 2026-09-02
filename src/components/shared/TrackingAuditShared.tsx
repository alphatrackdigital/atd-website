import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, CheckCircle2, ChevronDown, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

type TrackingAuditFormSelectOption = {
  value: string;
  label: string;
};

type TrackingAuditFormSelectProps = {
  id: string;
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: readonly TrackingAuditFormSelectOption[];
  placeholder: string;
  error?: string;
  theme?: string;
};

export const TrackingAuditFormSelect = ({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
}: TrackingAuditFormSelectProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !options.length) return;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open, options.length]);

  const openAt = (index: number) => {
    if (!options.length) return;
    const nextIndex = Math.min(Math.max(index, 0), options.length - 1);
    setActiveIndex(nextIndex);
    setOpen(true);
  };

  const moveActive = (index: number) => {
    if (!options.length) return;
    const nextIndex = (index + options.length) % options.length;
    setActiveIndex(nextIndex);
  };

  const commitOption = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        aria-activedescendant={open && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          openAt(selectedIndex >= 0 ? selectedIndex : 0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openAt(selectedIndex >= 0 ? selectedIndex : 0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openAt(selectedIndex >= 0 ? selectedIndex : options.length - 1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openAt(selectedIndex >= 0 ? selectedIndex : 0);
          }
        }}
        className={[
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 text-left text-[13px] font-medium outline-none transition-all",
          "border-border bg-card text-card-foreground shadow-[0_1px_0_rgba(255,255,255,0.025)] hover:border-primary/30 hover:bg-accent",
          "focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/20",
          error ? "border-red-500/45" : "",
        ].join(" ")}
      >
        <span className={selected ? "truncate text-foreground" : "truncate text-muted-foreground/75"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={[
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-[80] mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border bg-card p-1.5 text-card-foreground shadow-[0_20px_50px_rgba(0,0,0,0.32)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                id={`${id}-option-${index}`}
                key={option.value}
                type="button"
                role="option"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isSelected}
                onFocus={() => setActiveIndex(index)}
                onClick={() => commitOption(option.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveActive(index + 1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveActive(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    moveActive(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    moveActive(options.length - 1);
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    commitOption(option.value);
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                  } else if (event.key === "Tab") {
                    setOpen(false);
                  }
                }}
                className={[
                  "flex min-h-9 w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] leading-5 outline-none transition-colors",
                  isSelected
                    ? "bg-primary/[0.10] font-semibold text-primary"
                    : isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/88 hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-primary/30",
                ].join(" ")}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TrackingAuditSuccessState = () => (
  <div
    data-tracking-audit-success
    className="mx-auto flex max-w-md flex-col items-center px-1 py-5 text-center sm:py-6"
    aria-live="polite"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.08] text-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
    </div>
    <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-[22px]">Application received.</h2>
    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-foreground/78">
      Thanks — we’ve received your Tracking Audit application.
    </p>
    <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-5 text-muted-foreground">
      We’ll review it and email you within one business day if the audit is a good fit.
    </p>
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.045] px-3 py-1.5 text-[11px] font-medium text-foreground/72">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span>No passwords or account credentials are required.</span>
    </div>
    <Button asChild variant="ghost" size="sm" className="mt-4 h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground">
      <Link to="/">Back to site</Link>
    </Button>
  </div>
);

export const TrackingAuditHumanReviewBadge = () => (
  <div
    className="absolute right-3 -top-5 z-40 sm:-right-3 sm:-top-4"
    data-human-review-badge
    aria-label="Human-reviewed audit. Not an automated report."
  >
    <div className="relative flex items-center gap-2 rounded-xl border border-amber-200/80 bg-[linear-gradient(135deg,#fff7d6_0%,#f3cf6b_42%,#d99a24_100%)] px-3.5 py-2 text-[10px] font-semibold text-[#3f2a07] shadow-[0_12px_28px_rgba(116,73,8,0.24),0_0_0_1px_rgba(255,255,255,0.35)_inset] sm:text-[11px]">
      <ShieldCheck className="h-4 w-4 shrink-0 text-[#795009]" aria-hidden="true" />
      <span className="leading-tight">
        <span className="block uppercase tracking-[0.12em]">Human-reviewed audit</span>
        <span className="mt-0.5 block font-medium tracking-normal text-[#65420a]/85">Not an automated report</span>
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-[#b97911]/55 bg-[#cf8d1e]"
      />
    </div>
  </div>
);

export const TrackingAuditReviewCue = () => (
  <div className="mt-9 flex justify-center md:mt-11 lg:mt-4 lg:shrink-0 lg:pb-1">
    <a
      href="#measurement-journey"
      data-tracking-audit-review-cue
      className="group inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/[0.055] px-4 py-2.5 text-sm font-semibold text-foreground/82 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.09] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <span>See what we review</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-background/55 text-primary">
        <ArrowDown className="h-4 w-4 motion-safe:animate-bounce motion-reduce:animate-none" aria-hidden="true" />
      </span>
    </a>
  </div>
);
