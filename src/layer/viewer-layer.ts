/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Scene } from '../scene'
import Layer from './layer'
import EditorControls from '../threed/controls/editor-controls'
import { CSS3DRenderer } from '../threed/renderers/CSS3DRenderer'
import RealObjectScene from '../component/threed/real-object-scene'

import * as THREE from 'three'

/**
 * Real Scene Renderer for Viewer
 */
export default class ViewerLayer extends Layer {

  private _textureLoader: THREE.TextureLoader
  /**
   * constructor
   * @param owner Real Scene
   */
  constructor(owner: Scene) {
    super(owner)

    // editorControls을 만들기 위해 강제로 getter를 access 함.
    this.editorControls

    this._textureLoader = new THREE.TextureLoader(THREE.DefaultLoadingManager)
    this._textureLoader.withCredentials = 'true'
    this._textureLoader.crossOrigin = 'use-credentials'
  }

  /**
   * disposer
   */
  dispose() {
    super.dispose()
    this.disposeEditorControls()

    this.disposeObjectScene()
    this.disposeGLRenderer()
    this.disposeCSS3DRenderer()
    this.disposeLights()
    this.disposeCamera()
    this.disposeRaycaster()

    this.disposeCanvas()

    // super.dispose()
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
  }

  /* object-scene */
  private _objectScene: RealObjectScene

  /**
   * getter
   */
  get objectScene(): RealObjectScene {
    if (!this._objectScene) {
      this._objectScene = this.createObjectScene()
    }

    return this._objectScene
  }

  /**
   * createObjectScene
   */
  protected createObjectScene(): RealObjectScene {
    var objectScene = this.rootContainer.object3D as RealObjectScene
    objectScene && objectScene.add(...this.lights)

    return objectScene
  }

  /**
   * objectScene disposer
   */
  protected disposeObjectScene() {
    // 폐기된 objectScene을 지워서 다음 objectScene getter 호출시 새로 생성되도록 한다.
    delete this._objectScene
  }

  /**
   * root container disposer
   * lights 등은 root-container에서 만든 것이 아니므로, 제거한다.
   * lights 등은 다른 root-container에서 재활용될 수 있다.
   */
  disposeRootContainer() {
    this.objectScene.remove(...this.lights)

    this.disposeObjectScene()
    super.disposeRootContainer()
  }

  /**
   * ViewRenderer에서는 CSS3DRenderer와 GLRendering을 위한 canvas를 오버레이로 만든다.
   * Warn: this.element는 아직 만들어지지 않은 상태에 buildOverlays가 호출됨.
   * @param into 
   */
  buildOverlays(into) {
    this._canvas = this.createCanvas()

    into.appendChild(this.css3DRenderer.domElement)
    into.appendChild(this.canvas)
  }

  /* canvas for GLRenderer */
  private _canvas: HTMLCanvasElement

  /**
   * canvas getter
   */
  get canvas() {
    return this._canvas
  }

  /**
   * canvas creator
   */
  createCanvas() {
    var canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'

    return canvas
  }

  /**
   * canvas disposer
   */
  disposeCanvas() {
    this._canvas && this.element.removeChild(this._canvas)
  }

  /* editor-controls */
  private _editorControls: EditorControls

  /**
   * editorControls getter
   */
  get editorControls() {
    if (!this._editorControls) {
      this._editorControls = this.createEditorControls()
    }
    return this._editorControls
  }

  protected createEditorControls(): EditorControls {
    var editorControls = new EditorControls(this.camera, this.canvas)
    editorControls.on('change', () => {
      this.invalidate()
    })

    return editorControls
  }

  protected disposeEditorControls() {
    if (this._editorControls) {
      this._editorControls.off('change')
      this._editorControls.dispose()
    }
  }

  /* raycaster */
  private _raycaster: THREE.Raycaster

  /**
   * raycaster getter
   */
  get raycaster() {
    if (!this._raycaster) {
      this._raycaster = this.createRaycaster()
    }

    return this._raycaster
  }

  /**
   * create raycaster
   */
  protected createRaycaster() {
    return new THREE.Raycaster()
  }

