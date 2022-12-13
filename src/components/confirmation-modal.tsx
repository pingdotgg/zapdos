import clsx from "clsx";
import React, { useEffect, useRef } from "react";
import create from "zustand";
import Button from "./button";
import { Modal } from "./modal";

interface ModalStoreState {
  content?: JSX.Element;
  setContent: (content?: JSX.Element) => void;
}

const useModalStore = create<ModalStoreState>((set) => ({
  content: undefined,
  setContent: (content) => set({ content }),
}));

export const useConfirmationModal = (options: ConfirmationModalOptions) => {
  const setContent = useModalStore((s) => s.setContent);
  const { onConfirm, ...rest } = options;
  const trigger = () => {
    setContent(
      <ConfirmationModal
        onConfirm={() => {
          onConfirm?.();
          setContent(undefined);
        }}
        onCancel={() => setContent(undefined)}
        {...rest}
      />
    );
  };
  return trigger;
};

export const ModalContainer: React.FC = () => {
  const [content, setContent] = useModalStore((s) => [s.content, s.setContent]);
  return (
    <Modal openState={[!!content, (open) => !open && setContent(undefined)]}>
      {content}
    </Modal>
  );
};

type ConfirmationModalOptions = {
  title: string;
  description: string;
  confirmationLabel?: string;
  onConfirm?: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "danger";
};

const ConfirmationModal: React.FC<
  ConfirmationModalOptions & {
    onCancel?: () => void;
  }
> = ({
  title,
  description,
  confirmationLabel = "Okay",
  onConfirm,
  onCancel,
  icon,
  variant = "primary",
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!cancelButtonRef.current) return;
    cancelButtonRef.current.focus();
  }, []);
  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        {icon && (
          <div
            className={clsx(
              "mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border sm:mx-0 sm:h-10 sm:w-10",
              {
                "border-gray-700 bg-gray-600": variant === "primary",
                "border-red-700 bg-red-600": variant === "danger",
              }
            )}
          >
            {icon}
          </div>
        )}
        <div className="text-center sm:text-left">
          <Modal.Title as="h3" className="text-lg font-medium leading-6">
            {title}
          </Modal.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:mt-4 sm:flex-row-reverse">
        <Button
          variant={variant}
          className="w-full justify-center sm:w-auto sm:text-sm"
          onClick={onConfirm}
        >
          {confirmationLabel}
        </Button>
        <Button
          className="w-full justify-center sm:w-auto sm:text-sm"
          onClick={onCancel}
          ref={cancelButtonRef}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
