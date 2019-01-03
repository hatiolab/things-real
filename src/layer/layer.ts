/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import EventSource from "../event/event-source";
import { CameraView } from "../types";
import RootContainer from "../component/root-container";
import Scene from "../scene/scene";
import CameraControl from "../threed/controls/camera-control";
import RealObjectScene from "../component/threed/real-object-scene";
import { CSS3DRenderer } from "../threed/renderers/css-3d-renderer";
import { SceneMode } from "../types";
import { WEBVR } from "../vr/WebVR";
import { PIXEL_RATIO } from "../component/html/elements";
import {
  callFrameAnimation,
  requestCustomAnimationFrame
} from "../util/custom-animation-frame";
import RayInput from "../threed/ray-input/ray-input";

import * as THREE from "three";

const NOOP = () => {};

/**
 * RealSceneRenderer
 */
export default abstract class Layer extends EventSource {
  private _resizer = this.resize.bind(this);

  private boundOnclick;
  private boundOnmousedown;
  private boundOnmouseup;
  private boundOnmousemove;
  // private boundOnmouseenter
  // private boundOnmouseleave

  private boundOnrayover;
  private boundOnrayout;
  private boundOnraydown;
  private boundOnrayup;

  private boundOnvrdisplaypresentchange;

  /**
   * RealSceneRenderer constructor
   * @param ownerScene
   */
  constructor(ownerScene: Scene) {
    super();

    this._ownerScene = ownerScene;
    this.setRootContainer(ownerScene.rootContainer);

    window.addEventListener("resize", this._resizer, false);
  }

  /**
   * diposer
   */
  protected disposed = false;

  dispose() {
    this.disposed = true;

    window.removeEventListener("resize", this._resizer);
    this.element.removeEventListener("click", this.boundOnclick);
    this.element.removeEventListener("mousedown", this.boundOnmousedown);
    this.element.removeEventListener("mouseup", this.boundOnmouseup);
    this.element.removeEventListener("mousemove", this.boundOnmousemove);

    window.removeEventListener(
      "vrdisplaypresentchange",
      this.boundOnvrdisplaypresentchange
    );

    this.disposeCameras();
    this.disposeObjectScene();
    this.disposeRootContainer();
    this.disposeTarget();
    this.disposeElement();
    this.disposeLights();

    this.disposeGLRenderer();
    this.disposeCSS3DRenderer();
    this.disposeRaycaster();
    this.disposeCanvas();
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
    this.boundOnclick = this.onclick.bind(this);
    this.boundOnmousedown = this.onmousedown.bind(this);
    this.boundOnmouseup = this.onmouseup.bind(this);
    this.boundOnmousemove = this.onmousemove.bind(this);
    this.boundOnvrdisplaypresentchange = this.onvrdisplaypresentchange.bind(
      this
    );

    this.boundOnrayover = this.onrayover.bind(this);
    this.boundOnrayout = this.onrayout.bind(this);
    this.boundOnraydown = this.onraydown.bind(this);
    this.boundOnrayup = this.onrayup.bind(this);

    this.element.addEventListener("click", this.boundOnclick);
    this.element.addEventListener("mousedown", this.boundOnmousedown);
    this.element.addEventListener("mouseup", this.boundOnmouseup);
    this.element.addEventListener("mousemove", this.boundOnmousemove);

    window.addEventListener(
      "vrdisplaypresentchange",
      this.boundOnvrdisplaypresentchange,
      false
    );
  }

  /* owner Scene */
  private _ownerScene: Scene;

  /**
   * owner Scene
   */
  get ownerScene() {
    return this._ownerScene;
  }

  /* root-container */
  private _rootContainer: RootContainer;

  /**
   * root-container
   */
  get rootContainer() {
    return this._rootContainer;
  }

