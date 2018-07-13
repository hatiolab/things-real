export default function mixin(clazz, ...objects) {
  objects.forEach(object => Object.assign(clazz.prototype, object))
}