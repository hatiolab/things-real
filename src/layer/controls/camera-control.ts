import * as THREE from "three";

export default class CameraController {
  // Save ortho camera FOV / position before switching to restore later.
  private orthoCameraMemory = {
    left: {
      position: new THREE.Vector3(-1000, 0, 0),
      rotation: new THREE.Euler()
    },
    right: {
      position: new THREE.Vector3(1000, 0, 0),
      rotation: new THREE.Euler()
    },
    top: {
      position: new THREE.Vector3(0, 1000, 0),
      rotation: new THREE.Euler()
    },
    bottom: {
      position: new THREE.Vector3(0, -1000, 0),
      rotation: new THREE.Euler()
    },
    back: {
      position: new THREE.Vector3(0, 0, -1000),
      rotation: new THREE.Euler()
    },
    front: {
      position: new THREE.Vector3(0, 0, 1000),
      rotation: new THREE.Euler()
    }
  };

  private cameras: { perspective: THREE.Camera; ortho: THREE.Camera } = {
    perspective: undefined,
    ortho: undefined
  };

  private currentCamera;
  private currentOrthoDir;

  private layer;

  constructor(layer) {
    this.layer = layer;

    this.initCameras();
  }

  dispose() {}

  /**
   * Initialize various cameras, store original one.
   */
  initCameras() {
    // Create Inspector camera.
    var { width, height } = this.layer.rootContainer.state;

    const perspectiveCamera = new THREE.PerspectiveCamera();
    perspectiveCamera.far = 20000;
    perspectiveCamera.near = 0.01;
    perspectiveCamera.position.set(0, height, (height * 3) / 4);
    perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
    perspectiveCamera.updateMatrixWorld(false);

    // let frustum = Math.max(width, height) / 2;
    // this._defaultCamera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 30000);
    // this._defaultCamera.position.set(0, frustum * 2, 0);
    // this._defaultCamera.position.set(0, frustum * 2, frustum * 2);
    // this._defaultCamera.position.set(0, 0, frustum * 2);

    const orthoCamera = new THREE.OrthographicCamera(
      -width,
      width,
      height,
      -height,
      0.01,
      20000
    );

    this.cameras = {
      perspective: perspectiveCamera,
      ortho: orthoCamera
    };
  }

  switchCamera(
    camera: "perspective" | "orthographic" | THREE.Camera = "perspective",
    dir?: "left" | "top" | "bottom" | "right"
  ) {
    if (camera === "perspective") {
      this.saveOrthoCamera(this.currentCamera, this.currentOrthoDir);
      camera = this.cameras.perspective;
    } else if (camera === "orthographic") {
      this.saveOrthoCamera(this.currentCamera, this.currentOrthoDir);
      camera = this.cameras.ortho;
      this.currentOrthoDir = dir;
      this.setOrthoCamera(this.cameras.ortho, dir);

      // Set initial rotation for the respective orthographic camera.
      if (
        camera.rotation.x === 0 &&
        camera.rotation.y === 0 &&
        camera.rotation.z === 0
      ) {
        camera.lookAt(0, 0, 0);
      }
    } else {
      this.saveOrthoCamera(this.currentCamera, this.currentOrthoDir);
    }

    this.layer.activeCamera = this.currentCamera = camera;
  }

  private saveOrthoCamera(camera, dir) {
    if (camera !== this.cameras.ortho) {
      return;
    }
    const info = this.orthoCameraMemory[dir];
    info.position.copy(camera.position);
    info.rotation.copy(camera.rotation);
    info.left = camera.left;
    info.right = camera.right;
    info.top = camera.top;
    info.bottom = camera.bottom;
  }

  private setOrthoCamera(camera, dir) {
    var { width, height } = this.layer.rootContainer.state;

    const targetEl = this.layer.target;
    const ratio = targetEl.offsetWidth / targetEl.offsetHeight;

    const info = this.orthoCameraMemory[dir];

    camera.left = info.left || -width;
    camera.right = info.right || width;
    camera.top = info.top || height;
    camera.bottom = info.bottom || -height;
    camera.position.copy(info.position);
    camera.rotation.copy(info.rotation);
  }
}
