import { BrainCircuit, CalendarCheck, Rocket, UserCheck, Video } from 'lucide-react'

export const MILESTONES = [
  { icon: CalendarCheck, step: '01', title: 'Book your seat', desc: 'Pick a track and batch while live seats last.', color: '#22d3ee' },
  { icon: UserCheck, step: '02', title: 'Profile & resume', desc: 'Your identity, resume and track on file.', color: '#b4ff39' },
  { icon: Rocket, step: '03', title: 'Live workspace', desc: 'Ship real tasks with a mentor curating your checklist.', color: '#38ffb0' },
  { icon: BrainCircuit, step: '04', title: 'Final assessment', desc: 'Timed screening tuned per domain by your admin.', color: '#7c5cff' },
  { icon: Video, step: '05', title: 'Final interview', desc: 'AI-scored mock interview with a verified scorecard.', color: '#ff5c7a' },
]

export const RING_RADIUS = 2.6
export const NODE_SIZE = 0.55
