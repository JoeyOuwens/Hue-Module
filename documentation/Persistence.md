# Documentation - Persistence
## Overview
 - Crownstone Hue  
 - Discovery
 - Bridge
 - Light 
 - LightAggregatorWrapper
 - Behaviour Aggregator 
 - Behaviour & Twilight Prioritizer 
 - Behavior/Twilight 
 - **Persistence** 
 - Event calls
 - Errors

## About
This is a persistence utility for the Crownstone Hue module, it has a few basic functions for preserving and loading the data of the objects used. 
 
## Usage
The Persistence utility is a singelton class created at runtime, to use it you simply import it and then call it's functions.
The usage of the utility is a builder like approach and you'll have to save after you are done updating the configuration. 

In short: to use the persistence utility, call `await Persistence.loadConfiguration()`
Then use one of the functions to build up the configuration.
Example: `Persistence.appendLight("bridgeId", Light)`
Then when ready, save the current configuration by calling  `await Persistence.saveConfiguration()`.

### Importing
`import {Persistence} from "."`

### Loading (Call before using)
To load the configuration, call:
` await Persistence.loadConfiguration()`
This loads the configuration from the configuration file, location and name is defined as variable `CONF_NAME`.
If the configuration file does not exist yet, an empty configuration file will be created.

If file is loaded or created, a configuration variable will be initialized with the last configuration and the current configuration is returned as `ConfigurationObject`.

If this is not called first before using, it will throw a error while trying to update the configuration.

### Save configuration
To save the current configuration, call:
`await Persistence.saveConfiguration()`
This saves the configuration into the configuration file.

### Building up the configuration
By calling one of these functions below, you'll build up the configuration variable.
These do not save them automatically and the configuration should be loaded in before using them.
`appendBridge(bridgeInfo:BridgeInfo): void`

`removeBridge(bridgeId: string): void`

`appendAllLightsFromConnectedBridges(bridges:Bridge[]): void`

`appendLight(bridgeId: string, light: Light | LightInfoObject): void `

`removeLightFromConfig(bridge: Bridge, uniqueLightId: string): void `

`appendBehaviour(bridgeId:string, lightId:string, behaviour:HueBehaviourWrapper): void`

`updateBehaviour(bridgeId: string, lightId: string, updatedBehaviour:HueBehaviourWrapper): void`

`removeBehaviour(bridgeId: string, lightId: string, cloudId: string): void`


### Retrieving objects
`getConfiguredBridges(): ConfBridgeObject[]`

` getAllBridges(): ConfBridges`

` getBridgeById(bridgeId: string): ConfBridgeObject`