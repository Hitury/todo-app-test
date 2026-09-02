export function CategoryMenu({
  x,
  y,
  onRename,
  onDelete,
  onClose,
}: {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        style={{ top: y, left: x }}
        className="fixed z-20 w-28 overflow-hidden rounded-md border border-line bg-panel py-1 text-[11px] shadow-lg px-1"
      >
        <button
          onClick={() => {
            onRename();
            onClose();
          }}
          className="block w-full px-2.5 py-1 text-left text-dim transition-colors hover:bg-hover/50 hover:text-ink rounded-md"
        >
          Rename
        </button>
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="block w-full px-2.5 py-1 text-left text-[#c4402f] transition-colors hover:bg-[#c4402f]/70 hover:text-white rounded-md"
        >
          Delete
        </button>
      </div>
    </>
  );
}
