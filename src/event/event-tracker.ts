/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import EventSource from './event-source'

type HandlerMap = { [s: string]: Function; }

/**
 * StandAloneTracker 는 Event Source에서 발생하는 이벤트를 소비하는 Handler를 실행하는 기능을 한다.
 */
export class StandAloneTracker {

  /**
   * Event Source Object
   */
  public eventOrigin: EventSource
  public handlerMap: HandlerMap = {}

  /**
   * event - handler (실행 context가 binding된)의 mapping object
   */
  private boundHandlerMap = {}

  private started: boolean = false

  /**
   * eventOrigin : Event Source 객체
   * handlerMap : event - handler map
   * context: 
   */
  constructor(eventOrigin: EventSource, handlerMap: HandlerMap, context?) {

    if (eventOrigin)
      this.eventOrigin = eventOrigin

    // tracker off 시 동작을 위해서 handlerMap을 보관해야 한다.
    this.handlerMap = handlerMap

    var context = context || this.eventOrigin || this

    for (let event in handlerMap) {
      let handler = handlerMap[event]
      this.boundHandlerMap[event] = handler.bind(context)
    }
  }

  /**
   * StandAloneTracker 소멸자
   */
  dispose() {
    this.off()
  }

  /**
   * Event Source의 이벤트 subscribe를 시작한다.
   */
  on() {
    if (this.started)
      return

    for (let event in this.handlerMap) {
      let handler = this.boundHandlerMap[event]

      this.eventOrigin.on(event, handler)
    }

    this.started = true
  }

  /**
   * Event Source의 이벤트 subscribe를 종료한다.
   */
  off() {
    for (let event in this.handlerMap) {
      let handler = this.boundHandlerMap[event]

      this.eventOrigin.off(event, handler)
    }

    this.started = false
  }
}

export class EventTracker {

  private trackers: StandAloneTracker[] = []
  private selector

  /**
   * selector : 문자열 selector에 해당하는 객체를 찾아주는 헬퍼
   */
  constructor(selector) {
    this.selector = selector
  }

  on(eventOrigin: EventSource | string, handlerMap: HandlerMap, listener, context?) {
    var deliverers: EventSource[] = null

    switch (typeof (eventOrigin)) {
      case 'object':
        deliverers = [eventOrigin as EventSource]
        break
      case 'string':
        deliverers = this.selector.select(eventOrigin, listener)
        break
      default:
        deliverers = []
    }

    if (!(deliverers instanceof Array))
      deliverers = [deliverers]

    deliverers.forEach(deliverer => {
      let tracker = new StandAloneTracker(deliverer, handlerMap, {
        listener,
        deliverer,
        context: context || deliverer
      })

      this.trackers.push(tracker)
      tracker.on()
    })
  }

  off(eventOrigin, handlerMap: HandlerMap) {
    var idxs = []

    for (let i = 0; i < this.trackers.length; i++) {
      let tracker = this.trackers[i]

      if (eventOrigin === tracker.eventOrigin && ((!handlerMap) || (handlerMap === tracker.handlerMap)))
        idxs.push(i)
    }

    idxs.reverse().forEach(idx => this.trackers.splice(idx, 1)[0].off())
  }

  all() {
    return this.trackers.slice()
  }

  dispose() {
    this.trackers.forEach(tracker => tracker.dispose())
  }
}
