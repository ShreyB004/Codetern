import {
  BarChart3,
  BrainCircuit,
  Code2,
  Container,
  Cpu,
  Database,
  Globe,
  LayoutTemplate,
  Network,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Wifi,
} from 'lucide-react'

const MAP = {
  BarChart3,
  BrainCircuit,
  Code2,
  Container,
  Cpu,
  Database,
  Globe,
  LayoutTemplate,
  Network,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Wifi,
}

export function DomainIcon({ name, ...props }) {
  const Icon = MAP[name] || Code2
  return <Icon {...props} />
}