/* from https://bl.ocks.org/sfpgmr/61fe805bb2a72bda86eff955838fda94 */

import * as THREE from 'three'

export default class BoundUVGenerator {

  private extrudedShape
  private extrudedOptions
  private bb

  setShape({
    extrudedShape,
    extrudedOptions
  }) {
    this.extrudedShape = extrudedShape;
    this.bb = new THREE.Box2();

    this.bb.setFromPoints(this.extrudedShape.extractPoints().shape);
    this.extrudedOptions = extrudedOptions;
  }

  generateTopUV(geometry, vertices, indexA, indexB, indexC) {
    const ax = vertices[indexA * 3],
      ay = vertices[indexA * 3 + 1],

      bx = vertices[indexB * 3],
      by = vertices[indexB * 3 + 1],

      cx = vertices[indexC * 3],
      cy = vertices[indexC * 3 + 1],

      bb = this.bb,//extrudedShape.getBoundingBox(),
      bbx = (bb.max.x - bb.min.x),
      bby = (bb.max.y - bb.min.y);


    return [
      new THREE.Vector2((ax - bb.min.x) / bbx, (1.0 - (ay - bb.min.y) / bby)),
      new THREE.Vector2((bx - bb.min.x) / bbx, (1.0 - (by - bb.min.y) / bby)),
      new THREE.Vector2((cx - bb.min.x) / bbx, (1.0 - (cy - bb.min.y) / bby))
    ];
  }

  generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD) {
    const ax = vertices[indexA * 3],
      ay = vertices[indexA * 3 + 1],
      az = vertices[indexA * 3 + 2],

      bx = vertices[indexB * 3],
      by = vertices[indexB * 3 + 1],
      bz = vertices[indexB * 3 + 2],

      cx = vertices[indexC * 3],
      cy = vertices[indexC * 3 + 1],
      cz = vertices[indexC * 3 + 2],

      dx = vertices[indexD * 3],
      dy = vertices[indexD * 3 + 1],
      dz = vertices[indexD * 3 + 2];

    const amt = this.extrudedOptions.amount,
      bb = this.bb,//extrudedShape.getBoundingBox(),
      bbx = (bb.max.x - bb.min.x),
      bby = (bb.max.y - bb.min.y);

    if (Math.abs(ay - by) < 0.01) {
      return [
        new THREE.Vector2(ax / bbx, 1.0 - az / amt),
        new THREE.Vector2(bx / bbx, 1.0 - bz / amt),
        new THREE.Vector2(cx / bbx, 1.0 - cz / amt),
        new THREE.Vector2(dx / bbx, 1.0 - dz / amt)
      ];
    } else {
      return [
        new THREE.Vector2((ay / bby), 1.0 - az / amt),
        new THREE.Vector2((by / bby), 1.0 - bz / amt),
        new THREE.Vector2((cy / bby), 1.0 - cz / amt),
        new THREE.Vector2((dy / bby), 1.0 - dz / amt)
      ];
    }
  }
}
