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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dockerode_1 = __importDefault(require("dockerode"));
var compose = __importStar(require("../../src/index"));
var path = __importStar(require("path"));
var fs_1 = require("fs");
var index_1 = require("../../src/index");
var docker = new dockerode_1.default();
// Docker commands, especially builds, can take some time. This makes sure that they can take the time they need.
jest.setTimeout(25000);
// Set to true if you need to diagnose using output
var logOutput = false;
var isContainerRunning = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                docker.listContainers(function (err, containers) {
                    if (err) {
                        reject(err);
                    }
                    var running = (containers || []).filter(function (container) {
                        return container.Names.includes(name);
                    });
                    resolve(running.length > 0);
                });
            })];
    });
}); };
var repoTags = function (imageInfo) { return imageInfo.RepoTags || []; };
var imageExists = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var images, foundImage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, docker.listImages()];
            case 1:
                images = _a.sent();
                foundImage = images.findIndex(function (imageInfo) {
                    return repoTags(imageInfo).includes(name);
                });
                return [2 /*return*/, foundImage > -1];
        }
    });
}); };
var removeImagesStartingWith = function (searchString) { return __awaiter(void 0, void 0, void 0, function () {
    var images, _i, images_1, image, _a, _b, repoTag, dockerImage;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, docker.listImages()];
            case 1:
                images = _c.sent();
                _i = 0, images_1 = images;
                _c.label = 2;
            case 2:
                if (!(_i < images_1.length)) return [3 /*break*/, 7];
                image = images_1[_i];
                _a = 0, _b = repoTags(image);
                _c.label = 3;
            case 3:
                if (!(_a < _b.length)) return [3 /*break*/, 6];
                repoTag = _b[_a];
                if (!repoTag.startsWith(searchString)) return [3 /*break*/, 5];
                dockerImage = docker.getImage(repoTag);
                if (logOutput) {
                    process.stdout.write("removing image ".concat(repoTag, " ").concat(dockerImage.id || ''));
                }
                return [4 /*yield*/, dockerImage.remove()];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                _a++;
                return [3 /*break*/, 3];
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7: return [2 /*return*/];
        }
    });
}); };
test('ensure container gets started', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _c.sent();
                return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 2:
                _c.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure exit code is returned correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, failedResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                result = _a.sent();
                expect(result).toMatchObject({
                    exitCode: 0
                });
                return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 2:
                result = _a.sent();
                expect(result).toMatchObject({
                    exitCode: 0
                });
                failedResult = 0;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, compose.logs('non_existent_service', {
                        cwd: path.join(__dirname)
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                failedResult = error_1.exitCode;
                return [3 /*break*/, 6];
            case 6:
                expect(failedResult).toBe(1);
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
describe('starts containers properly with --build and --timeout options', function () {
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, compose.down({
                        cwd: path.join(__dirname),
                        log: logOutput,
                        config: 'docker-compose-build.yml'
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, compose.down({
                        cwd: path.join(__dirname),
                        log: logOutput,
                        config: 'docker-compose-build.yml'
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('ensure container gets started with --build option', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, compose.upAll({
                        cwd: path.join(__dirname),
                        log: logOutput,
                        config: 'docker-compose-build.yml',
                        commandOptions: ['--build']
                    })];
                case 1:
                    _b.sent();
                    _a = expect;
                    return [4 /*yield*/, isContainerRunning('/compose_test_nginx')];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    test('ensure container gets started with --build and --timeout option', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, compose.upAll({
                        cwd: path.join(__dirname),
                        log: logOutput,
                        config: 'docker-compose-build.yml',
                        commandOptions: [['--build'], ['--timeout', '5']]
                    })];
                case 1:
                    _b.sent();
                    _a = expect;
                    return [4 /*yield*/, isContainerRunning('/compose_test_nginx')];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    test('ensure container gets started with --build and --timeout option with different command style', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, compose.upAll({
                        cwd: path.join(__dirname),
                        log: logOutput,
                        config: 'docker-compose-build.yml',
                        commandOptions: ['--build', ['--timeout', '5']]
                    })];
                case 1:
                    _b.sent();
                    _a = expect;
                    return [4 /*yield*/, isContainerRunning('/compose_test_nginx')];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
});
test('ensure container command executed with --workdir command option', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.down({
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-42.yml'
                })];
            case 1:
                _a.sent();
                return [4 /*yield*/, compose.run('some-service', 'pwd', {
                        cwd: path.join(__dirname),
                        log: true,
                        config: 'docker-compose-42.yml',
                        composeOptions: ['--verbose'],
                        // Alpine has "/" as default
                        commandOptions: ['--workdir', '/home/root']
                    })];
            case 2:
                result = _a.sent();
                expect(result.out).toBe('/home/root\n');
                return [4 /*yield*/, compose.down({
                        cwd: path.join(__dirname),
                        log: logOutput,
                        config: 'docker-compose-42.yml'
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure only single container gets started', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _c.sent();
                return [4 /*yield*/, compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })];
            case 2:
                _c.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure only multiple containers get started', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _c.sent();
                return [4 /*yield*/, compose.upMany(['web'], { cwd: path.join(__dirname), log: logOutput })];
            case 2:
                _c.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure container gets down', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_e.sent()]).toBeFalsy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [2 /*return*/];
        }
    });
}); });
test('ensure container gets stopped', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.stop({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_e.sent()]).toBeFalsy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 7:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure only single container gets stopped', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.stopOne('proxy', { cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_e.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 7:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure multiple containers gets stopped', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.stopMany({ cwd: path.join(__dirname), log: logOutput }, 'proxy', 'web')];
            case 4:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_e.sent()]).toBeFalsy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 7:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure only single container gets paused then resumed', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b, _c, _d, errMsg, err_1, _e, _f, std;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                opts = { cwd: path.join(__dirname), log: logOutput };
                return [4 /*yield*/, compose.upAll(opts)];
            case 1:
                _g.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_g.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_g.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.pauseOne('proxy', opts)];
            case 4:
                _g.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_g.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_g.sent()]).toBeTruthy();
                _g.label = 7;
            case 7:
                _g.trys.push([7, 9, , 10]);
                return [4 /*yield*/, compose.exec('proxy', 'cat /etc/os-release', opts)];
            case 8:
                _g.sent();
                return [3 /*break*/, 10];
            case 9:
                err_1 = _g.sent();
                errMsg = err_1.err;
                return [3 /*break*/, 10];
            case 10:
                expect(errMsg).toContain('is paused');
                return [4 /*yield*/, compose.unpauseOne('proxy', opts)];
            case 11:
                _g.sent();
                _e = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 12:
                _e.apply(void 0, [_g.sent()]).toBeTruthy();
                _f = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 13:
                _f.apply(void 0, [_g.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.exec('proxy', 'cat /etc/os-release', opts)];
            case 14:
                std = _g.sent();
                expect(std.out).toContain('Alpine Linux');
                return [4 /*yield*/, compose.down(opts)];
            case 15:
                _g.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure container gets started with --abort-on-container-exit option', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.upAll({
                    cwd: path.join(__dirname),
                    log: logOutput,
                    commandOptions: ['--abort-on-container-exit']
                })];
            case 1:
                result = _c.sent();
                expect(result).toMatchObject({
                    exitCode: 0
                });
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_c.sent()]).toBeFalsy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_c.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure container gets started with --abort-on-container-exit option correctly aborts all services when a container exits', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.upAll({
                    cwd: path.join(__dirname),
                    log: logOutput,
                    commandOptions: ['--abort-on-container-exit']
                })];
            case 1:
                result = _c.sent();
                expect(result.out).toMatch(/Aborting on container exit/);
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_c.sent()]).toBeFalsy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_c.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure container gets killed', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.kill({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_e.sent()]).toBeFalsy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 7:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure custom ymls are working', function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, cwd, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                config = './docker-compose-2.yml';
                cwd = path.join(__dirname);
                return [4 /*yield*/, compose.upAll({ cwd: cwd, log: logOutput, config: config })];
            case 1:
                _c.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web_2')];
            case 2:
                _a.apply(void 0, [_c.sent()]).toBeTruthy();
                // config & [config] are the same thing, ensures that multiple configs are handled properly
                return [4 /*yield*/, compose.kill({ cwd: cwd, log: logOutput, config: [config] })];
            case 3:
                // config & [config] are the same thing, ensures that multiple configs are handled properly
                _c.sent();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web_2')];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: cwd, log: logOutput, config: config })];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure run and exec are working', function () { return __awaiter(void 0, void 0, void 0, function () {
    var checkOSID, opts, _a, std;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                checkOSID = function (out, id) {
                    // parse /etc/os-release contents
                    var re = /([\w,_]+)=(.*)/g;
                    var match;
                    var os = {};
                    while ((match = re.exec(out)) !== null) {
                        // eslint-disable-line no-cond-assign
                        os[match[1]] = match[2];
                    }
                    expect(os.ID).toBe(id);
                };
                opts = { cwd: path.join(__dirname), log: logOutput };
                return [4 /*yield*/, compose.upAll(opts)];
            case 1:
                _b.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_b.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.exec('web', 'cat /etc/os-release', opts)];
            case 3:
                std = _b.sent();
                checkOSID(std.out, 'debian');
                return [4 /*yield*/, compose.run('proxy', 'cat /etc/os-release', opts)];
            case 4:
                std = _b.sent();
                checkOSID(std.out, 'alpine');
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 5:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ensure run and exec with command defined as array are working', function () { return __awaiter(void 0, void 0, void 0, function () {
    var checkOSID, opts, _a, std;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                checkOSID = function (out, id) {
                    // parse /etc/os-release contents
                    var re = /([\w,_]+)=(.*)/g;
                    var match;
                    var os = {};
                    while ((match = re.exec(out)) !== null) {
                        // eslint-disable-line no-cond-assign
                        os[match[1]] = match[2];
                    }
                    expect(os.ID).toBe(id);
                };
                opts = { cwd: path.join(__dirname), log: false };
                return [4 /*yield*/, compose.upAll(opts)];
            case 1:
                _b.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_b.sent()]).toBe(true);
                return [4 /*yield*/, compose.exec('web', ['/bin/sh', '-c', 'cat /etc/os-release'], opts)];
            case 3:
                std = _b.sent();
                checkOSID(std.out, 'debian');
                return [4 /*yield*/, compose.run('proxy', ['/bin/sh', '-c', 'cat /etc/os-release'], opts)];
            case 4:
                std = _b.sent();
                checkOSID(std.out, 'alpine');
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 5:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
test('build accepts config as string', function () { return __awaiter(void 0, void 0, void 0, function () {
    var configuration, config, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    (0, fs_1.readFile)(path.join(__dirname, 'docker-compose-2.yml'), function (err, content) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(content.toString());
                    });
                })];
            case 1:
                configuration = _a.sent();
                config = {
                    configAsString: configuration,
                    log: logOutput
                };
                return [4 /*yield*/, compose.upAll(config)];
            case 2:
                _a.sent();
                return [4 /*yield*/, compose.port('web', 8888, config)];
            case 3:
                result = _a.sent();
                expect(result.data.address).toBe('0.0.0.0');
                expect(result.data.port).toBe(8888);
                return [4 /*yield*/, compose.down(config)];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('build single service', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                opts = {
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-build.yml'
                };
                return [4 /*yield*/, removeImagesStartingWith('compose-test-build-image')];
            case 1:
                _e.sent();
                return [4 /*yield*/, compose.buildOne('build_test_1', opts)];
            case 2:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-1:test')];
            case 3:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-2:test')];
            case 4:
                _b.apply(void 0, [_e.sent()]).toBeFalsy();
                _c = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-3:test')];
            case 5:
                _c.apply(void 0, [_e.sent()]).toBeFalsy();
                _d = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-4:test')];
            case 6:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, removeImagesStartingWith('compose-test-build-image')];
            case 7:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('build multiple services', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                opts = {
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-build.yml'
                };
                return [4 /*yield*/, compose.buildMany(['build_test_2', 'build_test_3'], opts)];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-1:test')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeFalsy();
                _b = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-2:test')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                _c = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-3:test')];
            case 4:
                _c.apply(void 0, [_e.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-4:test')];
            case 5:
                _d.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, removeImagesStartingWith('compose-test-build-image')];
            case 6:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('build all services', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                opts = {
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-build.yml'
                };
                return [4 /*yield*/, compose.buildAll(opts)];
            case 1:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-1:test')];
            case 2:
                _a.apply(void 0, [_e.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-2:test')];
            case 3:
                _b.apply(void 0, [_e.sent()]).toBeTruthy();
                _c = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-3:test')];
            case 4:
                _c.apply(void 0, [_e.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, imageExists('compose-test-build-image-4:test')];
            case 5:
                _d.apply(void 0, [_e.sent()]).toBeTruthy();
                return [4 /*yield*/, removeImagesStartingWith('compose-test-build-image')];
            case 6:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
test('pull single service', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                opts = {
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose.yml'
                };
                return [4 /*yield*/, removeImagesStartingWith('nginx:1.19.9-alpine')];
            case 1:
                _c.sent();
                _a = expect;
                return [4 /*yield*/, imageExists('nginx:1.19.9-alpine')];
            case 2:
                _a.apply(void 0, [_c.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.pullOne('proxy', opts)];
            case 3:
                _c.sent();
                _b = expect;
                return [4 /*yield*/, imageExists('nginx:1.19.9-alpine')];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); });
test('pull multiple services', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                opts = {
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose.yml'
                };
                return [4 /*yield*/, removeImagesStartingWith('nginx:1.16.0')];
            case 1:
                _e.sent();
                return [4 /*yield*/, removeImagesStartingWith('nginx:1.19.9-alpine')];
            case 2:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, imageExists('nginx:1.16.0')];
            case 3:
                _a.apply(void 0, [_e.sent()]).toBeFalsy();
                _b = expect;
                return [4 /*yield*/, imageExists('nginx:1.19.9-alpine')];
            case 4:
                _b.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.pullMany(['web', 'proxy'], opts)];
            case 5:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, imageExists('nginx:1.16.0')];
            case 6:
                _c.apply(void 0, [_e.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, imageExists('nginx:1.19.9-alpine')];
            case 7:
                _d.apply(void 0, [_e.sent()]).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); });
