/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Command from './command'

function calculate_bounds_on_root(component) {
  if (component.isRoot)
    return component.bounds

  var { bounds, rotatePoint } = component

  var pointOnTop = rotatePoint
  // if(component.parent && !component.parent.isRoot)
  // pointOnTop = recursive_transcoordS2P(pointOnTop, component.parent)
  // TODO 목적상 아래 로직으로 대체 가능할 것이다. 검토하라. (스케일된 컴포넌트에 대해서 이상작동한다.)
  pointOnTop = component.transcoordS2T(pointOnTop.x, pointOnTop.y)

  return {
    left: pointOnTop.x - (rotatePoint.x - bounds.left),
    top: pointOnTop.y - (rotatePoint.y - bounds.top),
    width: bounds.width,
    height: bounds.height
  }
}

function calculate_bounds_on_container(component, container) {
  if (container.isRoot)
    return component.bounds

  var { bounds, rotatePoint } = component

  var pointOnContainer = container.transcoordT2S(rotatePoint.x, rotatePoint.y)

  var container_bounds = container.bounds

  return {
    left: pointOnContainer.x - (rotatePoint.x - bounds.left) - container_bounds.left,
    top: pointOnContainer.y - (rotatePoint.y - bounds.top) - container_bounds.top,
    width: bounds.width,
    height: bounds.height
  }
}

function calculate_rotation_on_root(component) {

  var rotation = 0

  while (component && !component.isRoot) {
    rotation += component.get('rotation') || 0

    component = component.parent
  }

  return rotation % (Math.PI * 2)
}

function calculate_rotation_on_container(component, container) {
  var rotation = component.get('rotation') || 0
  var container_rotation = calculate_rotation_on_root(container)

  return (rotation - container_rotation) % (Math.PI * 2)
}

/*
 * 컴포넌트가 추가, 삭제되거나 부모컨테이너를 바꿔서 이동하는 경우.
 * 새로운 그룹을 만들거나, 그룹해제 되는 경우도 포함됨.
 *
 * to_container, component, to_index
 *
 */
export default class CommandMigrate extends Command {

  execute() {

    var changes = this.params.changes

    changes.forEach(change => {
      let { component, to_container,
        to_index, to_left, to_top, hint } = change

      let bounds = calculate_bounds_on_root(component)
      let rotation = calculate_rotation_on_root(component)

      /* to_container가 없으면, 완전히 제거함 */
      component.removeSelf(!to_container)

      component.bounds = bounds
      component.set('rotation', rotation)

      if (to_container) {
        component.set('rotation', calculate_rotation_on_container(component, to_container))
        let bounds = calculate_bounds_on_container(component, to_container)

        change.to_left = to_left !== undefined ? to_left : bounds.left
        change.to_top = to_top !== undefined ? to_top : bounds.top

        component.bounds = {
          left: change.to_left,
          top: change.to_top,
          width: bounds.width,
          height: bounds.height
        }

        if (typeof (to_index) === 'undefined')
          to_container.addComponent(component)
        else
          to_container.insertComponentAt(component, to_index)
      }
    })
  }
}
