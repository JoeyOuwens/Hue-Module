import {promises as fs} from 'fs';
import {Bridge} from "./Bridge";

const fetch = require('node-fetch');
import {v3} from "node-hue-api";
import {bri} from "node-hue-api/lib/model/lightstate/stateParameters";

const discovery = v3.discovery;
const hueApi = v3.api;
const model = v3.model;


//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";


//TODO


//config locations/names
const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "bridges";
const CONF_LIGHT_LOCATION: string = "lights";


export class Framework {
    configSettings: object = {"bridges": "", "lights": ""};
    connectedBridges: Bridge[] = new Array();

    APP_NAME: string = 'node-hue-api';
    DEVICE_NAME: string = 'testSuite';

    constructor() {
    }

    async init() {
        await this.getConfigSettings();
        const result = await this.getConfiguredBridges();
        let bridges = new Array();
        for (const ip of result) {
            bridges.push(await this.createBridgeFromConfig(ip));
        }
        return bridges;
    }

    async getConfigSettings(): Promise<void> {
        await fs.readFile(CONF_NAME, 'utf8').then((data) => {
            this.configSettings = JSON.parse(data);
        }).catch(err => {
            if (err.code === "ENOENT") {
                this.updateConfigFile();
            }
            throw err;
        });

    };


    // Returns either a list of bridges or a errorcode
    async discoverBridges(): Promise<Bridge[]> {
        const discoveryResults = await discovery.nupnpSearch()
        if (discoveryResults.length === 0) {
            throw Error(NO_BRIDGES_DISCOVERED);
        } else {
            let bridges: Bridge[] = new Array();
            discoveryResults.forEach(item => {
                bridges.push(new Bridge(
                    item.name,
                    "",
                    "",
                    "",
                    item.ipaddress,
                    "",
                    this
                ))
            })
            return bridges;
        }
    }


    //Returns a string[] of bridges or an string.
    getConfiguredBridges(): string[] {
        const bridges: string[] = Object.keys(this.configSettings["bridges"]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            throw Error(NO_BRIDGES_IN_CONFIG);
        } else {
            return bridges;
        }
    }

    //Temp???
    async saveBridgeInformation(bridge: Bridge, oldIpAddress?: string): Promise<void> {
        let config = bridge.getInfo();
        let ipAddress = config["ipAddress"];
        delete config["reachable"];
        delete config["ipAddress"];
        this.configSettings[CONF_BRIDGE_LOCATION][ipAddress] = config;
        if (oldIpAddress !== undefined) {
            delete this.configSettings[CONF_BRIDGE_LOCATION][oldIpAddress];
        }
        await this.updateConfigFile();
    }

    async saveAllLightsFromConnectedBridges() {
        this.connectedBridges.forEach(bridge => {
            bridge.getConnectedLights().forEach(async light => {
                await this.saveLightInfo(light.getInfo())
            })
        });
    }


    async saveLightInfo(light): Promise<void> {
        this.configSettings[CONF_LIGHT_LOCATION][light.uniqueId] = {};
        this.configSettings[CONF_LIGHT_LOCATION][light.uniqueId]["name"] = light.name;
        this.configSettings[CONF_LIGHT_LOCATION][light.uniqueId]["id"] = light.id;
        this.configSettings[CONF_LIGHT_LOCATION][light.uniqueId]["bridgeId"] = light.bridgeId;
        this.configSettings[CONF_LIGHT_LOCATION][light.uniqueId]["state"] = light.state;
        await this.updateConfigFile();
    }

    //Call this to save configuration to the config file.
    async updateConfigFile(): Promise<void> {
        return await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings));
    }

    getConnectedBridges() {
        return this.connectedBridges;
    }

    createBridgeFromConfig(ipAddress) {
        let bridge = new Bridge(this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].name, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].username, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].clientKey, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].macAddress, ipAddress, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].bridgeId, this);
        this.connectedBridges.push(bridge);
        return bridge;
    }

}


async function testing() {
    try {
        const test = new Framework();
        const bridges = await test.init();
        // const discoveredBridges = await test.discoverBridges();
        // console.log(await discoveredBridges[0].init());
        const bridge = bridges[1];
        const bridge2 = bridges[0];
        await bridge.init()
        await bridge2.init()
        await test.saveAllLightsFromConnectedBridges();

        const lights = bridge2.getConnectedLights()
        // console.log(lights[0].getInfo());
        // console.log(await lights[0].setState({ct: 40}));
        const light = bridge2.getLightById("00:17:88:01:10:25:5d:16-0b");
        // await light.updateStateFromBridge();
        // await test.saveLightInfo(light)

    } catch (err) {
        console.log(err);
    }
}

testing();
