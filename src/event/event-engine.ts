/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import EventSource from './event-source'
import EventPump from './event-pump'
import { select } from '../component/model'

type HandlerMap = { [s: string]: Function; }

export default class EventEngine {
  private eventMaps: {
    eventPump: EventPump,
    listener: object,
    handlerMap: HandlerMap,
    deliverer: EventSource
  }[] = []
  private _root: object

  constructor(root) {
    this.root = root

    if (root.eventMap) {
      this.add(root, root.eventMap)
    }
  }

  set root(root) {
    this._root = root
  }

  get root() {
    return this._root
  }

  stop() {
    this.eventMaps.forEach(map => map.eventPump.stop())
  }

  add(listener, handlerMap) {
    if (!this.root)
      return

    for (let selector in handlerMap) {
      let handlers = handlerMap[selector]

      /* 리스너가 이벤트를 핸들링하는 오브젝트가 아닌 경우 '(self)' 선택자는 사용할 수 없다. */
      if (selector === '(self)' && typeof listener.on === 'undefined')
        throw new Error('(self) selector not available when deliverer is not a event handlable object.')

      let deliverers = select(selector, this.root, listener)

      deliverers.forEach(deliverer => {
        var eventPump = new EventPump(deliverer)
        eventPump.addEventHandlers(listener, handlers)
        eventPump.start()

        this.eventMaps.push({
          eventPump,
          listener,
          handlerMap,
          deliverer
        })
      })
    }
  }

  remove(listener, handlerMap?) {
    var maps = this.eventMaps.slice(0) // Clone Array
    for (let i = 0; i < maps.length; i++) {
      let item = maps[i]
      if (item.listener === listener && (!handlerMap || item.handlerMap === handlerMap)) {
        this.eventMaps.splice(i, 1)
        item.eventPump.dispose()
      }
    }
  }

  clear() {
    var maps = this.eventMaps.slice(0) // Clone Array

    maps.forEach(map => map.eventPump.dispose())

    this.eventMaps = []
  }

  dispose() {
    this.stop()
    this.clear()
  }
}
