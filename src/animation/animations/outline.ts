/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Animation from './animation'

/**
 outline 애니메이션은 정지해있는 컴포넌트의 outline을 따라 움직이는 효과를 만들어낸다.
 만일 아웃라인을 제공하는 컴포넌트가 애니메이션 동작중이면, 애니메이션 동작에 의한 아웃라인의 변화는 반영되지 않는다.
 애니메이션이 아닌 실제 위치가 변경되는 경우에는 반영된다.
 아웃라인 컴포넌트와 애니메이션 컴포넌트가 동일 부모 아래서 적용된다면, 부모의 움직임이 반영되는 효과를 만들어 낼 수 있다.
*/

export default class Outline extends Animation {

  step(delta) {
    var {
      rideOn
    } = this.config

    var component = this.client

    if(!rideOn || !component || !component.root)
      return

    var center = component.center
    var outliner = component.root.findById(rideOn)
    if(!outliner)
      return

    var outline = outliner.outline(delta)
    var center = component.transcoordS2T(center.x, center.y)

    if(outliner) {
      component.delta('tx', outline.x - center.x)
      component.delta('ty', outline.y - center.y)
    }
  }
}
