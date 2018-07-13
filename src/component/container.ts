/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { ComponentModel } from '../types'
import Component from './component'
import { clonedeep, mixin } from '../util'

export default class Container extends Component {

  constructor(model: ComponentModel) {
    super(model)

    this._components = [];
  }

  dispose() {
    this.components.slice().forEach(component => component.dispose())

    super.dispose();
  }

  private _components: Component[] = []

  get components() {
    return this._components;
  }

  get hierarchy() {
    var model = clonedeep(this.model);

    if (this.components)
      model.components = this.components.map(c => { return c.hierarchy })

    return model
  }

  get isContainer() {
    return true
  }

  addComponent(component: Component) {
    var oldContainer = component.container

    if (oldContainer) {
      if (this === oldContainer)
        return

      oldContainer.removeComponent(component)
    }

    var index = (this._components.push(component) - 1)

    component.container = this
    component.added(this) /* callback */

    // this.trigger('add', this, component, index)

    // component.delegate_on(this)
    // component.trigger('added', this, component, index)

    // this.root && this.root.isReady && component.ready()
  }

  removeComponent(component: Component) {
    var idx = this.components.indexOf(component)

    if (idx == -1)
      return

    this.components.splice(idx, 1)

    component.container = null
    component.removed(this) /* callback */

    // this.trigger('remove', this, component)

    // component.trigger('removed', this, component)
    // component.delegate_off(this)
  }
}

Component.register('container', Container);


// import * as selector from '../model/selector'
// import { Layout, AbsoluteLayout } from '../layout'

// import RectPath from './mixins/rect-path'
// import MoveHandle from './mixins/move-handle'

// const EMPTY = []

// export default class Container extends MoveHandle(RectPath(Component)) {

//   get showMoveHandle() {
//     return true;
//   }

//   isContainer() {
//     return true
//   }

//   containable(component) {
//     return component.isDescendible(this) && component.get('type') !== 'variable'
//   }

//   get hasTextProperty() {
//     return false
//   }

//   // 컴포넌트를 임의로 추가 및 삭제할 수 있는 지를 지정하는 속성임.
//   // 예를 들면, 임의의 컴포넌트를 드래깅해서 컨테이너에 추가하거나, delete key로 삭제할 때 적용됨.
//   get focusible() {
//     return true
//   }

//   get layout() {
//     return Layout.get(this.get('layout')) || AbsoluteLayout
//   }

//   reflow() {
//     this.layout.reflow(this)

//     this.components && this.components.forEach(component => {
//       if (component.isContainer())
//         component.reflow()
//     })
//   }



//   removeComponent(component) {
//     var idx = this._components.indexOf(component)

//     if (idx == -1)
//       return

//     this._components.splice(idx, 1)

//     component.container = null
//     component.removed(this) /* callback */

//     this.trigger('remove', this, component)

//     component.trigger('removed', this, component)
//     component.delegate_off(this)
//   }

//   insertComponentAt(component, index) {
//     var oldContainer = component.container

//     if (oldContainer) {
//       oldContainer.removeComponent(component)
//     }

//     // TODO index가 유효하지 않은 경우(예를 들면, index가 전체 컴포넌트 개수보다 큰 경우)에 대한 검증
//     var head = this._components.splice(0, index)
//     this._components = head.concat(component, this._components)

//     // 실제 적용된 인덱스를 다시 구한다.
//     index = this._components.indexOf(component)

//     component.container = this
//     component.added(this) /* callback */

//     this.trigger('add', this, component, index)

//     component.delegate_on(this)
//     component.trigger('added', this, component, index)
//   }

//   add(comp) {
//     if (!(comp instanceof Array))
//       return this.add.call(this, [comp])

//     comp.forEach(c => {
//       if (this._components.indexOf(c) == -1)
//         this.addComponent(c)
//     })

//     return this
//   }

//   remove(comp) {
//     if (!(comp instanceof Array))
//       return this.remove.call(this, [comp])

//     if (!this._components)
//       return this

//     comp.forEach(c => {
//       this.removeComponent(c)
//     })

//     return this
//   }

//   getAt(index) {
//     if (this._components)
//       return this._components[index]
//   }

//   forEach(fn, context) {
//     if (!this._components)
//       return

//     this._components.forEach(fn, context)
//   }

//   traverse(fn, context) {
//     fn.call(context, this);

//     if (!this._components)
//       return

//     this._components.forEach(component => {
//       if (component.isContainer())
//         component.traverse(fn, context);
//       else
//         fn.call(context, component);
//     })
//   }

//   indexOf(item) {
//     return (this._components || EMPTY).indexOf(item)
//   }

//   size() {
//     return (this._components || EMPTY).length
//   }

//   moveChildAt(index, child) {
//     var oldIndex = this.indexOf(child)
//     if (oldIndex == -1)
//       return

//     var head = this._components.splice(0, oldIndex)
//     var tail = this._components.splice(1)

//     this._components = head.concat(tail)

//     index = Math.max(0, index)
//     index = Math.min(index, this._components.length)

//     head = this._components.splice(0, index)
//     this._components = head.concat(child, this._components)
//   }

//   moveChildForward(child) {
//     var index = this.indexOf(child)
//     if (index == -1 || index == this.size() - 1)
//       return

//     this._components[index] = this._components[index + 1]
//     this._components[index + 1] = child
//   }

//   moveChildBackward(child) {
//     var index = this.indexOf(child)
//     if (index == -1 || index == 0)
//       return

//     this._components[index] = this._components[index - 1]
//     this._components[index - 1] = child
//   }

//   moveChildToFront(child) {
//     var index = this.indexOf(child)
//     if (index == -1 || index == this.size() - 1)
//       return

