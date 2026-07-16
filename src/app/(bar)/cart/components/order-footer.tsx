"use client";

import styles from "./order-footer.module.css";
import { SlideToOrder } from "./slide-to-order";

export function OrderFooter({
  comment,
  disabled,
  error,
  onCommentChange,
  onSubmit,
}: {
  comment: string;
  disabled: boolean;
  error: string | null;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <label className={styles.field}>
          <span className={styles.label}>Комментарий к заказу</span>
          <textarea
            className={styles.textarea}
            maxLength={300}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Например: без льда"
            value={comment}
          />
        </label>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : null}
        <SlideToOrder disabled={disabled} onComplete={onSubmit} />
      </div>
    </footer>
  );
}
