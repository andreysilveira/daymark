import { describe, it, expect } from 'vitest';
import { Task } from '../src/types';
import { isToday, isOverdue, isUpcoming, getLocalDateString } from '../src/utils/date';

describe('View Filtering Logic', () => {
  const today = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Due today',
      description: null,
      project_id: null,
      due_date: today,
      is_completed: 0,
      completed_at: null,
      created_at: '2026-10-15T00:00:00.000Z',
      updated_at: '2026-10-15T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Overdue task',
      description: null,
      project_id: null,
      due_date: yesterdayStr,
      is_completed: 0,
      completed_at: null,
      created_at: '2026-10-14T00:00:00.000Z',
      updated_at: '2026-10-14T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Upcoming task',
      description: null,
      project_id: null,
      due_date: tomorrowStr,
      is_completed: 0,
      completed_at: null,
      created_at: '2026-10-15T00:00:00.000Z',
      updated_at: '2026-10-15T00:00:00.000Z',
    },
    {
      id: '4',
      title: 'Inbox task (no due date)',
      description: null,
      project_id: null,
      due_date: null,
      is_completed: 0,
      completed_at: null,
      created_at: '2026-10-15T00:00:00.000Z',
      updated_at: '2026-10-15T00:00:00.000Z',
    },
    {
      id: '5',
      title: 'Completed task',
      description: null,
      project_id: null,
      due_date: today,
      is_completed: 1,
      completed_at: '2026-10-15T12:00:00.000Z',
      created_at: '2026-10-15T00:00:00.000Z',
      updated_at: '2026-10-15T12:00:00.000Z',
    },
  ];

  it('filters Today view tasks (due today and overdue incomplete)', () => {
    const todayTasks = sampleTasks.filter(
      (t) => t.is_completed === 0 && t.due_date && (isToday(t.due_date) || isOverdue(t.due_date))
    );
    expect(todayTasks.map((t) => t.id)).toEqual(['1', '2']);
  });

  it('filters Upcoming view tasks (future incomplete tasks)', () => {
    const upcomingTasks = sampleTasks.filter(
      (t) => t.is_completed === 0 && t.due_date && isUpcoming(t.due_date)
    );
    expect(upcomingTasks.map((t) => t.id)).toEqual(['3']);
  });

  it('filters Inbox view tasks (incomplete tasks without due date)', () => {
    const inboxTasks = sampleTasks.filter((t) => t.is_completed === 0 && !t.due_date);
    expect(inboxTasks.map((t) => t.id)).toEqual(['4']);
  });

  it('filters Completed view tasks', () => {
    const completedTasks = sampleTasks.filter((t) => t.is_completed === 1);
    expect(completedTasks.map((t) => t.id)).toEqual(['5']);
  });
});
