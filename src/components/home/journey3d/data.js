import { BrainCircuit, CalendarCheck, Rocket, UserCheck, Video } from 'lucide-react'
// mainly for mobile apps
export const MILESTONES = [
  { icon: UserCheck, step: '01', title: 'Profile & resume', desc: 'Your identity, resume and track on file.', color: '#b4ff39' },
  { icon: Rocket, step: '02', title: 'Live workspace', desc: 'Weekly sprints; a mentor curates and reviews your checklist.', color: '#38ffb0' },
  { icon: CalendarCheck, step: '03', title: 'Production handoff', desc: 'Deploy with CI, tests and a mentor sign-off.', color: '#22d3ee' },
  { icon: BrainCircuit, step: '04', title: 'Final assessment', desc: 'Timed screening tuned per domain by your admin.', color: '#7c5cff' },
  { icon: Video, step: '05', title: 'Final interview', desc: 'AI-scored mock interview with a verified scorecard.', color: '#ff5c7a' },
]

export const RING_RADIUS = 2.6
export const NODE_SIZE = 0.55
