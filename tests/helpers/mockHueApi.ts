import {v3} from "node-hue-api";
export const fakeBridgeKey = {clientkey: "FakeKey", username: "FakeUsername"}
export const fakeBridge = {
  bridgeid: "ABDCFFFEAKE91",
  name: "Philips Hue Fake Bridge",
  mac: "AB:DC:FA:KE:91",
  ipaddress: "192.168.178.10"
}
export const fakeLightsOnBridge = [{
  name: "Light 1",
  uniqueid: "ABCD123",
  state: {
    "on": true,
    "bri": 190,
    "alert": "select",
    "mode": "homeautomation",
    "reachable": true
  },
  id: 0,
  bridgeId: "ABDCFFFEAKE91",
  capabilities: {control: {}},
  getSupportedStates: (() => {
    return {}
  })
}, {
  name: "Light 2",
  uniqueid: "XYZ0987",
  state: {
    "on": true,
    "bri": 190,
    "alert": "select",
    "mode": "homeautomation",
    "reachable": true
  },
  id: 1,
  bridgeId: "ABDCFFFEAKE91",
  capabilities: {control: {}},
  getSupportedStates: (() => {
    return {}
  })
}]

export const fakeCreateLocal = ((ipaddress) => {
  if (ipaddress === fakeBridge.ipaddress) {
    return {
      connect: ((ignore) => {return fakeHueApi})
    }
  } else {
    return {connect: ( () => Promise.reject({code: "ETIMEDOUT"}))}
  }
})
const fakeApiLights = {
  getAll: (() => {
    return fakeLightsOnBridge;
  }),
  getLight: ((id) => {
    return fakeLightsOnBridge[id]
  }),
  setLightState: ((id, state) => {fakeLightsOnBridge[id].state = {...state};
    return true;
  }),
  getLightState: ((id) => {
    return {...fakeLightsOnBridge[id].state};
  })
}

export const fakeHueApi = {
  users: {
    createUser: ((a, b) => {
      return fakeBridgeKey;
    })
  },
  configuration: {
    getConfiguration: (() => {
      return fakeBridge;
    })
  },
  lights: fakeApiLights
}

export const fakeNupnpSearch = (() => {
  return [{name: fakeBridge.name, ipaddress: fakeBridge.ipaddress}]
})