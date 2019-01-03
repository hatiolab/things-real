/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Scene from "../scene/scene";
import Layer from "./layer";
import EditorControls from "../threed/controls/editor-controls";
import { ActionModel } from "../types";
import { PIXEL_RATIO } from "../component/html/elements";

import { error } from "../util/logger";

import * as THREE from "three";
import { WEBVR } from "../vr/WebVR";

/**
 * Real Scene Renderer for Viewer
 */
export default class ViewerLayer extends Layer {
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

    this.disposeEditorControls();
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
    super.ready();

    // editorControls을 만들기 위해 강제로 getter를 access 함.
    this.editorControls;
  }

  /**
   * root container disposer
   * lights 등은 root-container에서 만든 것이 아니므로, 제거한다.
   * lights 등은 다른 root-container에서 재활용될 수 있다.
   */
  disposeRootContainer() {
    super.disposeRootContainer();

    this.disposeObjectScene();
    super.disposeRootContainer();
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

  /**
   *
   * @param force
   */
  // prerender(force?) {
  //   this.rootContainer.components.forEach(component => {
  //     let object = component.object3D;
  //     !object["isRealObject"] && object["prerender"](force);
  //   });
  // }

  /**
   * render
   * @param context
   */

  private _draw_reserved = false;

  protected render(context?) {
    if (this.disposed) {
      return;
    }

    var vr = this.glRenderer.vr as any;

    if (vr.enabled || this._draw_reserved) {
      this.glRenderer.render(this.objectScene, this.activeCamera);
      this.css3DRenderer.render(
        this.rootContainer.css3DScene,
        this.activeCamera
      );

      if (this.rayInput) {
        this.rayInput.update();
      }

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
    super.onresize(width, height);

    this.editorControls.setObject(this.activeCamera);
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

  onrayover(mesh) {
    this.onmouseenter(mesh.component);
    // mesh.component
    // if (!mesh) {
    //   return;
    // }

    // if (mesh.material) mesh.material.opacity = 1;
  }

  onrayout(mesh) {
    this.onmouseleave(mesh.component);
  }

  onraydown(mesh) {}

  onrayup(mesh) {
    var component = mesh.component;
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

  private enteredComponent;

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
          this.rootContainer.findAll(target, component).forEach(x => {
            x.data = !x.data;
          });
        break;
      case "data-tristate":
        (enter || restore) &&
          this.rootContainer.findAll(target, component).forEach(x => {
            let number = Math.round(Math.max(Number(x.data) || 0, 0));
            x.data = (number + (enter ? 1 : 2)) % 3;
          });
        break;
      case "data-set":
        if (enter) {
          this.rootContainer.findAll(target, component).forEach(x => {
            x.data = component.substitute(value);
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
      case "goto":
        this._gotoScene(target);
        break;
      default:
        // things-real 라이브러리 외부에서 처리하도록 한다.
        this.ownerScene.trigger(action, target, component.substitute(value));
    }
  }

  async _gotoScene(boardName) {
    if (!boardName) return;

    try {
      var scene: any = await this.rootContainer.refProvider.get(
        boardName,
        true
      );

      var old_scene = this.ownerScene;

      if (scene.target === this.target) {
        scene.release();
        return;
      }

      // this.forward.forEach(function(scene) {
      //   scene.release();
      // });
      // this.forward = [];

      if (old_scene) {
        // this._unbindAllEvents(old_scene._container, this);
        old_scene.target = null;
        // this.backward.push(old_scene);
      }
      scene.target = this.target;
      scene._layer.glRenderer;

      // this._bindAllEvents(this.scene._container, this);

      /* 이 컴포넌트의 폭이 값을 가지고 있으면 - 화면상에 자리를 잡고 보여지고 있음을 의미한다.
       * 이 때는 정상적으로 그려주고,
       * 그렇지 않으면, 다음 Resize Handling시에 처리하도록 한다.
       */
      // if (this.offsetWidth) this._fit();

      // this._showHideNavButton();
    } catch (e) {
      error(e);
    }
  }
}
