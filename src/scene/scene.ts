import { SceneConfig, SceneModel, SceneMode, FitMode } from '../types'
import { Component, RootContainer } from '../component'
import { SnapshotCommander } from '../command'
import { clonedeep, error } from '../util'
import { compile } from '../main'

export default class Scene {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement
  private _snapshotCommander: SnapshotCommander

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

    this.sceneModel = config.model

    this._snapshotCommander = new SnapshotCommander({
      take: () => { return this.sceneModel },
      putback: model => { this.sceneModel = model as SceneModel }
    })
  }

  get sceneMode() {
    return this._sceneMode
  }

  get sceneModel(): SceneModel {
    return this.rootContainer.hierarchy
  }

  set sceneModel(model) {
    this._rootContainer = compile({
      ...model,
      type: 'root'
    }) as RootContainer
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

  add(components) {

  }

  remove() {

  }

  get selected() {
    return []
  }

  copy() {

    var copied = this.selected.filter(component => !component.isRootModel)
      .map(component => component.hierarchy)

    if (copied.length == 0)
      return;

    return JSON.stringify(copied, null, 2);
  }

  cut() {
    var copied = this.copy()
    this.remove()

    return copied
  }

  paste(copied) {
    if (!copied)
      return

    try {
      this.add(JSON.parse(copied))
    } catch (e) {
      error(e, copied)
    }
  }

}