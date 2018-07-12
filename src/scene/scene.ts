import { SceneConfig, SceneModel, SceneMode, FitMode } from '../main'

export default class Scene {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement | string
  private _sceneModel: SceneModel

  constructor(config: SceneConfig) {
    this._sceneMode = config.mode | SceneMode.VIEW
    this._fitMode = config.fit | FitMode.RATIO
    this._targetEl = config.targetEl
    this._sceneModel = config.model
  }

  get sceneMode() {
    return this._sceneMode
  }

  fit(mode: FitMode): void { }
}