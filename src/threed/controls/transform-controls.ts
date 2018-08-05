/**
 * @author arodic / https://github.com/arodic
 */

import * as THREE from 'three'
import {
  TransformGizmoTranslate,
  TransformGizmoRotate,
  TransformGizmoScale
} from './transform-gizmo-controls'

var changeEvent = { type: 'change' }
var mouseDownEvent = { type: 'mouseDown' }
var mouseUpEvent = { type: 'mouseUp', mode: this._mode }
var objectChangeEvent = { type: 'objectChange' }

export default class TransformControls extends THREE.Object3D {
  public translationSnap = null
  public rotationSnap = null
  public object = undefined

  private space = 'world'
  private axis = null
  private camera

  private _size = 1
  private _mode = 'translate'
  private dragging = false
  private gizmo = {
    'translate': new TransformGizmoTranslate(),
    'rotate': new TransformGizmoRotate(),
    'scale': new TransformGizmoScale()
  }
  // private boundBox: THREE.BoxHelper

  private ray = new THREE.Raycaster()
  private pointerVector = new THREE.Vector2()

  private point = new THREE.Vector3()
  private offset = new THREE.Vector3()

  private offsetRotation = new THREE.Vector3()

  private lookAtMatrix = new THREE.Matrix4()
  private eye = new THREE.Vector3()

  private tempMatrix = new THREE.Matrix4()
  private tempVector = new THREE.Vector3()
  private tempQuaternion = new THREE.Quaternion()
  private unitX = new THREE.Vector3(1, 0, 0)
  private unitY = new THREE.Vector3(0, 1, 0)
  private unitZ = new THREE.Vector3(0, 0, 1)

  private quaternionXYZ = new THREE.Quaternion()
  private quaternionX = new THREE.Quaternion()
  private quaternionY = new THREE.Quaternion()
  private quaternionZ = new THREE.Quaternion()
  private quaternionE = new THREE.Quaternion()

  private oldPosition = new THREE.Vector3()
  private oldScale = new THREE.Vector3()
  private oldRotationMatrix = new THREE.Matrix4()

  private parentRotationMatrix = new THREE.Matrix4()
  private parentScale = new THREE.Vector3()

  private worldPosition = new THREE.Vector3()
  private worldRotation = new THREE.Euler()
  private worldRotationMatrix = new THREE.Matrix4()
  private camPosition = new THREE.Vector3()
  private camRotation = new THREE.Euler()

  private domElement

  private boundOnPointerDown
  private boundOnPointerHover
  private boundOnPointerMove
  private boundOnPointerUp

  constructor(camera, domElement: HTMLElement | Document = document) {
    super()

    // TODO: Make non-uniform scale and rotate play nice in hierarchies
    // TODO: ADD RXYZ contol

    this.visible = false
    this.domElement = domElement
    this.camera = camera

    // gizmo objects
    for (var type in this.gizmo) {
      var gizmoObj = this.gizmo[type]

      gizmoObj.visible = (type === this._mode)
      this.add(gizmoObj)
    }

    // event handlers
    this.boundOnPointerDown = this.onPointerDown.bind(this)
    this.boundOnPointerHover = this.onPointerHover.bind(this)
    this.boundOnPointerMove = this.onPointerMove.bind(this)
    this.boundOnPointerUp = this.onPointerUp.bind(this)

    domElement.addEventListener('mousedown', this.boundOnPointerDown, false)
    domElement.addEventListener('touchstart', this.boundOnPointerDown, false)

    domElement.addEventListener('mousemove', this.boundOnPointerHover, false)
    domElement.addEventListener('touchmove', this.boundOnPointerHover, false)

    domElement.addEventListener('mousemove', this.boundOnPointerMove, false)
    domElement.addEventListener('touchmove', this.boundOnPointerMove, false)

    domElement.addEventListener('mouseup', this.boundOnPointerUp, false)
    domElement.addEventListener('mouseout', this.boundOnPointerUp, false)
    domElement.addEventListener('touchend', this.boundOnPointerUp, false)
    domElement.addEventListener('touchcancel', this.boundOnPointerUp, false)
    domElement.addEventListener('touchleave', this.boundOnPointerUp, false)
  }

