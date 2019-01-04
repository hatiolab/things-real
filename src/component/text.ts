/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "./component";
import RealObjectText from "./threed/real-object-text";

export default class Text extends Component {
  static get type() {
    return "text";
  }

  buildObject3D() {
    return new RealObjectText(this);
  }

  get hasTextProperty() {
    return true;
  }

  onchange(after, before) {
    /* 모든 변화에 대해서 text substitute 가 동작하도록 object3D를 update함 */
    super.onchange(after, before);
    this.object3D.update();
  }
}

Component.register(Text.type, Text);
