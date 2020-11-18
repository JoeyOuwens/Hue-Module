import {Bridge} from "./hue/Bridge";
import {CrownstoneHueError} from "./util/CrownstoneHueError";
import {eventBus} from "./util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH, ON_PRESENCE_CHANGE, ON_SPHERE_CHANGE} from "./constants/EventConstants";
import {Discovery} from "./hue/Discovery";
import {GenericUtil} from "./util/GenericUtil";
import {LightBehaviourWrapper} from "./wrapper/LightBehaviourWrapper";
import {Light} from "./hue/Light";
import {RECONNECTION_TIMEOUT_TIME, SPHERE_DEFAULT} from "./constants/HueConstants";

/**
 * CrownstoneHue object
 *
 * @remarks
 * init() should be called before using this object.
 *
 * @param sphereLocation - Longitude and Latitude of the location of where the Sphere is.
 * @param bridges - List of connected bridges
 * @param lights - List of a wrapped light and aggregator
 *
 */

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class CrownstoneHue {
  bridges: Bridge[] = [];
  lights: { [uniqueId: string]: LightBehaviourWrapper } = {};
  sphereLocation: SphereLocation;
  dumbHouseModeActive: boolean = false;
  activePresenceEvents: PresenceEvent[] = [];

  constructor(sphereLocation?: SphereLocation) {
    if (!sphereLocation || !sphereLocation.latitude|| !sphereLocation.longitude) {
      sphereLocation = SPHERE_DEFAULT;
    }
    this.sphereLocation = sphereLocation;
  }

  /** Call to change/set new Sphere location
   */
  setSphereLocation(sphereLocation: SphereLocation): void {
    this.sphereLocation = sphereLocation;
    eventBus.emit(ON_SPHERE_CHANGE, sphereLocation)
  }

  /** Call to turn on/off Dumb house mode.
   *
   * @param on - Boolean whether Dumb house mode should be on or off.
   */
  setDumbHouseMode(on: boolean): void {
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH, on);
    this.dumbHouseModeActive = on;
  }

  /** Adds/Updates the new behaviour on its light.
   * Passes the active presence events to the new behaviour.
   * @param newBehaviour
   */
  async setBehaviour(newBehaviour: HueBehaviourWrapper): Promise<boolean> {
    const behaviour = GenericUtil.deepCopy(newBehaviour) as HueBehaviourWrapper;
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined && this.lights[behaviour.lightId] !== undefined) {
        this._setBehaviour(this.lights[light.uniqueId], behaviour);
        return true;
      }
    }
    return false;
  };

  _setBehaviour(lightBehaviourWrapper: LightBehaviourWrapper, behaviour: HueBehaviourWrapper): void {
    const index = lightBehaviourWrapper.behaviourAggregator.setBehaviour(behaviour, this.sphereLocation);
    if (behaviour.type === "BEHAVIOUR") {
      for (const event of this.activePresenceEvents) {
        lightBehaviourWrapper.behaviourAggregator.switchBehaviourPrioritizer.behaviours[index].onPresenceDetect(event);
      }
    }
  }


  removeBehaviour(lightId: string, cloudId: string): void {
    for (const bridge of this.bridges) {
      const light = bridge.lights[lightId];
      if (light !== undefined) {
        this.lights[lightId].behaviourAggregator.removeBehaviour(cloudId);
        break;
      }
    }
  };

  /** Use when a user enters or leaves a room or sphere.
   *  Saves the event for when a new behaviour is added.
   * @param presenceEvent
   */
  presenceChange(presenceEvent: PresenceEvent): void {
    if (presenceEvent.type === "ENTER") {
      this.activePresenceEvents.push(presenceEvent);
    }
    else if (presenceEvent.type === "LEAVE") {
      this._onPresenceLeave(presenceEvent);
    }
    else {
      return;
    }
    eventBus.emit(ON_PRESENCE_CHANGE, presenceEvent);
  }

  _onPresenceLeave(presenceEvent: PresenceEvent): void {
    for (let i = 0; i < this.activePresenceEvents.length; i++) {
      let presenceProfile = this.activePresenceEvents[i].data;
      if (presenceProfile.profileIdx === presenceEvent.data.profileIdx) {
        if (presenceEvent.data.type === "SPHERE" && presenceProfile.type === "SPHERE") {
          this.activePresenceEvents.splice(i, 1);
          break;
        }
        if (presenceEvent.data.type === "LOCATION" && presenceProfile.type === "LOCATION") {
          if (presenceEvent.data.locationId === presenceProfile.locationId) {
            this.activePresenceEvents.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  async addBridge(bridgeData: BridgeInitialization): Promise<Bridge> {
    if (bridgeData.bridgeId == undefined && bridgeData.ipAddress == undefined) {
      throw new CrownstoneHueError(413, bridgeData.bridgeId)
    }
    for (const bridge of this.bridges) {
      if (bridge.bridgeId === bridgeData.bridgeId) {
        throw new CrownstoneHueError(410, bridgeData.bridgeId)
      }
      if (bridge.ipAddress === bridgeData.ipAddress) {
        throw new CrownstoneHueError(411, bridgeData.bridgeId)
      }
    }
    const bridge = new Bridge({
      name: bridgeData.name,
      username: bridgeData.username,
      clientKey: bridgeData.clientKey,
      macAddress: bridgeData.macAddress,
      ipAddress: bridgeData.ipAddress,
      bridgeId: bridgeData.bridgeId
    });
    await bridge.init();
    this.bridges.push(bridge);
    return bridge;
  }

  removeBridge(bridgeId: string): void {
    for (let i = 0; i < this.bridges.length; i++) {
      if (this.bridges[i].bridgeId === bridgeId) {
        this.bridges[i].cleanup();
        this.bridges.splice(i, 1);
        for (const light of Object.keys(this.lights)) {
          if (this.lights[light].light.bridgeId === bridgeId) {
            this.removeLight(this.lights[light].light.uniqueId);
          }
        }
        break;
      }
    }
  }

  /**
   * Adds a light to the bridge.
   *
   * @remarks
   * id refers to the id of the light on the bridge and NOT the uniqueId of a light.
   * Gets info of the light from Bridge and creates a Light object and pushes it to the list.
   *
   *
   * @param bridgeId - The id of the bridge of which the light have to be added to.
   * @param idOnBridge - The id of the light on the bridge.
   */
  async addLight(data: LightInitFormat): Promise<Light> {
    for (const bridge of this.bridges) {
      if (bridge.bridgeId === data.bridgeId) {
        if (bridge.lights[data.uniqueId]) {
          throw new CrownstoneHueError(409, data.uniqueId)
        }
        const light = await bridge.configureLight(data);
        if (light == undefined) {
          throw new CrownstoneHueError(412, data.uniqueId)
        }

        const lightBehaviourWrapper = this._createLightBehaviourWrapper(light);
        lightBehaviourWrapper.init();
        return light;
      }
    }
  }

  _createLightBehaviourWrapper(light: Light): LightBehaviourWrapper {
    const lightBehaviourWrapper = new LightBehaviourWrapper(light);
    this.lights[light.getUniqueId()] = lightBehaviourWrapper;
    lightBehaviourWrapper.behaviourAggregator.onDumbHouseModeSwitch(this.dumbHouseModeActive)
    return lightBehaviourWrapper;
  }

  removeLight(lightId: string): void {
    for (const bridge of this.bridges) {
      const light = bridge.lights[lightId];
      if (light !== undefined) {
        bridge.removeLight(lightId);
        if (this.lights[lightId] !== undefined) {
          this.lights[lightId].cleanup();
          delete this.lights[lightId];
        }
      }
    }
  }

  /** Returns a map of all connected lights by uniqueId

   */
  getAllConnectedLights(): { [uniqueId: string]: Light } {
    let lights = {}
    for (const wrappedLight of Object.values(this.lights)) {
      lights[wrappedLight.light.uniqueId] = wrappedLight.light;
    }
    return lights;
  }

  getConfiguredBridges(): Bridge[] {
    return this.bridges;
  }


  stop(): void {
    for (const bridge of this.bridges) {
      bridge.cleanup()
    }
    Object.values(this.lights).forEach(wrappedLight => {
      wrappedLight.cleanup();
    });
  }
}
