import { clonedeep } from '../../util'
import { isEqual } from 'lodash';

export default {
  getState(prop) {
    return (prop in this._state) ? this._state[prop] : this.get(prop)
  },

  clearState(props: string[] | string) {
    if (typeof props === 'string') {
      return this.clearState([props])
    }

    var after = {}
    var before = {}
    var changed = false

    props.forEach(key => {
      let before_val = this.getState(key)
      let after_val = this.getModel(key)

      if (!isEqual(before_val, after_val)) {
        before[key] = before_val
        after[key] = after_val

        changed = true
      }

      delete this._state[key];
    })

    if (changed) {
      this.onchange(after, before);
    }
  },

  setState(props: Object | string, value?: any) {

    if (typeof props === 'string')
      return this.setState({ [props]: value })

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
        this._state[key] = after_val

        changed = true
      }
    })

    if (changed) {
      this.onchange(after, before);
    }

    return this
  }
}