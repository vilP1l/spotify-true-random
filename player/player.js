var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { EventEmitter } from 'cross-events';
import { delay, getSpotifyUriID } from './utils.js';
var baseURL = 'https://api.spotify.com/v1';
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(init, authRefreshHandler) {
        var _this = _super.call(this) || this;
        _this.enabled = true;
        _this.auth = init.auth;
        _this.clientID = init.clientID;
        _this.authRefreshHandler = authRefreshHandler;
        return _this;
    }
    Player.prototype.doRequest = function (path, options) {
        return __awaiter(this, void 0, void 0, function () {
            var req, text, json, paginationObject, nextItems, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, this.refreshTokens()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fetch("".concat(baseURL).concat(path), __assign({ headers: __assign({ Authorization: "Bearer ".concat(this.auth.accessToken) }, options === null || options === void 0 ? void 0 : options.headers) }, options === null || options === void 0 ? void 0 : options.fetchOptions))];
                    case 2:
                        req = _a.sent();
                        if (!(req.status !== 200)) return [3 /*break*/, 6];
                        if (!(req.status === 429 && (!options || options.handleRatelimits === undefined))) return [3 /*break*/, 4];
                        return [4 /*yield*/, delay(parseInt(req.headers.get("Retry-After") || ""))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.doRequest(path)];
                    case 4:
                        if (req.status === 204) {
                            return [2 /*return*/, {}];
                        }
                        return [4 /*yield*/, req.text()];
                    case 5:
                        text = _a.sent();
                        throw new Error(text);
                    case 6: return [4 /*yield*/, req.json()];
                    case 7:
                        json = _a.sent();
                        if (!(options === null || options === void 0 ? void 0 : options.handlePagination)) return [3 /*break*/, 9];
                        paginationObject = json;
                        if (!paginationObject.next)
                            return [2 /*return*/, paginationObject];
                        return [4 /*yield*/, this.doRequest(paginationObject.next.replace(baseURL, ''), options)];
                    case 8:
                        nextItems = _a.sent();
                        paginationObject.items = __spreadArray(__spreadArray([], paginationObject.items, true), nextItems.items, true);
                        json = paginationObject;
                        _a.label = 9;
                    case 9: return [2 /*return*/, json];
                    case 10:
                        error_1 = _a.sent();
                        throw new Error("failed to do request to ".concat(path, ": ").concat(error_1));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.refreshTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, req, _a, _b, json, date, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(+new Date() >= +new Date(this.auth.tokenExpiry))) return [3 /*break*/, 7];
                        body = new URLSearchParams({
                            grant_type: 'refresh_token',
                            client_id: this.clientID,
                            refresh_token: this.auth.refreshToken,
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch('https://accounts.spotify.com/api/token', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                body: body.toString(),
                            })];
                    case 2:
                        req = _c.sent();
                        if (!(req.status !== 200)) return [3 /*break*/, 4];
                        _a = Error.bind;
                        _b = "status not 200: ".concat;
                        return [4 /*yield*/, req.text()];
                    case 3: throw new (_a.apply(Error, [void 0, _b.apply("status not 200: ", [_c.sent()])]))();
                    case 4: return [4 /*yield*/, req.json()];
                    case 5:
                        json = _c.sent();
                        this.auth.accessToken = json.access_token;
                        this.auth.refreshToken = json.refresh_token;
                        date = new Date();
                        date.setHours(date.getHours() + 1);
                        this.auth.tokenExpiry = date;
                        this.emit('auth-refresh', this.auth);
                        if (this.authRefreshHandler)
                            this.authRefreshHandler(this.auth);
                        return [2 /*return*/, true];
                    case 6:
                        error_2 = _c.sent();
                        throw new Error("failed to refresh token: ".concat(error_2));
                    case 7: return [2 /*return*/, false];
                }
            });
        });
    };
    Player.prototype.handleTrackChange = function (json) {
        this.playbackState = json;
        this.getQueue();
        this.emit('track-change', json);
    };
    Player.prototype.getPlaybackState = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var json, playPauseChanged, shuffleChanged;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.doRequest('/me/player')];
                    case 1:
                        json = _f.sent();
                        playPauseChanged = ((_a = this.playbackState) === null || _a === void 0 ? void 0 : _a.is_playing) !== json.is_playing;
                        shuffleChanged = ((_b = this.playbackState) === null || _b === void 0 ? void 0 : _b.shuffle_state) !== json.shuffle_state;
                        if (this.playbackState && (!json || !Object.keys(json).length))
                            this.emit('state-change', json);
                        if (playPauseChanged || shuffleChanged)
                            this.emit('state-change', json);
                        /*
                          only attempt to queue a random song when there has been a previous one, this prevents
                          songs from being queued on reloads, etc, and still works mostly the same because
                          shuffle is enabled
                        */
                        if (((_d = (_c = this.playbackState) === null || _c === void 0 ? void 0 : _c.item) === null || _d === void 0 ? void 0 : _d.id) !== ((_e = json.item) === null || _e === void 0 ? void 0 : _e.id)) {
                            if (this.enabled && this.playbackState && json.shuffle_state) {
                                this.playbackState = json;
                                this.queueRandomSong()
                                    .then(function () { return _this.handleTrackChange(json); })
                                    .catch(function (e) { return _this.emit('error', e); });
                            }
                            else
                                this.handleTrackChange(json);
                        }
                        else
                            this.playbackState = json;
                        return [2 /*return*/, json];
                }
            });
        });
    };
    Player.prototype.startPlaybackStatePoll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getPlaybackState()
                                .catch(function (e) { return _this.emit('error', e); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, delay(2000)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.getContextSongsList = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var data, id, albumTracks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = null;
                        id = getSpotifyUriID(uri);
                        if (!uri.includes(':user:')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.doRequest('/me/tracks?limit=50', { handlePagination: true })];
                    case 1:
                        data = (_a.sent());
                        return [3 /*break*/, 9];
                    case 2:
                        if (!uri.includes(':playlist:')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.doRequest("/playlists/".concat(id, "/tracks"), { handlePagination: true })];
                    case 3:
                        data = (_a.sent());
                        return [3 /*break*/, 9];
                    case 4:
                        if (!uri.includes(':album:')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.doRequest("/albums/".concat(id, "/tracks"), { handlePagination: true })];
                    case 5:
                        albumTracks = _a.sent();
                        albumTracks.items = albumTracks.items.map(function (a) { return ({ track: a }); });
                        data = albumTracks;
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(false && uri.includes(':artist:'))) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.doRequest("/artists/".concat(id, "/top-tracks?market=US"), { handlePagination: true })];
                    case 7:
                        data = _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        data = null;
                        _a.label = 9;
                    case 9: return [2 /*return*/, data];
                }
            });
        });
    };
    Player.prototype.getCachedContextSongsList = function (contextID) {
        return __awaiter(this, void 0, void 0, function () {
            var list, nextFetchTime;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.lastSongsListFetch || !this.contextSongsList || contextID !== this.listContextID)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getContextSongsList(contextID)];
                    case 1:
                        list = _a.sent();
                        this.contextSongsList = list;
                        this.lastSongsListFetch = new Date();
                        this.listContextID = contextID;
                        return [2 /*return*/, list];
                    case 2:
                        nextFetchTime = this.lastSongsListFetch;
                        nextFetchTime.setMinutes(nextFetchTime.getMinutes() + 5);
                        // doesn't need to be awaited because it's the same list 
                        if (new Date() > nextFetchTime) {
                            this.getContextSongsList(contextID)
                                .then(function (list) {
                                _this.contextSongsList = list;
                                _this.lastSongsListFetch = new Date();
                                _this.listContextID = contextID;
                            });
                        }
                        if (!this.contextSongsList)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.contextSongsList];
                }
            });
        });
    };
    Player.prototype.queueSong = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doRequest("/me/player/queue?uri=".concat(uri), {
                            fetchOptions: {
                                method: 'POST',
                            },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.getQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doRequest('/me/player/queue')];
                    case 1:
                        queue = _a.sent();
                        this.queue = queue;
                        this.emit('state-change', this.playbackState);
                        return [2 /*return*/, queue];
                }
            });
        });
    };
    Player.prototype.queueRandomSong = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var contextUri, list, track, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        contextUri = (_b = (_a = this.playbackState) === null || _a === void 0 ? void 0 : _a.context) === null || _b === void 0 ? void 0 : _b.uri;
                        if (!contextUri)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getCachedContextSongsList(contextUri)];
                    case 1:
                        list = _c.sent();
                        if (!(list === null || list === void 0 ? void 0 : list.items.length))
                            return [2 /*return*/];
                        track = list.items[Math.floor(Math.random() * list.items.length)].track;
                        if (!track)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.queueSong(track.uri)];
                    case 2:
                        _c.sent();
                        this.emit('track-queued', track);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _c.sent();
                        throw new Error("failed to queue random track: ".concat(error_3));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.toggleEnableState = function () {
        this.enabled = !this.enabled;
        this.emit('state-change', this.playbackState);
    };
    return Player;
}(EventEmitter));
export default Player;
