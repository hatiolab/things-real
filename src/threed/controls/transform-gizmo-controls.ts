/**
 * @author arodic / https://github.com/arodic
 */

import * as THREE from 'three'

class GizmoMaterial extends THREE.MeshBasicMaterial {

  constructor(parameters) {

    super();

    this.depthTest = false;
    this.depthWrite = false;
    this.fog = false;
    this.side = THREE.FrontSide;
    this.transparent = true;

    this.setValues(parameters);

    this.oldColor = this.color.clone();
    this.oldOpacity = this.opacity;
  }

  highlight(highlighted) {

    if (highlighted) {

      this.color.setRGB(1, 1, 0);
      this.opacity = 1;
    } else {

      this.color.copy(this.oldColor);
      this.opacity = this.oldOpacity;
    }
  }
}

class GizmoLineMaterial extends THREE.LineBasicMaterial {

  constructor(parameters) {

    super();

    this.depthTest = false;
    this.depthWrite = false;
    this.fog = false;
    this.transparent = true;
    this.linewidth = 1; // Due to limitations in the ANGLE layer, with the WebGL renderer on Windows platforms linewidth will always be 1 regardless of the set value.

    this.setValues(parameters);

    this.oldColor = this.color.clone();
    this.oldOpacity = this.opacity;
  }

  highlight(highlighted) {

    if (highlighted) {

      this.color.setRGB(1, 1, 0);
      this.opacity = 1;
    } else {

      this.color.copy(this.oldColor);
      this.opacity = this.oldOpacity;
    }
  }
}

var pickerMaterial = new GizmoMaterial({ visible: false, transparent: false });

class TransformGizmo extends THREE.Object3D {

  constructor() {

    super();

    this.init();
  }

  init() {
    this.handles = new THREE.Object3D();
    this.pickers = new THREE.Object3D();
    this.planes = new THREE.Object3D();

    this.add(this.handles);
    this.add(this.pickers);
    this.add(this.planes);

    //// PLANES

    var planeGeometry = new THREE.PlaneBufferGeometry(50, 50, 2, 2);
    var planeMaterial = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });

    var planes = {
      "XY": new THREE.Mesh(planeGeometry, planeMaterial),
      "YZ": new THREE.Mesh(planeGeometry, planeMaterial),
      "XZ": new THREE.Mesh(planeGeometry, planeMaterial),
      "XYZE": new THREE.Mesh(planeGeometry, planeMaterial)
    };

    this.activePlane = planes["XYZE"];

    planes["YZ"].rotation.set(0, Math.PI / 2, 0);
    planes["XZ"].rotation.set(- Math.PI / 2, 0, 0);

    for (var i in planes) {

      planes[i].name = i;
      this.planes.add(planes[i]);
      this.planes[i] = planes[i];
    }

    //// HANDLES AND PICKERS

    var setupGizmos = function (gizmoMap, parent) {

      for (var name in gizmoMap) {

        for (i = gizmoMap[name].length; i--;) {

          var object = gizmoMap[name][i][0];
          var position = gizmoMap[name][i][1];
          var rotation = gizmoMap[name][i][2];

          object.name = name;

          object.renderOrder = Infinity; // avoid being hidden by other transparent objects

          if (position) object.position.set(position[0], position[1], position[2]);
          if (rotation) object.rotation.set(rotation[0], rotation[1], rotation[2]);

          parent.add(object);
        }
      }
    };

    setupGizmos(this.handleGizmos, this.handles);
    setupGizmos(this.pickerGizmos, this.pickers);

    // reset Transformations

    this.traverse(function (child) {

      if (child instanceof THREE.Mesh) {

        child.updateMatrix();

        var tempGeometry = child.geometry.clone();
        tempGeometry.applyMatrix(child.matrix);
        child.geometry = tempGeometry;

        child.position.set(0, 0, 0);
        child.rotation.set(0, 0, 0);
        child.scale.set(1, 1, 1);
      }
    });
  }

  highlight(axis) {

    this.traverse(function (child) {

      if (child.material && child.material.highlight) {

        if (child.name === axis) {

          child.material.highlight(true);
        } else {

          child.material.highlight(false);
        }
      }
    });
  }

  update(rotation, eye) {

    var vec1 = new THREE.Vector3(0, 0, 0);
    var vec2 = new THREE.Vector3(0, 1, 0);
    var lookAtMatrix = new THREE.Matrix4();

    this.traverse(function (child) {

      if (child.name.search("E") !== - 1) {

        child.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(eye, vec1, vec2));
      } else if (child.name.search("X") !== - 1 || child.name.search("Y") !== - 1 || child.name.search("Z") !== - 1) {

        child.quaternion.setFromEuler(rotation);
      }
    });
  }
}

export class TransformGizmoTranslate extends TransformGizmo {

