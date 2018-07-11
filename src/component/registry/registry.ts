var registry = {};

export default {
  register(type: string, clazz: FunctionConstructor): FunctionConstructor {
    if (!clazz)
      return registry[type]
    registry[type] = clazz
    return clazz;
  }
}
