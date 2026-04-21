import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Edit2, MoreVertical, Plug, Trash2 } from "lucide-react";
import { type SavedConnection } from "../stores/connection";

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
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-1.5 hover:bg-bg-base rounded transition-colors 
            focus-visible:border-none focus-visible:outline-none"
          title="Menu"
        >
          <MoreVertical size={14} className="text-text-secondary" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-bg-elevated border border-border rounded-md shadow-lg z-50 min-w-max"
          sideOffset={8}
        >
          <DropdownMenu.Item
            onSelect={() => onConnect(connection)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-bg-base transition-colors text-sm text-text-primary cursor-pointer rounded-t-md focus:outline-none"
          >
            <Plug size={14} className="text-accent" />
            Connect
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => onEdit(connection)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-bg-base transition-colors text-sm text-text-primary cursor-pointer focus:outline-none"
          >
            <Edit2 size={14} className="text-text-secondary" />
            Edit
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => onDelete(connection.id)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-error/10 transition-colors text-sm text-error cursor-pointer rounded-b-md focus:outline-none"
          >
            <Trash2 size={14} className="text-error" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
