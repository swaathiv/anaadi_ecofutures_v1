export function SectionHeading({
  id,
  eyebrow,
  title,
  body,
  align = "left",
  level = 2,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  level?: 2 | 3;
}) {
  const H = level === 2 ? "h2" : "h3";
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className={`eyebrow eyebrow-rule ${centered ? "mx-auto" : ""}`}>{eyebrow}</p>}
      <H id={id} className={`text-section ${eyebrow ? "mt-5" : ""}`}>
        {title}
      </H>
      {body && <p className={`mt-5 text-ink ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{body}</p>}
    </div>
  );
}
