/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import ViewerLayer from './viewer-layer'
import RealObjectScene from '../component/threed/real-object-scene'
import TransformControls from '../threed/controls/transform-controls'
import CommandChange from '../command/command-change'

import * as THREE from 'three'

/**
 * Real Scene Renderer for Modeling
 */
export default class ModelerLayer extends ViewerLayer {

  private boundOnclick
  private boundOnmousedown
  private boundOnmouseup

  /**
   * scene-renderer disposer
   */
  dispose() {
    super.dispose()

    this.disposeTransformControls()
    this.disposeGridHelper()

    this.element.removeEventListener('click', this.boundOnclick)
    this.element.removeEventListener('mousedown', this.boundOnmousedown)
    this.element.removeEventListener('mouseup', this.boundOnmouseup)
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
    super.ready()

    this.boundOnclick = this.onclick.bind(this)
    this.boundOnmousedown = this.onmousedown.bind(this)
    this.boundOnmouseup = this.onmouseup.bind(this)

    this.element.addEventListener('click', this.boundOnclick)
    this.element.addEventListener('mousedown', this.boundOnmousedown)
    this.element.addEventListener('mouseup', this.boundOnmouseup)
  }

  /* overides */

  createObjectScene() {
    var objectScene = this.rootContainer.object3D as RealObjectScene

    if (objectScene) {
      objectScene.add(this.gridHelper)
      objectScene.add(...this.lights)
      objectScene.add(this.transformControls)
    }

    return objectScene
  }

  disposeRootContainer() {
    this.objectScene.remove(this.gridHelper)
    this.objectScene.remove(this.transformControls)

    super.disposeRootContainer()
  }

  createCSS3DRenderer() {
    var renderer = super.createCSS3DRenderer()
    var div = renderer.domElement
    // only for editor mode
    div.style.pointerEvents = 'none'

    return renderer
  }

  /* transform controls */
  private _transformControls: TransformControls

  /**
   * transform-controls getter
   */
  get transformControls() {
    if (!this._transformControls) {
      this._transformControls = this.createTransformControls()
    }

    return this._transformControls;
  }

  /**
   * createTransformControls
   */
  protected createTransformControls() {
    var controls = new TransformControls(this.rootContainer.object3D, this.camera, this.element)

    controls.addEventListener('change', () => {
      this.invalidate()
    })

    controls.addEventListener('objectChange', () => {
      let object = this._transformControls.object;
      let component = object && object.component

      object && CommandChange.around(this.ownerScene.commander, () => {
        // 3d-object의 변화를 component에 반영한다.
        component.updateTransformReverse(object);
      })
    })

    return controls
  }

  /**
   * disposeTransformControls
   */
  protected disposeTransformControls() {
    this._transformControls && this._transformControls.dispose();
  }

  /* grid-helper */
  private _gridHelper: THREE.GridHelper

  /**
   * grid-helper getter
   */
  get gridHelper() {
    if (!this._gridHelper) {
      this._gridHelper = this.createGridHelper()
    }

    return this._gridHelper;
  }

  /**
   * createGridHelper
   */
  protected createGridHelper() {
    var { width, height } = this.rootContainer.state
    var size = Math.max(width, height)

    return new THREE.GridHelper(size, 20)
  }

  /**
   * disposeGridHelper
   */
  protected disposeGridHelper() {
    // Nothing to do
  }

  /**
   * transform mode
   * @params mode mode: 'translate' | 'scale' | 'rotate', space: 'world' | 'local'
   */
  set transformMode({ mode, space, size }: { mode?, space?, size?}) {
    mode && (this.transformControls.mode = mode)
    space && (this.transformControls.setSpace(space))
    size && (this.transformControls.size = size)
  }

  /**
   * 
   * @param x 
   * @param y 
   */
  capture(x, y) {
    var {
      width,
      height
    } = this.canvas

    var vector = new THREE.Vector2(
      x / width * 2 - 1,
      -y / height * 2 + 1
    );

    this.raycaster.setFromCamera(vector, this.camera);

    /* modeler case begin */
    var activePickers = this.transformControls.activePickers;
    var intersects = this.raycaster.intersectObjects(activePickers, true);

    if (intersects.length > 0) {
      return this.rootContainer;
    }
    /* modeler case end */

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.rootContainer.layout.capturables(this.rootContainer);
    intersects = this.raycaster.intersectObjects(capturables.map(component => {
      return component.object3D
    }), true);

    for (let i = 0; i < intersects.length; i++) {
      let object: THREE.Object3D = intersects[i].object

      while (!object['isRealObject'] && object !== this.objectScene) {
        object = object.parent
      }

      let component
      if (object['isRealObject']) {
        component = object['component']
      }

      if (component) {
        /* [BEGIN] GROUP을 위한 테스트 로직임(제거되어야 함.) */
        while (component.parent && component.parent !== this.rootContainer) {
          component = component.parent;
        }
        /* [END] GROUP을 위한 테스트 로직임 */

        return component;
      }
    }

    return this.rootContainer;
  }

  /**
   * 
   * @param event 
   */
  onclick(event) {
    let pointer = event['changedTouches'] ? event['changedTouches'][0] : event
    let component = this.capture(pointer.offsetX, pointer.offsetY)

    if (component === this.rootContainer) {
      this.transformControls.detach()
      this.editorControls.enable()
      this.render()
      return
    }

    this.transformControls.attach(component.object3D)
    this.editorControls.disable()
    this.render()

    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * 
   * @param event 
   */
  onmousedown(event) {
  }

  /**
   * 
   * @param event 
   */
  onmouseup(event) {
  }

}
