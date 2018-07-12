/**
 * @author arodic / https://github.com/arodic
 */

import * as THREE from 'three'
import {
  TransformGizmoTranslate,
  TransformGizmoRotate,
  TransformGizmoScale
} from './transform-gizmo-controls'

var TransformControls = function (camera, domElement, scene) {

  // TODO: Make non-uniform scale and rotate play nice in hierarchies
  // TODO: ADD RXYZ contol

  THREE.Object3D.call(this);

  domElement = (domElement !== undefined) ? domElement : document;

  this.object = undefined;
  this.visible = false;
  this.translationSnap = null;
  this.rotationSnap = null;
  this.space = "world";
  this.size = 1;
  this.axis = null;

  var scope = this;

  var _mode = "translate";

  var _gizmo = {

    "translate": new TransformGizmoTranslate(),
    "rotate": new TransformGizmoRotate(),
    "scale": new TransformGizmoScale()
  };

  for (var type in _gizmo) {

    var gizmoObj = _gizmo[type];

    gizmoObj.visible = (type === _mode);
    this.add(gizmoObj);
  }

  var changeEvent = { type: "change" };
  var mouseDownEvent = { type: "mouseDown" };
  var mouseUpEvent = { type: "mouseUp", mode: _mode };
  var objectChangeEvent = { type: "objectChange" };

  var ray = new THREE.Raycaster();
  var pointerVector = new THREE.Vector2();

  var point = new THREE.Vector3();
  var offset = new THREE.Vector3();

  var rotation = new THREE.Vector3();
  var offsetRotation = new THREE.Vector3();
  var scale = 1;

  var lookAtMatrix = new THREE.Matrix4();
  var eye = new THREE.Vector3();

  var tempMatrix = new THREE.Matrix4();
  var tempVector = new THREE.Vector3();
  var tempQuaternion = new THREE.Quaternion();
  var unitX = new THREE.Vector3(1, 0, 0);
  var unitY = new THREE.Vector3(0, 1, 0);
  var unitZ = new THREE.Vector3(0, 0, 1);

  var quaternionXYZ = new THREE.Quaternion();
  var quaternionX = new THREE.Quaternion();
  var quaternionY = new THREE.Quaternion();
  var quaternionZ = new THREE.Quaternion();
  var quaternionE = new THREE.Quaternion();

  var oldPosition = new THREE.Vector3();
  var oldScale = new THREE.Vector3();
  var oldRotationMatrix = new THREE.Matrix4();

  var parentRotationMatrix = new THREE.Matrix4();
  var parentScale = new THREE.Vector3();

  var worldPosition = new THREE.Vector3();
  var worldRotation = new THREE.Euler();
  var worldRotationMatrix = new THREE.Matrix4();
  var camPosition = new THREE.Vector3();
  var camRotation = new THREE.Euler();

  // selection box
  var selectionBox = new THREE.BoxHelper();

  selectionBox.material.depthTest = false;
  selectionBox.material.transparent = true;
  selectionBox.material.color.set(0x1faaf2);
  selectionBox.visible = false;

  scene.add(selectionBox);

  this.dispose = function () {
  };

  this.attach = function (object) {

    this.object = object;
    this.visible = true;
    this.update();

    selectionBox.setFromObject(object).update();
    selectionBox.visible = true;

    scope.dispatchEvent(changeEvent);
  };

  this.detach = function () {

    this.object = undefined;
    this.visible = false;
    this.axis = null;

    selectionBox.visible = false;

    scope.dispatchEvent(changeEvent);
  };

  this.getMode = function () {

    return _mode;
  };

  this.setMode = function (mode) {

    _mode = mode ? mode : _mode;

    if (_mode === "scale") scope.space = "local";

    for (var type in _gizmo) _gizmo[type].visible = (type === _mode);

    this.update();
    scope.dispatchEvent(changeEvent);
  };

  this.setTranslationSnap = function (translationSnap) {

    scope.translationSnap = translationSnap;
  };

  this.setRotationSnap = function (rotationSnap) {

    scope.rotationSnap = rotationSnap;
  };

  this.setSize = function (size) {

    scope.size = size;
    this.update();
    scope.dispatchEvent(changeEvent);
  };

  this.setSpace = function (space) {

    scope.space = space;
    this.update();
    scope.dispatchEvent(changeEvent);
  };

  this.getActivePickers = function () {

    if (scope.object === undefined) {
      return [];
    }
    return _gizmo[_mode].pickers.children;
  }

  this.update = function () {

    if (scope.object === undefined) {
      selectionBox.update();
      return;
    }

    scope.object.updateMatrixWorld();
    worldPosition.setFromMatrixPosition(scope.object.matrixWorld);
    worldRotation.setFromRotationMatrix(tempMatrix.extractRotation(scope.object.matrixWorld));

    camera.updateMatrixWorld();
    camPosition.setFromMatrixPosition(camera.matrixWorld);
    camRotation.setFromRotationMatrix(tempMatrix.extractRotation(camera.matrixWorld));

    scale = worldPosition.distanceTo(camPosition) / 6 * scope.size;
    this.position.copy(worldPosition);
    this.scale.set(scale, scale, scale);

    if (camera instanceof THREE.PerspectiveCamera) {

      eye.copy(camPosition).sub(worldPosition).normalize();

    } else if (camera instanceof THREE.OrthographicCamera) {

      eye.copy(camPosition).normalize();
    }

    if (scope.space === "local") {

      _gizmo[_mode].update(worldRotation, eye);

    } else if (scope.space === "world") {

      _gizmo[_mode].update(new THREE.Euler(), eye);
    }

    _gizmo[_mode].highlight(scope.axis);

    selectionBox.update();
  };

  // control의 위로 마우스가 지나갈 때, 컨트롤이 감지되었음(scope.axis == axis)을 알린다.
  this.onPointerHover = function (event) {

    if (scope.object === undefined || (event.button !== undefined && event.button !== 0)) return;

    var pointer = event.changedTouches ? event.changedTouches[0] : event;

    var intersect = intersectObjects(pointer, _gizmo[_mode].pickers.children);

    var axis = null;

    if (intersect) {

      axis = intersect.object.name;
    }

    if (scope.axis !== axis) {

      scope.axis = axis;
      scope.update();
      scope.dispatchEvent(changeEvent);
      scope.dispatchEvent(objectChangeEvent);
    }
  }

  this.onPointerDown = function (event) {
    if (scope.object === undefined || (event.button !== undefined && event.button !== 0)) return;

    var pointer = event.changedTouches ? event.changedTouches[0] : event;

    if (pointer.button === 0 || pointer.button === undefined) {

      var intersect = intersectObjects(pointer, _gizmo[_mode].pickers.children);

      if (intersect) {

        event.stopPropagation();

        scope.axis = intersect.object.name;

        scope.dispatchEvent(mouseDownEvent);

        scope.update();

        eye.copy(camPosition).sub(worldPosition).normalize();

        _gizmo[_mode].setActivePlane(scope.axis, eye);

        var planeIntersect = intersectObjects(pointer, [_gizmo[_mode].activePlane]);

        if (planeIntersect) {

          oldPosition.copy(scope.object.position);
          oldScale.copy(scope.object.scale);

          oldRotationMatrix.extractRotation(scope.object.matrix);
          worldRotationMatrix.extractRotation(scope.object.matrixWorld);

          parentRotationMatrix.extractRotation(scope.object.parent.matrixWorld);
          parentScale.setFromMatrixScale(tempMatrix.getInverse(scope.object.parent.matrixWorld));

          offset.copy(planeIntersect.point);
        }
      } else {
        this.detach();
      }
    }
  }

  this.onPointerDragMove = function (event) {

    if (scope.object === undefined || scope.axis === null || (event.button !== undefined && event.button !== 0)) return;

    var pointer = event.changedTouches ? event.changedTouches[0] : event;

    var planeIntersect = intersectObjects(pointer, [_gizmo[_mode].activePlane]);

    if (planeIntersect === false) return;

    // event.preventDefault();
    event.stopPropagation();

    point.copy(planeIntersect.point);

    if (_mode === "translate") {

      point.sub(offset);
      point.multiply(parentScale);

      if (scope.space === "local") {

        point.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

        if (scope.axis.search("X") === - 1) point.x = 0;
        if (scope.axis.search("Y") === - 1) point.y = 0;
        if (scope.axis.search("Z") === - 1) point.z = 0;

        point.applyMatrix4(oldRotationMatrix);

        scope.object.position.copy(oldPosition);
        scope.object.position.add(point);
      }

      if (scope.space === "world" || scope.axis.search("XYZ") !== - 1) {

        if (scope.axis.search("X") === - 1) point.x = 0;
        if (scope.axis.search("Y") === - 1) point.y = 0;
        if (scope.axis.search("Z") === - 1) point.z = 0;

        point.applyMatrix4(tempMatrix.getInverse(parentRotationMatrix));

        scope.object.position.copy(oldPosition);
        scope.object.position.add(point);
      }

      if (scope.translationSnap !== null) {

        if (scope.space === "local") {

          scope.object.position.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));
        }

        if (scope.axis.search("X") !== - 1) scope.object.position.x = Math.round(scope.object.position.x / scope.translationSnap) * scope.translationSnap;
        if (scope.axis.search("Y") !== - 1) scope.object.position.y = Math.round(scope.object.position.y / scope.translationSnap) * scope.translationSnap;
        if (scope.axis.search("Z") !== - 1) scope.object.position.z = Math.round(scope.object.position.z / scope.translationSnap) * scope.translationSnap;

        if (scope.space === "local") {

          scope.object.position.applyMatrix4(worldRotationMatrix);
        }
      }
    } else if (_mode === "scale") {

      point.sub(offset);
      point.multiply(parentScale);

      if (scope.space === "local") {

        if (scope.axis === "XYZ") {

          scale = 1 + ((point.y) / Math.max(oldScale.x, oldScale.y, oldScale.z) / 100);

          scope.object.scale.x = oldScale.x * scale;
          scope.object.scale.y = oldScale.y * scale;
          scope.object.scale.z = oldScale.z * scale;
        } else {

          point.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

          if (scope.axis === "X") scope.object.scale.x = oldScale.x * (1 + point.x / oldScale.x / 100);
          if (scope.axis === "Y") scope.object.scale.y = oldScale.y * (1 + point.y / oldScale.y / 100);
          if (scope.axis === "Z") scope.object.scale.z = oldScale.z * (1 + point.z / oldScale.z / 100);
        }
      }
    } else if (_mode === "rotate") {

      point.sub(worldPosition);
      point.multiply(parentScale);
      tempVector.copy(offset).sub(worldPosition);
      tempVector.multiply(parentScale);

      if (scope.axis === "E") {

        point.applyMatrix4(tempMatrix.getInverse(lookAtMatrix));
        tempVector.applyMatrix4(tempMatrix.getInverse(lookAtMatrix));

        rotation.set(Math.atan2(point.z, point.y), Math.atan2(point.x, point.z), Math.atan2(point.y, point.x));
        offsetRotation.set(Math.atan2(tempVector.z, tempVector.y), Math.atan2(tempVector.x, tempVector.z), Math.atan2(tempVector.y, tempVector.x));

        tempQuaternion.setFromRotationMatrix(tempMatrix.getInverse(parentRotationMatrix));

        quaternionE.setFromAxisAngle(eye, rotation.z - offsetRotation.z);
        quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionE);
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

        scope.object.quaternion.copy(tempQuaternion);

      } else if (scope.axis === "XYZE") {

        quaternionE.setFromEuler(point.clone().cross(tempVector).normalize()); // rotation axis

        tempQuaternion.setFromRotationMatrix(tempMatrix.getInverse(parentRotationMatrix));
        quaternionX.setFromAxisAngle(quaternionE, - point.clone().angleTo(tempVector));
        quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

        scope.object.quaternion.copy(tempQuaternion);

      } else if (scope.space === "local") {

        point.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

        tempVector.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

        rotation.set(Math.atan2(point.z, point.y), Math.atan2(point.x, point.z), Math.atan2(point.y, point.x));
        offsetRotation.set(Math.atan2(tempVector.z, tempVector.y), Math.atan2(tempVector.x, tempVector.z), Math.atan2(tempVector.y, tempVector.x));

        quaternionXYZ.setFromRotationMatrix(oldRotationMatrix);

        if (scope.rotationSnap !== null) {

          quaternionX.setFromAxisAngle(unitX, Math.round((rotation.x - offsetRotation.x) / scope.rotationSnap) * scope.rotationSnap);
          quaternionY.setFromAxisAngle(unitY, Math.round((rotation.y - offsetRotation.y) / scope.rotationSnap) * scope.rotationSnap);
          quaternionZ.setFromAxisAngle(unitZ, Math.round((rotation.z - offsetRotation.z) / scope.rotationSnap) * scope.rotationSnap);
        } else {

          quaternionX.setFromAxisAngle(unitX, rotation.x - offsetRotation.x);
          quaternionY.setFromAxisAngle(unitY, rotation.y - offsetRotation.y);
          quaternionZ.setFromAxisAngle(unitZ, rotation.z - offsetRotation.z);
        }

        if (scope.axis === "X") quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionX);
        if (scope.axis === "Y") quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionY);
        if (scope.axis === "Z") quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionZ);

        scope.object.quaternion.copy(quaternionXYZ);

      } else if (scope.space === "world") {

        rotation.set(Math.atan2(point.z, point.y), Math.atan2(point.x, point.z), Math.atan2(point.y, point.x));
        offsetRotation.set(Math.atan2(tempVector.z, tempVector.y), Math.atan2(tempVector.x, tempVector.z), Math.atan2(tempVector.y, tempVector.x));

        tempQuaternion.setFromRotationMatrix(tempMatrix.getInverse(parentRotationMatrix));

        if (scope.rotationSnap !== null) {

          quaternionX.setFromAxisAngle(unitX, Math.round((rotation.x - offsetRotation.x) / scope.rotationSnap) * scope.rotationSnap);
          quaternionY.setFromAxisAngle(unitY, Math.round((rotation.y - offsetRotation.y) / scope.rotationSnap) * scope.rotationSnap);
          quaternionZ.setFromAxisAngle(unitZ, Math.round((rotation.z - offsetRotation.z) / scope.rotationSnap) * scope.rotationSnap);
        } else {

          quaternionX.setFromAxisAngle(unitX, rotation.x - offsetRotation.x);
          quaternionY.setFromAxisAngle(unitY, rotation.y - offsetRotation.y);
          quaternionZ.setFromAxisAngle(unitZ, rotation.z - offsetRotation.z);
        }

        quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

        if (scope.axis === "X") tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
        if (scope.axis === "Y") tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
        if (scope.axis === "Z") tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);

        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

        scope.object.quaternion.copy(tempQuaternion);
      }
    }

    scope.update();
    scope.dispatchEvent(changeEvent);
    scope.dispatchEvent(objectChangeEvent);
  }

  function intersectObjects(pointer, objects) {

    var rect = domElement.getBoundingClientRect();

    var x = pointer.offsetX / rect.width;
    var y = pointer.offsetY / rect.height;

    pointerVector.set((x * 2) - 1, - (y * 2) + 1);
    ray.setFromCamera(pointerVector, camera);

    var intersections = ray.intersectObjects(objects, true);

    return intersections[0] ? intersections[0] : false;
  }
};

TransformControls.prototype = Object.create(THREE.Object3D.prototype);
TransformControls.prototype.constructor = TransformControls;

export default TransformControls