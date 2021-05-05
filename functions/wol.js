const dgram = require('dgram');
const util = require('util');

async function main(event) {
    // Check request metadata
    if (event.httpMethod !== 'GET')
        throw new Error('Invalid method');

    // Check request body
    let {host, port, mac} = event.queryStringParameters;
    if (typeof(host) !== 'string')
        throw new Error('Invalid host');
    if (typeof(port) !== 'string')
        throw new Error('Invalid port');
    port = parseInt(port)
    if (typeof(port) !== 'number' || !isFinite(port) || port <= 0 || port >= 65536)
        throw new Error('Invalid port');
    if (typeof(mac) !== 'string' || mac.length !== 17)
        throw new Error('Invalid mac');
    mac = mac.split(':')
    if (mac.length !== 6 || mac.some(e => e.length !== 2))
        throw new Error('Invalid mac');
    mac = mac.join('')

    // Send magic packet
    const payload = Buffer.from('ff'.repeat(6) + mac.repeat(16), 'hex')
    const client = dgram.createSocket('udp4');
    await util.promisify(client.send.bind(client))(payload, port, host)
    client.close()
}

exports.handler = async function(event, context) {
    try {
        await main(event);
    } catch (err) {
        return { statusCode: 400, body: "false" };
    }
    return { statusCode: 200, body: "true" }

    // try {
    //     await main(event);
    // } catch (err) {
    //     return { statusCode: 400, body: JSON.stringify({stack: err.stack, event: event}) };
    // }
    // return { statusCode: 200, body: "true" }
}