//     var head = this._components.splice(0, index)
//     var tail = this._components.splice(1)

//     this._components = head.concat(tail, this._components)
//   }

//   moveChildToBack(child) {
//     var index = this.indexOf(child)
//     if (index == -1 || index == 0)
//       return

//     var head = this._components.splice(0, index)
//     var tail = this._components.splice(0)

//     this._components = this._components.concat(head, tail)
//   }

//   symmetryX(x) {

//     super.symmetryX(x)

//     this.components.map(component => {
//       component.symmetryX(0)
//     })
//   }

//   /*
//    * 조건에 맞는 컴포넌트를 찾기 위한 기능들
//    *
//    * findAll(s, ...others) 조건에 맞는 모든 컴포넌트를 찾아낸다.
//    * findFirst(finder, ...others) finder 함수에서 조건에 맞는 첫번째 컴포넌트를 리턴한다. (To Be Defined)
//    * capture(x, y) 파라미터로 주어진 좌표값을 포함하는 컴포넌트를 찾는다. (Event Capturing)
//    * findById(id) 파라미터 id와 같은 id를 가진 컴포넌트를 찾는다.
//    */

//   findAll(s, ...others) {
//     if (typeof s === 'string')
//       return selector.select(s, this, others[0] || this) // others[0] means (self)

//     if (typeof s !== 'function')
//       return

//     var found = []

//     for (let i = this.components.length - 1; i >= 0; i--) {
//       let components = this.components[i].findAll(s, ...others)
//       if (components)
//         found = found.concat(components);
//     }

//     if (s(this, ...others))
//       found.push(this)

//     return found;
//   }

//   findFirst(s, ...others) {
//     if (typeof s === 'string')
//       return selector.select(s, this, others[0])[0]

//     if (typeof s !== 'function')
//       return

//     for (let i = this.components.length - 1; i >= 0; i--) {
//       var found = this.components[i].findFirst(s, ...others);
//       if (found != null)
//         return found;
//     }

//     if (s(this, ...others))
//       return this;

//     return null;
//   }

//   findById(id) {
//     return this.root.findById(id)
//   }

//   contains(x, y) {
//     // 효율을 위해서, contains를 호출하기 전에 x, y좌표값은 이 컴포넌트에 대해서 이미 transcoord 된 상태이다.
//     // 참조 : capture(x, y)

//     // 컨테이너의 경우, 외부 바운드의 영역을 10 포인트씩 확장시켜서 contains 여부를 결정한다.

//     var contains = super.contains(x, y)

//     if (!contains) {
//       var { left, top, width, height, lineWidth = 0 } = this.state;
//       var extend = this.stuck ? 0 : 10 + lineWidth / 2;

//       contains = (x < Math.max(left + width, left) + extend && x > Math.min(left + width, left) - extend
//         && y < Math.max(top + height, top) + extend && y > Math.min(top + height, top) - extend);
//     }

//     return contains

//   }

//   capture(x, y) {
//     var point = this.transcoordP2S(x, y);

//     if (!this.contains(point.x, point.y))
//       return false;

//     // 나의 좌표로 시프트
//     var bounds = this.bounds

//     point.x -= bounds.left
//     point.y -= bounds.top

//     var capturables = this.layout.capturables(this)

//     for (let i = capturables.length - 1; i >= 0; i--) {
//       var found = capturables[i].capture(point.x, point.y);
//       if (found)
//         return found;
//     }

//     return this.capturable && this;
//   }

//   /*
//    * capturePath(path) 파라미터로 주어진 path를 포함하는 컨테이너를 찾는다.
//    * @path
//    * @excepts 컨테이너를 찾을 때 제외되는 대상이다.
//    */

//   capturePath(path, excepts) {

//     if (excepts) {
//       if (excepts.indexOf(this) > -1)
//         return false

//       for (let i = 0; i < excepts.length; i++)
//         if (!this.containable(excepts[i]))
//           return false
//     }

//     // path의 각 좌표는 부모 기준의 좌표로 변환된 것이므로, 나의 각도를 적용해서 변환한다.
//     var cpath = []
//     var { left, top, width, height } = this.bounds

//     for (let i = 0; i < path.length; i++) {
//       let point = this.transcoordP2S(path[i].x, path[i].y)

//       if (point.x < left || point.x > left + width
//         || point.y < top || point.y > top + height)
//         return false

//       point.x -= left
//       point.y -= top

//       cpath.push(point)
//     }

//     let capturables = this.layout.capturables(this)

//     for (let i = capturables.length - 1; i >= 0; i--) {
//       let capturable = capturables[i]
//       if (!capturable.isContainer())
//         continue

//       let found = capturable.capturePath(cpath, excepts);
//       if (found)
//         return found;
//     }

//     return this.focusible && this
//   }

//   /* render .. */

//   render(context) {

//     var {
//       left = 0,
//       top = 0,
//       width,
//       height
//     } = this.bounds;

//     // 컨테이너의 바운드를 표현한다.(컨테이너의 기본 그리기 기능)
//     context.beginPath();

//     context.rect(left, top, width, height);

//     this.drawFill(context);
//     this.drawStroke(context);
//   }

//   postrender(context) {

//     super.postrender(context);

//     /* 자식 컴포넌트들 그리기 */
//     var { top, left, scale } = this.state;
//     context.translate(left, top);

//     this.layout.drawables(this).forEach(m => {
//       m.draw(context);
//     });

//     context.translate(-left, -top);

//     this.drawText(context);
//   }

//   trim() {
//     this.components.forEach((component) => {
//       component.trim();
//     })

//     super.trim();
//   }
// }

// /* clone 하지 않아도 되는 경우의 memoized getter */
// ;["layout"].forEach(getter => Component.memoize(Container.prototype, getter, false));
