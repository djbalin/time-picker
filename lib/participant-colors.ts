/**
 * Family-token color rotation for participant badges/avatars. Assign by the
 * participant's index in the poll's participant list so the same person gets
 * the same color on every screen.
 */
export type ParticipantColor = { bg: string; text: string };

export const PARTICIPANT_COLORS: ParticipantColor[] = [
  { bg: "bg-sky-tint", text: "text-sky-deep" },
  { bg: "bg-green-tint", text: "text-green-deep" },
  { bg: "bg-orange-tint", text: "text-orange-deep" },
  { bg: "bg-yellow", text: "text-ink" },
];

export function participantColor(index: number): ParticipantColor {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}
