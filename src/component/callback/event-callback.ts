export default interface EventCallback {

  /**
   * state가 변경된 후에 호출된다.
   */
  onchange(after: Object, before: Object): void;
}