  /**
   * raycaster disposer
   */
  protected disposeRaycaster() {
    // Nothing to do
  }

  /* gl-renderer */
  private _glRenderer: THREE.WebGLRenderer

  /**
   * gl-renderer getter
   */
  get glRenderer() {
    if (!this._glRenderer && this.canvas) {
      this._glRenderer = this.createGLRenderer()
    }

    return this._glRenderer
  }

  protected createGLRenderer() {
    var renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      precision: "highp",
      antialias: true,
      alpha: true
    })
    renderer.setClearColor(0xffffff, 0)

    return renderer
  }

  protected disposeGLRenderer() {
    this._glRenderer && this._glRenderer.dispose()
  }

  /* css3d-renderer */
  private _css3DRenderer //: CSS3DRenderer

  /**
   * css3d-renderer getter
   */
  get css3DRenderer() {
    if (!this._css3DRenderer) {
      this._css3DRenderer = this.createCSS3DRenderer()
    }

    return this._css3DRenderer
  }

  protected createCSS3DRenderer() {
    var renderer = new CSS3DRenderer()
    var div = renderer.domElement
    div.style.position = 'absolute'
    div.style.top = '0'

    return renderer
  }

  protected disposeCSS3DRenderer() {
    // Nothing to do
  }

  /* camera */
  private _camera: THREE.PerspectiveCamera

  /**
   * camera getter
   */
  get camera() {
    if (!this._camera) {
      this._camera = this.createCamera()
    }

    return this._camera
  }

  protected createCamera() {
    var { width, height } = this.rootContainer.state

    var camera = new THREE.PerspectiveCamera()

    camera.position.set(0, height, height * 3 / 4)

    // let frustum = Math.max(width, height) / 2;
    // this._camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 30000);
    // this._camera.position.set(0, frustum * 2, 0);
    // this._camera.position.set(0, frustum * 2, frustum * 2);
    // this._camera.position.set(0, 0, frustum * 2);

    camera.lookAt(new THREE.Vector3(0, 0, 0))

    return camera
  }

  protected disposeCamera() {
    // Nothing to do
  }

  /* lights */
  private _lights: THREE.Light[]

  /**
   * lights getter
   */
  get lights() {
    if (!this._lights) {
      this._lights = this.createLights()
    }

    return this._lights
  }

  /**
   * lights creator
   */
  createLights() {
    return [
      new THREE.AmbientLight(0x777777),
      new THREE.DirectionalLight(0xffffff, 0.5)
    ]
  }

  /**
   * lights disposer
   */
  disposeLights() {
    // Nothing to do
  }

  /**
   * 
   * @param force 
   */
  prerender(force?) {

    this.rootContainer.components.forEach(component => {
      let object = component.object3D;
      (!object['isRealObject']) && object['prerender'](force)
    })
  }

  /**
   * gl-renderer와 css3d-render를 render 한다.
   */
  render() {
    this.glRenderer.render(this.objectScene, this.camera)
    this.css3DRenderer.render(this.rootContainer.css3DScene, this.camera)
  }

  /**
   * 
   * @param width 
   * @param height 
   */
  onresize(width, height) {

    this.camera.near = 1
    this.camera.far = 10000
    this.camera.aspect = width / height

    var distance = 1000
    var diag = Math.sqrt((height * height) + (width * width))
    this.camera.fov = 2 * Math.atan(diag / (2 * distance)) * 180 / Math.PI

    // this.camera.position.set(0, h, h * 3 / 4)
    this.camera.updateProjectionMatrix()

    this.css3DRenderer.setSize(width, height)
    this.glRenderer.setSize(width, height, true)
  }

  /**
   * mouse/touch pointer를 받아서 raycaster로 Object3D를 찾고,
   * Object3D를 생성한 Component를 리턴한다.
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

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.rootContainer.layout.capturables(this);
    var intersects = this.raycaster.intersectObjects(capturables.map(component => {
      return component.object3D
    }), true);

    for (let i = 0; i < intersects.length; i++) {
      let object: THREE.Object3D = intersects[i].object

      while (!(object['isRealObject']) && object !== this.objectScene) {
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
