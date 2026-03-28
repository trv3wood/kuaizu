type ProjectDetailViewStrategy = {
  showApplyAction: boolean
  showPublicContact: boolean
}

type TalentDetailViewStrategy = {
  showOliveBranchAction: boolean
  showPublicContact: boolean
}

export type ProjectDetailScene = 'default' | 'olive-branch-contact'
export type TalentDetailScene = 'default' | 'project-application-review'

const DEFAULT_PROJECT_DETAIL_SCENE: ProjectDetailScene = 'default'
const DEFAULT_TALENT_DETAIL_SCENE: TalentDetailScene = 'default'

const PROJECT_DETAIL_STRATEGIES: Record<ProjectDetailScene, ProjectDetailViewStrategy> = {
  default: {
    showApplyAction: true,
    showPublicContact: false
  },
  'olive-branch-contact': {
    showApplyAction: false,
    showPublicContact: true
  }
}

const TALENT_DETAIL_STRATEGIES: Record<TalentDetailScene, TalentDetailViewStrategy> = {
  default: {
    showOliveBranchAction: true,
    showPublicContact: false
  },
  'project-application-review': {
    showOliveBranchAction: false,
    showPublicContact: true
  }
}

export function resolveProjectDetailStrategy(scene?: string) {
  const currentScene = scene && scene in PROJECT_DETAIL_STRATEGIES
    ? scene as ProjectDetailScene
    : DEFAULT_PROJECT_DETAIL_SCENE

  return {
    scene: currentScene,
    strategy: PROJECT_DETAIL_STRATEGIES[currentScene]
  }
}

export function resolveTalentDetailStrategy(scene?: string) {
  const currentScene = scene && scene in TALENT_DETAIL_STRATEGIES
    ? scene as TalentDetailScene
    : DEFAULT_TALENT_DETAIL_SCENE

  return {
    scene: currentScene,
    strategy: TALENT_DETAIL_STRATEGIES[currentScene]
  }
}

export function buildProjectDetailUrl(id: number, scene: ProjectDetailScene = DEFAULT_PROJECT_DETAIL_SCENE) {
  const query = Number.isFinite(id) ? [`id=${id}`] : []

  if (scene !== DEFAULT_PROJECT_DETAIL_SCENE) {
    query.push(`scene=${scene}`)
  }

  return `/pages/project-detail/project-detail?${query.join('&')}`
}

type BuildTalentDetailUrlOptions = {
  id?: number
  userId?: number
  scene?: TalentDetailScene
}

export function buildTalentDetailUrl(options: BuildTalentDetailUrlOptions) {
  const {
    id,
    userId,
    scene = DEFAULT_TALENT_DETAIL_SCENE
  } = options
  const query: string[] = []

  if (typeof id === 'number' && Number.isFinite(id)) {
    query.push(`id=${id}`)
  }

  if (typeof userId === 'number' && Number.isFinite(userId)) {
    query.push(`userId=${userId}`)
  }

  if (scene !== DEFAULT_TALENT_DETAIL_SCENE) {
    query.push(`scene=${scene}`)
  }

  return `/pages/talent-detail/talent-detail?${query.join('&')}`
}