  dispose() {

    var domElement = this.domElement

    domElement.removeEventListener('mousedown', this.boundOnPointerDown)
    domElement.removeEventListener('touchstart', this.boundOnPointerDown)

    domElement.removeEventListener('mousemove', this.boundOnPointerHover)
    domElement.removeEventListener('touchmove', this.boundOnPointerHover)

    domElement.removeEventListener('mousemove', this.boundOnPointerMove)
    domElement.removeEventListener('touchmove', this.boundOnPointerMove)

    domElement.removeEventListener('mouseup', this.boundOnPointerUp)
    domElement.removeEventListener('mouseout', this.boundOnPointerUp)
    domElement.removeEventListener('touchend', this.boundOnPointerUp)
    domElement.removeEventListener('touchcancel', this.boundOnPointerUp)
    domElement.removeEventListener('touchleave', this.boundOnPointerUp)
  }

  attach(object) {

    this.object = object
    this.visible = true;

    this.update()
  }

  detach() {

    this.object = undefined
    this.visible = false
    this.axis = null
  }

  get mode() {
    return this._mode
  }

  set mode(mode) {
    mode && (this._mode = mode)

    if (this._mode === 'scale')
      this.space = 'local'

    for (var type in this.gizmo)
      this.gizmo[type].visible = (type === this._mode)

    this.update()
    this.dispatchEvent(changeEvent)
  }

  get size() {
    return this._size
  }

  set size(size) {
    this._size = size
    this.update()
    this.dispatchEvent(changeEvent)
  }

  get activePickers() {
    return this.object ? this.gizmo[this.mode].pickers.children : []
  }

  setSpace(space) {
    this.space = space
    this.update()
    this.dispatchEvent(changeEvent)
  }

  update() {

    if (this.object === undefined) {
      return
    }

    this.object.updateMatrixWorld()
    this.worldPosition.setFromMatrixPosition(this.object.matrixWorld)
    this.worldRotation.setFromRotationMatrix(this.tempMatrix.extractRotation(this.object.matrixWorld))

    this.camera.updateMatrixWorld()
    this.camPosition.setFromMatrixPosition(this.camera.matrixWorld)
    this.camRotation.setFromRotationMatrix(this.tempMatrix.extractRotation(this.camera.matrixWorld))

    var nscale = this.worldPosition.distanceTo(this.camPosition) / 6 * this.size
    this.position.copy(this.worldPosition)
    this.scale.set(nscale, nscale, nscale)

    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.eye.copy(this.camPosition).sub(this.worldPosition).normalize()
    } else if (this.camera instanceof THREE.OrthographicCamera) {
      this.eye.copy(this.camPosition).normalize()
    }

    var gizmo = this.gizmo[this.mode]

    if (this.space === 'local') {
      gizmo.update(this.worldRotation, this.eye)
    } else if (this.space === 'world') {
      gizmo.update(new THREE.Euler(), this.eye)
    }

