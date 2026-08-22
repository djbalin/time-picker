/**
 * Family-token color rotation for participant badges/avatars. Assign by the
 * participant's index in the poll's participant list, so the same person
 * gets the same color on every screen.
 *
 * Deliberately more than a handful of entries — red is left out on purpose
 * since it's reserved for "this date doesn't work" status elsewhere in the
 * UI, and a participant badge sharing that color would read as a warning.
 */
export type ParticipantColor = { bg: string; text: string };

export const PARTICIPANT_COLORS: ParticipantColor[] = [
  { bg: "bg-sky-tint", text: "text-sky-deep" },
  { bg: "bg-orange-tint", text: "text-orange-deep" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-green-tint", text: "text-green-deep" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-yellow", text: "text-ink" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-lime-100", text: "text-lime-800" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-700" },
];

export function participantColor(index: number): ParticipantColor {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}
