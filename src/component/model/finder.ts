/*
 * 조건에 맞는 컴포넌트를 찾기 위한 기능들
 *
 * findAll(s, ...others) 조건에 맞는 모든 컴포넌트를 찾아낸다.
 * findFirst(finder, ...others) finder 함수에서 조건에 맞는 첫번째 컴포넌트를 리턴한다. (To Be Defined)
 * capture(x, y) 파라미터로 주어진 좌표값을 포함하는 컴포넌트를 찾는다. (Event Capturing)
 * findById(id) 파라미터 id와 같은 id를 가진 컴포넌트를 찾는다.
 */

export default
  findAll(s, ...others) {
  if (typeof s === 'string')
    return selector.select(s, this, others[0] || this) // others[0] means (self)

  if (typeof s !== 'function')
    return

  var found = []

  for (let i = this.components.length - 1; i >= 0; i--) {
    let components = this.components[i].findAll(s, ...others)
    if (components)
      found = found.concat(components);
  }

  if (s(this, ...others))
    found.push(this)

  return found;
}

findFirst(s, ...others) {
  if (typeof s === 'string')
    return selector.select(s, this, others[0])[0]

  if (typeof s !== 'function')
    return

  for (let i = this.components.length - 1; i >= 0; i--) {
    var found = this.components[i].findFirst(s, ...others);
    if (found != null)
      return found;
  }

  if (s(this, ...others))
    return this;

  return null;
}

findById(id) {
  return this.root.findById(id)
}