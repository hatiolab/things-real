/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";
import RealObjectDomElement from "./threed/real-object-dom-element";
import { error } from "../util/logger";

import * as THREE from "three";

class RealObjectRef extends RealObjectDomElement {
  private _texture;

  needTextureUpdate() {
    if (this._texture) {
      // CONFIRM-ME 아래 needsUpdate 속성 수정만으로 다시 그려지는지.
      this._texture.needsUpdate = true;
    } else {
      this.update();
    }
  }

  buildMaterial() {
    var ref = this.component.ref;

    var params: any = {};

    if (ref) {
      // TODO 참조의 canvas를 가져오는 우아한 방법을 찾아보자.
      var texture = new THREE.Texture(ref._layer.canvas);

      texture.needsUpdate = true;

      params = {
        map: texture
      };
    }

    const material = new THREE.MeshBasicMaterial(params);

    material.transparent = true;
    // material.transparent = false;
    material.side = THREE.DoubleSide;
    material.blending = THREE.NormalBlending;

    return material;
  }
}

export default class GlobalRef extends Component {
  static get type() {
    return "global-ref";
  }

  static readonly NATURE = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: [
      {
        type: "string",
        label: "scene-number",
        name: "ref",
        placeholder: "SCENE-1"
      },
      {
        type: "select",
        label: "fit",
        name: "fit",
        property: {
          options: ["both", "ratio"]
        }
      }
    ],
    "value-property": "ref"
  };

  dispose() {
    this._releaseRef();
    super.dispose();
  }

  /**
   * property isDomComponent
   * readonly
   */
  get isDomComponent(): boolean {
    return true;
  }

  buildObject3D() {
    return new RealObjectRef(this);
  }

  private _ref;
  private _waiting;

  get ref() {
    if (this._ref || this._waiting) return this._ref;

    var provider = this.root.refProvider;
    var refname = this.getState("ref");

    if (provider && refname) {
      this._waiting = true;
      provider.get(refname, true).then(
        ref => {
          this._ref = ref;
          this._ref._layer.on("redraw", this.onredraw_ref, this);

          this._ref.target = this.domElement;

          this.object3D.update();
          delete this._waiting;

          // TODO remove below, 위의 redraw 이벤트를 활용하거나, VR 렌더링 문제를 수정.
          setInterval(() => {
            this.object3D.update();
            this.invalidate();
          }, 1000);
        },
        error => {
          delete this._waiting;
        }
      );
    } else {
      setTimeout(() => {
        this.object3D.update();
      }, 100);
    }

    return this._ref;
  }

  _releaseRef() {
    if (this._ref && this._ref.release) {
      this._ref._layer.off("redraw", this.onredraw_ref, this);
      this._ref.release();
    }
    delete this._ref;
  }

  onredraw_ref() {
    (this.object3D as RealObjectRef).needTextureUpdate();
    this.invalidate();
  }

  onchangeref(after, before) {
    this._releaseRef();
    this.object3D.update();
  }

  /* isDomComponent 가 true인 경우는 cssObject3D getter를 구현해야 한다. */
  get cssObject3D() {
    return (this.object3D as any).cssObject3D;
  }

  private _domElement;

  get domElement() {
    if (!this._domElement) {
      this._domElement = this.createElement();
    }
    return this._domElement;
  }

  createElement() {
    var element = document.createElement("div");

    /* mouse event를 받지 못하게 한다. */
    element.style.pointerEvents = "none";

    return element;
  }
}

Component.register(GlobalRef.type, GlobalRef);
