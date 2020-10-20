import {
  switchOn100Range,
  switchOn30Range, switchOn50Range23500500, switchOn70Range1310sunset, switchOn80Range13001500,
  twilight60BetweenRange, twilight70Range12001500,
  twilight80BetweenSunriseSunset
} from "./constants/mockBehaviours";
import {SPHERE_LOCATION} from "./constants/testConstants";
import {Light} from "./helpers/Light";
import {Api} from "./helpers/Api";
import {HueBehaviourWrapperBehaviour, HueBehaviourWrapperTwilight} from "../src/declarations/behaviourTypes";


describe("Scenarios", () =>{
//  Scenario 0
// setup
// No active SwitchBehaviours
// Active Twilight at 80%
// Current Aggregated state off
//
// events
// user switches
// result: next aggregated state: 80%
// Active Twilight changes to 60%
// result: next aggregated state: 60%
// a SwitchBehaviour becomes active (100%)
// result: next aggregated state: 60% ( == min(60,100) )
// Another SwitchBehaviour becomes active, BehaviourHandler prioritizes this one. BehaviourState: 30%
// result: next aggregated state: 30% == min(60,30)
//
  test("Scenario 0",  async ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn30Range,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn100Range,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight60BetweenRange,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight80BetweenSunriseSunset,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));

    await behaviourAggregator._loop();
    api.user.turnLightOff();
    await light.renewState();
    await behaviourAggregator._loop();
    // End setup;
    //User turns on light
    api.user.turnLightOn();
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:80*2.54});
    //Twilight gets active
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 10).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:60*2.54});

    //SwitchBehaviour  with 100% gets active.
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 15).toString()));
    await behaviourAggregator._loop();
    expect(light.state.bri/2.54).toBe(60);

    //SwitchBehaviour  with 30% gets active.
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:30*2.54});
  })
  //
  test("Scenario 1", async () =>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn70Range1310sunset,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight80BetweenSunriseSunset,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    api.user.turnLightOff();
    await light.renewState();
    await behaviourAggregator._loop();
    // End setup;
    //User turns on light
    api.user.turnLightOn();
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state.bri/2.54).toBe(80);

    //User turns off light
    api.user.turnLightOff();
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //SwitchBehaviour activates
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 10).toString()));
    await behaviourAggregator._loop();
    expect(light.state.bri/2.54).toBe(70);

  });

  test("Scenario 2", async () =>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight80BetweenSunriseSunset,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn70Range1310sunset,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn30Range,SPHERE_LOCATION)
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn50Range23500500,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    api.user.turnLightOff();
    await light.renewState();
    await behaviourAggregator._loop();
    // End setup;

    //User turns on light
    api.user.turnLightOn();
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state).toStrictEqual({on:true,bri:80*2.54});
    //SwitchBehaviour activates
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 10).toString()));
    await behaviourAggregator._loop();
    expect(light.state).toStrictEqual({on:true,bri:70*2.54});

    //User turns off light
    api.user.turnLightOff();
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //SwitchBehaviour activates
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20).toString()));
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //All behaviours inactive
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 23, 20).toString()));
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //new behaviour active
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 23, 50).toString()));
    await behaviourAggregator._loop();
    expect(light.state).toStrictEqual({on:true,bri:50*2.54});
  });

  test("Scenario 3",async ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight70Range12001500,SPHERE_LOCATION);
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn80Range13001500,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    //Users dims light to 50.
    api.user.dimLight(50)
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    expect(behaviourAggregator.override === "DIM_STATE_OVERRIDE")

    //All behaviours inactive
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 15, 0).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })

  test("Scenario 4",async ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight70Range12001500,SPHERE_LOCATION);
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn80Range13001500,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 12, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    //Users dims light to 50.
    api.user.dimLight(50)
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    expect(behaviourAggregator.override === "DIM_STATE_OVERRIDE")
    //Behaviour gets active
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    //All behaviours inactive
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 15, 0).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })

  test("Scenario 5",async ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilight70Range12001500,SPHERE_LOCATION);
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn100Range,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 14, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    //Users dims light to 50.
    api.user.dimLight(50)
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    expect(behaviourAggregator.override === "DIM_STATE_OVERRIDE")
    //User turns off light
    api.user.turnLightOff();
    await light.renewState();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    //User turns on light
    api.user.turnLightOn();
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })

  test("Scenario 6",async ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn80Range13001500,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 14, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:80*2.54});
    //User turns off light
    api.user.turnLightOff();
    await light.renewState();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    expect(behaviourAggregator.override === "SWITCH_STATE_OVERRIDE")
    //User turns on light
    api.user.turnLightOn();
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:80*2.54});
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })






})

