/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Scene from '../scene/scene'
import Layer from './layer'
import EditorControls from '../threed/controls/editor-controls'
import { CSS3DRenderer } from '../threed/renderers/css-3d-renderer'
import RealObjectScene from '../component/threed/real-object-scene'
import { SceneMode, ActionModel } from '../types'
import { PIXEL_RATIO } from '../component/html/elements'

import * as THREE from 'three'
import { WEBVR } from '../vr/WebVR'
import {
  startCustomAF,
  stopCustomAF,
  executeCustomAF
} from '../util/custom-animation-frame'

/**
 * Real Scene Renderer for Viewer
 */
export default class ViewerLayer extends Layer {
  private boundOnclick
  private boundOnmousedown
  private boundOnmouseup
  private boundOnmousemove
  // private boundOnmouseenter
  // private boundOnmouseleave

  private boundOnvrdisplaypresentchange

  private enteredComponent

  /**
   * constructor
   * @param owner Real Scene
   */
  constructor(owner: Scene) {
    super(owner)

    // editorControls을 만들기 위해 강제로 getter를 access 함.
    this.editorControls
  }

  /**
   * disposer
   */
  dispose() {
    super.dispose()

    this.element.removeEventListener('click', this.boundOnclick)
    this.element.removeEventListener('mousedown', this.boundOnmousedown)
    this.element.removeEventListener('mouseup', this.boundOnmouseup)
    this.element.removeEventListener('mousemove', this.boundOnmousemove)

    window.removeEventListener(
      'vrdisplaypresentchange',
      this.boundOnvrdisplaypresentchange
    )

    this.disposeEditorControls()

    this.disposeObjectScene()
    this.disposeGLRenderer()
    this.disposeCSS3DRenderer()
    this.disposeLights()
    this.disposeCamera()
    this.disposeRaycaster()

    this.disposeCanvas()
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
    this.boundOnclick = this.onclick.bind(this)
    this.boundOnmousedown = this.onmousedown.bind(this)
    this.boundOnmouseup = this.onmouseup.bind(this)
    this.boundOnmousemove = this.onmousemove.bind(this)
    this.boundOnvrdisplaypresentchange = this.onvrdisplaypresentchange.bind(this)

    this.element.addEventListener('click', this.boundOnclick)
    this.element.addEventListener('mousedown', this.boundOnmousedown)
    this.element.addEventListener('mouseup', this.boundOnmouseup)
    this.element.addEventListener('mousemove', this.boundOnmousemove)

    window.addEventListener(
      'vrdisplaypresentchange',
      this.boundOnvrdisplaypresentchange,
      false
    )
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
    into.appendChild(this.css3DRenderer.domElement)
    into.appendChild(this.canvas)
  }

  /* canvas for GLRenderer */
  private _canvas: HTMLCanvasElement

  /**
   * canvas getter
   */
  get canvas() {
    if (!this._canvas) {
      this._canvas = this.createCanvas()
    }
    return this._canvas
  }

  /**
   * canvas creator
   */
  createCanvas() {
    var canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    // canvas.style.background = 'transparent'
    canvas.style.pointerEvents = 'none'

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
  private _editorControlsEventHandler

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
    var editorControls = new EditorControls(this.camera, this.element)

    this._editorControlsEventHandler = (() => {
      this.invalidate()
    }).bind(this)
    editorControls.addEventListener('change', this._editorControlsEventHandler)

    return editorControls
  }

  protected disposeEditorControls() {
    if (this._editorControls) {
      this._editorControls.removeEventListener(
        'change',
        this._editorControlsEventHandler
      )
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
      precision: 'highp',
      antialias: true,
      alpha: true
    })
    renderer.setClearColor(0xffffff, 0)
    // Add support for retina displays
    renderer.setPixelRatio(PIXEL_RATIO)
    // Specify the size of the canvas
    renderer.setSize(1, 1)

    document.body.appendChild(WEBVR.createButton(renderer))

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

    if (this.ownerScene.mode === SceneMode.EDIT) {
      div.style.pointerEvents = 'none'
    } else {
      // disableAllUserEvents(div)
    }

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

