/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import Container from './container'
import DOMComponent from './dom';
import RealObjectScene from './threed/real-object-scene'
import { SceneModel } from '../types'
import { warn, error, clonedeep } from '../util'
import { compile } from '../real'
import { debounce } from 'lodash'
import EventEngine from '../event/event-engine'

import * as THREE from 'three'

var invalidateDataDebouncer = debounce(function mapper(comp: Component) {
  comp.dataSpreadEngine.execute()
  comp.isContainer && (comp as Container).components.forEach(child => mapper(child))
}, 500)

export default class RootContainer extends Container {

  static get type() {
    return 'root'
  }

  /**
   * root container를 생성
   * @param {SceneModel} model 
   */
  constructor(model: SceneModel) {
    super(model)

    this.eventEngine
    /* component 빌드가 완료되면, 전체적으로 data spread를 실행한다. */
    this.invalidateData()
  }

  /**
   * root container 소멸자
   */
  dispose() {
    this.disposeEventEngine()
    this.disposeCSS3DScene()
    this.disposeTemplateMap()
    this.disposeIndexMap()
  }

  /**
   * root container임을 확인
   */
  get isRoot() {
    return true
  }

  /**
   * root는 자신임
   */
  get root() {
    return this
  }

  /* event engine */

  /**
   * 생성자보다 먼저 준비되어야 하므로, 바로 생성함.
   */
  private _eventEngine: EventEngine = new EventEngine(this)

  /**
   * event engine
   */
  get eventEngine() {
    return this._eventEngine
  }

  /**
   * event engine disposer
   */
  protected disposeEventEngine() {
    this._eventEngine && this._eventEngine.dispose()
  }

  /**
   * THREE.Scene을 제공
   */
  protected buildObject3D() {
    return new RealObjectScene(this)
  }

  /**
   * CSS3DRenderer용 THREE.Scene을 제공
   */
  get css3DScene() {
    if (!this._css3DScene) {
      this._css3DScene = this.buildCSS3DScene()
    }
    return this._css3DScene
  }

  private _css3DScene: THREE.Scene

  protected buildCSS3DScene() {
    return new THREE.Scene()
  }

  protected disposeCSS3DScene() {
    var children = [...this.css3DScene.children]
    children.forEach(child => this.css3DScene.remove(child))
  }

  /**
   * SceneModel의 width. Scene(2차원)의 폭을 의미함
   */
  get width() {
    return this.getState('width')
  }

  /**
   * SceneModel의 height. Scene(2차원)의 높이를 의미함
   */
  get height() {
    return this.getState('height')
  }

  /* template registry */
  private _templateMap: Object = {}
  private _templatePrefixes: string[] = []

  /**
   * template component map을 제거
   */
  protected disposeTemplateMap() {
    delete this._templateMap
    delete this._templatePrefixes
  }

  /**
   * template component를 등록
   * @param {string} prefix template id prefix
   * @param {Component} component template component
   */
  private addTemplate(prefix: string, component: Component) {

    var old = this._templateMap[prefix]
    if (old)
      error('Template replaced (duplicated)', prefix, component, old)

    this._templateMap[prefix] = component

    delete this._templatePrefixes
  }

  /**
   * template component를 등록 취소
   * @param {string} prefix template id prefix
   * @param {Component} component template component
   */
  private removeTemplate(prefix: string, component: Component) {

    var old = this._templateMap[prefix]

    if (old !== component)
      warn('Removing template failed (different)', prefix, component, old)
    else
      delete this._templateMap[prefix]

    delete this._templatePrefixes
  }

  /**
   * id에 해당하는 등록된 템플릿이 있는 지 조회
   * @param {string} id
   */
  private findTemplateFor(id: string) {
    if (!this._templatePrefixes)
      this._templatePrefixes = Object.keys(this._templateMap).sort().reverse();

    var prefix = this._templatePrefixes.find(prefix => { return id.startsWith(prefix) })
    if (prefix)
      return this._templateMap[prefix]
  }

  /* index registry */
  private _indexMap: Object = {}

  /**
   * Component 를 id로 찾는 경우, 빠르게 찾기위해 인덱스에 등록
   * @param {string} id 
   * @param {Component} component 
   */
  private addIndex(id: string, component: Component) {

    var old = this._indexMap[id]
    if (old)
      error('Index replaced (duplicated)', id, component, old)

    this._indexMap[id] = component
  }

  /**
   * 인덱스에서 component를 삭제
   * @param {string} id 
   * @param {Component} component 
   */
  private removeIndex(id: string, component: Component) {

    var old = this._indexMap[id]

    if (old !== component)
      warn('Removing index failed (different)', id, component, old)
    else
      delete this._indexMap[id]
  }

