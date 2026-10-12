import React, { useState } from 'react';
import { Modal } from 'shared/components/feedback/Modal';
import { Button } from 'shared/components/buttons/Button';
import { MessageSquare, AlertTriangle } from 'lucide-react';

export const ModalsSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Modals & Overlays
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Accessible dialog overlays with backdrop blur and customizable
          headers/footers
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          leftIcon={<MessageSquare className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Open Standard Dialog
        </Button>

        <Button
          variant="danger"
          leftIcon={<AlertTriangle className="w-4 h-4" />}
          onClick={() => setIsConfirmOpen(true)}
        >
          Open Confirmation Modal
        </Button>
      </div>

      {/* Standard Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Theme Component Showcase Modal"
        subtitle="Demonstrating reusable modal dialog behavior"
      >
        <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            This modal component is completely responsive, keyboard accessible
            (ESC key to dismiss), and automatically locks background scrolling
            while open.
          </p>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
            💡 Easy to integrate with form submission handlers or confirmation
            actions.
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Item Confirmation"
        subtitle="This action cannot be undone"
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to remove this user from the organization? They
          will lose access to all shared resources immediately.
        </p>
      </Modal>
    </div>
  );
};
