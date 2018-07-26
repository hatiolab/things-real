/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Scene } from '../scene'
import Layer from './layer'
import EditorControls from '../threed/controls/editor-controls'
import RealObjectScene from '../component/threed/real-object-scene'
import * as THREE from 'three'

export default class ViewerLayer extends Layer {

  protected _scene: RealObjectScene
  private _raycaster: THREE.Raycaster
  private _camera: THREE.PerspectiveCamera
  private _lights: THREE.Light[]
  private _editorControls: EditorControls
  private _renderer: THREE.WebGLRenderer

  private _textureLoader: THREE.TextureLoader

  constructor(owner: Scene) {
    super(owner)

    this._textureLoader = new THREE.TextureLoader(THREE.DefaultLoadingManager)
    this._textureLoader.withCredentials = 'true'
    this._textureLoader.crossOrigin = 'use-credentials'
  }

  dispose() {

    this._editorControls && this._editorControls.dispose()

    this.scene.dispose()
    this.renderer.dispose()

    super.dispose()
  }

  ready() {
    this.setEditorControl(this.camera, this.element)
  }

  setRootContainer(rootContainer​​) {
    if (this._scene) {
      /* scene이 dispose 될 때, lights 도 같이 dispose 되지 않도록 미리 빼줌 */
      this._scene.remove(...this.lights)
    }

    super.setRootContainer(rootContainer)

    if (this._scene) {
      this._scene.dispose()
      delete this._scene
    }
  }

  get editorControls() {
    return this._editorControls
  }

  private setEditorControl(camera, element) {

    if (this._editorControls) {
      this._editorControls.off('change')
      this._editorControls.dispose()
    }

    this._editorControls = new EditorControls(camera, element)
    this._editorControls.on('change', () => {
      this.render()
    })
  }

  get raycaster() {
    if (!this._raycaster) {
      this._raycaster = new THREE.Raycaster()
    }

    return this._raycaster
  }

  get renderer() {
    if (!this._renderer && this.element) {
      this._renderer = new THREE.WebGLRenderer({
        canvas: (this.element as HTMLCanvasElement),
        precision: "highp",
        antialias: true,
        alpha: true
      });

      this._renderer.setClearColor(0xffffff, 0)
    }

    return this._renderer
  }

  get camera() {
    if (!this._camera) {
      let { width, height } = this.rootContainer.state

      this._camera = new THREE.PerspectiveCamera()

      this._camera.position.set(0, height, height * 3 / 4)

      // let frustum = Math.max(width, height) / 2;
      // this._camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 30000);
      // this._camera.position.set(0, frustum * 2, 0);
      // this._camera.position.set(0, frustum * 2, frustum * 2);
      // this._camera.position.set(0, 0, frustum * 2);

      this._camera.lookAt(new THREE.Vector3(0, 0, 0))
    }

    return this._camera
  }

  get lights() {
    if (!this._lights) {
      this._lights = [
        new THREE.AmbientLight(0x777777),
        new THREE.DirectionalLight(0xffffff, 0.5)
      ];
    }

    return this._lights
  }

  get scene() {
    if (!this._scene) {
      this._scene = this.rootContainer.object3D
      this._scene.add(...this.lights)
    }

    return this._scene
  }

  draw() {
    if (!this.renderer) {
      return;
    }

    this.prerender()
    this.render()
  }

  prerender(force?) {

    this.rootContainer.components.forEach(component => {
      let object = component.object3D;
      (!object['isRealObject']) && object['prerender'](force)
    })
  }

  render() {
    // TODO transformControls가 update될 필요가 있을 때만, update 하도록 개선.
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    super.resize()

    var { offsetWidth: width, offsetHeight: height } = this.target

    this.camera.near = 1
    this.camera.far = 10000
    this.camera.aspect = width / height

    var distance = 1000
    var diag = Math.sqrt((height * height) + (width * width))
    this.camera.fov = 2 * Math.atan(diag / (2 * distance)) * 180 / Math.PI

    // this.camera.position.set(0, h, h * 3 / 4)
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height, true)
  }

  /*
   * capturePath(path) 파라미터로 주어진 path를 포함하는 컨테이너를 찾는다.
   * @path
   * @excepts 컨테이너를 찾을 때 제외되는 대상이다.
   */

  capturePath(path, excepts) {

    // TODO 3D 공간에서 구현해야함..

    var capturables = this.rootContainer.layout.capturables(this)

    for (let i = capturables.length - 1; i >= 0; i--) {
      let capturable = capturables[i]
      if (!capturable.isContainer())
        continue

      let found = capturable.capturePath(path, excepts)
      if (found)
        return found;
    }

    return false
  }

  capture(x, y) {
    var {
      width,
      height
    } = (this.element as HTMLCanvasElement);

    var vector = new THREE.Vector2(
      x / width * 2 - 1,
      -y / height * 2 + 1
    );

    this.raycaster.setFromCamera(vector, this.camera);

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.rootContainer.layout.capturables(this);
    var intersects = this.raycaster.intersectObjects(capturables.map(component => {
      return component.object3D
    }), true);

    for (let i = 0; i < intersects.length; i++) {
      let object: THREE.Object3D = intersects[i].object

      while (!(object['isRealObject']) && object !== this.scene) {
        object = object.parent
      }

      let component
      if (object['isRealObject']) {
        component = object['component']
      }

      if (component) {
        /* [BEGIN] GROUP을 위한 테스트 로직임(제거되어야 함.) */
        while (component.parent && component.parent !== this) {
          component = component.parent;
        }
        /* [END] GROUP을 위한 테스트 로직임 */

        return component;
      }
    }

    return this;
  }
}
