import { AVATAR_PX, Avatar, type AvatarSize } from "./Avatar";

/** Overlapping row of avatars, with a `+N` counter past `max`. */
export function AvatarStack({
  names,
  max = 5,
  size = "md",
}: {
  names: string[];
  max?: number;
  size?: Exclude<AvatarSize, "xl">;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  const px = AVATAR_PX[size];

  return (
    <span className="inline-flex items-center">
      {shown.map((name, i) => (
        // Names can legitimately repeat, so position is part of the identity.
        // biome-ignore lint/suspicious/noArrayIndexKey: order is stable for a given name list
        <span key={`${name}-${i}`} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={name} size={size} />
        </span>
      ))}
      {extra > 0 ? (
        <span
          className="grid place-items-center rounded-full bg-surface-sunken text-2xs font-semibold text-muted"
          style={{
            width: px,
            height: px,
            marginLeft: -8,
            border: "var(--ring-avatar)",
          }}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
