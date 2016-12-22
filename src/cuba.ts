///<reference path="../typings/index.d.ts" />

class Cuba {

    static REST_TOKEN_STORAGE_KEY = 'cubaAccessToken';
    static USER_NAME_STORAGE_KEY = 'cubaUserName';
    static LOCALE_STORAGE_KEY = 'cubaLocale';

    private loginCallbacks: JQueryCallback;
    private tokenExpiryCallbacks: JQueryCallback;

    constructor(public apiUrl = '/app/rest/',
                public restClientId = 'client',
                public restClientSecret = 'secret',
                public defaultLocale = 'en') {
        this.loginCallbacks = $.Callbacks();
        this.tokenExpiryCallbacks = $.Callbacks();
    }

    get restApiToken(): string {
        return localStorage.getItem(Cuba.REST_TOKEN_STORAGE_KEY);
    }

    set restApiToken(token: string) {
        localStorage.setItem(Cuba.REST_TOKEN_STORAGE_KEY, token);
    }

    get locale(): string {
        let storedLocale = localStorage.getItem(Cuba.LOCALE_STORAGE_KEY);
        return storedLocale ? storedLocale : this.defaultLocale;
    }

    set locale(locale: string) {
        localStorage.setItem(Cuba.LOCALE_STORAGE_KEY, locale);
    }

    login(login: string, password: string): JQueryPromise<{access_token: string}> {
        return $.ajax({
            url: this.apiUrl + 'v2/oauth/token',
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
            url: this.apiUrl + 'v2/oauth/revoke',
            data: {token: this.restApiToken},
            headers: this._getBasicAuthHeaders()
        };
        Cuba.clearAuthData();
        return $.ajax(ajaxSettings);
    }

    onTokenExpiry(cb): void {
        this.tokenExpiryCallbacks.add(cb);
    }

    loadEntities(entityName, options?: {view?: string, sort?: string, limit?: number, offset?: number}): JQueryPromise<any[]> {
        return this.ajax('GET', 'v2/entities/' + entityName, options);
    }

    loadEntity(entityName, id, options?: {view?: string}): JQueryPromise<any> {
        return this.ajax('GET', 'v2/entities/' + entityName + '/' + id, options);
    }

    deleteEntity(entityName, id): JQueryPromise<any> {
        return this.ajax('DELETE', 'v2/entities/' + entityName + '/' + id, null, {dataType: null});
    }

    commitEntity(entityName: string, entity: any): JQueryPromise<any> {
        if (entity.id) {
            return this.ajax('PUT', 'v2/entities/' + entityName + '/' + entity.id, JSON.stringify(entity));
        } else {
            return this.ajax('POST', 'v2/entities/' + entityName, JSON.stringify(entity));
        }
    }

    invokeService(serviceName: string, methodName: string, params: any, ajaxSettings?: JQueryAjaxSettings): JQueryPromise<any> {
        return this.ajax('POST', 'v2/services/' + serviceName + '/' + methodName, JSON.stringify(params), ajaxSettings);
    }

    query(entityName: string, queryName: string, params?: any): JQueryPromise<any> {
        return this.ajax('GET', 'v2/queries/' + entityName + '/' + queryName, params);
    }

    loadMetadata(): JQueryPromise<any> {
        return this.ajax('GET', 'v2/metadata/entities', null);
    }

    loadEnums(): JQueryPromise<any> {
        return this.ajax('GET', 'v2/metadata/enums', null);
    }

    loadEntityMetadata(entityName: string): JQueryPromise<any> {
        return this.ajax('GET', 'v2/metadata/entities' + '/' + entityName, null);
    }

    getPermissions(): JQueryPromise<any> {
        return this.ajax('GET', 'v2/permissions', null);
    }

    getUserInfo(): JQueryPromise<any> {
        return this.ajax('GET', 'v2/userInfo', null);
    }

    _getBasicAuthHeaders(): {[header: string]: string} {
        return {
            "Accept-Language": this.locale,
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret)
        };
    }

    static clearAuthData(): void {
        localStorage.removeItem(Cuba.REST_TOKEN_STORAGE_KEY);
        localStorage.removeItem(Cuba.USER_NAME_STORAGE_KEY);
    }

    ajax(type, path, data?, ajaxSettings?: JQueryAjaxSettings): JQueryXHR {
        var settings: any = {
            type: type,
            url: this.apiUrl + path,
            data: data,
            dataType: 'json',
            headers: {
                "Accept-Language": this.locale
            }
        };
        if (this.restApiToken) {
            settings.headers["Authorization"] = "Bearer " + this.restApiToken
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
