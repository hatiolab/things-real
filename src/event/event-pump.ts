/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import EventSource from './event-source'
import { match } from '../component/model'
import { warn } from '../util'

type HandlerMap = { [s: string]: Function; }

function control(root, listener, handlers, event, args) {
  for (let selector in handlers) {
    let event_map = handlers[selector]

    if (match(selector, event.origin, listener, root)) {
      for (let event_name in event_map) {
        let handler = event_map[event_name]

        if (event_name == event.name) {
          event.listener = listener

          /* 실행컨텍스트는 리스너가 되도록 한다. */
          handler.apply(listener, args)
        }
      }
    }
  }
}

function event_handler_fn() {
  var args = arguments;
  var e = args[args.length - 1]
  var event_pump = this.event_pump

  event_pump.listeners.forEach(listener => {
    control(event_pump.deliverer, listener.listener, listener.cloned_handlers, e, args)
  })
}

export default class EventPump {

  private deliverer: EventSource
  private listeners: HandlerMap[] = []

  /*
   * Construct a new event pump.
   *
   * @param [EventSource] deliverer target object to listen events that the object fires or delegates
   */
  constructor(deliverer: EventSource) {
    this.deliverer = deliverer;
  }

  start() {
    this.deliverer.on('(all)', event_handler_fn, {
      event_pump: this
    })
  }

  stop() {
    this.deliverer.off('(all)', event_handler_fn);
  }

  addEventHandlers(listener, handlers) {
    var cloned_handlers = Object.assign({}, handlers); // clone object

    var selectors = Object.keys(cloned_handlers)

    selectors.forEach(selector => {
      if (selector.indexOf('?') == 0) {
        let handler = cloned_handlers[selector]
        let variable = selector.substr(1)
        let value = listener.get(variable)
        delete cloned_handlers[selector]

        if (value)
          cloned_handlers[value] = handler
        else
          warn('EventPump#on', `variable #{selector} is not evaluated on listener`)
      }
    })

    this.listeners.push({
      listener: listener,
      handlers: handlers,
      cloned_handlers: cloned_handlers
    })
  }

  removeEventHandlers(listener, handlers?) {
    for (let i = 0; i < this.listeners.length; i++) {
      let item = this.listeners[i]
      if (item.listener === listener && (!handlers || item.handlers === handlers))
        this.listeners.splice(i, 1)
    }
  }

  clear() {
    this.listeners = []
  }

  dispose() {
    this.stop()
    this.clear()
  }
}
