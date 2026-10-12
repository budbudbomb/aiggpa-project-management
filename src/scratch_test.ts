/* eslint-disable no-console */
import { ActivityTaskStore } from './stores/activityTaskStore';

// In Node environment, mock localStorage if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, val: string): void => {
      store.set(key, val);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
    clear: (): void => {
      store.clear();
    },
    key: (i: number): string | null => Array.from(store.keys())[i] ?? null,
    get length(): number {
      return store.size;
    },
  };
  globalThis.localStorage = mockStorage;
}

console.log('--- Testing Organizational Hierarchy & Activities Engine ---');

// 1. Employees check
const employees = ActivityTaskStore.getEmployees();
console.log(`Loaded ${employees.length} employees.`);

const centerHead = employees.find(e => e.role === 'Center Head')!;
const pm = employees.find(e => e.role === 'Project Manager')!;
const ra = employees.find(e => e.role === 'Research Analyst')!;
const fellow = employees.find(
  e => e.role === 'Fellow' && e.reportsTo === pm.id
)!;
const intern = employees.find(
  e => e.role === 'Intern' && e.reportsTo === fellow.id
)!;

console.log('Center Head:', centerHead.name);
console.log('Project Manager:', pm.name);
console.log('Research Analyst:', ra.name);
console.log('Fellow under PM:', fellow.name);
console.log('Intern under Fellow:', intern.name);

// 2. Can Center Head assign to PM?
console.log(
  'Can Center Head assign to PM?',
  ActivityTaskStore.canAssignTo(centerHead, pm)
); // Expect true
console.log(
  'Can Center Head assign to RA?',
  ActivityTaskStore.canAssignTo(centerHead, ra)
); // Expect true

// 3. Can PM assign to Fellow?
console.log(
  'Can PM assign to assigned Fellow?',
  ActivityTaskStore.canAssignTo(pm, fellow)
); // Expect true

// 4. Can Fellow assign to Intern?
console.log(
  'Can Fellow assign to assigned Intern?',
  ActivityTaskStore.canAssignTo(fellow, intern)
); // Expect true

// 5. Can Intern assign to anyone?
console.log(
  'Can Intern create tasks?',
  ActivityTaskStore.canCreateTasks(intern.role)
); // Expect false
console.log(
  'Intern eligible assignees count:',
  ActivityTaskStore.getEligibleAssignees(intern).length
); // Expect 0

// 6. Test Task Creation
const task1 = ActivityTaskStore.createTask({
  title: 'Test Center Head Task for PM',
  description: 'Test description',
  projectId: 'PRJ-01',
  projectName: 'DPI-Based Open Networks',
  creatorId: centerHead.id,
  creatorName: centerHead.name,
  creatorRole: centerHead.role,
  assigneeId: pm.id,
  assigneeName: pm.name,
  assigneeRole: pm.role,
  reviewerId: centerHead.id,
  reviewerName: centerHead.name,
  reviewerRole: centerHead.role,
  priority: 'High',
  status: 'To Do',
  startDate: '2026-10-01',
  dueDate: '2026-10-20',
  requiresReview: true,
  labels: ['Test'],
  attachments: [],
  checklist: [{ id: '1', text: 'Step 1', completed: false }],
  comments: [],
  evidenceRequirements: [],
  submissions: [],
});

console.log('Created task with ID:', task1.id);

// 7. Test Transition to In Progress
const tRes1 = ActivityTaskStore.transitionStatus(task1.id, 'In Progress', pm);
console.log('Transition to In Progress:', tRes1.success, tRes1.message);

// 8. Test Review Gate: Subordinate tries to complete task that requires review
const tRes2 = ActivityTaskStore.transitionStatus(task1.id, 'Completed', pm);
console.log(
  'Subordinate tries to mark Completed (redirects to In Review):',
  tRes2.message
);
const inReviewTask = ActivityTaskStore.getTaskById(task1.id)!;
console.log('Task status now:', inReviewTask.status); // Expect 'In Review'

// 9. Supervisor requests revisions
const chgRes = ActivityTaskStore.requestChanges(
  task1.id,
  centerHead,
  'Please re-verify section 3 data tables.'
);
console.log('Supervisor requests changes:', chgRes.success, chgRes.message);
const revisionTask = ActivityTaskStore.getTaskById(task1.id)!;
console.log('Task status after change request:', revisionTask.status); // Expect 'Changes Requested'

// 10. Subordinate resubmits
const resubRes = ActivityTaskStore.resubmitTask(
  task1.id,
  pm,
  'Section 3 re-verified with latest survey figures.'
);
console.log('Subordinate resubmits:', resubRes.success, resubRes.message);
const resubTask = ActivityTaskStore.getTaskById(task1.id)!;
console.log('Task status after resubmit:', resubTask.status); // Expect 'In Review'

// 11. Supervisor approves completion
const tRes3 = ActivityTaskStore.approveTask(
  task1.id,
  centerHead,
  'Deliverables verified. Approved.'
);
console.log('Supervisor approves completion:', tRes3.success, tRes3.message);
console.log(
  'Final task status:',
  ActivityTaskStore.getTaskById(task1.id)!.status
); // Expect 'Completed'

console.log('--- All Engine Tests Completed Successfully! ---');
