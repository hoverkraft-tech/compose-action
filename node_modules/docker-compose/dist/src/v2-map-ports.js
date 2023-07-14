"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mapPorts = function (ports) {
    if (!ports) {
        return [];
    }
    return ports.split(',').map(function (untypedPort) {
        var exposedFragments = untypedPort.trim().split('->');
        var _a = exposedFragments.length === 1
            ? exposedFragments[0].split('/')
            : exposedFragments[1].split('/'), port = _a[0], protocol = _a[1];
        var mapped = exposedFragments[0];
        var lastDoubleColon = mapped.lastIndexOf(':');
        if (lastDoubleColon === -1) {
            return {
                exposed: { port: Number(port), protocol: protocol }
            };
        }
        var address = mapped.substr(0, lastDoubleColon);
        var mappedPort = mapped.substr(lastDoubleColon + 1);
        return {
            exposed: { port: Number(port), protocol: protocol },
            mapped: { port: Number(mappedPort), address: address }
        };
    });
};
exports.default = mapPorts;
