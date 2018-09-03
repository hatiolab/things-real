/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import AbstractRealObject from './threed/abstract-real-object'
import * as THREE from 'three'

enum AXIS {
  X, Y, Z
}

const DEFAULT_CONFIG = [{
  joint: {
    axis: AXIS.Y,
    min: -190 / 180 * Math.PI,
    max: 190 / 180 * Math.PI
  },
  arm: {
    width: 0,
    height: 10,
    depth: 0
  }
}, {
  joint: {
    axis: AXIS.X,
    min: -58 / 180 * Math.PI,
    max: 90 / 180 * Math.PI
  },
  arm: {
    width: 0,
    height: 0,
    depth: 10
  }
}, {
  joint: {
    axis: AXIS.X,
    min: -135 / 180 * Math.PI,
    max: 40 / 180 * Math.PI
  },
  arm: {
    width: -3,
    height: 0,
    depth: 0
  }
}, {
  joint: {
    axis: AXIS.Y,
    min: -90 / 180 * Math.PI,
    max: 75 / 180 * Math.PI
  },
  arm: {
    width: 0,
    height: -6,
    depth: 0
  }
}, {
  joint: {
    axis: AXIS.Y,
    min: -139 / 180 * Math.PI,
    max: 20 / 180 * Math.PI
  }
}]

class Arm extends THREE.Group {
  private _pivot: Joint

  public width: number
  public height: number
  public depth: number

  constructor(width, height, depth) {
    super()

    this.width = width
    this.height = height
    this.depth = depth

    var geometry = new THREE.CubeGeometry(Math.abs(this.width) || 1, Math.abs(this.height) || 1, Math.abs(this.depth) || 1)
    var material = new THREE.MeshLambertMaterial({
      color: 0x1278ef
    })

    var mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(this.width / 2, this.height / 2, this.depth / 2)

    this.add(mesh)
  }

  set pivot(pivot: Joint) {
    this._pivot = pivot
    this._pivot.attach(this)

    this.update()
  }

  attach(joint: Joint) {
    joint.position.set(this.width, this.height, this.depth)
    this.add(joint)
  }

  update() {
    if (this._pivot) {
      let angle = this._pivot.angle

      switch (this._pivot.axis) {
        case AXIS.X:
          this.rotation.set(angle, 0, 0)
          break;
        case AXIS.Y:
          this.rotation.set(0, angle, 0)
          break;
        case AXIS.Z:
          this.rotation.set(0, 0, angle)
          break;
      }
    }
  }
}

class Joint extends THREE.Group {
  private _angle: number = 0
  private _axis: AXIS = AXIS.Y
  private _arm: Arm /* joint 뒤에 연결된 arm */
  private _max: number
  private _min: number
  private _joint: THREE.Group

  constructor(axis: AXIS = AXIS.Y, angle: number = 0, min: number = -Math.PI + 0.1, max: number = Math.PI - 0.1) {
    super()

    const jointGeo1 = new THREE.CylinderGeometry(0.8, 0.8, 0.8 * 2, 32, 32, false, -min, 2 * Math.PI - max + min)
    const jointGeoMax = new THREE.CylinderGeometry(0.8, 0.8, 0.8 * 2, 32, 32, false, -max, max)
    const jointGeoMin = new THREE.CylinderGeometry(0.8, 0.8, 0.8 * 2, 32, 32, false, 0, -min)

    const jointMesh1 = new THREE.Mesh(jointGeo1, new THREE.MeshBasicMaterial({
      color: 0xffbb00,
    }))
    const jointMeshMax = new THREE.Mesh(jointGeoMax, new THREE.MeshBasicMaterial({
      color: 0x009900,
    }))
    const jointMeshMin = new THREE.Mesh(jointGeoMin, new THREE.MeshBasicMaterial({
      color: 0xdd2200,
    }))

    this._joint = new THREE.Group()
    this._joint.add(jointMesh1, jointMeshMax, jointMeshMin)
    this.add(this._joint)

    this._max = max
    this._min = min

    this.axis = axis
    this.angle = angle

    this.update()
  }

  attach(post: Arm) {
    this.add(post)

    this._arm = post

    this.update()
  }

  get angle() {
    return this._angle
  }

  set angle(angle) {
    this._angle = Math.min(this._max, Math.max(this._min, angle))

    if (this._arm) {
      this._arm.update()
    }

    this.update()
  }

  get axis() {
    return this._axis
  }

  set axis(axis) {
    this._axis = axis

    if (this._arm) {
      this._arm.update()
    }

    this.update()
  }

  update() {
    switch (this.axis) {
      case AXIS.X:
        this._joint.rotation.set(this.angle, 0, Math.PI / 2)
        break;
      case AXIS.Y:
        this._joint.rotation.set(0, this.angle, 0)
        break;
      case AXIS.Z:
        this._joint.rotation.set(Math.PI / 2, 0, this.angle)
        break;
    }
  }
}

class RobotArm3D extends AbstractRealObject {

  private _pivot: THREE.Object3D

  private _arms
  private _joints

  build() {
    let {
      config = DEFAULT_CONFIG
    } = this.component.state

    this._arms = []
    this._joints = []

    this._pivot = new THREE.Group()

    var parentArm

    for (let i = 0; i < config.length; i++) {
      let jointConfig = config[i].joint
      let armConfig = config[i].arm

      let joint = new Joint(jointConfig.axis, 0, jointConfig.min, jointConfig.max)
      parentArm && parentArm.attach(joint)

      if (armConfig) {
        let arm = new Arm(armConfig.width, armConfig.height, armConfig.depth)
        arm.pivot = joint

        parentArm = arm
        this._arms[i] = arm
      }

      this._joints[i] = joint
    }

    this._pivot.add(this._joints[0])
    this.add(this._pivot)

    this.angles = this.component.state.angles || []

    /* fit size to dimension */
    var boundingBox = new THREE.Box3().setFromObject(this._pivot)

    var objectSize: THREE.Vector3 = new THREE.Vector3()
    objectSize = boundingBox.getSize(objectSize)

    var {
      width = 1,
      height = 1,
      depth = 1
    } = this.component.state.dimension || Component.UNIT_DIMENSION

    var scale = Math.max(width / objectSize.x, depth / objectSize.y, height / objectSize.z)

    /* component 자체의 scale도 별도의 의미가 있으므로, dimension은 하위 pivot object의 scale로 조절한다. */
    this._pivot.scale.set(scale, scale, scale)
  }

  clear() {
    super.clear()
    // TODO implement clear logic
  }

  get angles() {
    return this._joints.map(joint => joint.angle)
  }

  set angles(angles: number[]) {
    for (let i = 0; i < angles.length && i < this._joints.length; i++) {
      this._joints[i].angle = angles[i]
    }
  }
}

export default class RobotArm extends Component {

  static get type() {
    return 'robot-arm'
  }

  buildObject3D(): THREE.Object3D {
    return new RobotArm3D(this)
  }

  get angles() {
    return (this.object3D as RobotArm3D).angles
  }

  set angles(angles) {
    (this.object3D as RobotArm3D).angles = angles
  }

  onchangeangles(after, before) {
    this.angles = after
  }
}

Component.register(RobotArm.type, RobotArm)