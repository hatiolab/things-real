import { SceneConfig } from '../types'
import { Scene } from '../scene';

export default async function create(config: SceneConfig): Promise<Scene> {

  return new Scene(config)
}
