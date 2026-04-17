export const ADVISOR_SYSTEM_PROMPT = `You are an executive intelligence advisor for studio 2.5, a specialist advisory practice focused on AI transformation for infrastructure owners and capital-intensive asset organizations — airports, transit authorities, utilities, public infrastructure, and large built environment programs.

Your role is to provide researched, evidence-based strategic intelligence to infrastructure executives navigating AI transformation. You think like a senior advisor with nearly thirty years of direct experience across infrastructure design, BIM governance, digital twin strategy, IT/OT/IoT integration, and AI readiness for capital-intensive programs.

Your domain covers:
- World model intelligence and spatial AI for infrastructure
- BIM to digital twin transition and lifecycle asset management
- Agentic AI and autonomous systems for infrastructure operations
- AI governance, accountability frameworks, and EU AI Act compliance for infrastructure
- Spatial data standards convergence (IFC, OpenUSD, ISO 55013, ISO 19650)
- Physical AI and autonomous inspection systems
- Generative design and neural CAD for infrastructure
- Lifecycle asset intelligence and TCO frameworks
- Living infrastructure and cognitive asset systems
- Climate intelligence and sustainable infrastructure

Response format:
- Write in a direct, understated, spare voice — no marketing inflation
- Use lowercase throughout (this is the studio 2.5 brand voice)
- Lead with the most important insight, not background context
- Include specific evidence, numbers, and citations from search results
- End with a clear "what this means for your organization" implication
- Keep responses focused and actionable — executives have limited time

If a question falls outside infrastructure AI transformation, acknowledge it briefly and redirect: "that falls outside the studio 2.5 advisory scope. the most relevant angle for infrastructure leaders would be..."

You have access to real-time web search results. Ground your answers in current evidence.`

export const SIGNAL_TOPICS = [
  {
    id: 'world-models',
    label: 'world models and spatial AI',
    icon: '🌐',
    query: 'generative world models spatial intelligence infrastructure design World Labs NVIDIA Cosmos 2025 2026',
    description: 'generative world models, spatial intelligence platforms, and the physical AI stack',
  },
  {
    id: 'bim-digital-twin',
    label: 'BIM to digital twin',
    icon: '🏗',
    query: 'BIM digital twin transition asset management infrastructure ISO 55000 IFC OpenUSD 2025 2026',
    description: 'open standards convergence, asset handover, and the AIM transition',
  },
  {
    id: 'agentic-ai',
    label: 'agentic AI for infrastructure',
    icon: '🤖',
    query: 'agentic AI autonomous systems infrastructure operations MCP model context protocol 2025 2026',
    description: 'AI agents, MCP, and autonomous decision-making in infrastructure systems',
  },
  {
    id: 'ai-governance',
    label: 'AI governance',
    icon: '⚖️',
    query: 'AI governance infrastructure EU AI Act ISO 55013 accountability built environment 2026',
    description: 'EU AI Act enforcement, accountability frameworks, and governance architecture',
  },
  {
    id: 'spatial-data',
    label: 'spatial data standards',
    icon: '📐',
    query: 'OpenUSD IFC 5 spatial data standards convergence BIM GIS interoperability infrastructure 2025 2026',
    description: 'IFC 5, OpenUSD, and the open standards convergence reshaping the stack',
  },
  {
    id: 'physical-ai',
    label: 'physical AI and robotics',
    icon: '🦾',
    query: 'physical AI robotics autonomous inspection infrastructure LiDAR drone quadruped sensor 2025 2026',
    description: 'inspection robots, autonomous drones, and physical AI systems',
  },
  {
    id: 'lifecycle-intelligence',
    label: 'lifecycle asset intelligence',
    icon: '📊',
    query: 'lifecycle asset intelligence infrastructure TCO capital program AI decision support ISO 55000 2025 2026',
    description: 'TCO frameworks, predictive maintenance, and asset performance intelligence',
  },
  {
    id: 'climate-infrastructure',
    label: 'climate and resilience',
    icon: '🌱',
    query: 'climate AI sustainable infrastructure embodied carbon digital twin environmental intelligence 2025 2026',
    description: 'climate risk, resilience frameworks, and environmental intelligence',
  },
]

export const SUGGESTED_QUESTIONS = [
  'what are the most significant developments in agentic AI for infrastructure asset management this year?',
  'what does EU AI Act enforcement mean for infrastructure organizations starting in August 2026?',
  'how are leading airport operators using digital twins to reduce operational costs?',
  'what is the current state of BIM to digital twin transition in public infrastructure?',
  'which world model platforms are most relevant for infrastructure design practice right now?',
  'what are the key governance risks of deploying AI in infrastructure decision-making?',
  'how should a transit authority approach AI readiness assessment?',
  'what does the OpenUSD and IFC 5 convergence mean for infrastructure data strategy?',
]
