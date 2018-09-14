/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { VERSION, SceneConfig, SceneModel, SceneMode, FitMode, ComponentModel } from '../types'
import { Component, RootContainer } from '../component'
import { CommandChange, SnapshotCommander } from '../command'
import { Layer, ModelerLayer, ViewerLayer } from '../layer'
import { EventSource } from '../event'
import { clonedeep, fullscreen, error } from '../util'
import { compile } from '../real'

export default class Scene extends EventSource {
  private _sceneMode: SceneMode
  private _fitMode: FitMode
  private _targetEl: HTMLElement
  private _snapshotCommander: SnapshotCommander

  private _rootContainer: RootContainer
  private _layer: Layer

  private _baseUrl: string
  private _selected: Component[]

  constructor(config: SceneConfig) {
    super()

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

    this.model = config.model

    /** layer */
    this._layer = this.mode == SceneMode.VIEW ?
      new ViewerLayer(this) : new ModelerLayer(this)

    this._layer.target = this._targetEl

    /** commander */
    this._snapshotCommander = new SnapshotCommander({
      take: () => { return this.model },
      putback: model => { this.model = model as SceneModel }
    })

    this._snapshotCommander.delegate_on(this)

    window.addEventListener('resize', () => {
      this.resize()
    }, false)
  }

  dispose() {
    // TODO implement
    this._snapshotCommander.delegate_off(this)
    this._layer.dispose()
    this._rootContainer && this._rootContainer.dispose()
  }

  get mode() {
    return this._sceneMode
  }

  get model(): SceneModel {
    var hierarchy = this.rootContainer.hierarchy
    hierarchy.version = this.version

    return hierarchy
  }

  get version(): number {
    return VERSION
  }

  set model(model) {
    this._rootContainer && this._rootContainer.dispose()

    this._rootContainer = compile({
      ...model,
      type: 'root'
    }) as RootContainer

    this._layer && this._layer.setRootContainer(this._rootContainer)

    if (this.mode == SceneMode.VIEW) {
      this._rootContainer.start()
    }
  }

  // for things-scene compatible
  get root() {
    return this._rootContainer
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
    if (this.mode == SceneMode.VIEW) {
      return
    }

    /* edit mode 에서만 적용되는 transformMode 를 효과적으로 처리하는 방법은 ? */
    (this._layer as any).transformMode = mode
  }

  get baseUrl() {
    return this._baseUrl
  }

  set baseUrl(baseUrl: string) {
    this._baseUrl = baseUrl
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

  add(components: ComponentModel | ComponentModel[]) {
    if (!(components instanceof Array)) {
      this.add([components])
      return
    }

    components.forEach(model => {
      this.rootContainer.addComponent(compile(model))
    })
  }

  remove(components: Component | Component[]) {
    if (!(components instanceof Array)) {
      this.add([components])
      return
    }

    components.forEach(component => component.parent.removeComponent(component))
  }

  set selected(components: Component[]) {

    var before = this._selected
    this._selected = components

    this.trigger('selected', this._selected, before)
  }

  get selected() {
    return this._selected
  }

  copy() {

    var copied = this.selected.filter(component => !component.isRoot)
      .map(component => component.hierarchy)

    if (copied.length == 0)
      return

    return JSON.stringify(copied, null, 2);
  }

  cut() {
    var copied = this.copy()
    this.remove(this.selected)

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

  undoableChange(changeFunc) {
    CommandChange.around(this.commander, changeFunc)
  }

  resize() {
    this._layer.resize()
  }

  fullscreen(mode?: FitMode) {
    fullscreen(this._targetEl, () => {
      this.fit(mode)
    })
  }
}