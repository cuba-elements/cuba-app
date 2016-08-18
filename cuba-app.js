"use strict";
var CubaApp = (function () {
    function CubaApp(apiUrl) {
        this.apiUrl = apiUrl;
        this.loginCallbacks = $.Callbacks();
    }
    Object.defineProperty(CubaApp.prototype, "restApiToken", {
        get: function () {
            return sessionStorage.getItem('cubaAccessToken');
        },
        set: function (token) {
            sessionStorage.setItem('cubaAccessToken', token);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CubaApp.prototype, "userName", {
        get: function () {
            return sessionStorage.getItem('cubaUserName');
        },
        set: function (userName) {
            sessionStorage.setItem('cubaUserName', userName);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CubaApp.prototype, "loggedIn", {
        get: function () {
            return typeof this.restApiToken !== 'undefined' && this.restApiToken != null;
        },
        enumerable: true,
        configurable: true
    });
    CubaApp.prototype.login = function (login, password) {
        var _this = this;
        return $.ajax({
            url: this.apiUrl + 'oauth/token',
            type: 'POST',
            headers: {
                "Authorization": "Basic Y2xpZW50OnNlY3JldA==" //todo minaev config
            },
            dataType: 'json',
            data: { grant_type: 'password', username: login, password: password }
        }).then(function (data) {
            _this.restApiToken = data.access_token;
            _this.userName = login;
            _this.loginCallbacks.fire();
        });
    };
    CubaApp.prototype.logout = function () {
        this.userName = null;
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: { token: this.restApiToken },
            headers: {
                "Authorization": "Basic Y2xpZW50OnNlY3JldA==" //todo minaev config
            }
        };
        sessionStorage.removeItem('cubaAccessToken');
        sessionStorage.removeItem('cubaUserName');
        return $.ajax(ajaxSettings);
    };
    CubaApp.prototype.onLogin = function (cb) {
        this.loginCallbacks.add(cb);
    };
    CubaApp.prototype.loadEntities = function (metaClass, view, sort) {
        if (view === void 0) { view = '_local'; }
        if (sort === void 0) { sort = null; }
        var opts = { view: view };
        if (sort) {
            opts.sort = sort;
        }
        return this._ajax('GET', 'entities/' + metaClass, opts);
    };
    CubaApp.prototype.loadEntity = function (metaClass, id, view) {
        if (view === void 0) { view = '_local'; }
        return this._ajax('GET', 'entities/' + metaClass + '/' + id, { view: view });
    };
    CubaApp.prototype.commitEntity = function (metaClass, entity) {
        if (entity.id) {
            return this._ajax('PUT', 'entities/' + metaClass + '/' + entity.id, JSON.stringify(entity));
        }
        else {
            return this._ajax('POST', 'entities/' + metaClass, JSON.stringify(entity));
        }
    };
    CubaApp.prototype.loadMetadata = function () {
        return this._ajax('GET', 'metadata/entities');
    };
    CubaApp.prototype.loadEntityMetadata = function (metaClass) {
        return this._ajax('GET', 'metadata/entities' + '/' + metaClass);
    };
    CubaApp.prototype._ajax = function (type, path, data) {
        var ajaxSettings = {
            type: type,
            url: this.apiUrl + path,
            data: data,
            headers: {
                "Authorization": "Bearer " + this.restApiToken
            }
        };
        if (type != 'GET') {
            ajaxSettings.contentType = 'application/json';
        }
        return $.ajax(ajaxSettings);
    };
    return CubaApp;
}());
exports.CubaApp = CubaApp;
