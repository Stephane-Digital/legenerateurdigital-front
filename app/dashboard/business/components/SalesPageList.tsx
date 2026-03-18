"use client";

import SalesPageCard from "./SalesPageCard";

export default function SalesPageList({ pages, onEdit, onDeleted }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {pages.map((p) => (
        <SalesPageCard
          key={p.id}
          page={p}
          onEdit={() => onEdit(p)}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
