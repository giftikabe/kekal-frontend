/**
 * The Kekal Living "KK" monogram — two interlocking K strokes.
 *
 * `animated` traces the strokes in on mount (used once, on the login
 * screen). Respects prefers-reduced-motion via index.css's global rule
 * that collapses animation-duration to ~0.
 */
interface LogomarkProps {
  variant?: "dark-on-light" | "light-on-dark";
  size?: number;
  animated?: boolean;
  className?: string;
}

export function Logomark({ variant = "dark-on-light", size = 32, animated = false, className }: LogomarkProps) {
  const stroke = variant === "dark-on-light" ? "#0A0A0A" : "#FFFFFF";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kekal Living"
    >
      {/* First K */}
      <path
        d="M6 4 V44 M6 24 L22 4 M6 24 L22 44"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        pathLength={animated ? 1 : undefined}
        style={
          animated
            ? {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "kk-trace 900ms ease-out forwards",
              }
            : undefined
        }
      />
      {/* Second K, mirrored and offset so the arms interlock with the first */}
      <path
        d="M42 4 V44 M42 24 L26 4 M42 24 L26 44"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        pathLength={animated ? 1 : undefined}
        style={
          animated
            ? {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "kk-trace 900ms ease-out 150ms forwards",
              }
            : undefined
        }
      />
      {animated && (
        <style>{`
          @keyframes kk-trace {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}
    </svg>
  );
}
