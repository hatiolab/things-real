/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import {
  SceneModelVersion,
  SceneConfig,
  SceneModel,
  SceneMode,
  FitMode,
  ComponentModel,
  CameraView
} from "../types";
import { Component, RootContainer } from "../component/index";
import { CommandChange, SnapshotCommander } from "../command/index";
import { Layer, ModelerLayer, ViewerLayer } from "../layer/index";
import { EventSource } from "../event/index";
import SceneModelMigrator from "../migrator/scene-model-migrator";
import { clonedeep, fullscreen, error } from "../util/index";
import { compile } from "../real/index";
import ReferenceMap from "../util/reference-map";

export default class Scene extends EventSource {
  private _sceneMode: SceneMode;
  private _fitMode: FitMode;
  private _targetEl: HTMLElement;
  private _refProvider: ReferenceMap;
  private _snapshotCommander: SnapshotCommander;

  private _rootContainer: RootContainer;
  private _layer: Layer;

  private _baseUrl: string;
  private _selected: Component[];

  constructor(config: SceneConfig) {
    super();

    /** root-container */
    this._sceneMode = config.mode | SceneMode.VIEW;
    this._fitMode = config.fit | FitMode.RATIO;
    this._refProvider = config.refProvider;

    this.model = config.model;

    this.setTargetEl(config.targetEl);

    /** commander */
    this._snapshotCommander = new SnapshotCommander({
      take: () => {
        return this.model;
      },
      putback: model => {
        this.model = model as SceneModel;
      }
    });

    this._snapshotCommander.delegate_on(this);

    window.addEventListener(
      "resize",
      () => {
        this.resize();
      },
      false
    );
  }

  dispose() {
    // TODO implement
    this._snapshotCommander.delegate_off(this);
    this._layer.dispose();
    this._rootContainer && this._rootContainer.dispose();
  }

  private setTargetEl(targetEl) {
    var _targetEl;

    if (typeof targetEl == "string") {
      _targetEl = document.getElementById(targetEl);
      if (!_targetEl) throw `target element '${targetEl}' is not exist`;

      if (_targetEl.firstChild)
        throw `target element '${targetEl}' is not empty`;
    } else if (targetEl instanceof HTMLElement) {
      _targetEl = targetEl;
    }

    this._targetEl = _targetEl;

    if (this._targetEl && this._targetEl.style) {
      this._targetEl.style.cursor = "default";
      this._targetEl.style.overflow = "hidden";
    }

    /** layer */
    this._layer =
      this.mode == SceneMode.VIEW
        ? new ViewerLayer(this)
        : new ModelerLayer(this);

    this._layer.target = this._targetEl;

    this.fit(this._fitMode);
  }

  get refProvider(): ReferenceMap {
    return this._refProvider;
  }

  get target(): HTMLElement {
    return this._targetEl;
  }

  set target(targetEl: HTMLElement) {
    this.setTargetEl(targetEl);
  }

  get mode() {
    return this._sceneMode;
  }

  get model(): SceneModel {
    var hierarchy = this.rootContainer.hierarchy;
    hierarchy.version = this.sceneModelVersion;

    return hierarchy;
  }

  get sceneModelVersion(): number {
    return SceneModelVersion;
  }

  set model(model) {
    this._rootContainer && this._rootContainer.dispose();

    this._rootContainer = compile({
      ...SceneModelMigrator.migrate(model),
      type: "root"
    }) as RootContainer;

    this._rootContainer.refProvider = this.refProvider;

    this._layer && this._layer.setRootContainer(this._rootContainer);

    if (this.mode == SceneMode.VIEW) {
      this._rootContainer.start();
    }
  }

  // for things-scene compatible
  get root() {
    return this._rootContainer;
  }

  get fitMode(): FitMode {
    return this._fitMode;
  }

  get rootContainer(): RootContainer {
    return this._rootContainer;
  }

  get commander(): SnapshotCommander {
    return this._snapshotCommander;
  }

  set transformMode(mode: { mode?; space?; size? }) {
    if (this.mode == SceneMode.VIEW) {
      return;
    }

    /* edit mode 에서만 적용되는 transformMode 를 효과적으로 처리하는 방법은 ? */
    (this._layer as any).transformMode = mode;
  }

  set activeCamera(camera) {
    const cameraviews = {
      perspective: CameraView.PERSPECTIVE,
      top: CameraView.TOP,
      bottom: CameraView.BOTTOM,
      left: CameraView.LEFT,
      right: CameraView.RIGHT,
      front: CameraView.FRONT,
      back: CameraView.BACK
    };

    if (typeof camera == "string") {
      this._layer.activateCamera(cameraviews[camera]);
    } else {
      this._layer.activateCamera(camera);
    }
  }

  get baseUrl() {
    return this._baseUrl;
  }

  set baseUrl(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  fit(mode: FitMode): void {
    if (mode !== undefined) this._fitMode = mode;
    this._layer.resize();
  }

  findAll(selector: string): Component[] {
    return this.rootContainer.findAll(selector);
  }

  findById(id: string): Component {
    return this.rootContainer.findById(id);
  }

  setProperties(targets: string, properties: string | object, value?: any) {
    this.findAll(targets).forEach(component =>
      component.setState(
        clonedeep(properties),
        value ? clonedeep(value) : value
      )
    );
  }

  setData(targets: string, value: any) {
    this.setProperties(targets, "data", value);
  }

  toggleData(targets: string) {
    this.findAll(targets).forEach(component => {
      component.data = !component.data;
    });
  }

  tristateData(targets: string) {
    this.findAll(targets).forEach(component => {
      component.data = (Math.round(Number(component.data) || 0) + 1) % 3;
    });
  }

  add(components: ComponentModel | ComponentModel[]) {
    if (!(components instanceof Array)) {
      this.add([components]);
      return;
    }

    components.forEach(model => {
      this.rootContainer.addComponent(compile(model));
    });
  }

  remove(components: Component | Component[]) {
    if (!(components instanceof Array)) {
      this.remove([components]);
      return;
    }

    components.forEach(component =>
      component.parent.removeComponent(component)
    );
  }

  set selected(components: Component[]) {
    var before = this._selected;
    this._selected = components;

    this.trigger("selected", this._selected, before);
  }

  get selected() {
    return this._selected;
  }

  get identities() {
    return this.root.identities;
  }

  copy() {
    var copied = this.selected
      .filter(component => !component.isRoot)
      .map(component => component.hierarchy);

    if (copied.length == 0) return;

    return JSON.stringify(copied, null, 2);
  }

  cut() {
    var copied = this.copy();
    this.remove(this.selected);

    return copied;
  }

  paste(copied) {
    if (!copied) return;

    try {
      this.add(JSON.parse(copied));
    } catch (e) {
      error(e, copied);
    }
  }

  undo() {
    this.commander.undo();
  }

  redo() {
    this.commander.redo();
  }

  undoableChange(changeFunc) {
    CommandChange.around(this.commander, changeFunc);
  }

  resize() {
    this._layer.resize();
  }

  fullscreen(mode?: FitMode) {
    fullscreen(this._targetEl, () => {
      this.fit(mode);
    });
  }
}
