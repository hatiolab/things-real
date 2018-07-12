import { Mode, SceneModel } from './type'

interface CreateConfig {
  targetEl: string | HTMLElement
  mode?: Mode
  model: SceneModel
}

interface Scene {
  targetEl: string | HTMLElement
  mode?: Mode
  model: SceneModel
}

export default async function create(config: CreateConfig): Promise<Scene> {
  return {
    ...config
  }
}
