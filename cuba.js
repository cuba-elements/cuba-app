///<reference path="../typings/index.d.ts" />
var Cuba = (function () {
    function Cuba(apiUrl, restClientId, restClientSecret) {
        if (apiUrl === void 0) { apiUrl = '/app/rest/v2/'; }
        if (restClientId === void 0) { restClientId = 'client'; }
        if (restClientSecret === void 0) { restClientSecret = 'secret'; }
        this.apiUrl = apiUrl;
        this.restClientId = restClientId;
        this.restClientSecret = restClientSecret;
        this.loginCallbacks = $.Callbacks();
        this.tokenExpiryCallbacks = $.Callbacks();
    }
    Object.defineProperty(Cuba.prototype, "restApiToken", {
        get: function () {
            return localStorage.getItem(Cuba.REST_TOKEN_STORAGE_KEY);
        },
        set: function (token) {
            localStorage.setItem(Cuba.REST_TOKEN_STORAGE_KEY, token);
        },
        enumerable: true,
        configurable: true
    });
    Cuba.prototype.login = function (login, password) {
        var _this = this;
        return $.ajax({
            url: this.apiUrl + 'oauth/token',
            type: 'POST',
            headers: this._getBasicAuthHeaders(),
            dataType: 'json',
            data: { grant_type: 'password', username: login, password: password }
        }).then(function (data) {
            _this.restApiToken = data.access_token;
            _this.loginCallbacks.fire();
        });
    };
    Cuba.prototype.onLogin = function (cb) {
        this.loginCallbacks.add(cb);
    };
    Cuba.prototype.logout = function () {
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: { token: this.restApiToken },
            headers: this._getBasicAuthHeaders()
        };
        Cuba.clearAuthData();
        return $.ajax(ajaxSettings);
    };
    Cuba.prototype.onTokenExpiry = function (cb) {
        this.tokenExpiryCallbacks.add(cb);
    };
    Cuba.prototype.loadEntities = function (entityName, options) {
        return this._ajax('GET', 'entities/' + entityName, options);
    };
    Cuba.prototype.loadEntity = function (entityName, id, options) {
        return this._ajax('GET', 'entities/' + entityName + '/' + id, options);
    };
    Cuba.prototype.commitEntity = function (entityName, entity) {
        if (entity.id) {
            return this._ajax('PUT', 'entities/' + entityName + '/' + entity.id, JSON.stringify(entity));
        }
        else {
            return this._ajax('POST', 'entities/' + entityName, JSON.stringify(entity));
        }
    };
    Cuba.prototype.invokeService = function (serviceName, methodName, params, ajaxSettings) {
        return this._ajax('POST', 'services/' + serviceName + '/' + methodName, JSON.stringify(params), ajaxSettings);
    };
    Cuba.prototype.query = function (entityName, queryName, params) {
        return this._ajax('GET', 'queries/' + entityName + '/' + queryName, params);
    };
    Cuba.prototype.loadMetadata = function () {
        return this._ajax('GET', 'metadata/entities', null);
    };
    Cuba.prototype.loadEntityMetadata = function (entityName) {
        return this._ajax('GET', 'metadata/entities' + '/' + entityName, null);
    };
    Cuba.prototype.getPermissions = function () {
        return this._ajax('GET', 'permissions', null);
    };
    Cuba.prototype.getUserInfo = function () {
        return this._ajax('GET', 'userInfo', null);
    };
    Cuba.prototype._getBasicAuthHeaders = function () {
        return {
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret)
        };
    };
    Cuba.clearAuthData = function () {
        localStorage.removeItem(Cuba.REST_TOKEN_STORAGE_KEY);
        localStorage.removeItem(Cuba.USER_NAME_STORAGE_KEY);
    };
    Cuba.prototype._ajax = function (type, path, data, ajaxSettings) {
        var _this = this;
        var settings = {
            type: type,
            url: this.apiUrl + path,
            data: data,
            dataType: 'json'
        };
        if (this.restApiToken) {
            settings.headers = {
                "Authorization": "Bearer " + this.restApiToken
            };
        }
        if (type != 'GET') {
            settings.contentType = 'application/json';
        }
        var ajaxPromise = $.ajax($.extend(settings, ajaxSettings));
        ajaxPromise.then(null, function (xhr) {
            if (Cuba.isTokenExpiredResponse(xhr)) {
                Cuba.clearAuthData();
                _this.tokenExpiryCallbacks.fire();
            }
        });
        return ajaxPromise;
    };
    Cuba.isTokenExpiredResponse = function (resp) {
        return resp.status === 401
            && resp.responseJSON
            && resp.responseJSON.error === 'invalid_token';
    };
    Cuba.REST_TOKEN_STORAGE_KEY = 'cubaAccessToken';
    Cuba.USER_NAME_STORAGE_KEY = 'cubaUserName';
    return Cuba;
}());
