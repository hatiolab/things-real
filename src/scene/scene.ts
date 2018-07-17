import { SceneConfig, SceneModel, SceneMode, FitMode } from '../types'
import { Component, RootContainer } from '../component'
import { clonedeep } from '../util'
import { compile } from '../main'

export default class Scene {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement

  private _width: number
  private _height: number

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

    this._width = config.model.width
    this._height = config.model.height
    this._sceneMode = config.mode | SceneMode.VIEW
    this._fitMode = config.fit | FitMode.RATIO

    this._rootContainer = compile({
      type: 'root',
      components: config.model.components
    }) as RootContainer
  }

  get sceneMode() {
    return this._sceneMode
  }

  get sceneModel(): SceneModel {
    return {
      width: this.width,
      height: this.height,
      components: this.rootContainer.hierarchy.components
    }
  }

  get width(): number {
    return this._width
  }

  get height(): number {
    return this._height
  }

  get fitMode(): FitMode {
    return this._fitMode
  }

  get rootContainer​​(): RootContainer {
    return this._rootContainer
  }

  fit(mode: FitMode): void {
    this._fitMode = mode
    // TODO implement
  }

  findAll(selector: string): Component[] {
    return this.rootContainer.findAll(selector)
  }

  findById(id: string): Component {
    return this.rootContainer.findById(id)
  }

  setProperties(target: string, properties: string | object, value?: any) {
    var components = this.findAll(target)
    components.forEach(component => component.setState(clonedeep(properties), value ? clonedeep(value) : value))
  }

  setData(targets: string, value: any) {
    this.setProperties(targets, 'data', value)
  }
}