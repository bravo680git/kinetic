import { useState } from "react";
import { AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type ConfirmType = "error" | "warning" | "info";

const typeConfig = {
  error: {
    icon: AlertCircle,
    iconColor: "text-error",
    buttonColor: "bg-error hover:bg-error/90",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-warning",
    buttonColor: "bg-warning hover:bg-warning/90",
  },
  info: {
    icon: HelpCircle,
    iconColor: "text-accent",
    buttonColor: "bg-accent hover:bg-accent/90",
  },
};

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  onConfirm: () => void | Promise<void>;
}

function ConfirmDialogContent({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  loading = false,
}: ConfirmOptions & {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
}) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg-elevated p-6 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <Icon size={24} className={`${config.iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-text-primary">
                {title}
              </Dialog.Title>
              {description && (
                <p className="text-sm text-text-secondary mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-2 border border-border text-text-primary rounded-md hover:bg-bg-base transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${config.buttonColor}`}
            >
              {loading ? "..." : confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!options) return;
    setLoading(true);
    try {
      const result = options.onConfirm();
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setLoading(false);
      setIsOpen(false);
      setOptions(null);
    }
  };

  const modal = {
    confirm: (opts: ConfirmOptions) => {
      setOptions(opts);
      setIsOpen(true);
    },
  };

  const contextHolder = (
    <ConfirmDialogContent
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setOptions(null);
      }}
      onConfirm={handleConfirm}
      title={options?.title || ""}
      description={options?.description}
      confirmText={options?.confirmText}
      cancelText={options?.cancelText}
      type={options?.type}
      loading={loading}
    />
  );

  return { modal, contextHolder };
}
