// Step-5 live workspace content: tasks + resources, keyed by domain.
export const WORKSPACE_TASKS = {
  mern: {
    tasks: [
      { title: 'Design the document model & API contracts', done: true, tips: 'Plan entities: users, projects, tasks. Write the REST spec before code.' },
      { title: 'Build JWT auth + role middleware', done: true, tips: 'Store hashed passwords, never raw. Add refresh-token rotation.' },
      { title: 'Ship realtime presence with Socket.io', done: false, tips: 'Use rooms per project. Emit presence state diffs, not full snapshots.' },
      { title: 'Deploy to Railway/Vercel + CI pipeline', done: false, tips: 'Add health checks, env separation, and automated e2e smoke tests.' },
    ],
    resources: ['MongoDB University M001', 'Node.js official docs', 'JWT.io debugger', 'Render/Railway guides'],
  },
  frontend: {
    tasks: [
      { title: 'Wire a tokenized Design System', done: true, tips: 'Color, type, spacing, radius tokens first — then components.' },
      { title: 'Implement page transitions with GSAP', done: true, tips: 'Animate out before route change to avoid layout shift.' },
      { title: 'Audit a11y to WCAG AA on every route', done: false, tips: 'Keyboard nav, focus rings, contrast, reduced-motion support.' },
      { title: 'Ship on Vercel with Lighthouse ≥ 95', done: false, tips: 'Code-split routes, lazy-load images, inline critical CSS.' },
    ],
    resources: ['Design tokens guide', 'GSAP ScrollTrigger docs', 'Web.dev a11y checklist', 'Next.js deployment docs'],
  },
  cyber: {
    tasks: [
      { title: 'Recon & enumeration on target VM', done: true, tips: 'Document every command; evidence > intuition in the report.' },
      { title: 'Exploit + escalate in sandboxed lab', done: false, tips: 'Stay in scope. Write the payload, then the mitigation.' },
      { title: 'Draft a structured pentest report', done: false, tips: 'Severity ratings, reproductions, remediation owners.' },
      { title: 'Build a detection playbook', done: false, tips: 'Map attacker actions to SIEM rules and alerts.' },
    ],
    resources: ['PortSwigger Web Academy', 'HackTheBox intro', 'OWASP Top 10', 'Kali documentation'],
  },
}

export const DEFAULT_WORKSPACE = {
  tasks: [
    { title: 'Onboard into the programme handbook', done: true, tips: 'Read the sprint calendar and grading rubric.' },
    { title: 'Complete week-01 hands-on lab', done: true, tips: 'Submit evidence: code, logs, or screenshots.' },
    { title: 'Submit progress checkpoint to mentor', done: false, tips: '30-minute live review; prepare your wins and blockers.' },
    { title: 'Claim your final certification', done: false, tips: 'You unlock the certificate ID once all tasks and the finale are complete.' },
  ],
  resources: ['Programme handbook', 'Sprint calendar', 'Mentor office-hours link', 'Community channel'],
}

export const INTERVIEW_QUESTIONS = [
  'Walk me through the last project you shipped and the biggest engineering decision you made.',
  'How would you debug a production bug you cannot reproduce locally?',
  'Describe a time you had to collaborate under a tight deadline — what was your role?',
]

export const INTERVIEW_FEEDBACK = {
  clarity: 'You articulate decisions in clear, structured language with concrete trade-offs.',
  depth: 'Strong domain awareness; connect examples to the Codetern curriculum for even richer depth.',
  confidence: 'Keep your pace steady and breathe between ideas — your energy reads well on camera.',
  next: 'Given your performance, you are cleared to book your seat. Your scorecard has been saved to your profile.',
}