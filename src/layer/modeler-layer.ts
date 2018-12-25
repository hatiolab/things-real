/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import ViewerLayer from "./viewer-layer";
import RealObjectScene from "../component/threed/real-object-scene";
import TransformControls from "../threed/controls/transform-controls";
import CommandChange from "../command/command-change";

import * as THREE from "three";

/**
 * Real Scene Renderer for Modeling
 */
export default class ModelerLayer extends ViewerLayer {
  constructor(ownerScene) {
    super(ownerScene);

    this.ownerScene.on("selected", this.onselectchanged.bind(this));
  }
  /**
   * scene-renderer disposer
   */
  dispose() {
    this.ownerScene.off("selected");

    super.dispose();

    this.disposeTransformControls();
    this.disposeBoundBox();
    this.disposeGridHelper();
  }

  /**
   * Lifecycle Target Element에 attach된 후, render() 전에 호출됨
   */
  ready() {
    super.ready();
  }

  /* overides */

  createObjectScene() {
    var objectScene = this.rootContainer.object3D as RealObjectScene;

    if (objectScene) {
      objectScene.add(this.gridHelper);
      objectScene.add(...this.lights);
      objectScene.add(this.transformControls);
    }

    return objectScene;
  }

  disposeRootContainer() {
    this.objectScene.remove(this.gridHelper);
    this.objectScene.remove(this.transformControls);

    super.disposeRootContainer();
  }

  /* selection box */
  private _boundBox: THREE.BoxHelper;

  /**
   * boundBox getter
   */
  get boundBox() {
    if (!this._boundBox) {
      this._boundBox = this.createBoundBox();
    }

    return this._boundBox;
  }

  /**
   * createBoundBox
   */
  protected createBoundBox() {
    var boundBox = new THREE.BoxHelper();
    var material: THREE.LineBasicMaterial = boundBox.material as THREE.LineBasicMaterial;
    material.depthTest = false;
    material.transparent = true;
    material.color.set(0x1faaf2);

    this.rootContainer.object3D.add(boundBox);

    return boundBox;
  }

  /**
   * disposeBoundBox
   */
  protected disposeBoundBox() {
    // this._boundBox && this._boundBox.dispose();
  }

  /* transform controls */
  private _transformControls: TransformControls;

  /**
   * transform-controls getter
   */
  get transformControls() {
    if (!this._transformControls) {
      this._transformControls = this.createTransformControls();
    }

    return this._transformControls;
  }

  /**
   * createTransformControls
   */
  protected createTransformControls() {
    var controls = new TransformControls(this.activeCamera, this.element);

    controls.addEventListener("change", () => {
      this.boundBox.update();
      this.invalidate();
    });

    controls.addEventListener("objectChange", () => {
      let object = this._transformControls.object;
      let component = object && object.component;

      object &&
        CommandChange.around(this.ownerScene.commander, () => {
          // 3d-object의 변화를 component에 반영한다.
          object.updateTransformReverse();
        });
    });

    return controls;
  }

  /**
   * disposeTransformControls
   */
  protected disposeTransformControls() {
    this._transformControls && this._transformControls.dispose();
  }

  /* grid-helper */
  private _gridHelper: THREE.GridHelper;

  /**
   * grid-helper getter
   */
  get gridHelper() {
    if (!this._gridHelper) {
      this._gridHelper = this.createGridHelper();
    }

    return this._gridHelper;
  }

  /**
   * createGridHelper
   */
  protected createGridHelper() {
    var { width, height } = this.rootContainer.state;
    var size = Math.max(width, height);

    return new THREE.GridHelper(size, 20);
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
  set transformMode({ mode, space, size }: { mode?; space?; size? }) {
    mode && (this.transformControls.mode = mode);
    space && this.transformControls.setSpace(space);
    size && (this.transformControls.size = size);
  }

  /**
   *
   * @param x
   * @param y
   */
  capture(coords) {
    var { width, height } = this.canvas;

    this.raycaster.setFromCamera(coords, this.activeCamera);

    /* modeler case begin */
    var activePickers = this.transformControls.activePickers;
    var intersects = this.raycaster.intersectObjects(activePickers, true);

    if (intersects.length > 0) {
      // return this.rootContainer
      return this.ownerScene.selected[0];
    }
    /* modeler case end */

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.rootContainer.capturables();
    intersects = this.raycaster.intersectObjects(
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

  onselectchanged(components, before) {
    var component = components[0];

    if (!component || component === this.rootContainer) {
      this.boundBox.visible = false;
      this.transformControls.detach();

      this.editorControls.enable();
      this.invalidate();
    } else {
      var object3D = component.object3D;

      this.transformControls.attach(object3D);

      (this.boundBox as any).setFromObject(object3D).update();
      this.boundBox.visible = true;

      this.editorControls.disable();
      this.invalidate();
    }
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
      this.ownerScene.selected = [];
    } else {
      this.ownerScene.selected = [component];
    }

    event.preventDefault();
    event.stopPropagation();
  }

  /**
   *
   * @param event
   */
  onmousemove(event) {
    let coords = this._getPosition(
      event["changedTouches"] ? event["changedTouches"][0] : event
    );
    let component = this.capture(coords);

    // if (component !== this.enteredComponent) {
    //   this.enteredComponent && this.onmouseleave(this.enteredComponent)
    //   component && this.onmouseenter(component)

    //   this.enteredComponent = component
    // }

    event.preventDefault();
    event.stopPropagation();
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
}
