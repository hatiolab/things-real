/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from '../components/component'
import ModelLayer from './model-layer'
import ObjectComponentBridge from './threed/object-component-bridge'
import './threed/controls/editor-controls'
import TransformControls from './threed/controls/transform-controls'

import CommandChange from '../command/command-change'

export default class Scene3DLayer extends ModelLayer {

  static support(dimension = '2d') {
    return String(dimension).toLowerCase() === '3d';
  }

  constructor(x, y) {
    super(x, y)
  }

  dispose() {
    this._transformControls && this._transformControls.dispose();

    this.scene.children.slice().forEach(child => {
      if (child.dispose)
        child.dispose();
      if (child.geometry && child.geometry.dispose)
        child.geometry.dispose();
      if (child.material && child.material.dispose)
        child.material.dispose();
      if (child.texture && child.texture.dispose)
        child.texture.dispose();
      this.remove(child)
    });

    this.renderer.dispose();

    super.dispose();
  }

  ready() {

    if (this.app.isEditMode) {
      this.onmousedown = this.transformControls.onPointerDown.bind(this.transformControls);
      this.ondragmove = this.transformControls.onPointerDragMove.bind(this.transformControls);
      this.onmousemove = this.transformControls.onPointerHover.bind(this.transformControls);
    }
  }

  get raycaster() {
    if (!this._raycaster) {
      this._raycaster = new THREE.Raycaster()
    }

    return this._raycaster;
  }

  get editorControls() {
    if (!this._editorControls) {
      this._editorControls = new THREE.EditorControls(this.camera);
    }

    return this._editorControls;
  }

  get transformControls() {
    if (!this._transformControls) {
      this._transformControls = new TransformControls(this.camera, this.target, this.scene);
      this.scene.add(this._transformControls);

      this._transformControls.addEventListener('change', () => {
        this.render();
      });

      this._transformControls.addEventListener('objectChange', () => {
        let object = this._transformControls.object;

        object && CommandChange.around(this.app.commander, function () {
          // object의 변화를 component에 반영한다.
          object.updateReverse();
        });

        object && object.update(true);
      });
    }

    return this._transformControls;
  }

  get renderer() {
    if (!this._renderer && this.canvas) {
      this._renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        precision: "highp",
        antialias: true,
        alpha: true
      });

