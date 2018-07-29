/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { SceneConfig, SceneModel, SceneMode, FitMode } from '../types'
import { Component, RootContainer } from '../component'
import { SnapshotCommander } from '../command'
import { Layer, ModelerLayer, ViewerLayer } from '../layer'
import { clonedeep, fullscreen, error } from '../util'
import { compile } from '../real'

export default class Scene {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement
  private _snapshotCommander: SnapshotCommander

  private _rootContainer: RootContainer
  private _layer: Layer

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

    /** root-container */
    this._sceneMode = config.mode | SceneMode.VIEW
    this._fitMode = config.fit | FitMode.RATIO

    this.sceneModel = config.model

    /** layer */
    this._layer = this.sceneMode == SceneMode.VIEW ?
      new ViewerLayer(this) : new ModelerLayer(this)

    this._layer.target = this._targetEl

    /** commander */
    this._snapshotCommander = new SnapshotCommander({
      take: () => { return this.sceneModel },
      putback: model => { this.sceneModel = model as SceneModel }
    })
  }

  dispose() {
    // TODO implement
    this._layer.dispose()
    this._rootContainer && this._rootContainer.dispose()
  }

  get sceneMode() {
    return this._sceneMode
  }

  get sceneModel(): SceneModel {
    return this.rootContainer.hierarchy
  }

  set sceneModel(model) {
    this._rootContainer && this._rootContainer.dispose()

    this._rootContainer = compile({
      ...model,
      type: 'root'
    }) as RootContainer

    this._layer && (this._layer.setRootContainer(this._rootContainer))
  }

  get fitMode(): FitMode {
    return this._fitMode
  }

  get rootContainer(): RootContainer {
    return this._rootContainer
  }

  get commander(): SnapshotCommander {
    return this._snapshotCommander
  }

  set transformMode(mode: { mode?, space?, size?}) {
    if (this.sceneMode == SceneMode.VIEW) {
      return
    }

    (this._layer as any).transformMode = mode
  }

  fit(mode: FitMode): void {
    this._fitMode = mode
    this._layer.resize()
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

  undo() {
    this.commander.undo()
  }

  redo() {
    this.commander.redo()
  }

  fullscreen(mode?: FitMode) {
    fullscreen(this._targetEl, () => {
      this.fit(mode)
    })
  }
}