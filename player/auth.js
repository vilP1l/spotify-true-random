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
import crypto from 'crypto';
var AuthManager = /** @class */ (function () {
    function AuthManager(appDetails) {
        this.verifiers = {};
        this.appDetails = appDetails;
    }
    AuthManager.prototype.getRandomString = function (length) {
        if (length === void 0) { length = 64; }
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        return Array(length).fill(null).map(function () { return chars[Math.floor(Math.random() * chars.length)]; }).join('');
    };
    AuthManager.prototype.getCodeChallenge = function (verifier) {
        return crypto.createHash('sha256')
            .update(verifier)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };
    AuthManager.prototype.getAuthURL = function () {
        var state = this.getRandomString(16);
        var codeVerifier = this.getRandomString();
        var codeChallenge = this.getCodeChallenge(codeVerifier);
        this.verifiers[state] = codeVerifier;
        var params = new URLSearchParams({
            response_type: 'code',
            client_id: this.appDetails.clientID,
            scope: this.appDetails.scope,
            redirect_uri: this.appDetails.redirectURI,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            state: state,
        });
        return "https://accounts.spotify.com/authorize?".concat(params.toString());
    };
    AuthManager.prototype.listenForAuth = function (port) {
        return __awaiter(this, void 0, void 0, function () {
            var http;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, import('http')];
                    case 1:
                        http = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var server = http.createServer(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var u, code, state, tokenDetails;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                                res.end('success');
                                                u = new URL(req.url || '', "http://".concat(req.headers.host));
                                                code = u.searchParams.get('code');
                                                state = u.searchParams.get('state');
                                                if (!code || !state) {
                                                    server.close();
                                                    reject('got no state or no code on http req');
                                                    return [2 /*return*/];
                                                }
                                                server.close();
                                                return [4 /*yield*/, this.exchangeCode(code, state)];
                                            case 1:
                                                tokenDetails = _a.sent();
                                                resolve(tokenDetails);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                server.listen(port);
                                server.once('error', function (e) {
                                    reject(e);
                                });
                            })];
                }
            });
        });
    };
    AuthManager.prototype.exchangeCode = function (code, state) {
        return __awaiter(this, void 0, void 0, function () {
            var codeChallenge, body, req, json, date, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeChallenge = this.verifiers[state];
                        if (!codeChallenge)
                            throw new Error('no code challenge for given state');
                        body = new URLSearchParams({
                            code: code,
                            redirect_uri: this.appDetails.redirectURI,
                            grant_type: 'authorization_code',
                            client_id: this.appDetails.clientID,
                            code_verifier: codeChallenge,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('https://accounts.spotify.com/api/token', {
                                method: 'POST',
                                body: body.toString(),
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                            })];
                    case 2:
                        req = _a.sent();
                        return [4 /*yield*/, req.json()];
                    case 3:
                        json = _a.sent();
                        date = new Date();
                        date.setHours(date.getHours() + 1);
                        return [2 /*return*/, {
                                accessToken: json.access_token,
                                refreshToken: json.refresh_token,
                                tokenExpiry: date,
                            }];
                    case 4:
                        error_1 = _a.sent();
                        throw new Error("failed to do http request: ".concat(error_1));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AuthManager;
}());
export default AuthManager;
