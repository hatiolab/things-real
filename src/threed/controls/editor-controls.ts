/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

import * as THREE from 'three'

var changeEvent = { type: 'change' }
var vector = new THREE.Vector3()
var spherical = new THREE.Spherical()
var normalMatrix = new THREE.Matrix3()
var pointer = new THREE.Vector2()
var touches = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

enum STATE {
	NONE = - 1,
	ROTATE,
	ZOOM,
	PAN
}

export default class EditorControls extends THREE.EventDispatcher {

	private domElement

	// API
	private enabled = true
	private center = new THREE.Vector3()
	private panSpeed = 0.001
	private zoomSpeed = 0.1
	private rotationSpeed = 0.005

	// internals
	private object
	private state = STATE.NONE

	private pointerOld = new THREE.Vector2()

	private prevTouches = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
	private prevDistance = null;

	private boundContextmenu
	private boundOnMouseDown
	private boundOnMouseUp
	private boundOnMouseWheel
	private boundOnMouseMove
	private boundTouchStart
	private boundTouchMove

	constructor(object, domElement: HTMLElement | Document = document) {
		super()

		this.object = object
		this.domElement = domElement

		this.boundContextmenu = this.contextmenu.bind(this)
		this.boundOnMouseDown = this.onMouseDown.bind(this)
		this.boundOnMouseUp = this.onMouseUp.bind(this)
		this.boundOnMouseWheel = this.onMouseWheel.bind(this)
		this.boundOnMouseMove = this.onMouseMove.bind(this)
		this.boundTouchStart = this.touchStart.bind(this)
		this.boundTouchMove = this.touchMove.bind(this)

		domElement.addEventListener('contextmenu', this.boundContextmenu, false);
		domElement.addEventListener('mousedown', this.boundOnMouseDown, false);
		domElement.addEventListener('wheel', this.boundOnMouseWheel, false);
		domElement.addEventListener('touchstart', this.boundTouchStart, false);
		domElement.addEventListener('touchmove', this.boundTouchMove, false);
	}

	enable() {
		this.enabled = true
	}

	disable() {
		this.enabled = false
	}

	focus(target) {

		var box = new THREE.Box3().setFromObject(target);
		var distance;

		if (box.isEmpty() === false) {

			this.center.copy(box.getCenter(target));
			distance = box.getBoundingSphere(target).radius;
		} else {

			// Focusing on an Group, AmbientLight, etc
			this.center.setFromMatrixPosition(target.matrixWorld);
			distance = 0.1;
		}

		var delta = new THREE.Vector3(0, 0, 1);
		delta.applyQuaternion(this.object.quaternion);
		delta.multiplyScalar(distance * 4);

		this.object.position.copy(this.center).add(delta);

		this.dispatchEvent(changeEvent);
	}

	pan(delta) {

		var distance = this.object.position.distanceTo(this.center);

		delta.multiplyScalar(distance * this.panSpeed);
		delta.applyMatrix3(normalMatrix.getNormalMatrix(this.object.matrix));

		this.object.position.add(delta);
		this.center.add(delta);

		this.dispatchEvent(changeEvent);
	}

	zoom(delta) {

		var distance = this.object.position.distanceTo(this.center);

		delta.multiplyScalar(distance * this.zoomSpeed);

		if (delta.length() > distance) return;

		delta.applyMatrix3(normalMatrix.getNormalMatrix(this.object.matrix));

		this.object.position.add(delta);

		this.dispatchEvent(changeEvent);
	}

	rotate(delta) {

		vector.copy(this.object.position).sub(this.center);
		spherical.setFromVector3(vector);
		spherical.theta += delta.x;
		spherical.phi += delta.y;

		spherical.makeSafe();

		vector.setFromSpherical(spherical);
		this.object.position.copy(this.center).add(vector);
		this.object.lookAt(this.center);

		this.dispatchEvent(changeEvent);
	}

	// mouse

