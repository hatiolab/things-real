import * as THREE from "three";
import Component from "../component";

const DEFAULT = {
  active: false,
  far: 100000,
  fov: 80,
  near: 0.005,
  spectator: false,
  zoom: 1
};

export default class Camera {
  private _component: Component;
  private _camera: THREE.PerspectiveCamera;

  constructor(component: Component) {
    this._component = component;
  }

  dispose() {
    // removeObject3d(this.camera)
  }

  setup() {}

  get component() {
    return this._component;
  }

  get camera() {
    if (!this._camera) {
      this._camera = new THREE.PerspectiveCamera();
      this.updateCamera();
    }

    return this._camera;
  }

  updateCamera() {
    var { width, height } = this.component.root.state;

    var {
      near = DEFAULT.near,
      far = DEFAULT.far,
      fov = DEFAULT.fov,
      zoom = DEFAULT.zoom,
      spectator = DEFAULT.spectator,
      active = DEFAULT.active,
      aspect = width / height
    } = this.component.state.camera;

    var camera = this.camera;

    // Update properties.
    camera.aspect = aspect;
    camera.far = far;
    camera.fov = fov;
    camera.near = near;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    if (active) {
      this.updateActiveCamera();
    }

    if (spectator) {
      this.updateSpectatorCamera();
    }
  }

  updateActiveCamera() {}

  updateSpectatorCamera() {}
}