  /**
   * root-container set
   * @param rootContainer
   */
  public setRootContainer(rootContainer?) {
    if (this._rootContainer) {
      this.disposeRootContainer();
    }

    if (rootContainer) {
      this._rootContainer = rootContainer;

      this._rootContainer.on("render", () => {
        this.invalidate();
      });

      this._rootContainer.on("active-camera", (camera, hint) => {
        this.activateCamera(camera);
      });

      this._rootContainer.on("deactive-camera", (camera, hint) => {
        this.inactivateCamera(camera);
      });

      var activeCameraComponent = this.cameraControl.findActiveCamera();
      this.activateCamera(
        activeCameraComponent
          ? activeCameraComponent.object3D
          : CameraView.PERSPECTIVE
      );

      this.invalidate();
    }
  }

  /**
   * root-container clear
   */
  protected disposeRootContainer() {
    if (!this._rootContainer) {
      return;
    }
    this._rootContainer.off("render");
    this.disposeObjectScene();
  }

  /* object-scene */
  private _objectScene: RealObjectScene;

  /**
   * getter
   */
  get objectScene(): RealObjectScene {
    if (!this._objectScene) {
      this._objectScene = this.createObjectScene();
    }

    return this._objectScene;
  }

  /**
   * createObjectScene
   */
  protected createObjectScene(): RealObjectScene {
    var objectScene = this.rootContainer.object3D as RealObjectScene;

    objectScene && objectScene.add(...this.lights);

    return objectScene;
  }

  /**
   * objectScene disposer
   */
  protected disposeObjectScene() {
    // 폐기된 objectScene을 지워서 다음 objectScene getter 호출시 새로 생성되도록 한다.
    this._objectScene && this._objectScene.remove(...this.lights);
    delete this._objectScene;
  }

  /* gl-renderer */
  private _glRenderer: THREE.WebGLRenderer;
  private _vrbutton;

  /**
   * gl-renderer getter
   */
  get glRenderer() {
    if (!this._glRenderer && this.canvas) {
      this._glRenderer = this.createGLRenderer();
    }

    return this._glRenderer;
  }

