/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";

import RealObjectCamera from "./threed/real-object-camera";

export default class Camera extends Component {
  static get type() {
    return "camera";
  }

  static readonly NATURE = {
    mutable: false,
    resizable: true,
    rotatable: true,
    properties: [
      {
        type: "number",
        label: "far",
        name: "far",
        placeholder: "100000"
      },
      {
        type: "number",
        label: "near",
        name: "near",
        placeholder: "1"
      },
      {
        type: "number",
        label: "fov",
        name: "fov",
        placeholder: "80"
      },
      {
        type: "number",
        label: "zoom",
        name: "zoom",
        placeholder: "1"
      },
      {
        type: "checkbox",
        label: "active",
        name: "active"
      }
    ],
    "value-property": "ref"
  };

  // ready() {
  //   if (this.state.active) {
  //     this.trigger("active-camera", this, this.object3D);
  //   }
  // }

  get object3DCamera() {
    return (this.object3D as RealObjectCamera).camera;
  }

  buildObject3D() {
    return new RealObjectCamera(this);
  }

  onchangefar() {
    this.object3D.update();
  }
  onchangenear() {
    this.object3D.update();
  }
  onchangezoom() {
    this.object3D.update();
  }
  onchangefov() {
    this.object3D.update();
  }

  onchangeactive(after, before) {
    this.trigger(
      after ? "active-camera" : "deactive-camera",
      (this.object3D as RealObjectCamera).camera
    );
  }
}

Component.register(Camera.type, Camera);
