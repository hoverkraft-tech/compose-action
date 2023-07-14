"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.port = exports.logs = exports.restartOne = exports.restartMany = exports.restartAll = exports.push = exports.ps = exports.configVolumes = exports.configServices = exports.config = exports.pullOne = exports.pullMany = exports.pullAll = exports.buildOne = exports.buildMany = exports.buildAll = exports.run = exports.exec = exports.rm = exports.kill = exports.unpauseOne = exports.pauseOne = exports.stopMany = exports.stopOne = exports.stop = exports.down = exports.upOne = exports.upMany = exports.upAll = exports.execCompose = exports.mapPsOutput = void 0;
var child_process_1 = __importDefault(require("child_process"));
var yaml_1 = __importDefault(require("yaml"));
var v2_map_ports_1 = __importDefault(require("./v2-map-ports"));
var nonEmptyString = function (v) { return v !== ''; };
var mapPsOutput = function (output, options) {
    var isQuiet = false;
    if (options === null || options === void 0 ? void 0 : options.commandOptions) {
        isQuiet =
            options.commandOptions.includes('-q') ||
                options.commandOptions.includes('--quiet') ||
                options.commandOptions.includes('--services');
    }
    var services = output
        .split("\n")
        .filter(nonEmptyString)
        .filter(function (_, index) { return isQuiet || index >= 1; })
        .map(function (line) {
        var _a;
        var nameFragment = line;
        var commandFragment = '';
        var imageFragment = '';
        var serviceFragment = '';
        var createdFragment = '';
        var stateFragment = '';
        var untypedPortsFragment = '';
        if (!isQuiet) {
            ;
            _a = line.split(/\s{3,}/), nameFragment = _a[0], imageFragment = _a[1], commandFragment = _a[2], serviceFragment = _a[3], createdFragment = _a[4], stateFragment = _a[5], untypedPortsFragment = _a[6];
        }
        return {
            name: nameFragment.trim(),
            command: commandFragment.trim(),
            state: stateFragment.trim(),
            ports: (0, v2_map_ports_1.default)(untypedPortsFragment.trim())
        };
    });
    return { services: services };
};
exports.mapPsOutput = mapPsOutput;
/**
 * Converts supplied yml files to cli arguments
 * https://docs.docker.com/compose/reference/overview/#use--f-to-specify-name-and-path-of-one-or-more-compose-files
 */
var configToArgs = function (config) {
    if (typeof config === 'undefined') {
        return [];
    }
    else if (typeof config === 'string') {
        return ['-f', config];
    }
    else if (config instanceof Array) {
        return config.reduce(function (args, item) { return args.concat(['-f', item]); }, []);
    }
    throw new Error("Invalid argument supplied: ".concat(config));
};
/**
 * Converts docker compose commandline options to cli arguments
 */
var composeOptionsToArgs = function (composeOptions) {
    var composeArgs = [];
    composeOptions.forEach(function (option) {
        if (option instanceof Array) {
            composeArgs = composeArgs.concat(option);
        }
        if (typeof option === 'string') {
            composeArgs = composeArgs.concat([option]);
        }
    });
    return composeArgs;
};
/**
 * Executes docker compose command with common options
 */
var execCompose = function (command, args, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        var composeOptions = options.composeOptions || [];
        var commandOptions = options.commandOptions || [];
        var composeArgs = composeOptionsToArgs(composeOptions);
        var isConfigProvidedAsString = !!options.configAsString;
        var configArgs = isConfigProvidedAsString
            ? ['-f', '-']
            : configToArgs(options.config);
        composeArgs = composeArgs.concat(configArgs.concat([command].concat(composeOptionsToArgs(commandOptions), args)));
        var cwd = options.cwd;
        var env = options.env || undefined;
        var executablePath = options.executablePath || 'docker';
        var childProc = child_process_1.default.spawn(executablePath, __spreadArray(['compose'], composeArgs, true), {
            cwd: cwd,
            env: env
        });
        childProc.on('error', function (err) {
            reject(err);
        });
        var result = {
            exitCode: null,
            err: '',
            out: ''
        };
        childProc.stdout.on('data', function (chunk) {
            var _a;
            result.out += chunk.toString();
            (_a = options.callback) === null || _a === void 0 ? void 0 : _a.call(options, chunk, 'stdout');
        });
        childProc.stderr.on('data', function (chunk) {
            var _a;
            result.err += chunk.toString();
            (_a = options.callback) === null || _a === void 0 ? void 0 : _a.call(options, chunk, 'stderr');
        });
        childProc.on('exit', function (exitCode) {
            result.exitCode = exitCode;
            setTimeout(function () {
                if (exitCode === 0) {
                    resolve(result);
                }
                else {
                    reject(result);
                }
            }, 500);
        });
        if (isConfigProvidedAsString) {
            childProc.stdin.write(options.configAsString);
            childProc.stdin.end();
        }
        if (options.log) {
            childProc.stdout.pipe(process.stdout);
            childProc.stderr.pipe(process.stderr);
        }
    });
};
exports.execCompose = execCompose;
/**
 * Determines whether or not to use the default non-interactive flag -d for up commands
 */
