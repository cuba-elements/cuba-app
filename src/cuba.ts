///<reference path="../typings/index.d.ts" />

class Cuba {

    static REST_TOKEN_STORAGE_KEY = 'cubaAccessToken';
    static USER_NAME_STORAGE_KEY = 'cubaUserName';

    private loginCallbacks: JQueryCallback;
    private tokenExpiryCallbacks: JQueryCallback;

    constructor(public apiUrl = '/app/rest/v2/',
                public restClientId = 'client',
                public restClientSecret = 'secret') {
        this.loginCallbacks = $.Callbacks();
        this.tokenExpiryCallbacks = $.Callbacks();
    }

    get restApiToken(): string {
        return localStorage.getItem(Cuba.REST_TOKEN_STORAGE_KEY);
    }

    set restApiToken(token: string) {
        localStorage.setItem(Cuba.REST_TOKEN_STORAGE_KEY, token);
    }

    login(login: string, password: string): JQueryPromise<{access_token: string}> {
        return $.ajax({
            url: this.apiUrl + 'oauth/token',
            type: 'POST',
            headers: this._getBasicAuthHeaders(),
            dataType: 'json',
            data: {grant_type: 'password', username: login, password: password}
        }).then((data) => {
            this.restApiToken = data.access_token;
            this.loginCallbacks.fire();
        });
    }

    onLogin(cb: Function) {
        this.loginCallbacks.add(cb);
    }

    logout(): JQueryPromise<any> {
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: {token: this.restApiToken},
            headers: this._getBasicAuthHeaders()
        };
        Cuba.clearAuthData();
        return $.ajax(ajaxSettings);
    }

    onTokenExpiry(cb): void {
        this.tokenExpiryCallbacks.add(cb);
    }

    loadEntities(entityName, view = '_local', sort = null): JQueryPromise<any[]> {
        var opts: any = {view: view};
        if (sort) {
            opts.sort = sort;
        }
        return this._ajax('GET', 'entities/' + entityName, opts);
    }

    loadEntity(entityName, id, view = '_local'): JQueryPromise<any> {
        return this._ajax('GET', 'entities/' + entityName + '/' + id, {view: view});
    }

    commitEntity(entityName: string, entity: any): JQueryPromise<any> {
        if (entity.id) {
            return this._ajax('PUT', 'entities/' + entityName + '/' + entity.id, JSON.stringify(entity));
        } else {
            return this._ajax('POST', 'entities/' + entityName, JSON.stringify(entity));
        }
    }

    invokeService(serviceName: string, methodName: string, params: any, ajaxSettings?: JQueryAjaxSettings): JQueryPromise<any> {
        return this._ajax('POST', 'services/' + serviceName + '/' + methodName, JSON.stringify(params), ajaxSettings);
    }

    query(entityName: string, queryName: string, params?: any): JQueryPromise<any> {
        return this._ajax('GET', 'queries/' + entityName + '/' + queryName, params);
    }

    loadMetadata(): JQueryPromise<any> {
        return this._ajax('GET', 'metadata/entities', null);
    }

    loadEntityMetadata(entityName: string): JQueryPromise<any> {
        return this._ajax('GET', 'metadata/entities' + '/' + entityName, null);
    }

    getPermissions(): JQueryPromise<any> {
        return this._ajax('GET', 'permissions', null);
    }

    getUserInfo(): JQueryPromise<any> {
        return this._ajax('GET', 'userInfo', null);
    }

    _getBasicAuthHeaders(): {[header: string]: string} {
        return {
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret)
        };
    }

    static clearAuthData(): void {
        localStorage.removeItem(Cuba.REST_TOKEN_STORAGE_KEY);
        localStorage.removeItem(Cuba.USER_NAME_STORAGE_KEY);
    }

    _ajax(type, path, data?, ajaxSettings?: JQueryAjaxSettings): JQueryXHR {
        var settings: any = {
            type: type,
            url: this.apiUrl + path,
            data: data,
            dataType: 'json'
        };
        if (this.restApiToken) {
            settings.headers = {
                "Authorization": "Bearer " + this.restApiToken
            }
        }
        if (type != 'GET') {
            settings.contentType = 'application/json';
        }
        var ajaxPromise = $.ajax($.extend(settings, ajaxSettings));
        ajaxPromise.then(null, (xhr: JQueryXHR) => {
            if (Cuba.isTokenExpiredResponse(xhr)) {
                Cuba.clearAuthData();
                this.tokenExpiryCallbacks.fire();
            }
        });
        return ajaxPromise;
    }

    static isTokenExpiredResponse(resp: JQueryXHR): boolean {
        return resp.status === 401
            && resp.responseJSON
            && resp.responseJSON.error === 'invalid_token';
    }
}
