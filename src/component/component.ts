/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { registry, residence } from "./registry/index";
import { LifeCycleCallback } from "./callback/index";
import { ModelAndState, select } from "./model/index";
import { Class, ComponentModel, CameraModel, Nature } from "../types";
import Container from "./container";
import RootContainer from "./root-container";
import RealObject from "./threed/real-object";
import RealObjectDummy from "./threed/real-object-dummy";
import { DataSpreadEngine } from "./data/index";
import { compile } from "../animation/index";
import { substitute, buildSubstitutor } from "./text/substitutor";
import format from "./text/format";
import objToVal from "../util/obj-value";
import { clonedeep, error } from "../util/index";

type EventMap = {
  [selector: string]: { [delegator: string]: { [event: string]: Function } };
};

export default class Component extends ModelAndState
  implements LifeCycleCallback {
  static readonly UNIT_DIMENSION = { width: 1, height: 1, depth: 1 };
  static readonly UNIT_SCALE = { x: 1, y: 1, z: 1 };
  static readonly UNIT_TRANSLATE = { x: 0, y: 0, z: 0 };
  static readonly UNIT_ROTATE = { x: 0, y: 0, z: 0 };

  static readonly NATURE: Nature = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: [],
    "value-property": "text"
  };

  /**
   * 컴포넌트 타입을 등록
   * @param {string|string[]} type component type
   * @param {Class} clazz component class
   */
  static register(type: string | string[], clazz?: Class): Class {
    return registry.register(type, clazz);
  }

  static getClass(type: string) {
    return registry.getClass(type);
  }

  /**
   * 현재 어플리케이션에 메모리에 남아있는 모든 컴포넌트 리스트를 조회
   */
  static get residents(): Object {
    return residence.residents;
  }

  /**
   * 컴포넌트 타입 - 모든 컴포넌트는 type 이름 정보를 제공해야한다.
   */
  static get type(): string | string[] {
    return "component";
  }

  /**
   * 새로운 컴포넌트 인스턴스를 모델 정보에 맞게 생성
   * @param {ComponentModel} model 컴포넌트 모델
   */
  constructor(model: ComponentModel) {
    super(model);

    residence.put(this);
  }

  /**
   * 컴포넌트 제거
   */
  dispose() {
    this.disposeAnimation();
    this.disposeDataSpreadEngine();
    this.disposeObject3D();
  }

  /* LifeCycleCallback */
  created() {}

  added(parent) {}

  removed(parent) {}

  ready() {}

  disposed() {}

  /* Component */

  get nature() {
    return this.constructor["NATURE"] || Component.NATURE;
  }

  get type() {
    return registry.getTypeByClassname(this.constructor.name)["type"];
  }

  /**
   * property hierarchy
   * readonly
   */
  get hierarchy(): ComponentModel {
    return clonedeep(this.model);
  }

  /**
   * property isContainer
   * readonly
   */
  get isContainer(): boolean {
    return false;
  }

  /**
   * property isRoot
   * readonly
   */
  get isRoot(): boolean {
    return false;
  }

  /**
   * property isDomComponent
   * readonly
   */
  get isDomComponent(): boolean {
    return false;
  }

  /**
   * property isDomComponent
   * readonly
   */
  get isTemplate(): boolean {
    return false;
  }

  /**
   * property root
   * readonly
   */
  get root(): RootContainer {
    return this.parent.root;
  }

  /**
   * property parent
   */
  private _parent: Container;

  get parent() {
    return this._parent;
  }

  set parent(parent) {
    this._parent = this.setParent(parent);
  }

  protected setParent(parent) {
    return parent;
  }

  /**
   * property object3D
   * readonly
   */
  private _object3D: RealObject;

  get object3D(): RealObject {
    if (!this._object3D) {
      this._object3D = this.buildObject3D();
      // this._object3D.update()
      // this._object3D.updateTransform()
    }
    return this._object3D;
  }

  protected buildObject3D(): RealObject {
    return new RealObjectDummy(this);
  }

  protected disposeObject3D() {
    this._object3D && (this._object3D as any).dispose();
  }

  /**
   * property renderer
   * readonly
   */
  get renderer() {
    return this.root.renderer;
  }

  /* Event */
  public eventMap: EventMap;

  prerender(
    context: CanvasRenderingContext2D | WebGLRenderingContext | THREE.Shape
  ) {}
  render(
    context: CanvasRenderingContext2D | WebGLRenderingContext | THREE.Shape
  ) {}

  /*
   * 조건에 맞는 컴포넌트를 찾기 위한 기능들
   *
   * findAll(selector, ...others) 조건에 맞는 모든 컴포넌트를 찾아낸다.
   * findById(id) 파라미터 id와 같은 id를 가진 컴포넌트를 찾는다.
   */

  /**
   * 컴포넌트 계층에서 selector에 해당하는 컴포넌트들을 찾는다
   * @param {string} selector
   * @param {any} others
   */
  findAll(selector: string | Function, ...others): Component[] {
    if (typeof selector === "string")
      return select(selector, this, others[0] || this); // others[0] means (self)

    if (typeof selector === "function" && selector(this, ...others))
      return [this];
  }

  /**
   * 루트 컨테이너 계층 안에서 해당 id를 가진 컴포넌트를 찾는다
   * @param {string} id
   */
  findById(id: string): Component {
    return this.root.findById(id);
  }

  /**
   * Data Manipulation
   */
  private _dataSpreadEngine: DataSpreadEngine;

  get dataSpreadEngine() {
    if (!this._dataSpreadEngine) {
      this._dataSpreadEngine = this.createDataSpreadEngine();
    }

    return this._dataSpreadEngine;
  }

  protected createDataSpreadEngine() {
    return new DataSpreadEngine(this);
  }

  protected disposeDataSpreadEngine() {
    this._dataSpreadEngine && this._dataSpreadEngine.dispose();
  }

  /**
   * redraw common
   */
  public invalidate() {
    this.root.invalidate();
  }

  /**
   * animation
   */

  private _animation;

  get animation() {
    // if (!this.app.isViewMode || this.isTemplate())
    if (this.isTemplate) return;

    if (!this._animation) {
      let config = this.get("animation");
      if (config && config["oncreate"])
        this._animation = compile(this, config["oncreate"]);
    }
    return this._animation;
  }

  disposeAnimation() {
    if (this._animation) {
      this._animation.dispose();
      delete this._animation;
    }
  }

  protected _started = false;

  start() {
    this._started = true;

    this.animation && (this.animation.started = true);
  }

  stop() {
    this._started = false;

    this.animation && (this.animation.started = false);
  }

  get started() {
    return this._started;
  }

  set started(started) {
    started ? this.start() : this.stop();
  }

  get value() {
    var valueprop = this.nature["value-property"] || "text";
    return valueprop == "value" ? this.getState("value") : this[valueprop];
  }

  set value(value) {
    var valueprop = this.nature["value-property"] || "text";
    valueprop == "value"
      ? this.setState("value", value)
      : (this[valueprop] = value);
  }

  /**
   * for retension
   */

  private _updatedAt;

  touch() {
    this._updatedAt = performance.now();
  }

  get updatedAt() {
    return this._updatedAt;
  }

  /**
   * for text
   */

  /* for simplicity */
  get text() {
    // TODO text는 format과 치환(substitute)등을 적용한 결과를 리턴한다.
    var textFormat = (this.state.textOptions || {}).textFormat;

    return textFormat
      ? format(textFormat, this.textSubstitutor())
      : this.textSubstitutor();
  }

  set text(text) {
    delete this._text_substitutor;
    var t = objToVal(text);

    this.textOptions = {
      ...(this.textOptions || {}),
      text: text === undefined ? "" : String(t)
    };
  }

  defaultTextSubstitutor() {
    var t = (this.state.textOptions || {}).text;
    return t == undefined ? "" : String(t);
  }

  private _text_substitutor;

  get textSubstitutor() {
    var text = (this.state.textOptions || {}).text;

    if (!this._text_substitutor)
      this._text_substitutor =
        buildSubstitutor(text, this) || this.defaultTextSubstitutor;

    return this._text_substitutor;
  }

  substitute(text) {
    return substitute(text);
  }

  /**
   * update 필요에 따라, 2D 컴포넌트 invalidate, 3D 컴포넌트 update 를 수행한다.
   */
  update() {
    this.object3D.update();
    this.invalidate();
  }

  /**
   * data state 변경시 호출되는 callback
   * @param after
   * @param before
   */
  onchangedata(after, before) {
    this.dataSpreadEngine.execute();
  }

  /**
   * data state 변경시 호출되는 callback
   * @param after
   * @param before
   */
  onchangemappings(after, before) {
    this.dataSpreadEngine.reset();
  }

  onchangetranslate(after, before) {
    this.object3D.updateTranslate();
  }

  onchangerotate(after, before) {
    this.object3D.updateRotate();
  }

  onchangescale(after, before) {
    this.object3D.updateScale();
  }

  onchangedimension(after, before) {
    this.object3D.updateDimension();
  }

  onchangealpha(after, before) {
    this.object3D.updateAlpha();
  }

  onchangehidden(after, before) {
    this.object3D.updateHidden();
  }

  onchangelineStyle(after, before) {
    this.update();
  }

  onchangefillStyle(after, before) {
    this.update();
  }

  onchangetextOptions(after, before) {
    this.update();
  }

  onchangetextStyle(after, before) {
    this.update();
  }

  onchangecamera(after?: CameraModel, before?: CameraModel) {
    this.object3D.updateCamera();

    let afterActive = after && after.active;
    let beforeActive = before && before.active;

    if (afterActive !== beforeActive) {
      if (afterActive)
        this.trigger("active-camera", this, this.object3D.camera);
      else this.trigger("deactive-camera", this, this.object3D.camera);
    }
  }
}

Component.register(Component.type, Component);