  /**
   * component index map을 제거
   */
  protected disposeIndexMap() {
    delete this._indexMap
  }

  /**
   * root container 아래의 컴포넌트를 id로 조회
   * @param {string} id 
   */
  public findById(id: string) {
    return this._indexMap[id]
  }

  /**
   * 해당 id를 가진 component를 찾고, 만약 없다면 id에 해당하는 template component로 생성해서 리턴
   * @param {string} id 
   */
  public findOrCreate(id: string) {
    var component = this._indexMap[id]

    if (!component) {
      let template = this.findTemplateFor(id)
      if (template) {
        let clone = Object.assign(clonedeep(template.hierarchy), {
          id: id,
          templatePrefix: ''
        })
        component = compile(clone)
        this.addComponent(component)
      }
    }

    return component
  }

  /**
   * data spread를 실행
   * data가 변경되거나, component entry가 바뀌면 호출한다.
   * debouncer로 작동해서 연속된 요청에 효과적으로 대응한다.
   */
  private invalidateData() {
    invalidateDataDebouncer(this)
  }

  get eventMap() {
    return {
      '(root)': {
        '(descendant)': {
          added: this._onadded,
          removed: this._onremoved,
          change: this._onchanged
        }
      }
    }
  }

  /**
   * Scene 화면을 갱신
   */
  public invalidate() {
    this.trigger('render')
  }

  /**
   * 루트컨테이너 계층안에서 새로운 컴포넌트가 추가될 때 호출됨.
   * onadded와 구별하기 위해서 _onadded로 명명함.
   * (onadded 는 built-in callback으로 component가 추가될 때 component 자신에게 자동 호출됨.)
   * @param container 
   * @param component 
   */
  private _onadded(container: Container, component: Component) {
    this.addTraverse(component)
    this.invalidateData()

    this.invalidate()
  }

  /**
   * 루트컨테이너 계층안에서 컴포넌트가 제거될 때 호출됨.
   * onremoved와 구별하기 위해서 _onremoved 명명함.
   * (onremoved 는 built-in callback으로 component가 제거될 때 component 자신에게 자동 호출됨.)
   * @param container 
   * @param component 
   */
  private _onremoved(container: Container, component: Component) {
    this.removeTraverse(component)

    this.invalidate()
  }

  /**
   * 루트 컨테이너 계층안의 어떤 컴포넌트라도 상태값이 변경될 때 호출됨.
   * onchanged와 구별하기 위해서 _onchanged 명명함.
   * (onchanged 는 built-in callback으로 component의 상태가 변화할 때 component 자신에게 자동 호출됨.)
   * @param after 
   * @param before 
   * @param hint 
   */
  private _onchanged(after, before, hint) {
    if (before.templatePrefix)
      this.removeTemplate(before.templatePrefix, hint.origin)

    if (after.templatePrefix)
      this.addTemplate(after.templatePrefix, hint.origin)


    if (before.id)
      this.removeIndex(before.id, hint.origin)

    if (after.id)
      this.addIndex(after.id, hint.origin)

    if (before.id != after.id || before.class != after.class)
      this.invalidateData()

    this.invalidate()
  }

  /**
   * component가 추가될 때 자식들까지 순차적으로 추가함
   * @param component 
   */
  private addTraverse(component: Component) {
    if (component.isContainer) {
      (component as Container).components.forEach(child => this.addTraverse(child))
    }

    var {
      id, templatePrefix
    } = component.model;

    if (id)
      this.addIndex(id, component)

    if (templatePrefix)
      this.addTemplate(templatePrefix, component)

    this.eventEngine.add(component, component.eventMap)

    if ((component as DOMComponent).cssObject3D) {
      this.css3DScene.add((component as DOMComponent).cssObject3D)
    }
  }

  /**
   * component가 제거될 때 자식들까지 순차적으로 제거함
   * @param component 
   */
  private removeTraverse(component: Component) {
    if (component.isContainer)
      (component as Container).components.forEach(child => this.removeTraverse(child))

    var {
      id, templatePrefix
    } = component.model;

    if (id)
      this.removeIndex(id, component)

    if (templatePrefix)
      this.removeTemplate(templatePrefix, component)

    this.eventEngine.remove(component)

    if ((component as DOMComponent).cssObject3D) {
      this.css3DScene.remove((component as DOMComponent).cssObject3D)
    }
  }
}

Component.register(RootContainer.type, RootContainer)
