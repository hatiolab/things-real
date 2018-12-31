/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { error, debug } from "./logger";
import mixin from "./mixin";

var reference_maps = new WeakSet();

export default class ReferenceMap {
  private counters: object;
  private references: object;
  private creator;
  private disposer;

  static get residents() {
    return reference_maps;
  }

  constructor(creator, disposer?) {
    this.counters = {};
    this.references = {};
    this.creator = creator;
    this.disposer = disposer;

    reference_maps.add(this);
  }

  dispose() {
    if (this.disposer) {
      for (let id in this.references)
        this.disposer.call(null, id, this.references[id]);
    }

    delete this.references;
    delete this.counters;
  }

  get ids() {
    return Object.keys(this.references);
  }

  private resolve(resolver, id, target, self) {
    target = mixin(target, function() {
      this.release = () => self.release(this);
    });

    self.references[id] = target;
    self.counters[id] = 1;

    resolver(target);
  }

  add(id, target?) {
    var self = this;

    return new Promise(function(resolve, reject) {
      var ref = self.references[id];

      if (ref) {
        if (ref === target) reject(Error("Reference ID and target duplicate"));
        else if (target) reject(Error("Reference ID duplicate"));
        else resolve(ref);
      } else {
        if (target) {
          self.resolve(resolve, id, target, self);
        } else {
          if (!self.creator) {
            reject(
              Error(
                "Reference id(" +
                  id +
                  ") is not allowed. Reference creator should be defined."
              )
            );
            return;
          }

          self.creator.call(
            null,
            id,
            function(target) {
              self.resolve(resolve, id, target, self);
            },
            function(error) {
              reject(error);
            }
          );
        }
      }
    });
  }

  get(id, createIf?) {
    return new Promise((resolve, reject) => {
      var ref = this.references[id];

      if (ref) {
        if (!this.counters.hasOwnProperty(id)) {
          reject(Error("No Reference Count"));
        } else {
          this.counters[id]++;
          resolve(ref);
        }
      } else if (createIf) {
        this.add(id).then(
          ref => {
            resolve(ref);
          },
          error => {
            reject(error);
          }
        );
      } else {
        reject(Error("No References for " + id));
      }
    });
  }

  _id(target) {
    for (let id in this.references) {
      let ref = this.references[id];
      if (ref === target) return id;
    }

    return -1;
  }

  release(target) {
    var id = this._id(target);
    var ref = this.references[id];

    if (!ref) {
      error("No Referenced ID");
      return;
    }

    this.counters[id]--;
    if (this.counters[id] == 0) {
      this.disposer && this.disposer.call(null, id, ref);
      delete this.references[id];
      delete this.counters[id];
      debug("RELEASED", id);
    }
  }
}
