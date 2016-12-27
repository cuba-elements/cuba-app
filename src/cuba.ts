/// <reference path="../node_modules/rx/ts/rx.lite.d.ts"/>

interface IResponseError extends Error {
    response?: any;
}
type ContentType = 'text' | 'json' | 'blob'

interface IFetchOptions extends RequestInit {
    handleAs?: ContentType
}

class Cuba {

    static REST_TOKEN_STORAGE_KEY = 'cubaAccessToken';
    static USER_NAME_STORAGE_KEY = 'cubaUserName';
    static LOCALE_STORAGE_KEY = 'cubaLocale';

    public loginSubject = new Rx.Subject<{access_token: string}>();
    public tokenExpirySubject = new Rx.Subject();
    public messagesSubject = new Rx.BehaviorSubject(null);
    public enumsSubject = new Rx.BehaviorSubject(null);

    constructor(public name = "",
                public apiUrl = '/app/rest/',
                public restClientId = 'client',
                public restClientSecret = 'secret',
                public defaultLocale = 'en') {
        if (this.restApiToken) {
            this.loadEntitiesMessages();
            this.loadEnums();
        }
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

    login(login: string, password: string): Promise<{access_token: string}> {
        if (login == null) login = '';
        if (password == null) password = '';
        let fetchOptions = {
            method: 'POST',
            headers: this._getBasicAuthHeaders(),
            body: 'grant_type=password&username=' + encodeURIComponent(login) + '&password=' + encodeURIComponent(password)
        };
        let loginRes = fetch(this.apiUrl + 'v2/oauth/token', fetchOptions)
            .then(this.checkStatus)
            .then((resp) => resp.json())
            .then((data) => {
                this.restApiToken = data.access_token;
                this.loginSubject.onNext(data);
                return data;
            });
        return loginRes;
    }

    logout(): Promise<any> {
        let fetchOptions = {
            method: 'POST',
            headers: this._getBasicAuthHeaders(),
            body: "token=" + encodeURIComponent(this.restApiToken),
        };
        this.clearAuthData();
        return fetch(this.apiUrl + 'v2/oauth/revoke', fetchOptions).then(this.checkStatus);
    }

    loadEntities(entityName, options?: {view?: string, sort?: string, limit?: number, offset?: number}): Promise<any[]> {
        return this.ajax('GET', 'v2/entities/' + entityName, options, {handleAs: 'json'});
    }

    loadEntity(entityName, id, options?: {view?: string}): Promise<any> {
        return this.ajax('GET', 'v2/entities/' + entityName + '/' + id, options, {handleAs: 'json'});
    }

    deleteEntity(entityName, id): Promise<any> {
        return this.ajax('DELETE', 'v2/entities/' + entityName + '/' + id);
    }

    commitEntity(entityName: string, entity: any): Promise<any> {
        if (entity.id) {
            return this.ajax('PUT', 'v2/entities/' + entityName + '/' + entity.id, JSON.stringify(entity), {handleAs: 'json'});
        } else {
            return this.ajax('POST', 'v2/entities/' + entityName, JSON.stringify(entity), {handleAs: 'json'});
        }
    }

    invokeService(serviceName: string, methodName: string, params: any, fetchOptions?: IFetchOptions): Promise<any> {
        return this.ajax('POST', 'v2/services/' + serviceName + '/' + methodName, JSON.stringify(params), fetchOptions);
    }

    query(entityName: string, queryName: string, params?: any): Promise<any> {
        return this.ajax('GET', 'v2/queries/' + entityName + '/' + queryName, params, {handleAs: 'json'});
    }

    loadMetadata(): Promise<any> {
        return this.ajax('GET', 'v2/metadata/entities', null, {handleAs: 'json'});
    }

    loadEntityMetadata(entityName: string): Promise<any> {
        return this.ajax('GET', 'v2/metadata/entities' + '/' + entityName, null, {handleAs: 'json'});
    }

    loadEntitiesMessages(): Promise<any> {
        let fetchRes = this.ajax('GET', 'v2/messages/entities', null, {handleAs: 'json'});
        fetchRes.then((messages) => {
            this.messagesSubject.onNext(messages);
        });
        return fetchRes;
    }

    loadEnums(): Promise<any> {
        let fetchRes = this.ajax('GET', 'v2/metadata/enums', null, {handleAs: 'json'});
        fetchRes.then((enums) => {
            this.enumsSubject.onNext(enums);
        });
        return fetchRes;
    }

    getPermissions(): Promise<any> {
        return this.ajax('GET', 'v2/permissions', null, {handleAs: 'json'});
    }

    getUserInfo(): Promise<any> {
        return this.ajax('GET', 'v2/userInfo', null, {handleAs: 'json'});
    }

    private _getBasicAuthHeaders(): {[header: string]: string} {
        return {
            "Accept-Language": this.locale,
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret),
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        };
    }

    private clearAuthData(): void {
        localStorage.removeItem(Cuba.REST_TOKEN_STORAGE_KEY);
        localStorage.removeItem(Cuba.USER_NAME_STORAGE_KEY);
    }

    ajax(method, path, data?, fetchOptions?: IFetchOptions): Promise<any> {
        let url = this.apiUrl + path;
        let settings: RequestInit = {
            method: method,
            headers: {
                "Accept-Language": this.locale
            }
        };
        if (this.restApiToken) {
            settings.headers["Authorization"] = "Bearer " + this.restApiToken
        }
        if (method == 'POST' || method == 'PUT') {
            settings.body = data;
            settings.headers["Content-Type"] = "application/json; charset=UTF-8";
        }
        if (method == 'GET' && data) {
            url += '?' + Object.keys(data).map(k => {
                return encodeURIComponent(k) + "=" + encodeURIComponent(data[k])
            }).join("&");
        }
        let handleAs:ContentType = fetchOptions ? fetchOptions.handleAs : undefined;
        switch (handleAs) {
            case "text":
                settings.headers["Accept"] = "text/html";
                break;
            case "json":
                settings.headers["Accept"] = "application/json";
                break;
        }

        let fetchRes = fetch(url, settings).then(this.checkStatus);

        fetchRes.catch((error) => {
            if (Cuba.isTokenExpiredResponse(error.response)) {
                this.clearAuthData();
                this.tokenExpirySubject.onNext(true);
            }
        });

        return fetchRes.then((resp) => {
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
    }

    checkStatus(response: Response): Response {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            let error: IResponseError = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }


    static isTokenExpiredResponse(resp: Response): boolean {
        return resp && resp.status === 401;
        // && resp.responseJSON
        // && resp.responseJSON.error === 'invalid_token';
    }
}

// The declarations below are required because `fetch` typings contains es6 types, while we are targeting es5.
// (lib is compatible with es5)
declare const Symbol: {
    iterator: symbol;
};
declare type IterableIterator<T> = any;
declare type IteratorResult<T> = any;
