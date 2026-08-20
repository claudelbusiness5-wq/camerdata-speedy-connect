export type OperatorId = "mtn" | "orange" | "camtel";

const labels: Record<OperatorId, string> = {
  mtn: "MTN",
  orange: "Orange",
  camtel: "CAMTEL",
};

const styles: Record<OperatorId, string> = {
  mtn: "bg-mtn text-mtn-blue",
  orange: "bg-orange-brand text-primary-foreground",
  camtel: "bg-camtel text-primary-foreground",
};

export function OperatorLogo({
  operator,
  className = "",
}: {
  operator: OperatorId;
  className?: string;
}) {
  return (
    <span
      aria-label={`Logo ${labels[operator]}`}
      role="img"
      className={`grid shrink-0 place-items-center rounded-xl font-black tracking-tight ${styles[operator]} ${className}`}
    >
      {labels[operator]}
    </span>
  );
}

export const operatorLabels = labels;