	onMouseDown(event) {

		if (this.enabled === false)
			return

		if (event.button === 0) {

			this.state = STATE.ROTATE
		} else if (event.button === 1) {

			this.state = STATE.ZOOM
		} else if (event.button === 2) {

			this.state = STATE.PAN
		}

		this.pointerOld.set(event.clientX, event.clientY)

		this.domElement.addEventListener('mousemove', this.boundOnMouseMove, false)
		this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false)
		this.domElement.addEventListener('mouseout', this.boundOnMouseUp, false)
		this.domElement.addEventListener('dblclick', this.boundOnMouseUp, false)
	}

	onMouseMove(event) {

		if (this.enabled === false)
			return

		pointer.set(event.clientX, event.clientY)

		var movementX = pointer.x - this.pointerOld.x
		var movementY = pointer.y - this.pointerOld.y

		if (this.state === STATE.ROTATE) {
			this.rotate(new THREE.Vector3(- movementX * this.rotationSpeed, - movementY * this.rotationSpeed, 0))
		} else if (this.state === STATE.ZOOM) {
			this.zoom(new THREE.Vector3(0, 0, movementY))
		} else if (this.state === STATE.PAN) {
			this.pan(new THREE.Vector3(- movementX, movementY, 0))
		}

		this.pointerOld.set(event.clientX, event.clientY);
	}

	onMouseUp(event) {

		this.domElement.removeEventListener('mousemove', this.boundOnMouseMove, false);
		this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false);
		this.domElement.removeEventListener('mouseout', this.boundOnMouseUp, false);
		this.domElement.removeEventListener('dblclick', this.boundOnMouseUp, false);

		this.state = STATE.NONE;
	}

	onMouseWheel(event) {

		event.preventDefault();

		// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
		this.zoom(new THREE.Vector3(0, 0, event.deltaY > 0 ? 1 : - 1));
	}

	contextmenu(event) {

		event.preventDefault();
	}

	dispose() {

		this.domElement.removeEventListener('contextmenu', this.boundContextmenu, false);
		this.domElement.removeEventListener('mousedown', this.boundOnMouseDown, false);
		this.domElement.removeEventListener('wheel', this.boundOnMouseWheel, false);

		this.domElement.removeEventListener('mousemove', this.boundOnMouseMove, false);
		this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false);
		this.domElement.removeEventListener('mouseout', this.boundOnMouseUp, false);
		this.domElement.removeEventListener('dblclick', this.boundOnMouseUp, false);

		this.domElement.removeEventListener('touchstart', this.boundTouchStart, false);
		this.domElement.removeEventListener('touchmove', this.boundTouchMove, false);
	}

	// touch

	touchStart(event) {

		if (this.enabled === false)
			return;

		switch (event.touches.length) {

			case 1:
				touches[0].set(event.touches[0].pageX, event.touches[0].pageY, 0);
				touches[1].set(event.touches[0].pageX, event.touches[0].pageY, 0);
				break;

			case 2:
				touches[0].set(event.touches[0].pageX, event.touches[0].pageY, 0);
				touches[1].set(event.touches[1].pageX, event.touches[1].pageY, 0);
				this.prevDistance = touches[0].distanceTo(touches[1]);
				break;
		}

		this.prevTouches[0].copy(touches[0]);
		this.prevTouches[1].copy(touches[1]);
	}

	touchMove(event) {

		if (this.enabled === false)
			return;

		event.preventDefault();
		event.stopPropagation();

		function getClosest(touch, touches) {

			var closest = touches[0];

			for (var i in touches) {
				if (closest.distanceTo(touch) > touches[i].distanceTo(touch)) closest = touches[i];
			}

			return closest;
		}

		switch (event.touches.length) {

			case 1:
				touches[0].set(event.touches[0].pageX, event.touches[0].pageY, 0);
				touches[1].set(event.touches[0].pageX, event.touches[0].pageY, 0);
				this.rotate(touches[0].sub(getClosest(touches[0], this.prevTouches)).multiplyScalar(- this.rotationSpeed));
				break;

			case 2:
				touches[0].set(event.touches[0].pageX, event.touches[0].pageY, 0);
				touches[1].set(event.touches[1].pageX, event.touches[1].pageY, 0);
				var distance = touches[0].distanceTo(touches[1]);
				this.zoom(new THREE.Vector3(0, 0, this.prevDistance - distance));
				this.prevDistance = distance;

				var offset0 = touches[0].clone().sub(getClosest(touches[0], this.prevTouches));
				var offset1 = touches[1].clone().sub(getClosest(touches[1], this.prevTouches));
				offset0.x = - offset0.x;
				offset1.x = - offset1.x;

				this.pan(offset0.add(offset1).multiplyScalar(0.5));

				break;
		}

		this.prevTouches[0].copy(touches[0]);
		this.prevTouches[1].copy(touches[1]);
	}
}