  constructor() {
    super();

    var arrowGeometry = new THREE.ConeBufferGeometry(0.05, 0.2, 12, 1, false);
    arrowGeometry.translate(0, 0.5, 0);

    var lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));

    var lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));

    var lineZGeometry = new THREE.BufferGeometry();
    lineZGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3));

    this.handleGizmos = {

      X: [
        [new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0xff0000 })), [0.5, 0, 0], [0, 0, - Math.PI / 2]],
        [new THREE.Line(lineXGeometry, new GizmoLineMaterial({ color: 0xff0000 }))]
      ],

      Y: [
        [new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x00ff00 })), [0, 0.5, 0]],
        [new THREE.Line(lineYGeometry, new GizmoLineMaterial({ color: 0x00ff00 }))]
      ],

      Z: [
        [new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x0000ff })), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new THREE.Line(lineZGeometry, new GizmoLineMaterial({ color: 0x0000ff }))]
      ],

      XYZ: [
        [new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new GizmoMaterial({ color: 0xffffff, opacity: 0.25 })), [0, 0, 0], [0, 0, 0]]
      ],

      XY: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new GizmoMaterial({ color: 0xffff00, opacity: 0.25 })), [0.15, 0.15, 0]]
      ],

      YZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new GizmoMaterial({ color: 0x00ffff, opacity: 0.25 })), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],

      XZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new GizmoMaterial({ color: 0xff00ff, opacity: 0.25 })), [0.15, 0, 0.15], [- Math.PI / 2, 0, 0]]
      ]

    };

    this.pickerGizmos = {

      X: [
        [new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [0.6, 0, 0], [0, 0, - Math.PI / 2]]
      ],

      Y: [
        [new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [0, 0.6, 0]]
      ],

      Z: [
        [new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
      ],

      XYZ: [
        [new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), pickerMaterial)]
      ],

      XY: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), pickerMaterial), [0.2, 0.2, 0]]
      ],

      YZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), pickerMaterial), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]
      ],

      XZ: [
        [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), pickerMaterial), [0.2, 0, 0.2], [- Math.PI / 2, 0, 0]]
      ]
    };

    this.init();
  }

  setActivePlane(axis, eye) {

    var tempMatrix = new THREE.Matrix4();
    eye.applyMatrix4(tempMatrix.getInverse(tempMatrix.extractRotation(this.planes["XY"].matrixWorld)));

    if (axis === "X") {

      this.activePlane = this.planes["XY"];

      if (Math.abs(eye.y) > Math.abs(eye.z))
        this.activePlane = this.planes["XZ"];
    }

    if (axis === "Y") {

      this.activePlane = this.planes["XY"];

      if (Math.abs(eye.x) > Math.abs(eye.z))
        this.activePlane = this.planes["YZ"];
    }

    if (axis === "Z") {

      this.activePlane = this.planes["XZ"];

      if (Math.abs(eye.x) > Math.abs(eye.y))
        this.activePlane = this.planes["YZ"];
    }

    if (axis === "XYZ")
      this.activePlane = this.planes["XYZE"];

    if (axis === "XY")
      this.activePlane = this.planes["XY"];

    if (axis === "YZ")
      this.activePlane = this.planes["YZ"];

    if (axis === "XZ")
      this.activePlane = this.planes["XZ"];
  }
};

export class TransformGizmoRotate extends TransformGizmo {

  constructor() {
    super();

    var CircleGeometry = function (radius, facing, arc) {

      var geometry = new THREE.BufferGeometry();
      var vertices = [];
      arc = arc ? arc : 1;

      for (var i = 0; i <= 64 * arc; ++i) {

        if (facing === 'x')
          vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
        if (facing === 'y')
          vertices.push(Math.cos(i / 32 * Math.PI) * radius, 0, Math.sin(i / 32 * Math.PI) * radius);
        if (facing === 'z')
          vertices.push(Math.sin(i / 32 * Math.PI) * radius, Math.cos(i / 32 * Math.PI) * radius, 0);
      }

      geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return geometry;
    };

    this.handleGizmos = {

      X: [
        [new THREE.Line(new CircleGeometry(1, 'x', 0.5), new GizmoLineMaterial({ color: 0xff0000 }))]
      ],

      Y: [
        [new THREE.Line(new CircleGeometry(1, 'y', 0.5), new GizmoLineMaterial({ color: 0x00ff00 }))]
      ],

      Z: [
        [new THREE.Line(new CircleGeometry(1, 'z', 0.5), new GizmoLineMaterial({ color: 0x0000ff }))]
      ],

      E: [
        [new THREE.Line(new CircleGeometry(1.25, 'z', 1), new GizmoLineMaterial({ color: 0xcccc00 }))]
      ],

      XYZE: [
        [new THREE.Line(new CircleGeometry(1, 'z', 1), new GizmoLineMaterial({ color: 0x787878 }))]
      ]
    };

    this.pickerGizmos = {

      X: [
        [new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 4, 12, Math.PI), pickerMaterial), [0, 0, 0], [0, - Math.PI / 2, - Math.PI / 2]]
      ],

