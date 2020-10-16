import {SwitchBehaviour} from "../behaviour/behaviour/SwitchBehaviour";

interface DiscoverResult {
  id: string,
  internalipaddress: string
}
interface HueLightState {
  on: boolean,
  bri?: number,
  hue?: number,
  sat?: number,
  xy?: [number, number],
  ct?: number,
}

interface HueFullState extends HueLightState{
  effect?: string,
  alert?: string,
  colormode?: string,
  mode?: string,
  reachable: boolean
}

interface StateUpdate extends HueLightState{
  effect?: string,
  alert?: string,
  bri_inc?: number;
  hue_inc?: number;
  sat_inc?: number;
  ct_inc?: number;
  xy_inc?: [number, number];
}


interface BridgeFormat {
  name: string;
  username: string;
  clientKey: string;
  macAddress: string;
  ipAddress: string;
  bridgeId: string;
  lights?: object;
}

interface PresenceProfileLocation {
  type: "LOCATION"
  profileIdx: number
  locationId: number
}

interface PresenceProfileSphere {
  type: "SPHERE"
  profileIdx: number
}

type PresenceProfile = PresenceProfileLocation | PresenceProfileSphere

type PresenceEventType = "ENTER" | "LEAVE"

interface PresenceEvent{
  type: PresenceEventType
  data: PresenceProfile
}

interface SphereLocation {
  latitude: number,
  longitude: number
}
interface PrioritizedList{
  1: SwitchBehaviour[];
  2: SwitchBehaviour[];
  3: SwitchBehaviour[];
  4: SwitchBehaviour[];
}

type EventUnsubscriber = () => void