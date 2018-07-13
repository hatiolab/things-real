import { SceneConfig, SceneModel, SceneMode, FitMode } from '../types'
import { Component, Container, RootContainer } from '../component'
import { compile } from '../main'
import { select } from '../component/model';

export default class Scene {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement
  private _sceneModel: SceneModel

  private _rootContainer: RootContainer

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

    this._rootContainer = compile({
      type: 'root',
      components: config.model.components
    }) as RootContainer
  }

  get sceneMode() {
    return this._sceneMode
  }

  get fitMode() {
    return this._fitMode
  }

  get rootContainer​​() {
    return this._rootContainer
  }

  fit(mode: FitMode): void { }

  findAll(selector: string): Component[] {
    return this.rootContainer.findAll(selector)
  }

  findById(id: string): Component {
    return this.rootContainer.findById(id)
  }
}