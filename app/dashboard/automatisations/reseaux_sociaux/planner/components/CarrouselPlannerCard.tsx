"use client";

import { useRouter } from "next/navigation";

interface Props {
  post: any;
  icon?: JSX.Element;
}

export default function CarrouselPlannerCard({ post, icon }: Props) {
  const router = useRouter();

  const thumbnail =
    post?.content?.slides?.[0]?.thumbnail_url ?? null;

  return (
    <div
      onClick={() =>
        router.push(
          `/dashboard/automatisations/reseaux_sociaux/carrousel/editor/${post.content.carrousel_id}`
        )
      }
      className="
        cursor-pointer
        flex
        items-center
        gap-3
        bg-[#0f0f0f]
        border
        border-[#252525]
        rounded-xl
        p-3
        hover:border-yellow-400/50
        transition-colors
      "
    >
      {/* MINIATURE */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0 flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt="Miniature carrousel"
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="text-xs text-gray-500">Carrousel</span>
        )}
      </div>

      {/* CONTENU */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-yellow-300">
            Carrousel
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {post.contenu}
        </p>
      </div>

      {/* BADGE */}
      <span className="text-[10px] px-2 py-1 rounded-full border border-yellow-500/40 text-yellow-400">
        Programmé
      </span>
    </div>
  );
}