var shouldUseDefaultNonInteractiveFlag = function (options) {
    if (options === void 0) { options = {}; }
    var commandOptions = options.commandOptions || [];
    var containsOtherNonInteractiveFlag = commandOptions.reduce(function (memo, item) {
        return (memo &&
            !item.includes('--abort-on-container-exit') &&
            !item.includes('--no-start'));
    }, true);
    return containsOtherNonInteractiveFlag;
};
var upAll = function (options) {
    var args = shouldUseDefaultNonInteractiveFlag(options) ? ['-d'] : [];
    return (0, exports.execCompose)('up', args, options);
};
exports.upAll = upAll;
var upMany = function (services, options) {
    var args = shouldUseDefaultNonInteractiveFlag(options)
        ? ['-d'].concat(services)
        : services;
    return (0, exports.execCompose)('up', args, options);
};
exports.upMany = upMany;
var upOne = function (service, options) {
    var args = shouldUseDefaultNonInteractiveFlag(options)
        ? ['-d', service]
        : [service];
    return (0, exports.execCompose)('up', args, options);
};
exports.upOne = upOne;
var down = function (options) {
    return (0, exports.execCompose)('down', [], options);
};
exports.down = down;
var stop = function (options) {
    return (0, exports.execCompose)('stop', [], options);
};
exports.stop = stop;
var stopOne = function (service, options) {
    return (0, exports.execCompose)('stop', [service], options);
};
exports.stopOne = stopOne;
var stopMany = function (options) {
    var services = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        services[_i - 1] = arguments[_i];
    }
    return (0, exports.execCompose)('stop', __spreadArray([], services, true), options);
};
exports.stopMany = stopMany;
var pauseOne = function (service, options) {
    return (0, exports.execCompose)('pause', [service], options);
};
exports.pauseOne = pauseOne;
var unpauseOne = function (service, options) {
    return (0, exports.execCompose)('unpause', [service], options);
};
exports.unpauseOne = unpauseOne;
var kill = function (options) {
    return (0, exports.execCompose)('kill', [], options);
};
exports.kill = kill;
var rm = function (options) {
    var services = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        services[_i - 1] = arguments[_i];
    }
    return (0, exports.execCompose)('rm', __spreadArray(['-f'], services, true), options);
};
exports.rm = rm;
var exec = function (container, command, options) {
    var args = Array.isArray(command) ? command : command.split(/\s+/);
    return (0, exports.execCompose)('exec', ['-T', container].concat(args), options);
};
exports.exec = exec;
var run = function (container, command, options) {
    var args = Array.isArray(command) ? command : command.split(/\s+/);
    return (0, exports.execCompose)('run', ['-T', container].concat(args), options);
};
exports.run = run;
var buildAll = function (options) {
    if (options === void 0) { options = {}; }
    return (0, exports.execCompose)('build', options.parallel ? ['--parallel'] : [], options);
};
exports.buildAll = buildAll;
var buildMany = function (services, options) {
    if (options === void 0) { options = {}; }
    return (0, exports.execCompose)('build', options.parallel ? ['--parallel'].concat(services) : services, options);
};
exports.buildMany = buildMany;
var buildOne = function (service, options) {
    return (0, exports.execCompose)('build', [service], options);
};
exports.buildOne = buildOne;
var pullAll = function (options) {
    if (options === void 0) { options = {}; }
    return (0, exports.execCompose)('pull', [], options);
};
exports.pullAll = pullAll;
var pullMany = function (services, options) {
    if (options === void 0) { options = {}; }
    return (0, exports.execCompose)('pull', services, options);
};
exports.pullMany = pullMany;
var pullOne = function (service, options) {
    return (0, exports.execCompose)('pull', [service], options);
};
exports.pullOne = pullOne;
var config = function (options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, config_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.execCompose)('config', [], options)];
                case 1:
                    result = _a.sent();
                    config_1 = yaml_1.default.parse(result.out);
                    return [2 /*return*/, __assign(__assign({}, result), { data: { config: config_1 } })];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, Promise.reject(error_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.config = config;
var configServices = function (options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, services, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.execCompose)('config', ['--services'], options)];
                case 1:
                    result = _a.sent();
                    services = result.out.split('\n').filter(nonEmptyString);
                    return [2 /*return*/, __assign(__assign({}, result), { data: { services: services } })];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, Promise.reject(error_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.configServices = configServices;
var configVolumes = function (options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, volumes, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.execCompose)('config', ['--volumes'], options)];
                case 1:
                    result = _a.sent();
                    volumes = result.out.split('\n').filter(nonEmptyString);
                    return [2 /*return*/, __assign(__assign({}, result), { data: { volumes: volumes } })];
                case 2:
                    error_3 = _a.sent();
                    return [2 /*return*/, Promise.reject(error_3)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.configVolumes = configVolumes;
var ps = function (options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.execCompose)('ps', [], options)];
                case 1:
                    result = _a.sent();
                    data = (0, exports.mapPsOutput)(result.out, options);
                    return [2 /*return*/, __assign(__assign({}, result), { data: data })];
                case 2:
                    error_4 = _a.sent();
                    return [2 /*return*/, Promise.reject(error_4)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.ps = ps;
var push = function (options) {
    if (options === void 0) { options = {}; }
    return (0, exports.execCompose)('push', options.ignorePushFailures ? ['--ignore-push-failures'] : [], options);
};
exports.push = push;
var restartAll = function (options) {
    return (0, exports.execCompose)('restart', [], options);
};
exports.restartAll = restartAll;
var restartMany = function (services, options) {
    return (0, exports.execCompose)('restart', services, options);
};
exports.restartMany = restartMany;
var restartOne = function (service, options) {
    return (0, exports.restartMany)([service], options);
};
exports.restartOne = restartOne;
var logs = function (services, options) {
    if (options === void 0) { options = {}; }
    var args = Array.isArray(services) ? services : [services];
    if (options.follow) {
        args = __spreadArray(['--follow'], args, true);
    }
    return (0, exports.execCompose)('logs', args, options);
};
exports.logs = logs;
var port = function (service, containerPort, options) {
    return __awaiter(this, void 0, void 0, function () {
        var args, result, _a, address, port_1, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    args = [service, containerPort];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, exports.execCompose)('port', args, options)];
                case 2:
                    result = _b.sent();
                    _a = result.out.split(':'), address = _a[0], port_1 = _a[1];
                    return [2 /*return*/, __assign(__assign({}, result), { data: {
                                address: address,
                                port: Number(port_1)
                            } })];
                case 3:
                    error_5 = _b.sent();
                    return [2 /*return*/, Promise.reject(error_5)];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.port = port;
var version = function (options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, version_1, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.execCompose)('version', ['--short'], options)];
                case 1:
                    result = _a.sent();
                    version_1 = result.out.replace('\n', '').trim();
                    return [2 /*return*/, __assign(__assign({}, result), { data: { version: version_1 } })];
                case 2:
                    error_6 = _a.sent();
                    return [2 /*return*/, Promise.reject(error_6)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.version = version;
exports.default = {
    upAll: exports.upAll,
    upMany: exports.upMany,
    upOne: exports.upOne,
    down: exports.down,
    stop: exports.stop,
    stopOne: exports.stopOne,
    stopMany: exports.stopMany,
    pauseOne: exports.pauseOne,
    unpauseOne: exports.unpauseOne,
    kill: exports.kill,
    rm: exports.rm,
    exec: exports.exec,
    run: exports.run,
    buildAll: exports.buildAll,
    buildMany: exports.buildMany,
    buildOne: exports.buildOne,
    pullAll: exports.pullAll,
    pullMany: exports.pullMany,
    pullOne: exports.pullOne,
    config: exports.config,
    configServices: exports.configServices,
    configVolumes: exports.configVolumes,
    ps: exports.ps,
    push: exports.push,
    restartAll: exports.restartAll,
    restartMany: exports.restartMany,
    restartOne: exports.restartOne,
    logs: exports.logs,
    port: exports.port,
    version: exports.version
};
