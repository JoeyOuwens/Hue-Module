import {HueLightState} from "../../src/declarations/declarations";

/** Helper class for simulation purposes.
 * Simulates an Api class and more;
 */
export class Api {
  lights;  //Fakes reals Api's api.lights method.
  light; // Same as lights, context purpose.
  user; // Extra for testing purpose.
  constructor() {
    const light = new ApiLight()
    this.lights = light;
    this.light = light;
    this.user = new UserInteraction(light);
  }
}

/** Simulates to be the connection to the Hue Light for testing.
 *
 */
export class ApiLight {
  state: HueLightState = {on: false, bri: 100};

  getLightState(id?) {
    return this.state;
  }

  setState(id, state) {
    for (const key of Object.keys(state)) {
      if (this.state[key] !== undefined) {
        this.state[key] = state.key;
      }
    }
  }

}

/** Simulates to be user involvement to the Hue Light for testing.
 *
 */
export class UserInteraction {
  light: ApiLight;

  constructor(light) {
    this.light = light;
  }

  turnOffLight() {
    this.light.setState(0, {on: false})
  }

  turnOnLight() {
    this.light.setState(0, {on: true})
  }

  dimLight(dimPercentage) {
    this.light.setState(0, {dim: dimPercentage*2.54})
  }
}