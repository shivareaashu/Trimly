'use client';

import { Modal } from './Modal.jsx';
import { Button } from '@/components/ui/Button.jsx';

export function FormModal({
  open,
  title,
  description,
  children,
  submitLabel = 'Save',
  onSubmit,
  onClose,
}) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <form className="space-y-5" onSubmit={onSubmit}>
        {children}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FormModal;
