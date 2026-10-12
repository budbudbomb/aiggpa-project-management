import React from 'react';
import { Button } from 'shared/components/buttons/Button';
import { Badge } from 'shared/components/feedback/Badge';
import { Plus, Download, Trash2, ArrowRight } from 'lucide-react';

export const ButtonsSection: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Buttons & Badges
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Variant buttons with support for icons, sizes, loading states, and
          status badges
        </p>
      </div>

      {/* Button Variants */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Button Variants
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="danger">Delete Item</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </div>

      {/* Button Sizes & Icons */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Sizes & Icons
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Small Button
          </Button>
          <Button size="md" leftIcon={<Download className="w-4 h-4" />}>
            Medium Export
          </Button>
          <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Large Next Step
          </Button>
          <Button isLoading size="md">
            Loading State
          </Button>
        </div>
      </div>

      {/* Icon-Only Buttons */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Icon-Only Buttons
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            iconOnly
            icon={<Plus className="w-4 h-4" />}
            title="Add New"
          />
          <Button
            variant="secondary"
            iconOnly
            icon={<Download className="w-4 h-4" />}
            title="Download"
          />
          <Button
            variant="outline"
            iconOnly
            icon={<ArrowRight className="w-4 h-4" />}
            title="Next"
          />
          <Button
            variant="danger"
            iconOnly
            icon={<Trash2 className="w-4 h-4" />}
            title="Delete"
          />
          <Button
            variant="iconOnly"
            icon={<Plus className="w-4 h-4" />}
            title="Icon Only Variant"
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Status Badges
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">Primary Tag</Badge>
          <Badge variant="success" dot>
            Active Status
          </Badge>
          <Badge variant="warning" dot>
            Pending Approval
          </Badge>
          <Badge variant="danger" dot>
            Inactive User
          </Badge>
          <Badge variant="info">Information</Badge>
          <Badge variant="neutral">Draft</Badge>
        </div>
      </div>
    </div>
  );
};