    camera.position.set(0, height, (height * 3) / 4)

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
      let object = component.object3D
      !object['isRealObject'] && object['prerender'](force)
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
   * gl-renderer만 render 한다.(CSS3DRenderer는 VR을 지원하지 않는다.)
   */
  render4vr() {
    executeCustomAF()
    this.glRenderer.render(this.objectScene, this.camera)
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
    var diag = Math.sqrt(height * height + width * width)
    this.camera.fov = (2 * Math.atan(diag / (2 * distance)) * 180) / Math.PI

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
  capture(coords) {
    var { width, height } = this.canvas

    this.raycaster.setFromCamera(coords, this.camera)

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.rootContainer.capturables()
    var intersects = this.raycaster.intersectObjects(
      capturables.map(component => {
        return component.object3D
      }),
      true
    )

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
          component = component.parent
        }
        /* [END] GROUP을 위한 테스트 로직임 */

        return component
      }
    }

    return this.rootContainer
  }

  _getPosition(event): { x; y } {
    var { width, height } = this.canvas

    var { clientX: x, clientY: y } = event

    var { left, top } = this.element.getBoundingClientRect()

    x -= left
    y -= top

    return {
      x: ((x * PIXEL_RATIO) / width) * 2 - 1,
      y: (-(y * PIXEL_RATIO) / height) * 2 + 1
    }
  }

  /**
   *
   * @param event
   */
  onvrdisplaypresentchange(event: VRDisplayEvent) {
    var isPresenting = !!event.display.isPresenting

    if (!isPresenting) {
      stopCustomAF()

      this.camera.layers.enable(1)
      var { height } = this.rootContainer.state

      this.camera.position.set(0, height, (height * 3) / 4)
      this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    } else {
      startCustomAF()

      this.glRenderer.setAnimationLoop(() => this.render4vr())
    }

    var vr = this.glRenderer.vr as any
    vr.enabled = isPresenting
  }

  /**
   *
   * @param event
   */
  onclick(event) {
    let coords = this._getPosition(
      event['changedTouches'] ? event['changedTouches'][0] : event
    )
    let component = this.capture(coords)

    if (component === this.rootContainer) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    var tapEvtModel: ActionModel =
      component.model.event && component.model.event.tap

    if (!tapEvtModel) {
      return
    }

    this._doEventAction(tapEvtModel, component, true)
  }

  /**
   *
   * @param event
   */
  onmousedown(event) { }

  /**
   *
   * @param event
   */
  onmouseup(event) { }

  onmousemove(event) {
    let coords = this._getPosition(
      event['changedTouches'] ? event['changedTouches'][0] : event
    )
    let component = this.capture(coords)

    if (component !== this.enteredComponent) {
      this.enteredComponent && this.onmouseleave(this.enteredComponent)
      component && this.onmouseenter(component)

      this.enteredComponent = component
    }

    event.preventDefault()
    event.stopPropagation()
  }

  onmouseenter(component) {
    if (component === this.rootContainer) {
      return
    }

    var hoverEvtModel: ActionModel =
      component.model.event && component.model.event.hover

    if (!hoverEvtModel) {
      return
    }

    this._doEventAction(hoverEvtModel, component, true)
  }

  onmouseleave(component) {
    if (component === this.rootContainer) {
      return
    }

    var hoverEvtModel: ActionModel =
      component.model.event && component.model.event.hover

    if (!hoverEvtModel) {
      return
    }

    this._doEventAction(hoverEvtModel, component, false)
  }

  _doEventAction(event: ActionModel, component, enter: boolean) {
    var { action, target, value, emphasize = false, restore = false } = event
    if (!action || !target) return

    // IMPLEMENT-ME
    if (emphasize) {
      if (enter) {
        // Emphasize.emphasize(component)
      } else if (restore) {
        // Emphasize.normalize(component)
      }
    }

    switch (action) {
      case 'data-toggle':
        ; (enter || restore) &&
          this.rootContainer.findAll(target).forEach(component => {
            component.data = !component.data
          })
        break
      case 'data-tristate':
        ; (enter || restore) &&
          this.rootContainer.findAll(target).forEach(component => {
            let number = Math.round(Math.max(Number(component.data) || 0, 0))
            component.data = (number + (enter ? 1 : 2)) % 3
          })
        break
      case 'data-set':
        if (enter) {
          this.rootContainer.findAll(target).forEach(component => {
            component.data = component.substitute(value)
          })
        } else if (restore) {
          // TODO restore 설정은 leave 시점에 enter 시점의 상태로 되돌린다는 뜻이다.
          // data-set에서는 어떻게 할 것인가 ? 참고로 enter - leave 는 stack 처럼 중복될 수 있다.
        }
        break
      case 'infowindow':
        // IMPLEMENT-ME
        //   enter
        //     ? InfoWindow.show(component, target, true /* auto close - no close button */)
        //     : restore ? InfoWindow.hide(component, target) : ;
        break
      default:
        // things-real 라이브러리 외부에서 처리하도록 한다.
        this.ownerScene.trigger(action, target, component.substitute(value))
    }
  }
}
