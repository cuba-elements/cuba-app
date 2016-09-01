class Cuba {
    constructor(apiUrl = 'http://localhost:8080/app/rest/v2/', restClientId = 'client', restClientSecret = 'secret', loginCallbacks = $.Callbacks()) {
        this.apiUrl = apiUrl;
        this.restClientId = restClientId;
        this.restClientSecret = restClientSecret;
        this.loginCallbacks = loginCallbacks;
    }
    get restApiToken() {
        return localStorage.getItem('cubaAccessToken');
    }
    set restApiToken(token) {
        localStorage.setItem('cubaAccessToken', token);
    }
    login(login, password) {
        return $.ajax({
            url: this.apiUrl + 'oauth/token',
            type: 'POST',
            headers: this._getBasicAuthHeaders(),
            dataType: 'json',
            data: { grant_type: 'password', username: login, password: password }
        }).then((data) => {
            this.restApiToken = data.access_token;
            this.loginCallbacks.fire();
        });
    }
    onLogin(cb) {
        this.loginCallbacks.add(cb);
    }
    logout() {
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: { token: this.restApiToken },
            headers: this._getBasicAuthHeaders()
        };
        localStorage.removeItem('cubaAccessToken');
        localStorage.removeItem('cubaUserName');
        return $.ajax(ajaxSettings);
    }
    loadEntities(entityName, view = '_local', sort = null) {
        var opts = { view: view };
        if (sort) {
            opts.sort = sort;
        }
        return this._ajax('GET', 'entities/' + entityName, opts);
    }
    loadEntity(entityName, id, view = '_local') {
        return this._ajax('GET', 'entities/' + entityName + '/' + id, { view: view });
    }
    commitEntity(entityName, entity) {
        if (entity.id) {
            return this._ajax('PUT', 'entities/' + entityName + '/' + entity.id, JSON.stringify(entity));
        }
        else {
            return this._ajax('POST', 'entities/' + entityName, JSON.stringify(entity));
        }
    }
    invokeService(serviceName, methodName, params) {
        return this._ajax('POST', 'services/' + serviceName + '/' + methodName, JSON.stringify(params));
    }
    loadMetadata() {
        return this._ajax('GET', 'metadata/entities', null);
    }
    loadEntityMetadata(entityName) {
        return this._ajax('GET', 'metadata/entities' + '/' + entityName, null);
    }
    getPermissions() {
        return this._ajax('GET', 'permissions', null);
    }
    getUserInfo() {
        return this._ajax('GET', 'userInfo', null);
    }
    _getBasicAuthHeaders() {
        return {
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret)
        };
    }
    _ajax(type, path, data) {
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
    }
}
