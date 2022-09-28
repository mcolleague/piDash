const http = require("http");
const fs = require('fs').promises;
const { exec } = require('child_process');

const routeActions = {
    "/plaincast": {
        scripts: ['sudo systemctl restart plaincast'],
        responseText: "Plaincast service has been restarted."
    },
    "/plaincast-kill": {
        scripts: ['sudo systemctl stop plaincast'],
        responseText: "Plaincast service has been stopped."
    },    
    "/reboot": {
        scripts: ['sudo shutdown -r now'],
        responseText: "Pi is rebooting."
    },
    "/shutdown": {
        scripts: ['sudo shutdown -h now'],
        responseText: "Pi is shutting down."
    },
    "/restart-server": {
        scripts: [
            'killall node',
            'node ~/Projects/piDash/index.js'
        ],
        responseText: "Node server restarted."
    }
}

const host = '0.0.0.0';
const port = 8000;

const requestListener = function (req, res) {
    if (Object.keys(routeActions).indexOf(req.url) > -1) {
        routeActions[req.url].scripts.forEach((script) => exec(script));
        res.end(routeActions[req.url].responseText);
    } else {
        fs.readFile(__dirname + "/index.html")
            .then(contents => {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(contents);
            })
            .catch(err => {
                res.writeHead(500);
                res.end(err);
                return;
            });   
    }     
};

const server = http.createServer(requestListener);

let indexFile;

fs.readFile(__dirname + "/index.html")
    .then(contents => {
        indexFile = contents;
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    })
    .catch(err => {
        console.error(`Could not read index.html file: ${err}`);
        process.exit(1);
    });