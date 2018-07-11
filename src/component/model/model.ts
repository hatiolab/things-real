import { clonedeep } from '../../util'
import { isEqual } from 'lodash';

export default {
  get(prop) {
    return this._model[prop];
  },

  getModel(prop) {
    return this._model[prop];
  },

  set(props, value) {
    this.setModel(props, value);
  },

  setModel(props, value) {
    if (typeof props === 'string') {
      return this.setModel({ [props]: value })
    }

    var after = {}
    var before = {}
    var changed = false

    var cloned = clonedeep(props)

    // Object.keys() 또는 for..in 으로는 undefined value 를 읽어오지 못함.
    // Object.getOwnPropertyNames() 를 사용해야 함.

    Object.getOwnPropertyNames(cloned).forEach(key => {

      let before_val = this.getState(key)
      let after_val = cloned[key]

      if (!isEqual(before_val, after_val)) {
        before[key] = before_val
        after[key] = after_val

        changed = true
      }

      delete this._state[key]
    })

    Object.assign(this._model, props);

    /** 
     * 모델 속성의 변화는, state 속성의 변화도 일으킨다.
     * 변화된 모델 속성과 동일한 state의 속성을 제거한다.
     * state속성이 제거되면, state에도 영향을 미치며, onchange 이벤트를 발생시킬 수 있다. 
     */
    if (changed) {
      this.onchange(after, before);
    }
  }
}