  protected createGLRenderer() {
    var renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      preserveDrawingBuffer: true,
      precision: "highp",
      antialias: true,
      alpha: true
    });

    renderer.setClearColor(0xffffff, 0);
    // Add support for retina displays
    renderer.setPixelRatio(PIXEL_RATIO);
    // Specify the size of the canvas
    renderer.setSize(1, 1);

    this._vrbutton = WEBVR.createButton(renderer);

    if (this._vrbutton) {
      document.body.appendChild(this._vrbutton);
    }

    // TODO Main Scene과 보조 Scene을 구별할 수 있는 방법이 필요하다.
    // Main Scene인 경우만 setAnimationLoop를 설정한다.
    if (WEBVR.mainRenderer === renderer) {
      renderer.setAnimationLoop(() => {
        callFrameAnimation();

        this.render();
      });
    } else {
      let _ = () => {
        this.render();
        requestCustomAnimationFrame(_);
      };

      !this.disposed && requestCustomAnimationFrame(_);
    }

    return renderer;
  }

  protected disposeGLRenderer() {
    if (this._glRenderer) {
      this._glRenderer.setAnimationLoop(NOOP);
      this._glRenderer.dispose();
    }

    if (WEBVR.mainRenderer === this._glRenderer) {
      WEBVR.mainRenderer = undefined;
    }

    if (this._vrbutton) {
      document.body.removeChild(this._vrbutton);
      delete this._vrbutton;
    }
  }

  /* css3d-renderer */
  private _css3DRenderer; //: CSS3DRenderer

  /**
   * css3d-renderer getter
   */
  get css3DRenderer() {
    if (!this._css3DRenderer) {
      this._css3DRenderer = this.createCSS3DRenderer();
    }

    return this._css3DRenderer;
  }

  protected createCSS3DRenderer() {
    var renderer = new CSS3DRenderer();
    var div = renderer.domElement;
    div.style.position = "absolute";
    div.style.top = "0";

    if (this.ownerScene.mode === SceneMode.EDIT) {
      div.style.pointerEvents = "none";
    } else {
      // disableAllUserEvents(div)
    }

    return renderer;
  }

  protected disposeCSS3DRenderer() {
    // Nothing to do
  }

  /**
   * element내부에 필요한 overlay들을 생성
   * ViewRenderer에서는 CSS3DRenderer와 GLRendering을 위한 canvas를 오버레이로 만든다.
   * Warn: this.element는 아직 만들어지지 않은 상태에 buildOverlays가 호출됨.
   * @param into
   */
  buildOverlays(into) {
    into.appendChild(this.css3DRenderer.domElement);
    into.appendChild(this.canvas);
  }

  /* canvas for GLRenderer */
  private _canvas: HTMLCanvasElement;

  /**
   * canvas getter
   */
  get canvas() {
    if (!this._canvas) {
      this._canvas = this.createCanvas();
    }
    return this._canvas;
  }

  /**
   * canvas creator
   */
  createCanvas() {
    var canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.background = "transparent";
    canvas.style.pointerEvents = "none";

    return canvas;
  }

  /**
   * canvas disposer
   */
  disposeCanvas() {
    this._canvas && this.element.removeChild(this._canvas);
  }

  /**
   * element가 resize 된 후에 호출됨
   * @param width
   * @param height
   */
  onresize(width, height) {
    this.element.style.width = width + "px";
    this.element.style.height = height + "px";

    if (this.activeCamera.isPerspectiveCamera) {
      this.activeCamera.aspect = width / height;
    } else {
      let { width: modelWidth, height: modelHeight } = this.rootContainer.state;

      let containerRatio = height / width;
      let modelRatio = modelHeight / modelWidth;

      if (containerRatio > modelRatio) {
        this.activeCamera.left = -modelWidth / 2;
        this.activeCamera.right = modelWidth / 2;
        this.activeCamera.top = (modelWidth * containerRatio) / 2;
        this.activeCamera.bottom = (-modelWidth * containerRatio) / 2;
      } else {
        this.activeCamera.left = -modelHeight / containerRatio / 2;
        this.activeCamera.right = modelHeight / containerRatio / 2;
        this.activeCamera.top = modelHeight / 2;
        this.activeCamera.bottom = -modelHeight / 2;
      }
    }

    this.css3DRenderer.setSize(width, height);
    this.glRenderer.setSize(width, height, true);

    this.activeCamera.updateProjectionMatrix();

    this.invalidate();
  }

  /* raycaster */
  private _raycaster: THREE.Raycaster;

  /**
   * raycaster getter
   */
  get raycaster() {
    if (!this._raycaster) {
      this._raycaster = this.createRaycaster();
    }

    return this._raycaster;
  }

  /**
   * create raycaster
   */
  protected createRaycaster() {
    return new THREE.Raycaster();
  }

  /**
   * raycaster disposer
   */
  protected disposeRaycaster() {
    // Nothing to do
  }

  /* ray-input */
  private _rayInput: RayInput;

  get rayInput() {
    return this._rayInput;
  }

  set rayInput(rayInput) {
    this.disposeRayInput();
    this._rayInput = rayInput;
  }

  createRayInput() {
    var rayInput = new RayInput(this.activeCamera, this.glRenderer.domElement);
    rayInput.setSize(this.glRenderer.getSize());
    rayInput.update();

    return rayInput;
  }

  disposeRayInput() {
    if (this._rayInput) {
    }
    delete this._rayInput;
  }

  bindRayInputs() {
    this.rayInput && this.unbindRayInputs();

    this.rayInput = this.createRayInput();

    // var camera: any = this.activeCamera;

    // if (!camera.parent) {
    this.objectScene.add(this.rayInput.getMesh());
    // } else {
    //   (camera.parent as any).add(this.rayInput.getMesh());
    // }

    this.rootContainer.components
      .filter(component => {
        let event = component.getState("event");
        return event && (event.tap || event.hover);
      })
      .forEach(component => {
        // Track the box for ray inputs.
        this.rayInput.add(component.object3D);

        // Set up a bunch of event listeners.
        this.rayInput.on("rayover", this.boundOnrayover);
        this.rayInput.on("rayout", this.boundOnrayout);
        this.rayInput.on("raydown", this.boundOnraydown);
        this.rayInput.on("rayup", this.boundOnrayup);
      });
  }

  unbindRayInputs() {
    // var camera: any = this.activeCamera;
    // if (!camera.parent) {
    this.objectScene.remove(this.rayInput.getMesh());
    // } else {
    //   (camera.parent as any).remove(this.rayInput.getMesh());
    // }

    this.rootContainer.components
      .filter(component => {
        let event = component.getState("event");
        return event && (event.tap || event.hover);
      })
      .forEach(component => {
        // Track the box for ray inputs.
        this.rayInput.remove(component.object3D);

        // Set up a bunch of event listeners.
        this.rayInput.off("rayover", this.boundOnrayover);
        this.rayInput.off("rayout", this.boundOnrayout);
        this.rayInput.off("raydown", this.boundOnraydown);
        this.rayInput.off("rayup", this.boundOnrayup);
      });

    this.disposeRayInput();
  }

  /**
   *
   * @param event
   */

  onvrdisplaypresentchange(event: VRDisplayEvent) {
    var { display } = event;

    // TODO Main Scene과 보조 Scene을 구별할 수 있는 방법이 필요하다.
    var isPresenting =
      !!display.isPresenting && this.glRenderer === WEBVR.mainRenderer;

    var vr = this.glRenderer.vr as any;
    vr && (vr.enabled = isPresenting);

    if (!isPresenting) {
      this.activeCamera.layers.enable(1); // CLARIFY-ME

      this.rayInput && this.unbindRayInputs();
    } else {
      // this.activeCamera.layers.enable(1); // CLARIFY-ME

      console.log(
        "active camera 1",
        this.activeCamera.position.x,
        this.activeCamera.position.y,
        this.activeCamera.position.z,
        this.activeCamera.uuid
      );

      display.depthNear = this.activeCamera.near;
      display.depthFar = this.activeCamera.far;

      this.bindRayInputs();
      console.log(
        "active camera 2",
        this.activeCamera.position.x,
        this.activeCamera.position.y,
        this.activeCamera.position.z,
        this.activeCamera.uuid
      );
    }

    this.invalidate();
  }

  /* resize */
  private _resizeTimeout;

  /**
   * 부모 엘리먼트의 크기가 변화했을 때, 호출한다.
   * 부모 엘리먼트의 크기를 1초 간격으로 쫓아가며 자신의 크기를 변화시킨다.
   * 자신의 크기를 변화시키면서, onresize 콜백으로 변화에 따른 부수적인 작업을 할 수 있도록 한다.
   * 1초 동안 부모 엘리먼트의 크기변화가 없으면, resize를 멈춘다.
   */
  resize() {
    if (this._resizeTimeout !== undefined) {
      clearTimeout(this._resizeTimeout);
      delete this._resizeTimeout;
    }

    if (!this.target) return;

    var oldwidth;
    var oldheight;

    var checker = () => {
      if (!this.target) return;

      let width = this.target.offsetWidth;
      let height = this.target.offsetHeight;

      if (oldwidth == width && oldheight == height) {
        return;
      }

      this.onresize(width, height);

      oldwidth = width;
      oldheight = height;

      // 최종 마무리는 확실하게
      this._resizeTimeout = setTimeout(checker, 500);
    };

    // 최초 반응은 빠르게.
    requestAnimationFrame(checker);
  }

  /* target container element */
  private _target: HTMLElement;

  /**
   * target container element getter
   */
  get target() {
    return this._target;
  }

  /**
   * target container element setter
   */
  set target(target) {
    this.disposeTarget();

    this._target = this.buildTarget(target);

    this.resize();

    this.ready();
  }

  /**
   * target builder
   * @param target
   */
  protected buildTarget(target) {
    if (!target) {
      return;
    }

    target.appendChild(this.element);

    return target;
  }

  /**
   * target container element clear
   */
  protected disposeTarget() {
    if (!this._target || !this.element) {
      return;
    }

    this._target.removeChild(this.element);

    // delete this._target
  }

  /* element */
  private _element: HTMLElement;

  /**
   * element getter
   */
  get element() {
    if (!this._element) {
      this._element = this.createElement();
    }

    return this._element;
  }

  /**
   * createElement
   */
  protected createElement() {
    var element = document.createElement("div");
    element.style.position = "absolute";

    this.buildOverlays(element);

    return element;
  }

  /**
   * element disposer
   */
  protected disposeElement() {
    // delete this._element
  }

  /**
   * render
   * @param context
   */

  protected abstract render(context?);

  /**
   * prerender
   * @param context
   */
  // protected prerender(context?) {}

  /**
   * 화면을 갱신하는 render() 함수호출을 최소화하기 위한 기능을 함.
   * 화면을 그리는 로직은 render() 에서 구현하지만,
   * 화면을 갱신하기 위해서는 invalidate() 를 호출하라.
   */
  public abstract invalidate();

  /* camera */

  /**
   * activeCamera getter
   */

  private _activeCamera: any;
  private _cameraControl: CameraControl;

  get cameraControl() {
    if (!this._cameraControl) {
      this._cameraControl = new CameraControl(this);
    }

    return this._cameraControl;
  }

  inactivateCamera(camera?: CameraView | THREE.Camera) {
    if (this._activeCamera === camera) {
      this.activateCamera();
    }
  }

  activateCamera(camera?: CameraView | THREE.Camera) {
    if (camera === undefined) {
      this.cameraControl.switchCamera("perspective");
      this.invalidate();

      return;
    }

    switch (camera) {
      case CameraView.PERSPECTIVE:
        this.cameraControl.switchCamera("perspective");
        break;
      case CameraView.LEFT:
        this.cameraControl.switchCamera("orthographic", "left");
        break;
      case CameraView.RIGHT:
        this.cameraControl.switchCamera("orthographic", "right");
        break;
      case CameraView.TOP:
        this.cameraControl.switchCamera("orthographic", "top");
        break;
      case CameraView.BOTTOM:
        this.cameraControl.switchCamera("orthographic", "bottom");
        break;
      case CameraView.FRONT:
        this.cameraControl.switchCamera("orthographic", "front");
        break;
      case CameraView.BACK:
        this.cameraControl.switchCamera("orthographic", "back");
        break;
      default:
        this.cameraControl.switchCamera(camera as THREE.Camera);
    }

    this.invalidate();
  }

  get activeCamera() {
    if (!this._activeCamera) {
      // default camera is perspective camera
      this.activateCamera(CameraView.PERSPECTIVE);
    }

    return this._activeCamera;
  }

  set activeCamera(camera) {
    this._activeCamera = camera;
    if (this.target) {
      this.onresize(this.target.offsetWidth, this.target.offsetHeight);
    }
  }

  disposeCameras() {
    this._cameraControl && this._cameraControl.dispose();
  }

  /* lights */
  private _lights: THREE.Light[];

  /**
   * lights getter
   */
  get lights() {
    if (!this._lights) {
      this._lights = this.createLights();
    }

    return this._lights;
  }

  /**
   * lights creator
   */
  createLights() {
    return [
      new THREE.AmbientLight(0xcccccc),
      new THREE.DirectionalLight(0xffffff, 0.5)
    ];
  }

  /**
   * lights disposer
   */
  disposeLights() {
    // Nothing to do
  }

  /**
   * mouse/touch pointer를 받아서 raycaster로 Object3D를 찾고,
   * Object3D를 생성한 Component를 리턴한다.
   * @param x
   * @param y
   */
  capture(coords) {
    var { width, height } = this.canvas;

    this.raycaster.setFromCamera(coords, this.activeCamera);

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.rootContainer.capturables();
    var intersects = this.raycaster.intersectObjects(
      capturables.map(component => {
        return component.object3D;
      }),
      true
    );

    for (let i = 0; i < intersects.length; i++) {
      let object: THREE.Object3D = intersects[i].object;

      while (!object["isRealObject"] && object !== this.objectScene) {
        object = object.parent;
      }

      let component;
      if (object["isRealObject"]) {
        component = object["component"];
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
  protected abstract onclick(event);
  protected abstract onmousedown(event);
  protected abstract onmouseup(event);
  protected abstract onmousemove(event);
  protected abstract onmouseenter(component);
  protected abstract onmouseleave(component);

  /**
   * VR RayInput Event Handlers
   * @param event
   */
  protected abstract onrayover(mesh);
  protected abstract onrayout(mesh);
  protected abstract onraydown(mesh);
  protected abstract onrayup(mesh);
}