test('pull all services', function () { return __awaiter(void 0, void 0, void 0, function () {
    var opts, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                opts = {
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose.yml'
                };
                return [4 /*yield*/, removeImagesStartingWith('nginx:1.16.0')];
            case 1:
                _e.sent();
                return [4 /*yield*/, removeImagesStartingWith('nginx:1.19.9-alpine')];
            case 2:
                _e.sent();
                _a = expect;
                return [4 /*yield*/, imageExists('nginx:1.16.0')];
            case 3:
                _a.apply(void 0, [_e.sent()]).toBeFalsy();
                _b = expect;
                return [4 /*yield*/, imageExists('nginx:1.19.9-alpine')];
            case 4:
                _b.apply(void 0, [_e.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.pullAll(opts)];
            case 5:
                _e.sent();
                _c = expect;
                return [4 /*yield*/, imageExists('nginx:1.16.0')];
            case 6:
                _c.apply(void 0, [_e.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, imageExists('nginx:1.19.9-alpine')];
            case 7:
                _d.apply(void 0, [_e.sent()]).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); });
test('teardown', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                docker.listContainers(function (err, containers) {
                    if (err) {
                        throw err;
                    }
                    containers.forEach(function (container) {
                        container.Names.forEach(function (name) {
                            if (name.startsWith('/compose_test_')) {
                                console.log("stopping ".concat(container.Id, " ").concat(container.Names));
                                docker.getContainer(container.Id).stop();
                            }
                        });
                    });
                });
                return [4 /*yield*/, removeImagesStartingWith('compose-test-build-image')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('config show data for docker-compose files', function () { return __awaiter(void 0, void 0, void 0, function () {
    var std;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.config({
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-42.yml'
                })];
            case 1:
                std = _a.sent();
                expect(std.data.config.version).toBe('3');
                expect(std.data.config.services['some-service']['image']).toBe('nginx:1.19.9-alpine');
                expect(std.data.config.volumes['db-data']).toEqual({});
                return [2 /*return*/];
        }
    });
}); });
test('config show data for docker-compose files (services)', function () { return __awaiter(void 0, void 0, void 0, function () {
    var std;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.configServices({
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-build.yml'
                })];
            case 1:
                std = _a.sent();
                expect(std.data.services.length).toBe(5);
                expect(std.data.services[0]).toContain('build_test_1');
                expect(std.err).toBeFalsy();
                return [2 /*return*/];
        }
    });
}); });
test('config show data for docker-compose files (volumes)', function () { return __awaiter(void 0, void 0, void 0, function () {
    var std;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.configVolumes({
                    cwd: path.join(__dirname),
                    log: logOutput,
                    config: 'docker-compose-42.yml'
                })];
            case 1:
                std = _a.sent();
                expect(std.data.volumes.length).toBe(1);
                expect(std.data.volumes[0]).toContain('db-data');
                expect(std.err).toBeFalsy();
                return [2 /*return*/];
        }
    });
}); });
test('ps shows status data for started containers', function () { return __awaiter(void 0, void 0, void 0, function () {
    var std, web;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _c.sent();
                return [4 /*yield*/, compose.ps({ cwd: path.join(__dirname), log: logOutput })];
            case 2:
                std = _c.sent();
                expect(std.err).toBeFalsy();
                expect(std.data.services.length).toBe(3);
                web = std.data.services.find(function (service) { return service.name === 'compose_test_web'; });
                expect(std.data.services.length).toBe(3);
                expect(web === null || web === void 0 ? void 0 : web.ports.length).toBe(2);
                expect(web === null || web === void 0 ? void 0 : web.ports[0].exposed.port).toBe(443);
                expect(web === null || web === void 0 ? void 0 : web.ports[0].exposed.protocol).toBe('tcp');
                expect((_a = web === null || web === void 0 ? void 0 : web.ports[0].mapped) === null || _a === void 0 ? void 0 : _a.port).toBe(443);
                expect((_b = web === null || web === void 0 ? void 0 : web.ports[0].mapped) === null || _b === void 0 ? void 0 : _b.address).toBe('0.0.0.0');
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('ps does not show status data for stopped containers', function () { return __awaiter(void 0, void 0, void 0, function () {
    var std, web, proxy;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _a.sent();
                return [4 /*yield*/, compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })];
            case 2:
                _a.sent();
                return [4 /*yield*/, compose.ps({ cwd: path.join(__dirname), log: logOutput })];
            case 3:
                std = _a.sent();
                expect(std.err).toBeFalsy();
                web = std.data.services.find(function (service) { return service.name === 'compose_test_web'; });
                proxy = std.data.services.find(function (service) { return service.name === 'compose_test_proxy'; });
                expect(web === null || web === void 0 ? void 0 : web.name).toBe('compose_test_web');
                expect(proxy).toBeFalsy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('restartAll does restart all containers', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _c.sent();
                return [4 /*yield*/, compose.restartAll({ cwd: path.join(__dirname), log: logOutput })];
            case 2:
                _c.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
test('restartMany does restart selected containers', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _b.sent();
                return [4 /*yield*/, compose.restartMany(['web', 'proxy'], {
                        cwd: path.join(__dirname),
                        log: logOutput
                    })];
            case 2:
                _b.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 3:
                _a.apply(void 0, [_b.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
test('restartOne does restart container', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _b.sent();
                return [4 /*yield*/, compose.restartOne('proxy', {
                        cwd: path.join(__dirname),
                        log: logOutput
                    })];
            case 2:
                _b.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _a.apply(void 0, [_b.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 4:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
test('logs does follow service logs', function () { return __awaiter(void 0, void 0, void 0, function () {
    var std;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.upAll({ cwd: path.join(__dirname), log: logOutput })];
            case 1:
                _a.sent();
                return [4 /*yield*/, compose.logs('proxy', {
                        cwd: path.join(__dirname),
                        log: logOutput
                    })];
            case 2:
                std = _a.sent();
                expect(std.out.includes('compose_test_proxy')).toBeTruthy();
                return [4 /*yield*/, compose.down({ cwd: path.join(__dirname), log: logOutput })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('returns the port for a started service', function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, port;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = {
                    cwd: path.join(__dirname),
                    config: './docker-compose-2.yml',
                    log: logOutput
                };
                return [4 /*yield*/, compose.upAll(config)];
            case 1:
                _a.sent();
                return [4 /*yield*/, compose.port('web', 8888, config)];
            case 2:
                port = _a.sent();
                expect(port.out).toMatch(/.*:[0-9]{1,5}/);
                return [4 /*yield*/, compose.down(config)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('removes container', function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                config = {
                    cwd: path.join(__dirname),
                    config: './docker-compose.yml',
                    log: logOutput
                };
                return [4 /*yield*/, compose.upAll(config)];
            case 1:
                _g.sent();
                _a = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 2:
                _a.apply(void 0, [_g.sent()]).toBeTruthy();
                _b = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 3:
                _b.apply(void 0, [_g.sent()]).toBeTruthy();
                return [4 /*yield*/, compose.rm(__assign(__assign({}, config), { commandOptions: ['-s'] }), 'proxy')];
            case 4:
                _g.sent();
                _c = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 5:
                _c.apply(void 0, [_g.sent()]).toBeTruthy();
                _d = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 6:
                _d.apply(void 0, [_g.sent()]).toBeFalsy();
                return [4 /*yield*/, compose.rm(__assign(__assign({}, config), { commandOptions: ['-s'] }), 'proxy', 'web')];
            case 7:
                _g.sent();
                _e = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_web')];
            case 8:
                _e.apply(void 0, [_g.sent()]).toBeFalsy();
                _f = expect;
                return [4 /*yield*/, isContainerRunning('/compose_test_proxy')];
            case 9:
                _f.apply(void 0, [_g.sent()]).toBeFalsy();
                return [2 /*return*/];
        }
    });
}); });
test('returns version information', function () { return __awaiter(void 0, void 0, void 0, function () {
    var version;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, compose.version()];
            case 1:
                version = (_a.sent()).data.version;
                expect(version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
                return [2 /*return*/];
        }
    });
}); });
test('parse ps output', function () {
    var output = "       Name                     Command               State                     Ports                  \n-------------------------------------------------------------------------------------------------------\ncompose_test_hello   /hello                           Exit 0                                           \ncompose_test_proxy   /docker-entrypoint.sh ngin ...   Up       80/tcp                                  \ncompose_test_web     nginx -g daemon off;             Up       0.0.0.0:443->443/tcp, 0.0.0.0:80->80/tcp\n";
    var psOut = (0, index_1.mapPsOutput)(output);
    expect(psOut.services[0]).toEqual({
        command: '/hello',
        name: 'compose_test_hello',
        state: 'Exit 0',
        ports: []
    });
    expect(psOut.services[1]).toEqual({
        command: '/docker-entrypoint.sh ngin ...',
        name: 'compose_test_proxy',
        state: 'Up',
        ports: [{ exposed: { port: 80, protocol: 'tcp' } }]
    });
    expect(psOut.services[2]).toEqual({
        command: 'nginx -g daemon off;',
        name: 'compose_test_web',
        state: 'Up',
        ports: [
            {
                exposed: { port: 443, protocol: 'tcp' },
                mapped: { port: 443, address: '0.0.0.0' }
            },
            {
                exposed: { port: 80, protocol: 'tcp' },
                mapped: { port: 80, address: '0.0.0.0' }
            }
        ]
    });
});
test('ps returns container ids when quiet', function () {
    var output = "64848fc721dfeff435edc7d4bb42e2f0e0a10d0c7602b73729a7fd7b09b7586f\naed60ce17575e69c56cc4cb07eeba89b5d7b7b2b307c8b87f3363db6af850719\nf49548fa0b1f88846b78c65c6ea7f802bcbdfb2cf10204497eb89ba622d7715b\n";
    var psOut = (0, index_1.mapPsOutput)(output, { commandOptions: ['-q'] });
    expect(psOut.services[0]).toEqual(expect.objectContaining({
        name: '64848fc721dfeff435edc7d4bb42e2f0e0a10d0c7602b73729a7fd7b09b7586f'
    }));
    expect(psOut.services[1]).toEqual(expect.objectContaining({
        name: 'aed60ce17575e69c56cc4cb07eeba89b5d7b7b2b307c8b87f3363db6af850719'
    }));
    expect(psOut.services[2]).toEqual(expect.objectContaining({
        name: 'f49548fa0b1f88846b78c65c6ea7f802bcbdfb2cf10204497eb89ba622d7715b'
    }));
});
test('ps returns container names when --services is passed in options', function () {
    var output = "web\nproxy\nhello\n";
    var psOut = (0, index_1.mapPsOutput)(output, { commandOptions: ['--services'] });
    expect(psOut.services[0]).toEqual(expect.objectContaining({
        name: 'web'
    }));
    expect(psOut.services[1]).toEqual(expect.objectContaining({
        name: 'proxy'
    }));
    expect(psOut.services[2]).toEqual(expect.objectContaining({
        name: 'hello'
    }));
});
test('ensure progress callback is called', function () { return __awaiter(void 0, void 0, void 0, function () {
    var config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = {
                    cwd: path.join(__dirname),
                    config: './docker-compose.yml',
                    callback: jest.fn()
                };
                return [4 /*yield*/, compose.upAll(config)];
            case 1:
                _a.sent();
                expect(config.callback).toBeCalled();
                return [4 /*yield*/, compose.down(config)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
