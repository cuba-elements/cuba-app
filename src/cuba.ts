declare let $: any;

class Cuba {

    constructor(public apiUrl = 'http://localhost:8080/app/rest/v2/',
                public restClientId = 'client',
                public restClientSecret = 'secret',
                private loginCallbacks = $.Callbacks()) {
    }

    get restApiToken(): string {
        return localStorage.getItem('cubaAccessToken');
    }

    set restApiToken(token: string) {
        localStorage.setItem('cubaAccessToken', token);
    }

    login(login: string, password: string): Promise<{access_token: string}> {
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

    logout(): Promise<any> {
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: {token: this.restApiToken},
            headers: this._getBasicAuthHeaders()
        };
        localStorage.removeItem('cubaAccessToken');
        localStorage.removeItem('cubaUserName');
        return $.ajax(ajaxSettings);
    }

    loadEntities(entityName, view = '_local', sort = null): Promise<any[]> {
        var opts: any = {view: view};
        if (sort) {
            opts.sort = sort;
        }
        return this._ajax('GET', 'entities/' + entityName, opts);
    }

    loadEntity(entityName, id, view = '_local'): Promise<any> {
        return this._ajax('GET', 'entities/' + entityName + '/' + id, {view: view});
    }

    commitEntity(entityName: string, entity: any): Promise<any> {
        if (entity.id) {
            return this._ajax('PUT', 'entities/' + entityName + '/' + entity.id, JSON.stringify(entity));
        } else {
            return this._ajax('POST', 'entities/' + entityName, JSON.stringify(entity));
        }
    }

    invokeService(serviceName: string, methodName: string, params: any): Promise<any> {
        return this._ajax('POST', 'services/' + serviceName + '/' + methodName, JSON.stringify(params));
    }

    loadMetadata(): Promise<any> {
        return this._ajax('GET', 'metadata/entities', null);
    }

    loadEntityMetadata(entityName: string): Promise<any> {
        return this._ajax('GET', 'metadata/entities' + '/' + entityName, null);
    }

    getPermissions(): Promise<any> {
        return this._ajax('GET', 'permissions', null);
    }

    getUserInfo(): Promise<any> {
        return this._ajax('GET', 'userInfo', null);
    }

    _getBasicAuthHeaders(): {[header: string]: string} {
        return {
            "Authorization": "Basic " + btoa(this.restClientId + ':' + this.restClientSecret)
        };
    }

    _ajax(type, path, data) {
        var ajaxSettings: any = {
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