      this._renderer.setClearColor(0xffffff, 0);
    }

    return this._renderer;
  }

  get camera() {
    if (!this._camera) {
      let { width, height } = this.state;

      this._camera = new THREE.PerspectiveCamera();

      this._camera.position.set(0, height, height * 3 / 4);

      // let frustum = Math.max(width, height) / 2;
      // this._camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 30000);
      // this._camera.position.set(0, frustum * 2, 0);
      // this._camera.position.set(0, frustum * 2, frustum * 2);
      // this._camera.position.set(0, 0, frustum * 2);

      this._camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    return this._camera;
  }

  get lights() {
    if (!this._lights) {
      this._lights = [
        new THREE.AmbientLight(0x777777),
        new THREE.DirectionalLight(0xffffff, 0.5)
      ];
    }

    return this._lights;
  }

  get scene() {
    if (!this._scene) {
      this._scene = new THREE.Scene();

      if (this.app.isEditMode) {
        this._scene.add(this.gridHelper);
      }
      this._scene.add(...this.lights);
    }

    return this._scene;
  }

  get gridHelper() {
    if (!this._gridHelper) {
      let { width, height } = this.state;
      let size = Math.max(width, height);
      this._gridHelper = new THREE.GridHelper(size, 20);
    }

    return this._gridHelper;
  }

  draw() {
    if (!this.renderer) {
      return;
    }

    this.prerender();
    this.render();
  }

  prerender(force) {

    this.components.forEach(component => {
      let object = ObjectComponentBridge.getObject3D(component);
      object && object.prerender(force);
    })
  }

  render() {
    // TODO transformControls가 update될 필요가 있을 때만, update 하도록 개선.
    this._transformControls && this._transformControls.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    super.resize();

    var { width: w, height: h } = this.state;
    var { offsetWidth: width, offsetHeight: height } = this.target;

    // raycaster의 정확성을 위해서 model의 scale을 조정한다.
    this.setState('scale', {
      x: width / w,
      y: height / h
    });

    this.camera.near = 1;
    this.camera.far = 10000;
    this.camera.aspect = width / height;

    var distance = 1000;
    var diag = Math.sqrt((height * height) + (width * width))
    this.camera.fov = 2 * Math.atan(diag / (2 * distance)) * 180 / Math.PI;

    // this.camera.position.set(0, h, h * 3 / 4);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, true);
  }

  /*
   * capturePath(path) 파라미터로 주어진 path를 포함하는 컨테이너를 찾는다.
   * @path
   * @excepts 컨테이너를 찾을 때 제외되는 대상이다.
   */

  capturePath(path, excepts) {

    // TODO 3D 공간에서 구현해야함..

    var capturables = this.layout.capturables(this)

    for (let i = capturables.length - 1; i >= 0; i--) {
      let capturable = capturables[i]
      if (!capturable.isContainer())
        continue

      let found = capturable.capturePath(path, excepts);
      if (found)
        return found;
    }

    return false
  }

  capture(x, y) {
    var {
      width,
      height
    } = this.canvas;

    var vector = new THREE.Vector2(
      x / width * 2 - 1,
      -y / height * 2 + 1
    );

    this.raycaster.setFromCamera(vector, this.camera);

    if (this.app.isEditMode) {
      var activePickers = this.transformControls.getActivePickers();
      var intersects = this.raycaster.intersectObjects(activePickers, true);

      if (intersects.length > 0) {
        return this;
      }
    }

    // TUNE-ME 자손들까지의 모든 intersects를 다 포함하는 것이면, capturable component에 해당하는 오브젝트라는 것을 보장할 수 없음.
    // 또한, component에 매핑된 오브젝트라는 것도 보장할 수 없음.
    var capturables = this.layout.capturables(this);
    intersects = this.raycaster.intersectObjects(capturables.map(ObjectComponentBridge.getObject3D), true);

    for (let i = 0; i < intersects.length; i++) {
      let object = intersects[i].object;
      let component = ObjectComponentBridge.getComponent(object);

      while (!component && object !== this.scene) {
        object = object.parent;
        component = ObjectComponentBridge.getComponent(object);
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

  get attention() {
    if (!this._attention) {
      this._attention = new THREE.Vector3();
    }

    return this._attention;
  }

  // onmousedown(e) {
  //   this.transformControls.onPointerDown(e);
  // }

  // ondragmove(e) {
  //   this.transformControls.onPointerDragMove(e);
  // }

  // ontouchstart(e) {
  //   this.transformControls.onPointerDown(e);
  // }

  // onmousemove(e) {
  //   this.transformControls.onPointerHover(e);
  //   // this.transformControls.onPointerMove(e);
  // }

  // ontouchmove(e) {
  //   this.transformControls.onPointerHover(e);
  //   this.transformControls.onPointerMove(e);
  // }

  // onmouseup(e) {
  //   this.transformControls.onPointerUp(e);
  // }

  // onmouseout(e) {
  //   this.transformControls.onPointerUp(e);
  // }

  // ontouchend(e) {
  //   this.transformControls.onPointerUp(e);
  // }

  // ontouchcancel(e) {
  //   this.transformControls.onPointerUp(e);
  // }

  // ontouchleave(e) {
  //   this.transformControls.onPointerUp(e);
  // }

  get eventMap() {
    return {
      '(self)': {
        '(all)': {
          change: ObjectComponentBridge.onchange,
          added: ObjectComponentBridge.onadded,
          removed: ObjectComponentBridge.onremoved,
        }
      },
    }
  }

}
