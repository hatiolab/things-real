import { SceneModel } from '../types'
import SceneModelMigrator1 from './scene-model-migrator-1'

export default class SceneModelMigrator {
  static migrate(model: SceneModel): SceneModel {
    if (!model)
      return

    /* TODO model.sceneModelVersion 부분은 삭제해야 함. */
    // AS-IS
    var version = model.version || model.sceneModelVersion || 1
    // TO-BE
    // var version = model.version || 1

    switch (version) {
      case 1:
        return SceneModelMigrator1.migrate(model)
        break
      default:
        return model
    }
  }
}