var Cuba = (function () {
    function Cuba(name, apiUrl, restClientId, restClientSecret, defaultLocale) {
        if (name === void 0) { name = ""; }
        if (apiUrl === void 0) { apiUrl = '/app/rest/'; }
        if (restClientId === void 0) { restClientId = 'client'; }
        if (restClientSecret === void 0) { restClientSecret = 'secret'; }
        if (defaultLocale === void 0) { defaultLocale = 'en'; }
        this.name = name;
        this.apiUrl = apiUrl;
        this.restClientId = restClientId;
        this.restClientSecret = restClientSecret;
        this.defaultLocale = defaultLocale;
        this.loginSubject = new Rx.Subject();
        this.tokenExpirySubject = new Rx.Subject();
        this.messagesSubject = new Rx.BehaviorSubject(null);
        this.enumsSubject = new Rx.BehaviorSubject(null);
        this.localeSubject = new Rx.BehaviorSubject(this.locale);
        if (this.restApiToken) {
            this.loadEntitiesMessages();
            this.loadEnums();
        }
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
    Object.defineProperty(Cuba.prototype, "locale", {
        get: function () {
            var storedLocale = localStorage.getItem(Cuba.LOCALE_STORAGE_KEY);
            return storedLocale ? storedLocale : this.defaultLocale;
        },
        set: function (locale) {
            localStorage.setItem(Cuba.LOCALE_STORAGE_KEY, locale);
            this.localeSubject.onNext(this.locale);
        },
        enumerable: true,
        configurable: true
    });
    Cuba.prototype.login = function (login, password) {
        var _this = this;
        if (login == null)
            login = '';
        if (password == null)
            password = '';
        var fetchOptions = {
            method: 'POST',
            headers: this._getBasicAuthHeaders(),
            body: 'grant_type=password&username=' + encodeURIComponent(login) + '&password=' + encodeURIComponent(password)
        };
        var loginRes = fetch(this.apiUrl + 'v2/oauth/token', fetchOptions)
            .then(this.checkStatus)
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
            _this.restApiToken = data.access_token;
            _this.loginSubject.onNext(data);
            return data;
        });
        return loginRes;
    };
    Cuba.prototype.logout = function () {
        var fetchOptions = {
            method: 'POST',
            headers: this._getBasicAuthHeaders(),
            body: "token=" + encodeURIComponent(this.restApiToken),
        };
        this.clearAuthData();
        return fetch(this.apiUrl + 'v2/oauth/revoke', fetchOptions).then(this.checkStatus);
    };
    Cuba.prototype.loadEntities = function (entityName, options) {
        return this.ajax('GET', 'v2/entities/' + entityName, options, { handleAs: 'json' });
    };
    Cuba.prototype.loadEntity = function (entityName, id, options) {
        return this.ajax('GET', 'v2/entities/' + entityName + '/' + id, options, { handleAs: 'json' });
    };
    Cuba.prototype.deleteEntity = function (entityName, id) {
        return this.ajax('DELETE', 'v2/entities/' + entityName + '/' + id);
    };
    Cuba.prototype.commitEntity = function (entityName, entity) {
        if (entity.id) {
            return this.ajax('PUT', 'v2/entities/' + entityName + '/' + entity.id, JSON.stringify(entity), { handleAs: 'json' });
        }
        else {
            return this.ajax('POST', 'v2/entities/' + entityName, JSON.stringify(entity), { handleAs: 'json' });
        }
    };
    Cuba.prototype.invokeService = function (serviceName, methodName, params, fetchOptions) {
        return this.ajax('POST', 'v2/services/' + serviceName + '/' + methodName, JSON.stringify(params), fetchOptions);
    };
    Cuba.prototype.query = function (entityName, queryName, params) {
        return this.ajax('GET', 'v2/queries/' + entityName + '/' + queryName, params, { handleAs: 'json' });
    };
    Cuba.prototype.loadMetadata = function () {
        return this.ajax('GET', 'v2/metadata/entities', null, { handleAs: 'json' });
    };
    Cuba.prototype.loadEntityMetadata = function (entityName) {
        return this.ajax('GET', 'v2/metadata/entities' + '/' + entityName, null, { handleAs: 'json' });
    };
    Cuba.prototype.loadEntitiesMessages = function () {
        var _this = this;
        var fetchRes = this.ajax('GET', 'v2/messages/entities', null, { handleAs: 'json' });
        fetchRes.then(function (messages) {
            _this.messagesSubject.onNext(messages);
        });
        return fetchRes;
    };
    Cuba.prototype.loadEnums = function () {
        var _this = this;
        var fetchRes = this.ajax('GET', 'v2/metadata/enums', null, { handleAs: 'json' });
        fetchRes.then(function (enums) {
            _this.enumsSubject.onNext(enums);
        });
        return fetchRes;
    };
    Cuba.prototype.getPermissions = function () {
        return this.ajax('GET', 'v2/permissions', null, { handleAs: 'json' });
    };
    Cuba.prototype.getUserInfo = function () {
        return this.ajax('GET', 'v2/userInfo', null, { handleAs: 'json' });
    };
    Cuba.prototype._getBasicAuthHeaders = function () {
        return {
            "Accept-Language": this.locale,
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret),
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        };
    };
    Cuba.prototype.clearAuthData = function () {
        localStorage.removeItem(Cuba.REST_TOKEN_STORAGE_KEY);
        localStorage.removeItem(Cuba.USER_NAME_STORAGE_KEY);
    };
    Cuba.prototype.ajax = function (method, path, data, fetchOptions) {
        var _this = this;
        var url = this.apiUrl + path;
        var settings = {
            method: method,
            headers: {
                "Accept-Language": this.locale
            }
        };
        if (this.restApiToken) {
            settings.headers["Authorization"] = "Bearer " + this.restApiToken;
        }
        if (method == 'POST' || method == 'PUT') {
            settings.body = data;
            settings.headers["Content-Type"] = "application/json; charset=UTF-8";
        }
        if (method == 'GET' && data) {
            url += '?' + Object.keys(data).map(function (k) {
                return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
            }).join("&");
        }
        var handleAs = fetchOptions ? fetchOptions.handleAs : undefined;
        switch (handleAs) {
            case "text":
                settings.headers["Accept"] = "text/html";
                break;
            case "json":
                settings.headers["Accept"] = "application/json";
                break;
        }
        var fetchRes = fetch(url, settings).then(this.checkStatus);
        fetchRes.catch(function (error) {
            if (Cuba.isTokenExpiredResponse(error.response)) {
                _this.clearAuthData();
                _this.tokenExpirySubject.onNext(true);
            }
        });
        return fetchRes.then(function (resp) {
            switch (handleAs) {
                case "text":
                    return resp.text();
                case "blob":
                    return resp.blob();
                case "json":
                    return resp.json();
                default:
                    return resp;
            }
        });
    };
    Cuba.prototype.checkStatus = function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    };
    Cuba.isTokenExpiredResponse = function (resp) {
        return resp && resp.status === 401;
    };
    return Cuba;
}());
Cuba.REST_TOKEN_STORAGE_KEY = 'cubaAccessToken';
Cuba.USER_NAME_STORAGE_KEY = 'cubaUserName';
Cuba.LOCALE_STORAGE_KEY = 'cubaLocale';
