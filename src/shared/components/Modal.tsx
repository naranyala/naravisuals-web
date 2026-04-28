import { clsx } from "clsx";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  fullScreenOnMobile?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  header,
  children,
  footer,
  className,
  fullScreenOnMobile = true,
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return createPortal(
    <div className={clsx("modal-overlay", { visible: isOpen, hidden: !isOpen })} onClick={onClose}>
      <div
        className={clsx("modal-container", fullScreenOnMobile && "mobile-fullscreen", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {header ? (
            <>
              <div className="modal-header-content">{header}</div>
              <button type="button" className="modal-close-btn" onClick={onClose}>
                ✕
              </button>
            </>
          ) : (
            <>
              {title && <h2 className="modal-title">{title}</h2>}
              <button type="button" className="modal-close-btn" onClick={onClose}>
                ✕
              </button>
            </>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
