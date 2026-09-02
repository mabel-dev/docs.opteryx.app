import learnJson from '@/learn.json'

export type LearnStep = {
  title: string
  href: string
  kind: string
  minutes: number
  why: string
  optional?: boolean
}

export type LearnPath = {
  slug: string
  title: string
  tone: 'teal' | 'orange' | 'navy'
  headline: string
  persona: string
  time: string
  outcomes: string[]
  prerequisites: string[]
  steps: LearnStep[]
  exercise: string
  next: string[]
}

export const learnPaths = learnJson as LearnPath[]

export function getLearnPath(slug: string): LearnPath | null {
  return learnPaths.find((learnPath) => learnPath.slug === slug) ?? null
}

/** Minutes of reading across the required steps; optional steps are excluded. */
export function requiredMinutes(learnPath: LearnPath): number {
  return learnPath.steps
    .filter((step) => !step.optional)
    .reduce((total, step) => total + step.minutes, 0)
}
