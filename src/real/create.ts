/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { SceneConfig } from '../types'
import Scene from '../scene/scene';

export default async function create(config: SceneConfig): Promise<Scene> {

  return new Scene(config)
}
