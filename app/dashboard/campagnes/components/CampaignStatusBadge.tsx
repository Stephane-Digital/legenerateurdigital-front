"use client";

type Props = {
  status: string;
};

export default function CampaignStatusBadge({ status }: Props) {
  const style = {
    draft: "bg-gray-700 text-gray-200 border-gray-500",
    running: "bg-yellow-500 text-black border-yellow-300",
    finished: "bg-green-600 text-white border-green-400",
  }[status] || "bg-gray-700 text-gray-200 border-gray-500";

  const label = {
    draft: "Brouillon",
    running: "En cours",
    finished: "Terminé",
  }[status] || status;

  return (
    <span
      className={`
        text-xs
        font-semibold
        px-3
        py-1
        rounded-full
        border
        ${style}
      `}
    >
      {label}
    </span>
  );
}
