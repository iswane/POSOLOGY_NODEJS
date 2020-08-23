const IFACES = require('os').networkInterfaces();
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const express = require('express');
const OS_NAME = require('os-name');
const CORSES = require('cors');
const app = express();
const VERSION_SYSTEM = OS_NAME();
const PORT_SERVER = 3000;
let PORT_SERIAL;
let HOSTNAME;
let ADDRESS;
require('events').EventEmitter.defaultMaxListeners = Infinity;

app.use(CORSES({origin: '*'}));

Object.keys(IFACES).forEach(dev => {
    IFACES[dev].filter(details => {
        if (details.family === 'IPv4' && details.internal === false) {
            ADDRESS = details.address;
            if(ADDRESS.startsWith('192.168')) {
                HOSTNAME = ADDRESS;
            }if(ADDRESS.startsWith('172.29')) {
                HOSTNAME = ADDRESS;
            } else {
                HOSTNAME = ADDRESS;
            }
        }
    });
});

if(VERSION_SYSTEM.toUpperCase().startsWith('LINUX')) {
    PORT_SERIAL = new SerialPort('/dev/tty.usbserial-1420', { baudRate: 256000 });
} else if(VERSION_SYSTEM.toUpperCase().startsWith('MACOS')) {
    PORT_SERIAL = new SerialPort('/dev/tty.usbserial-1420', { baudRate: 256000 });
} else if(VERSION_SYSTEM.toUpperCase().startsWith('WINDOWS')) {
    PORT_SERIAL = new SerialPort('COM4');
}

const PARSER_SERIAL = new Readline();
PORT_SERIAL.pipe(PARSER_SERIAL);
let poidsproduit = '00.00';

app.get('/api/getPoids', (req, res) => {
    /*serialport.list((err, ports) => {
        ports.forEach((port) => {
            console.log('COM NAME ::: ', port.comName);
        });
    });*/

    PARSER_SERIAL.on('data', line => {
        poidsproduit = line;
        poidsproduit = poidsproduit.replace('ww00', '');
        poidsproduit = poidsproduit.replace('wn00', '');
        poidsproduit = poidsproduit.replace('wn-00', '-');
        poidsproduit = poidsproduit.replace('ww-00', '-');
        poidsproduit = poidsproduit.substr(0, poidsproduit.length - 3);
        console.log('poidsproduit ::: ', poidsproduit);
    });
    PORT_SERIAL.write('ROBOT POWER ON\n');

    if(res.statusCode === 200) {
        res.send({
            poids: poidsproduit
        });
    }
});

app.listen(PORT_SERVER, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT_SERVER}/`);
});
