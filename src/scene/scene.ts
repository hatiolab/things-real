import { SceneConfig, SceneModel, SceneMode, FitMode } from '../main'

export default class Scene {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement
  private _sceneModel: SceneModel

  constructor(config: SceneConfig) {

    if (typeof (config.targetEl) == 'string') {
      this._targetEl = document.getElementById(config.targetEl);
      if (!this._targetEl)
        throw `target element '${config.targetEl}' is not exist`

      if (this._targetEl.firstChild)
        throw `target element '${config.targetEl}' is not empty`
    } else {
      this._targetEl = config.targetEl;
    }

    if (this._targetEl && this._targetEl.style) {
      this._targetEl.style.cursor = "default"
      this._targetEl.style.overflow = "hidden"
    }

    this._sceneMode = config.mode | SceneMode.VIEW
    this._fitMode = config.fit | FitMode.RATIO
    this._sceneModel = config.model
  }

  get sceneMode() {
    return this._sceneMode
  }

  get fitMode() {
    return this._fitMode
  }

  fit(mode: FitMode): void { }
}