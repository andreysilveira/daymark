import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, Folder, CheckCircle2, Circle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task, Project, UpdateTaskInput } from '../../types';

export interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  projects: Project[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  projects,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date);
      setProjectId(task.project_id);
      setIsCompleted(task.is_completed === 1);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onUpdate(task.id, {
        title: trimmed,
        description: description.trim() || null,
        due_date: dueDate || null,
        project_id: projectId || null,
        is_completed: isCompleted ? 1 : 0,
      });
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDelete(task.id);
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" maxWidth="lg">
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md bg-surface border border-border px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
            placeholder="Task title"
          />
        </div>

        {/* Description textarea */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md bg-surface border border-border px-3 py-2 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
            placeholder="Add additional notes, links, or context..."
          />
        </div>

        {/* Due date & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-text-muted" /> Due Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value || null)}
                className="w-full rounded-md bg-surface border border-border px-2.5 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate(null)}
                  className="text-xs text-text-muted hover:text-danger px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-text-muted" /> Project
            </label>
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value || null)}
              className="w-full rounded-md bg-surface border border-border px-2.5 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
            >
              <option value="">No Project (Inbox)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Completion status toggle */}
        <div className="flex items-center justify-between py-2 px-3 bg-surface-secondary rounded-md border border-border-subtle">
          <span className="text-xs text-text-secondary">Completion Status</span>
          <button
            type="button"
            onClick={() => setIsCompleted(!isCompleted)}
            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-accent">Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-text-muted" />
                <span className="text-text-secondary">Incomplete</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-danger font-medium">Delete this task?</span>
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-danger hover:text-danger hover:bg-danger-subtle"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim() || isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
