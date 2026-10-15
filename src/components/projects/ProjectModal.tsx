import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Project, CreateProjectInput, UpdateProjectInput } from '../../types';
import { Trash2, Archive, ArchiveRestore } from 'lucide-react';

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (input: CreateProjectInput | UpdateProjectInput) => Promise<any>;
  onArchive?: (id: string, archive: boolean) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
}

const PRESET_COLORS = [
  { name: 'Mint', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Slate', value: '#64748b' },
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  onArchive,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | null>(PRESET_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color || PRESET_COLORS[0].value);
    } else {
      setName('');
      setColor(PRESET_COLORS[0].value);
    }
    setShowDeleteConfirm(false);
    setError(null);
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Project name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: trimmed,
        color: color || null,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !onDelete) return;
    try {
      setIsSubmitting(true);
      await onDelete(project.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!project || !onArchive) return;
    try {
      setIsSubmitting(true);
      await onArchive(project.id, project.is_archived === 0);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to change archive state.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
      description="Projects organize your tasks into distinct focus areas."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Work, Personal, Side Project"
            className="w-full rounded-md bg-surface border border-border px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
            autoFocus
          />
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  color === c.value ? 'ring-2 ring-accent ring-offset-2 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {project && (
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            {onArchive && (
              <button
                type="button"
                onClick={handleToggleArchive}
                disabled={isSubmitting}
                className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer"
              >
                {project.is_archived === 1 ? (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Unarchive Project</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Project</span>
                  </>
                )}
              </button>
            )}

            {onDelete && (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-danger font-medium">Delete project?</span>
                    <Button size="sm" variant="danger" onClick={handleDelete} disabled={isSubmitting}>
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs text-danger hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim() || isSubmitting}>
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
