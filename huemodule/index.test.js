/**
 * @jest-environment node
 */

const Framework = require('./index').Framework;
const Bridge = require('./Bridge').Bridge;

const framework = new Framework();
const notWorkingBridge = new Bridge("Hue color lamp 3","user","key","mac","192.168.178.12","-1",framework);

test('Returns the amount of bridges.', async () => {
    const bridges =  await framework.init();
    return  expect(bridges.length).toBeGreaterThan(0);
});

test('Returns discovery result bridges.', async () => {
     await framework.init();
    return await framework.discoverBridges().then(data => {expect(data.length).toBeGreaterThan(0) });
});

test('Returns bridge info', () => {
    return expect(notWorkingBridge.getInfo()).toStrictEqual({
        name: "Hue color lamp 3",
        ipAddress: "192.168.178.12",
        macAddress: "mac",
        username: "user",
        clientKey: "key",
        bridgeId: "-1",
        reachable: false
    });
});

test('Returns no bridge discovered', async () => {
    return expect(await notWorkingBridge.init()).toStrictEqual( Error("NO_BRIDGES_DISCOVERED"))
});


