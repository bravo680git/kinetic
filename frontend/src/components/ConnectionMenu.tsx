import {
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { Edit2, MoreVertical, Plug, Trash2 } from "lucide-react";
import { useState } from "react";
import { type SavedConnection } from "../lib/connections";

interface ConnectionMenuProps {
  connection: SavedConnection;
  onConnect: (conn: SavedConnection) => void;
  onEdit: (conn: SavedConnection) => void;
  onDelete: (id: string) => void;
}

export function ConnectionMenu({
  connection,
  onConnect,
  onEdit,
  onDelete,
}: ConnectionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="p-1.5 hover:bg-bg-base rounded transition-colors"
        title="Menu"
      >
        <MoreVertical size={14} className="text-text-secondary" />
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="bg-bg-elevated border border-border rounded-md shadow-lg z-50 min-w-max"
        >
          <button
            onClick={() => {
              onConnect(connection);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-bg-base transition-colors text-sm text-text-primary rounded-t-md"
          >
            <Plug size={14} className="text-accent" />
            Connect
          </button>
          <button
            onClick={() => {
              onEdit(connection);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-bg-base transition-colors text-sm text-text-primary"
          >
            <Edit2 size={14} className="text-text-secondary" />
            Edit
          </button>
          <button
            onClick={() => {
              onDelete(connection.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-status-error/10 transition-colors text-sm text-status-error rounded-b-md"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </>
  );
}
