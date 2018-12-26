/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import EventSource from "../event/event-source";
import { CameraView } from "../types";
import RootContainer from "../component/root-container";
import Scene from "../scene/scene";
import CameraControl from "./controls/camera-control";

import * as THREE from "three";

/**
 * RealSceneRenderer
 */
export default abstract class Layer extends EventSource {
  /**
   * RealSceneRenderer constructor
   * @param ownerScene
   */
  constructor(ownerScene: Scene) {
    super();

    this._ownerScene = ownerScene;
    this.setRootContainer(ownerScene.rootContainer);
  }

  /**
   * diposer
   */
  dispose() {
    this.disposeCameras();
    this.disposeRootContainer();
    this.disposeTarget();
    this.disposeElement();
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {}

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

      this._rootContainer.on("active-camera", (component, camera, hint) => {
        this.activateCamera(camera);
      });

      this._rootContainer.on("deactive-camera", (component, camera, hint) => {
        this.inactivateCamera(camera);
      });

      var activeCameraComponent = this.cameraControl.findActiveCamera();
      this.activateCamera(
        activeCameraComponent && activeCameraComponent.object3D.camera
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
    // delete this._rootContainer
  }

  /**
   * element가 resize 된 후에 호출됨
   * @param width
   * @param height
   */
  onresize(width, height) {}

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

      this.element.style.width = width + "px";
      this.element.style.height = height + "px";

      this.onresize && this.onresize(width, height);
      this.invalidate();

      oldwidth = width;
      oldheight = height;

      // 최종 마무리는 확실하게
      this._resizeTimeout = setTimeout(checker, 500);
    };

    // 최초 반응은 빠르게.
    requestAnimationFrame(checker);
  }

  /**
   * element내부에 필요한 overlay들을 생성
   * @param into
   */
  protected abstract buildOverlays(into);

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

    this.ready(); // TODO 필요한가 ?
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
  protected prerender(context?) {}

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
    this.invalidate();
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
}
