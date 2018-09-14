import { SceneModel } from '../types'
import SceneModelMigrator1 from './scene-model-migrator-1'

export default class SceneModelMigrator {
  static migrate(model: SceneModel): SceneModel {
    switch (model.version || 1) {
      case 1:
        return SceneModelMigrator1.migrate(model)
        break
      default:
        return model
    }
  }
}