    gizmo.highlight(this.axis)
  }

  onPointerHover(event) {

    if (this.object === undefined || this.dragging === true || (event.button !== undefined && event.button !== 0))
      return

    var pointer = event.changedTouches ? event.changedTouches[0] : event

    var intersect = this.intersectObjects(pointer, this.gizmo[this.mode].pickers.children)

    var axis = null

    if (intersect) {
      axis = intersect.object.name
      event.preventDefault()
    }

    if (this.axis !== axis) {
      this.axis = axis
      this.update()
      this.dispatchEvent(changeEvent)
    }
  }

  onPointerDown(event) {

    if (this.object === undefined || this.dragging === true || (event.button !== undefined && event.button !== 0))
      return

    var pointer = event.changedTouches ? event.changedTouches[0] : event

    if (pointer.button === 0 || pointer.button === undefined) {

      var gizmo = this.gizmo[this.mode]
      var intersect = this.intersectObjects(pointer, gizmo.pickers.children)

      if (intersect) {

        event.preventDefault()
        event.stopPropagation()

        this.axis = intersect.object.name

        this.dispatchEvent(mouseDownEvent)

        this.update()

        this.eye.copy(this.camPosition).sub(this.worldPosition).normalize()

        gizmo.setActivePlane(this.axis, this.eye)

        var planeIntersect = this.intersectObjects(pointer, [gizmo.activePlane])

        if (planeIntersect) {

          this.oldPosition.copy(this.object.position)
          this.oldScale.copy(this.object.scale)

          this.oldRotationMatrix.extractRotation(this.object.matrix)
          this.worldRotationMatrix.extractRotation(this.object.matrixWorld)

          this.parentRotationMatrix.extractRotation(this.object.parent.matrixWorld)
          this.parentScale.setFromMatrixScale(this.tempMatrix.getInverse(this.object.parent.matrixWorld))

          this.offset.copy(planeIntersect.point)
        }
      }
    }

    this.dragging = true
  }

  onPointerMove(event) {

    if (this.object === undefined || this.axis === null || this.dragging === false || (event.button !== undefined && event.button !== 0))
      return

    var pointer = event.changedTouches ? event.changedTouches[0] : event

    var planeIntersect = this.intersectObjects(pointer, [this.gizmo[this.mode].activePlane])

    if (planeIntersect === false)
      return

    event.preventDefault()
    event.stopPropagation()

    this.point.copy(planeIntersect.point)

    if (this.mode === 'translate') {

      this.point.sub(this.offset)
      this.point.multiply(this.parentScale)

      if (this.space === 'local') {

        this.point.applyMatrix4(this.tempMatrix.getInverse(this.worldRotationMatrix))

        if (this.axis.search('X') === - 1) this.point.x = 0
        if (this.axis.search('Y') === - 1) this.point.y = 0
        if (this.axis.search('Z') === - 1) this.point.z = 0

        this.point.applyMatrix4(this.oldRotationMatrix)

        this.object.position.copy(this.oldPosition)
        this.object.position.add(this.point)
      }

      if (this.space === 'world' || this.axis.search('XYZ') !== - 1) {

        if (this.axis.search('X') === - 1) this.point.x = 0
        if (this.axis.search('Y') === - 1) this.point.y = 0
        if (this.axis.search('Z') === - 1) this.point.z = 0

        this.point.applyMatrix4(this.tempMatrix.getInverse(this.parentRotationMatrix))

        this.object.position.copy(this.oldPosition)
        this.object.position.add(this.point)
      }

      if (this.translationSnap !== null) {

        if (this.space === 'local') {

          this.object.position.applyMatrix4(this.tempMatrix.getInverse(this.worldRotationMatrix))
        }

        if (this.axis.search('X') !== - 1)
          this.object.position.x = Math.round(this.object.position.x / this.translationSnap) * this.translationSnap
        if (this.axis.search('Y') !== - 1)
          this.object.position.y = Math.round(this.object.position.y / this.translationSnap) * this.translationSnap
        if (this.axis.search('Z') !== - 1)
          this.object.position.z = Math.round(this.object.position.z / this.translationSnap) * this.translationSnap

        if (this.space === 'local') {
          this.object.position.applyMatrix4(this.worldRotationMatrix)
        }
      }
    } else if (this.mode === 'scale') {

      this.point.sub(this.offset)
      this.point.multiply(this.parentScale)

      if (this.space === 'local') {
        if (this.axis === 'XYZ') {

          var nscale = 1 + ((this.point.y) / Math.max(this.oldScale.x, this.oldScale.y, this.oldScale.z))

          this.object.scale.x = this.oldScale.x * nscale
          this.object.scale.y = this.oldScale.y * nscale
          this.object.scale.z = this.oldScale.z * nscale
        } else {

          this.point.applyMatrix4(this.tempMatrix.getInverse(this.worldRotationMatrix))

          if (this.axis === 'X') this.object.scale.x = this.oldScale.x * (1 + this.point.x / this.oldScale.x)
          if (this.axis === 'Y') this.object.scale.y = this.oldScale.y * (1 + this.point.y / this.oldScale.y)
          if (this.axis === 'Z') this.object.scale.z = this.oldScale.z * (1 + this.point.z / this.oldScale.z)
        }
      }
    } else if (this.mode === 'rotate') {

      this.point.sub(this.worldPosition)
      this.point.multiply(this.parentScale)
      this.tempVector.copy(this.offset).sub(this.worldPosition)
      this.tempVector.multiply(this.parentScale)

      let rotation = new THREE.Vector3()

      if (this.axis === 'E') {

        this.point.applyMatrix4(this.tempMatrix.getInverse(this.lookAtMatrix))
        this.tempVector.applyMatrix4(this.tempMatrix.getInverse(this.lookAtMatrix))

        rotation.set(Math.atan2(this.point.z, this.point.y), Math.atan2(this.point.x, this.point.z), Math.atan2(this.point.y, this.point.x))
        this.offsetRotation.set(Math.atan2(this.tempVector.z, this.tempVector.y), Math.atan2(this.tempVector.x, this.tempVector.z), Math.atan2(this.tempVector.y, this.tempVector.x))

        this.tempQuaternion.setFromRotationMatrix(this.tempMatrix.getInverse(this.parentRotationMatrix))

        this.quaternionE.setFromAxisAngle(this.eye, rotation.z - this.offsetRotation.z)
        this.quaternionXYZ.setFromRotationMatrix(this.worldRotationMatrix)

        this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionE)
        this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionXYZ)

        this.object.quaternion.copy(this.tempQuaternion)

      } else if (this.axis === 'XYZE') {

        // this.quaternionE.setFromEuler(this.point.clone().cross(this.tempVector).normalize()) // rotation axis
        this.quaternionE.setFromEuler(new THREE.Euler().setFromVector3(this.point.clone().cross(this.tempVector).normalize())) // rotation axis

        this.tempQuaternion.setFromRotationMatrix(this.tempMatrix.getInverse(this.parentRotationMatrix))
        // this.quaternionX.setFromAxisAngle(this.quaternionE, - this.point.clone().angleTo(this.tempVector))
        this.quaternionX.setFromAxisAngle(new THREE.Vector3(this.quaternionE.x, this.quaternionE.y, this.quaternionE.z), - this.point.clone().angleTo(this.tempVector))
        this.quaternionXYZ.setFromRotationMatrix(this.worldRotationMatrix)

        this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionX)
        this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionXYZ)

        this.object.quaternion.copy(this.tempQuaternion)

      } else if (this.space === 'local') {

        this.point.applyMatrix4(this.tempMatrix.getInverse(this.worldRotationMatrix))

        this.tempVector.applyMatrix4(this.tempMatrix.getInverse(this.worldRotationMatrix))

        rotation.set(Math.atan2(this.point.z, this.point.y), Math.atan2(this.point.x, this.point.z), Math.atan2(this.point.y, this.point.x))
        this.offsetRotation.set(Math.atan2(this.tempVector.z, this.tempVector.y), Math.atan2(this.tempVector.x, this.tempVector.z), Math.atan2(this.tempVector.y, this.tempVector.x))

        this.quaternionXYZ.setFromRotationMatrix(this.oldRotationMatrix)

        if (this.rotationSnap !== null) {

          this.quaternionX.setFromAxisAngle(this.unitX, Math.round((rotation.x - this.offsetRotation.x) / this.rotationSnap) * this.rotationSnap)
          this.quaternionY.setFromAxisAngle(this.unitY, Math.round((rotation.y - this.offsetRotation.y) / this.rotationSnap) * this.rotationSnap)
          this.quaternionZ.setFromAxisAngle(this.unitZ, Math.round((rotation.z - this.offsetRotation.z) / this.rotationSnap) * this.rotationSnap)
        } else {

          this.quaternionX.setFromAxisAngle(this.unitX, rotation.x - this.offsetRotation.x)
          this.quaternionY.setFromAxisAngle(this.unitY, rotation.y - this.offsetRotation.y)
          this.quaternionZ.setFromAxisAngle(this.unitZ, rotation.z - this.offsetRotation.z)
        }

        if (this.axis === 'X') this.quaternionXYZ.multiplyQuaternions(this.quaternionXYZ, this.quaternionX)
        if (this.axis === 'Y') this.quaternionXYZ.multiplyQuaternions(this.quaternionXYZ, this.quaternionY)
        if (this.axis === 'Z') this.quaternionXYZ.multiplyQuaternions(this.quaternionXYZ, this.quaternionZ)

        this.object.quaternion.copy(this.quaternionXYZ)

      } else if (this.space === 'world') {

        rotation.set(Math.atan2(this.point.z, this.point.y), Math.atan2(this.point.x, this.point.z), Math.atan2(this.point.y, this.point.x))
        this.offsetRotation.set(Math.atan2(this.tempVector.z, this.tempVector.y), Math.atan2(this.tempVector.x, this.tempVector.z), Math.atan2(this.tempVector.y, this.tempVector.x))

        this.tempQuaternion.setFromRotationMatrix(this.tempMatrix.getInverse(this.parentRotationMatrix))

        if (this.rotationSnap !== null) {

          this.quaternionX.setFromAxisAngle(this.unitX, Math.round((rotation.x - this.offsetRotation.x) / this.rotationSnap) * this.rotationSnap)
          this.quaternionY.setFromAxisAngle(this.unitY, Math.round((rotation.y - this.offsetRotation.y) / this.rotationSnap) * this.rotationSnap)
          this.quaternionZ.setFromAxisAngle(this.unitZ, Math.round((rotation.z - this.offsetRotation.z) / this.rotationSnap) * this.rotationSnap)
        } else {

          this.quaternionX.setFromAxisAngle(this.unitX, rotation.x - this.offsetRotation.x)
          this.quaternionY.setFromAxisAngle(this.unitY, rotation.y - this.offsetRotation.y)
          this.quaternionZ.setFromAxisAngle(this.unitZ, rotation.z - this.offsetRotation.z)
        }

        this.quaternionXYZ.setFromRotationMatrix(this.worldRotationMatrix)

        if (this.axis === 'X') this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionX)
        if (this.axis === 'Y') this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionY)
        if (this.axis === 'Z') this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionZ)

        this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionXYZ)

        this.object.quaternion.copy(this.tempQuaternion)
      }
    }

    this.update()
    this.dispatchEvent(changeEvent)
    this.dispatchEvent(objectChangeEvent)
  }

  onPointerUp(event) {

    event.preventDefault() // Prevent MouseEvent on mobile

    if (event.button !== undefined && event.button !== 0)
      return

    if (this.dragging && (this.axis !== null)) {

      mouseUpEvent.mode = this.mode
      this.dispatchEvent(mouseUpEvent)
    }

    this.dragging = false

    if ('TouchEvent' in window && event instanceof TouchEvent) {

      // Force 'rollover'
      this.axis = null
      this.update()
      this.dispatchEvent(changeEvent)
    } else {

      this.onPointerHover(event)
    }
  }

  intersectObjects(pointer, objects) {

    var rect = this.domElement.getBoundingClientRect()

    var x = (pointer.clientX - rect.left) / rect.width
    var y = (pointer.clientY - rect.top) / rect.height

    this.pointerVector.set((x * 2) - 1, - (y * 2) + 1)
    this.ray.setFromCamera(this.pointerVector, this.camera)

    var intersections = this.ray.intersectObjects(objects, true)

    return intersections[0] ? intersections[0] : false
  }
}