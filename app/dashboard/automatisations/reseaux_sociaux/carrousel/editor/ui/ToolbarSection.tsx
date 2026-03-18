export default function ToolbarSection({ title, children }) {
  return (
    <div>
      <h3 className="text-yellow-300 font-semibold mb-3">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
