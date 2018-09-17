/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'
import RealObjectExtrude from './threed/real-object-extrude';

export default abstract class Shape extends Component {

  buildObject3D() {
    return new RealObjectExtrude(this)
  }
}
