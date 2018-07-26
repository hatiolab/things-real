/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import ViewerLayer from './viewer-layer'
import RealObjectScene from '../component/threed/real-object-scene'
import TransformControls from '../threed/controls/transform-controls'
import CommandChange from '../command/command-change'

import * as THREE from 'three'

export default class ModelerLayer extends ViewerLayer {

  private _transformControls: TransformControls
  private _gridHelper: THREE.GridHelper

  private boundOnclick
  private boundOnmousedown
  private boundOnmouseup

  dispose() {
    this._transformControls && this._transformControls.dispose();

    this.element.removeEventListener('click', this.boundOnclick)
    this.element.removeEventListener('mousedown', this.boundOnmousedown)
    this.element.removeEventListener('mouseup', this.boundOnmouseup)

    super.dispose()
  }

  ready() {
    super.ready()

    this.boundOnclick = this.onclick.bind(this)
    this.boundOnmousedown = this.onmousedown.bind(this)
    this.boundOnmouseup = this.onmouseup.bind(this)

    this.element.addEventListener('click', this.boundOnclick)
    this.element.addEventListener('mousedown', this.boundOnmousedown)
    this.element.addEventListener('mouseup', this.boundOnmouseup)
  }

  setRootContainer(rootContainer​​) {
    if (this._scene) {
      /* scene이 dispose 될 때, 같이 dispose 되지 않도록 미리 빼줌 */
      this._scene.remove(this.gridHelper)
      this._scene.remove(this.transformControls)
    }

    super.setRootContainer(rootContainer)
  }

  get transformControls() {
    if (!this._transformControls) {
      this._transformControls = new TransformControls(this.camera, this.element);

      this._transformControls.addEventListener('change', () => {
        this.render();
      });

      this._transformControls.addEventListener('objectChange', () => {
        let object = this._transformControls.object;

        object && CommandChange.around(this.owner.commander, () => {
          // object의 변화를 component에 반영한다.
          object.updateReverse();
        });

        // object && object.update(true);
      });
    }

    return this._transformControls;
  }

  get scene() {
    if (!this._scene) {
      this._scene = this.rootContainer.object3D as RealObjectScene

      this._scene.add(this.gridHelper)
      this._scene.add(...this.lights)
      this._scene.add(this.transformControls)
    }

    return this._scene;
  }

  get gridHelper() {
    if (!this._gridHelper) {
      let { width, height } = this.rootContainer.state;
      let size = Math.max(width, height);
      this._gridHelper = new THREE.GridHelper(size, 20);
    }

    return this._gridHelper;
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

      while (!object['isRealObject'] && object !== this.scene) {
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

  onmousedown(event) {
  }

  onmouseup(event) {
  }

}
