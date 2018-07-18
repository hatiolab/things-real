/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default interface EventCallback {

  /**
   * state가 변경된 후에 호출된다.
   */
  onchange(after: object, before: object): void;
}
