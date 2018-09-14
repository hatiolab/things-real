import { SceneModelVersion, SceneModel, ComponentModel } from '../types'
import { Scene } from 'three';

/**
 * SceneModel version 1 migrator
 */
export default class SceneModelMigrator1 {

  static migrate(model$1): SceneModel {
    return {
      width: model$1.width,
      height: model$1.height,
      version: SceneModelVersion,
      components: (model$1.components || []).map(child$1 => SceneModelMigrator1.migrateComponent(child$1))
    }
  }

  static migrateComponent(model$1): ComponentModel {
    var model$2: ComponentModel = {
      dimension: {}
    }

    /**
     * 여기에 변환로직.
     */
    for (let key in model$1) {
      let value = model$1[key]

      switch (key) {
        case 'width':
          model$2.dimension = {
            ...model$2.dimension,
            width: value
          }
          break
        case 'height':
          model$2.dimension = {
            ...model$2.dimension,
            depth: value
          }
          break
        case 'ratate':
          model$2.rotate = {
            ...model$2.rotate,
            y: value
          }
          break
        case 'scale':
          let { x, y } = value
          model$2.lineStyle = {}
          x && (model$2.x = x)
          y && (model$2.z = y)
          break
        case 'x':
          model$2.translate = {
            ...model$2.translate,
            x: value
          }
          break
        case 'y':
          model$2.translate = {
            ...model$2.translate,
            z: value
          }
          break
        case 'lineWidth':
        case 'strokeStyle':
        case 'lineDash':
        case 'lineCap':
        case 'lineJoin':
          model$2.lineStyle = {
            ...model$2.lineStyle,
            [key]: value
          }
          break
        case 'text':
        case 'bold':
        case 'italic':
        case 'fontFamily':
        case 'fontSize':
        case 'lineHeight':
          model$2.textOptions = {
            ...model$2.textOptions,
            [key]: value
          }
          break
        case 'type':
          model$2.type = SceneModelMigrator1.migrateTypeName(value)
          break
        default:
          model$2[key] = value
          break
      }
    }

    if (model$1.components) {
      model$2.components = model$1.components.map(child$1 => this.migrateComponent(child$1))
    }

    return model$2
  }

  static migrateTypeName(type$1) {
    switch (type$1) {
      case 'polygon':
        return 'path'
        break
      default:
        return type$1
    }
  }
}