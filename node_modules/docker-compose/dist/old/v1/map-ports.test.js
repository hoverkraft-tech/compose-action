"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var map_ports_1 = __importDefault(require("../../src/map-ports"));
test('map ports for empty string', function () {
    expect((0, map_ports_1.default)('')).toEqual([]);
});
test('map ports for exposed tcp', function () {
    expect((0, map_ports_1.default)('80/tcp')).toEqual([
        { exposed: { port: 80, protocol: 'tcp' } }
    ]);
});
test('map ports for exposed tcp on ivp4 interface', function () {
    expect((0, map_ports_1.default)('0.0.0.0:443->443/tcp')).toEqual([
        {
            exposed: { port: 443, protocol: 'tcp' },
            mapped: { address: '0.0.0.0', port: 443 }
        }
    ]);
});
test('map multiple tcp ports exposed on ivp4 interfaces', function () {
    expect((0, map_ports_1.default)('0.0.0.0:443->443/tcp, 0.0.0.0:80->80/tcp')).toEqual([
        {
            exposed: { port: 443, protocol: 'tcp' },
            mapped: { address: '0.0.0.0', port: 443 }
        },
        {
            exposed: { port: 80, protocol: 'tcp' },
            mapped: { address: '0.0.0.0', port: 80 }
        }
    ]);
});
test('map multiple tcp ports exposed on ipv4 and ipv6 interfaces', function () {
    expect((0, map_ports_1.default)('0.0.0.0:443->443/tcp,:::443->443/tcp, 0.0.0.0:80->80/tcp,:::80->80/tcp')).toEqual([
        {
            exposed: { port: 443, protocol: 'tcp' },
            mapped: { address: '0.0.0.0', port: 443 }
        },
        {
            exposed: { port: 443, protocol: 'tcp' },
            mapped: { address: '::', port: 443 }
        },
        {
            exposed: { port: 80, protocol: 'tcp' },
            mapped: { address: '0.0.0.0', port: 80 }
        },
        {
            exposed: { port: 80, protocol: 'tcp' },
            mapped: { address: '::', port: 80 }
        }
    ]);
});
