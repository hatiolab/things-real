/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Scene from "../scene/scene";
import Layer from "./layer";
import EditorControls from "../threed/controls/editor-controls";
import { CSS3DRenderer } from "../threed/renderers/css-3d-renderer";
import RealObjectScene from "../component/threed/real-object-scene";
import { SceneMode, ActionModel } from "../types";
import { PIXEL_RATIO } from "../component/html/elements";

import * as THREE from "three";
window["THREE"] = THREE; // for ray-input

import { WEBVR } from "../vr/WebVR";
import RayInput from "ray-input/build/ray.min"; // to prevent uglify-js compile error
import { callFrameAnimation } from "../util/custom-animation-frame";

/**
 * Real Scene Renderer for Viewer
 */
export default class ViewerLayer extends Layer {
  private boundOnclick;
  private boundOnmousedown;
  private boundOnmouseup;
  private boundOnmousemove;
  // private boundOnmouseenter
  // private boundOnmouseleave

  private boundOnvrdisplaypresentchange;

  private enteredComponent;

  /**
   * constructor
   * @param owner Real Scene
   */
  constructor(owner: Scene) {
    super(owner);
  }

  /**
   * disposer
   */
  dispose() {
    super.dispose();

    this.element.removeEventListener("click", this.boundOnclick);
    this.element.removeEventListener("mousedown", this.boundOnmousedown);
    this.element.removeEventListener("mouseup", this.boundOnmouseup);
    this.element.removeEventListener("mousemove", this.boundOnmousemove);

    window.removeEventListener(
      "vrdisplaypresentchange",
      this.boundOnvrdisplaypresentchange
    );

    this.disposeEditorControls();

    this.disposeObjectScene();
    this.disposeGLRenderer();
    this.disposeCSS3DRenderer();
    this.disposeLights();
    this.disposeRaycaster();

    this.disposeCanvas();
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
    // editorControls을 만들기 위해 강제로 getter를 access 함.
    this.editorControls;

    this.boundOnclick = this.onclick.bind(this);
    this.boundOnmousedown = this.onmousedown.bind(this);
    this.boundOnmouseup = this.onmouseup.bind(this);
    this.boundOnmousemove = this.onmousemove.bind(this);
    this.boundOnvrdisplaypresentchange = this.onvrdisplaypresentchange.bind(
      this
    );

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

  /* ray-input */
  private _rayInput: RayInput;

  get rayInput() {
    if (!this._rayInput) {
      this._rayInput = new RayInput(
        this.activeCamera,
        this.glRenderer.domElement
      );
      this._rayInput.setSize(this.glRenderer.getSize());
    }

    return this._rayInput;
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
    delete this._objectScene;
  }

  /**
   * root container disposer
   * lights 등은 root-container에서 만든 것이 아니므로, 제거한다.
   * lights 등은 다른 root-container에서 재활용될 수 있다.
   */
  disposeRootContainer() {
    this.objectScene.remove(...this.lights);

    this.disposeObjectScene();
    super.disposeRootContainer();
  }

  /**
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
    // canvas.style.background = 'transparent'
    canvas.style.pointerEvents = "none";

    return canvas;
  }

  /**
   * canvas disposer
   */
  disposeCanvas() {
    this._canvas && this.element.removeChild(this._canvas);
  }

  /* editor-controls */
  private _editorControls: EditorControls;
  private _editorControlsEventHandler;

  /**
   * editorControls getter
   */
  get editorControls() {
    if (!this._editorControls) {
      this._editorControls = this.createEditorControls();
    }
    return this._editorControls;
  }

  protected createEditorControls(): EditorControls {
    var editorControls = new EditorControls(this.activeCamera, this.element);

    this._editorControlsEventHandler = (() => {
      this.invalidate();
    }).bind(this);
    editorControls.addEventListener("change", this._editorControlsEventHandler);

    return editorControls;
  }

  protected disposeEditorControls() {
    if (this._editorControls) {
      this._editorControls.removeEventListener(
        "change",
        this._editorControlsEventHandler
      );
      this._editorControls.dispose();
    }
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

    renderer.setAnimationLoop(this.render.bind(this));

    return renderer;
  }

  protected disposeGLRenderer() {
    this._glRenderer && this._glRenderer.dispose();

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
   *
   * @param force
   */
  prerender(force?) {
    this.rootContainer.components.forEach(component => {
      let object = component.object3D;
      !object["isRealObject"] && object["prerender"](force);
    });
  }

  /**
   * render
   * @param context
   */

  private _draw_reserved = false;

  protected render(context?) {
    callFrameAnimation();

    var vr = this.glRenderer.vr as any;

    if (vr.enabled || this._draw_reserved) {
      this.glRenderer.render(this.objectScene, this.activeCamera);
      this.css3DRenderer.render(
        this.rootContainer.css3DScene,
        this.activeCamera
      );

      this.trigger("redraw");
    }

    this._draw_reserved = false;
  }

  /**
   * 화면을 갱신하는 render() 함수호출을 최소화하기 위한 기능을 함.
   * 화면을 그리는 로직은 render() 에서 구현하지만,
   * 화면을 갱신하기 위해서는 invalidate() 를 호출하라.
   */
  public invalidate() {
    this._draw_reserved = true;
  }

  /**
   *
   * @param width
   * @param height
   */
  onresize(width, height) {
    if (this.activeCamera.isPerspectiveCamera) {
      this.activeCamera.aspect = width / height;
      var distance = 1000;
      var diag = Math.sqrt(height * height + width * width);

      this.activeCamera.fov =
        (2 * Math.atan(diag / (2 * distance)) * 180) / Math.PI;
    } else {
    }

    this.activeCamera.updateProjectionMatrix();

    this.css3DRenderer.setSize(width, height);
    this.glRenderer.setSize(width, height, true);
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

  _getPosition(event): { x; y } {
    var { width, height } = this.canvas;

    var { clientX: x, clientY: y } = event;

    var { left, top } = this.element.getBoundingClientRect();

    x -= left;
    y -= top;

    return {
      x: ((x * PIXEL_RATIO) / width) * 2 - 1,
      y: (-(y * PIXEL_RATIO) / height) * 2 + 1
    };
  }

  /**
   * VR RayInput Event Handlers
   * @param event
   */

  onSelected(mesh) {
    if (!mesh) {
      return;
    }

    if (mesh.material) mesh.material.opacity = 1;
  }

  onDeselected(mesh) {
    if (!mesh) {
      return;
    }

    if (mesh.material) mesh.material.opacity = 0.5;
  }

  bindRayInputs() {
    this.objectScene.add(this.rayInput.getMesh());

    console.log(this.rayInput.getMesh());

    this.rootContainer.components.forEach(component => {
      console.log("component added to rayInput", component);
      // Track the box for ray inputs.
      this.rayInput.add(component.object3D);

      // Set up a bunch of event listeners.
      this.rayInput.on("rayover", this.onSelected);
      this.rayInput.on("rayout", this.onDeselected);
      this.rayInput.on("raydown", this.onSelected);
      this.rayInput.on("rayup", this.onDeselected);
    });
  }

  unbindRayInputs() {
    this.objectScene.remove(this.rayInput.getMesh());

    this.rootContainer.components.forEach(component => {
      // Track the box for ray inputs.
      this.rayInput.remove(component.object3D);

      // Set up a bunch of event listeners.
      this.rayInput.off("rayover", this.onSelected);
      this.rayInput.off("rayout", this.onDeselected);
      this.rayInput.off("raydown", this.onSelected);
      this.rayInput.off("rayup", this.onDeselected);
    });
  }

  /**
   *
   * @param event
   */
  onvrdisplaypresentchange(event: VRDisplayEvent) {
    var { display } = event;
    var isPresenting = !!display.isPresenting;

    var vr = this.glRenderer.vr as any;
    vr.enabled = isPresenting;

    setTimeout(() => {
      if (!isPresenting) {
        this.activeCamera.layers.enable(1);
        var { height } = this.rootContainer.state;

        this.activeCamera.position.set(0, height, (height * 3) / 4);
        this.activeCamera.lookAt(new THREE.Vector3(0, 0, 0));

        this.unbindRayInputs();
      } else {
        display.depthNear = this.activeCamera.near;
        display.depthFar = this.activeCamera.far;

        // this.activeCamera.position.set(0, height, (height * 3) / 4);
        // this.activeCamera.lookAt(new THREE.Vector3(100, 100, 100));

        this.bindRayInputs();
      }
    }, 100);

    this.invalidate();
  }

  /**
   *
   * @param event
   */
  onclick(event) {
    let coords = this._getPosition(
      event["changedTouches"] ? event["changedTouches"][0] : event
    );
    let component = this.capture(coords);

    if (component === this.rootContainer) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    var tapEvtModel: ActionModel =
      component.model.event && component.model.event.tap;

    if (!tapEvtModel) {
      return;
    }

    this._doEventAction(tapEvtModel, component, true);
  }

  /**
   *
   * @param event
   */
  onmousedown(event) {}

  /**
   *
   * @param event
   */
  onmouseup(event) {}

  onmousemove(event) {
    let coords = this._getPosition(
      event["changedTouches"] ? event["changedTouches"][0] : event
    );
    let component = this.capture(coords);

    if (component !== this.enteredComponent) {
      this.enteredComponent && this.onmouseleave(this.enteredComponent);
      component && this.onmouseenter(component);

      this.enteredComponent = component;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  onmouseenter(component) {
    if (component === this.rootContainer) {
      return;
    }

    var hoverEvtModel: ActionModel =
      component.model.event && component.model.event.hover;

    if (!hoverEvtModel) {
      return;
    }

    this._doEventAction(hoverEvtModel, component, true);
  }

  onmouseleave(component) {
    if (component === this.rootContainer) {
      return;
    }

    var hoverEvtModel: ActionModel =
      component.model.event && component.model.event.hover;

    if (!hoverEvtModel) {
      return;
    }

    this._doEventAction(hoverEvtModel, component, false);
  }

  _doEventAction(event: ActionModel, component, enter: boolean) {
    var { action, target, value, emphasize = false, restore = false } = event;
    if (!action || !target) return;

    // IMPLEMENT-ME
    if (emphasize) {
      if (enter) {
        // Emphasize.emphasize(component)
      } else if (restore) {
        // Emphasize.normalize(component)
      }
    }

    switch (action) {
      case "data-toggle":
        (enter || restore) &&
          this.rootContainer.findAll(target).forEach(component => {
            component.data = !component.data;
          });
        break;
      case "data-tristate":
        (enter || restore) &&
          this.rootContainer.findAll(target).forEach(component => {
            let number = Math.round(Math.max(Number(component.data) || 0, 0));
            component.data = (number + (enter ? 1 : 2)) % 3;
          });
        break;
      case "data-set":
        if (enter) {
          this.rootContainer.findAll(target).forEach(component => {
            component.data = component.substitute(value);
          });
        } else if (restore) {
          // TODO restore 설정은 leave 시점에 enter 시점의 상태로 되돌린다는 뜻이다.
          // data-set에서는 어떻게 할 것인가 ? 참고로 enter - leave 는 stack 처럼 중복될 수 있다.
        }
        break;
      case "infowindow":
        // IMPLEMENT-ME
        //   enter
        //     ? InfoWindow.show(component, target, true /* auto close - no close button */)
        //     : restore ? InfoWindow.hide(component, target) : ;
        break;
      default:
        // things-real 라이브러리 외부에서 처리하도록 한다.
        this.ownerScene.trigger(action, target, component.substitute(value));
    }
  }
}
