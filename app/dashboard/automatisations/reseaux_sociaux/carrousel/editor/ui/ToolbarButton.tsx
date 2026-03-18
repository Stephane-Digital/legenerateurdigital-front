export default function ToolbarButton({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-2 px-3 rounded-xl text-sm ${
        danger
          ? "bg-red-600 hover:bg-red-500"
          : "bg-yellow-600 hover:bg-yellow-500 text-black"
      }`}
    >
      {label}
    </button>
  );
}
