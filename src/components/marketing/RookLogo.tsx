type Props = {
  size?: number;
  fill?: string;
  withGradientPlate?: boolean;
};

export function RookLogo({ size = 32, fill = "#0A0E14", withGradientPlate = true }: Props) {
  const inner = (
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 20h14v2H5v-2z" fill={fill} />
      <path d="M7 18h10l1-3H6l1 3z" fill={fill} />
      <path d="M8 15h8V9H8v6z" fill={fill} />
      <path d="M7 9h10l-1-3H8L7 9z" fill={fill} />
      <path d="M6 6h2V3h2v3h4V3h2v3h2v1H6V6z" fill={fill} />
    </svg>
  );

  if (!withGradientPlate) return inner;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        flexShrink: 0,
        background: "linear-gradient(135deg, #00B4A6, #009A8E)",
        boxShadow: "0 2px 12px rgba(0, 180, 166, 0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Sentry"
    >
      {inner}
    </div>
  );
}
