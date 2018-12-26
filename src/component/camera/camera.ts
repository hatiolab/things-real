import * as THREE from "three";

const DEFAULT = {
  active: false,
  far: 100000,
  fov: 80,
  near: 0.005,
  spectator: false,
  zoom: 1
};

export function createCamera(parent, options) {
  var camera = new THREE.PerspectiveCamera();
  parent.camera = camera;
  updateCamera(camera, options);

  return camera;
}

export function updateCamera(camera, options) {
  var {
    near = DEFAULT.near,
    far = DEFAULT.far,
    fov = DEFAULT.fov,
    zoom = DEFAULT.zoom,
    spectator = DEFAULT.spectator,
    active = DEFAULT.active,
    aspect = window.innerWidth / window.innerHeight
  } = options;

  camera.aspect = aspect;
  camera.far = far;
  camera.fov = fov;
  camera.near = near;
  camera.zoom = zoom;

  camera.updateProjectionMatrix();
}
