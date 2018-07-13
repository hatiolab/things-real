/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

function match_by_id(selector, component, listener, root) {
  return selector.substr(1) == component.get('id')
}

function match_by_class(selector, component, listener, root) {
  var str_class = component.get('class')
  if (!str_class)
    return false;

  var classes = str_class.split(' ') || []

  return classes.indexOf(selector.substr(1)) >= 0
}

function match_relatives(selector, component, listener, root) {
  switch (selector) {
    case '(all)':
      return true
    case '(self)':
      return root === component
    case '(root)':
      return !root.parent && root === component
    case '(descendant)':
      return root !== component
    case '(child)':
      return root === component.parent
    default:
      return false;
  }
}

function match_by_type(selector, component, listener, root) {
  return (selector == component.get('type'))
}

// match의 self는 root 이다.
export function match(selector, component, listener?, root?) {
  if (selector == '(all)')
    return true

  switch (selector.charAt(0)) {
    case '#':
      return match_by_id(selector, component, listener, root)
    case '.':
      return match_by_class(selector, component, listener, root)
    case '(':
      return match_relatives(selector, component, listener, root)
    default:
      return match_by_type(selector, component, listener, root)
  }
}

function select_recurse(matcher, selector, component, self, root, result) {

  if (matcher(selector, component, self, root))
    result.push(component)

  component.components && component.components.forEach(child => {
    select_recurse(matcher, selector, child, self, root, result)
  })

  return result
}

function match_relatives_for_select(selector, component, self, root) {
  switch (selector) {
    case '(all)':
      return true
    // TODO descendant를 구현하시오. (self의 자손들)
    // case '(descendant)' :
    //   return root !== component
    case '(parent)':
      return self && self.parent === component
    case '(child)':
    case '(children)':
      return self && self === component.parent
    case '(sibling)':
    case '(siblings)':
      return self && self.parent === component.parent && self !== component
    default:
      return false;
  }
}

// select의 self는 self 이다.
export function select(selector, component, self?) {

  if (selector == '(root)')
    return [component]
  if (selector == '(self)')
    return self ? [self] : []

  var matcher;
  switch (selector.charAt(0)) {
    case '#':
      let selected = component.root.findById(selector.substr(1));
      if (selected)
        return [selected];
      else
        return [];
      break;
    case '.':
      matcher = match_by_class
      break;
    case '(':
      matcher = match_relatives_for_select
      break;
    default:
      matcher = match_by_type
      break;
  }

  return select_recurse(matcher, selector, component, self, component, [])
}
