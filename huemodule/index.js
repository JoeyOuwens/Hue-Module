"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Framework = exports.failure = exports.success = exports.Failure = exports.Success = void 0;
var fs_1 = require("fs");
var node_hue_api_1 = require("node-hue-api");
var nupnp_1 = require("node-hue-api/lib/api/discovery/nupnp");
var discovery = node_hue_api_1.v3.discovery;
var hueApi = node_hue_api_1.v3.api;
var model = node_hue_api_1.v3.model;
//User signing
var APP_NAME = 'node-hue-api';
var DEVICE_NAME = 'testSuite';
//Return messages/Error codes
var NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
var NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
var UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
var BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
var BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";
var Light = /** @class */ (function () {
    function Light(name, uniqueId, state, id, reachable) {
        this.reachable = false;
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.reachable = reachable;
    }
    Light.prototype.update = function (newValues) {
        var _this = this;
        Object.keys(newValues).forEach(function (key) {
            if (typeof (_this[key]) !== undefined) {
                _this[key] = newValues[key];
            }
        });
    };
    return Light;
}());
var Bridge = /** @class */ (function () {
    function Bridge(name, username, clientKey, macAddress, ipAddress, bridgeId, framework) {
        this.reachable = false;
        this.name = name;
        this.username = username;
        this.ipAddress = ipAddress;
        this.clientKey = clientKey;
        this.macAddress = macAddress;
        this.bridgeId = bridgeId;
        //temp fix??
        this.framework = framework;
    }
    Bridge.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.username == "")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.link()];
                    case 1:
                        result = _a.sent();
                        if (result.isFailure()) {
                            return [2 /*return*/, result];
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.connect()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.link = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, bridgeConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createUser()];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.api.configuration.getConfiguration()];
                    case 3:
                        bridgeConfig = _a.sent();
                        this.update({
                            "bridgeId": bridgeConfig.bridgeId,
                            "name": bridgeConfig.name,
                            "macAddress": bridgeConfig.mac,
                            "reachable": true
                        });
                        return [2 /*return*/, exports.success(true)];
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    Bridge.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createAuthenticatedApi().then(function (res) {
                            return res;
                        })];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 2];
                        return [2 /*return*/, result];
                    case 2:
                        if (!result.isFailure()) return [3 /*break*/, 6];
                        if (!(result.value == "ENOTFOUND" || result.value == "ETIMEDOUT")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._rediscoverMyself().then(function (res) {
                                return res;
                            })];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/, result];
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, exports.failure("UNEXPECTED ERROR")];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.getConnectedLights = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.lights];
            });
        });
    };
    Bridge.prototype.createAuthenticatedApi = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, hueApi.createLocal(this.ipAddress).connect(this.username)];
                    case 1:
                        result = _a.sent();
                        this.api = result;
                        this.reachable = true;
                        return [2 /*return*/, exports.success(true)];
                    case 2:
                        err_1 = _a.sent();
                        return [2 /*return*/, exports.failure(err_1.code)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.createUnAuthenticatedApi = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, hueApi.createLocal(this.ipAddress)];
                    case 1:
                        result = _a.sent();
                        this.api = result;
                        this.reachable = true;
                        return [2 /*return*/, exports.success(true)];
                    case 2:
                        err_2 = _a.sent();
                        return [2 /*return*/, exports.failure(err_2.code)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    //User should press link button before this is called.
    Bridge.prototype.createUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, createdUser, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createUnAuthenticatedApi().then(function (res) {
                            return res;
                        })];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.api.value.users.createUser(APP_NAME, DEVICE_NAME)];
                    case 3:
                        createdUser = _a.sent();
                        this.update({ "username": createdUser.username, "clientKey": createdUser.clientkey });
                        return [2 /*return*/, exports.success(true)];
                    case 4:
                        err_3 = _a.sent();
                        if (err_3.getHueErrorType() === 101) {
                            return [2 /*return*/, exports.failure(BRIDGE_LINK_BUTTON_UNPRESSED)];
                        }
                        else {
                            return [2 /*return*/, exports.failure(err_3.code)];
                        }
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, result];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    //Attempts to find- and connect to the bridge
    Bridge.prototype._rediscoverMyself = function () {
        return __awaiter(this, void 0, void 0, function () {
            var possibleBridges, result, _i, _a, item, oldIpAddress, api;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getBridgesFromDiscoveryUrl().catch(function (err) {
                            return exports.failure(err.code);
                        })];
                    case 1:
                        possibleBridges = _b.sent();
                        if (!possibleBridges.isSuccess()) return [3 /*break*/, 7];
                        if (!(possibleBridges.value.length === 0)) return [3 /*break*/, 2];
                        return [2 /*return*/, exports.failure(NO_BRIDGES_DISCOVERED)];
                    case 2:
                        result = { id: "", internalipaddress: "" };
                        for (_i = 0, _a = possibleBridges.value; _i < _a.length; _i++) {
                            item = _a[_i];
                            if (this.bridgeId.toLowerCase() === item.id.toLowerCase()) {
                                result = item;
                                break;
                            }
                        }
                        if (!(typeof (result) === "object")) return [3 /*break*/, 6];
                        oldIpAddress = this.ipAddress;
                        this.ipAddress = result.internalipaddress;
                        return [4 /*yield*/, this.createAuthenticatedApi().catch(function (err) {
                                return exports.failure(err.code);
                            })];
                    case 3:
                        api = _b.sent();
                        if (!api.isSuccess()) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.framework.saveBridgeInformation(this, oldIpAddress)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, api];
                    case 5: return [2 /*return*/, api];
                    case 6: return [3 /*break*/, 8];
                    case 7: return [2 /*return*/, possibleBridges];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    //Uses the nupnp export from the library before it gets altered. ?Move outside class??
    Bridge.prototype._getBridgesFromDiscoveryUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nupnp_1.nupnp()
                            .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, exports.success(res)];
                            });
                        }); }).catch(function (err) {
                            if (err.code != undefined) {
                                return exports.failure(err.code);
                            }
                            else {
                                return exports.failure(err);
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Bridge.prototype.update = function (newValues) {
        var _this = this;
        Object.keys(newValues).forEach(function (key) {
            if (typeof (_this[key]) !== undefined) {
                _this[key] = newValues[key];
            }
        });
        this.framework.saveBridgeInformation(this);
    };
    Bridge.prototype.getAllLightsOnBridge = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.lights.getAll().then(function (res) {
                            return exports.success(res);
                        }).catch(function (err) {
                            return exports.failure(err.code);
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Bridge.prototype.setLightState = function (id, state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.lights.setLightState(id, state)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Bridge.prototype.getInfo = function () {
        return { name: this.name, ipAddress: this.ipAddress, macAddress: this.macAddress, username: this.username, clientKey: this.clientKey, bridgeId: this.bridgeId, reachable: this.reachable };
    };
    return Bridge;
}());
//config locations/names
var CONF_NAME = "saveConfig.json";
var CONF_BRIDGE_LOCATION = "bridges";
var CONF_LIGHT_LOCATION = "lights";
var Success = /** @class */ (function () {
    function Success(value) {
        this.value = value;
    }
    Success.prototype.isSuccess = function () {
        return true;
    };
    Success.prototype.isFailure = function () {
        return false;
    };
    return Success;
}());
exports.Success = Success;
var Failure = /** @class */ (function () {
    function Failure(value) {
        this.value = value;
    }
    Failure.prototype.isSuccess = function () {
        return false;
    };
    Failure.prototype.isFailure = function () {
        return true;
    };
    return Failure;
}());
exports.Failure = Failure;
exports.success = function (l) {
    return new Success(l);
};
exports.failure = function (a) {
    return new Failure(a);
};
var Framework = /** @class */ (function () {
    function Framework() {
        this.configSettings = { "bridges": "", "lights": "" };
        this.connectedBridges = new Array();
    }
    Framework.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, bridges, _i, _a, ip, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.getConfigSettings()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, this.getConfiguredBridges()];
                    case 2:
                        result = _d.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 7];
                        bridges = new Array();
                        _i = 0, _a = result.value;
                        _d.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        ip = _a[_i];
                        _c = (_b = bridges).push;
                        return [4 /*yield*/, this.createBridgeFromConfig(ip)];
                    case 4:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, bridges];
                    case 7: return [2 /*return*/, result];
                }
            });
        });
    };
    Framework.prototype.getConfigSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(CONF_NAME, 'utf8').then(function (data) {
                            _this.configSettings = JSON.parse(data);
                        }).catch(function (err) {
                            if (err.code === "ENOENT") {
                                _this.updateConfigFile();
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    // Returns either a list of bridges or a errorcode TODO: map result to Bridge
    Framework.prototype.discoverBridges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoveryResults, bridges_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, discovery.nupnpSearch().then(function (res) {
                            return res;
                        })];
                    case 1:
                        discoveryResults = _a.sent();
                        if (discoveryResults.length === 0) {
                            return [2 /*return*/, NO_BRIDGES_DISCOVERED];
                        }
                        else {
                            bridges_1 = new Array();
                            discoveryResults.forEach(function (item) {
                                bridges_1.push(new Bridge(item.name, "", "", "", item.ipaddress, "", _this));
                            });
                            return [2 /*return*/, bridges_1];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    //Returns a string[] of bridges or an string.
    Framework.prototype.getConfiguredBridges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bridges;
            return __generator(this, function (_a) {
                bridges = Object.keys(this.configSettings["bridges"]);
                if (bridges === undefined || bridges === null || bridges.length === 0) {
                    return [2 /*return*/, exports.failure(NO_BRIDGES_IN_CONFIG)];
                }
                else {
                    return [2 /*return*/, exports.success(bridges)];
                }
                return [2 /*return*/];
            });
        });
    };
    //Temp???
    Framework.prototype.saveBridgeInformation = function (bridge, oldIpAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var config, ipAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = bridge.getInfo();
                        ipAddress = config["ipAddress"];
                        delete config["reachable"];
                        delete config["ipAddress"];
                        this.configSettings[CONF_BRIDGE_LOCATION][ipAddress] = config;
                        if (oldIpAddress !== undefined) {
                            delete this.configSettings[CONF_BRIDGE_LOCATION][oldIpAddress];
                        }
                        return [4 /*yield*/, this.updateConfigFile()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //Call this to save configuration to the config file.
    Framework.prototype.updateConfigFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.writeFile(CONF_NAME, JSON.stringify(this.configSettings)).then(function (res) {
                            return exports.success(true);
                        }).catch(function (err) {
                            return exports.failure(err.code);
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Framework.prototype.getConnectedBridges = function () {
        return this.connectedBridges;
    };
    Framework.prototype.createBridgeFromConfig = function (ipAddress) {
        var bridge = new Bridge(this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].name, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].username, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].clientKey, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].macAddress, ipAddress, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].bridgeId, this);
        this.connectedBridges.push(bridge);
        return bridge;
    };
    return Framework;
}());
exports.Framework = Framework;
function testing() {
    return __awaiter(this, void 0, void 0, function () {
        var test, bridges, discoveredBridges, _a, _b, _c, _d, lights;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    test = new Framework();
                    return [4 /*yield*/, test.init()];
                case 1:
                    bridges = _e.sent();
                    return [4 /*yield*/, test.discoverBridges()];
                case 2:
                    discoveredBridges = _e.sent();
                    // @ts-ignore
                    _b = (_a = console).log;
                    return [4 /*yield*/, discoveredBridges[0].init()];
                case 3:
                    // @ts-ignore
                    _b.apply(_a, [_e.sent()]);
                    console.log(bridges);
                    return [4 /*yield*/, bridges[0].init()];
                case 4:
                    _e.sent();
                    bridges[0].update({ "name": "Philips Hue" });
                    _d = (_c = console).log;
                    return [4 /*yield*/, bridges[0].getInfo()];
                case 5:
                    _d.apply(_c, [_e.sent()]);
                    console.log(bridges);
                    return [4 /*yield*/, bridges[0].getAllLightsOnBridge()];
                case 6:
                    lights = _e.sent();
                    lights.value.forEach(function (light) {
                        bridges[0].setLightState(light.id, { on: false });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
testing();