      Y: [
        [new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 4, 12, Math.PI), pickerMaterial), [0, 0, 0], [Math.PI / 2, 0, 0]]
      ],

      Z: [
        [new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 4, 12, Math.PI), pickerMaterial), [0, 0, 0], [0, 0, - Math.PI / 2]]
      ],

      E: [
        [new THREE.Mesh(new THREE.TorusBufferGeometry(1.25, 0.12, 2, 24), pickerMaterial)]
      ],

      XYZE: [
        [new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 2, 24), pickerMaterial)]
      ]
    };

    this.pickerGizmos.XYZE[0][0].visible = false; // disable XYZE picker gizmo

    this.init();
  }

  setActivePlane(axis) {

    if (axis === "E")
      this.activePlane = this.planes["XYZE"];

    if (axis === "X")
      this.activePlane = this.planes["YZ"];

    if (axis === "Y")
      this.activePlane = this.planes["XZ"];

    if (axis === "Z")
      this.activePlane = this.planes["XY"];
  }

  update(rotation, eye2) {
    super.update(rotation, eye2);

    var tempMatrix = new THREE.Matrix4();
    var worldRotation = new THREE.Euler(0, 0, 1);
    var tempQuaternion = new THREE.Quaternion();
    var unitX = new THREE.Vector3(1, 0, 0);
    var unitY = new THREE.Vector3(0, 1, 0);
    var unitZ = new THREE.Vector3(0, 0, 1);
    var quaternionX = new THREE.Quaternion();
    var quaternionY = new THREE.Quaternion();
    var quaternionZ = new THREE.Quaternion();
    var eye = eye2.clone();

    worldRotation.copy(this.planes["XY"].rotation);
    tempQuaternion.setFromEuler(worldRotation);

    tempMatrix.makeRotationFromQuaternion(tempQuaternion).getInverse(tempMatrix);
    eye.applyMatrix4(tempMatrix);

    this.traverse(function (child) {

      tempQuaternion.setFromEuler(worldRotation);

      if (child.name === "X") {

        quaternionX.setFromAxisAngle(unitX, Math.atan2(- eye.y, eye.z));
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
        child.quaternion.copy(tempQuaternion);
      }

      if (child.name === "Y") {

        quaternionY.setFromAxisAngle(unitY, Math.atan2(eye.x, eye.z));
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
        child.quaternion.copy(tempQuaternion);
      }

      if (child.name === "Z") {

        quaternionZ.setFromAxisAngle(unitZ, Math.atan2(eye.y, eye.x));
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);
        child.quaternion.copy(tempQuaternion);
      }
    });
  }
}

export class TransformGizmoScale extends TransformGizmo {
  constructor() {
    super();

    var arrowGeometry = new THREE.BoxBufferGeometry(0.125, 0.125, 0.125);
    arrowGeometry.translate(0, 0.5, 0);

    var lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));

    var lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));

    var lineZGeometry = new THREE.BufferGeometry();
    lineZGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3));

    this.handleGizmos = {

      X: [
        [new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0xff0000 })), [0.5, 0, 0], [0, 0, - Math.PI / 2]],
        [new THREE.Line(lineXGeometry, new GizmoLineMaterial({ color: 0xff0000 }))]
      ],

      Y: [
        [new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x00ff00 })), [0, 0.5, 0]],
        [new THREE.Line(lineYGeometry, new GizmoLineMaterial({ color: 0x00ff00 }))]
      ],

      Z: [
        [new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x0000ff })), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new THREE.Line(lineZGeometry, new GizmoLineMaterial({ color: 0x0000ff }))]
      ],

      XYZ: [
        [new THREE.Mesh(new THREE.BoxBufferGeometry(0.125, 0.125, 0.125), new GizmoMaterial({ color: 0xffffff, opacity: 0.25 }))]
      ]
    };

    this.pickerGizmos = {

      X: [
        [new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [0.6, 0, 0], [0, 0, - Math.PI / 2]]
      ],

      Y: [
        [new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [0, 0.6, 0]]
      ],

      Z: [
        [new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
      ],

      XYZ: [
        [new THREE.Mesh(new THREE.BoxBufferGeometry(0.4, 0.4, 0.4), pickerMaterial)]
      ]
    };

    this.init();
  }

  setActivePlane(axis, eye) {

    var tempMatrix = new THREE.Matrix4();
    eye.applyMatrix4(tempMatrix.getInverse(tempMatrix.extractRotation(this.planes["XY"].matrixWorld)));

    if (axis === "X") {

      this.activePlane = this.planes["XY"];
      if (Math.abs(eye.y) > Math.abs(eye.z))
        this.activePlane = this.planes["XZ"];
    }

    if (axis === "Y") {

      this.activePlane = this.planes["XY"];
      if (Math.abs(eye.x) > Math.abs(eye.z))
        this.activePlane = this.planes["YZ"];
    }

    if (axis === "Z") {

      this.activePlane = this.planes["XZ"];
      if (Math.abs(eye.x) > Math.abs(eye.y))
        this.activePlane = this.planes["YZ"];
    }

    if (axis === "XYZ")
      this.activePlane = this.planes["XYZE"];
  }
}
