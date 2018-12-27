import * as THREE from "three";

const DEFAULT = {
  far: 100000,
  fov: 80,
  near: 1,
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
    zoom = DEFAULT.zoom
  } = options;

  camera.far = far;
  camera.fov = fov;
  camera.near = near;
  camera.zoom = zoom;
}
