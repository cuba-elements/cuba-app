declare let $: any;

class Cuba {

    constructor (public apiUrl = 'http://localhost:8080/app/rest/v2/',
                 public restClientId = 'client',
                 public restClientSecret = 'secret') {
    }

    get restApiToken() {
        return sessionStorage.getItem('cubaAccessToken');
    }

    set restApiToken(token) {
        sessionStorage.setItem('cubaAccessToken', token);
    }

    login(login, password) {
        return $.ajax({
            url: this.apiUrl + 'oauth/token',
            type: 'POST',
            headers: this._getBasicAuthHeaders(),
            dataType: 'json',
            data: {grant_type: 'password', username: login, password: password}
        }).then((data) => {
            this.restApiToken = data.access_token;
        });
    }

    logout() {
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: {token: this.restApiToken},
            headers: this._getBasicAuthHeaders()
        };
        sessionStorage.removeItem('cubaAccessToken');
        sessionStorage.removeItem('cubaUserName');
        return $.ajax(ajaxSettings);
    }

    loadEntities(metaClass, view = '_local', sort = null) {
        var opts:any = {view: view};
        if (sort) {
            opts.sort = sort;
        }
        return this._ajax('GET', 'entities/' + metaClass, opts);
    }

    loadEntity(metaClass, id, view = '_local') {
        return this._ajax('GET', 'entities/' + metaClass + '/' + id,  {view: view});
    }

    commitEntity(metaClass, entity) {
        if (entity.id) {
            return this._ajax('PUT', 'entities/' + metaClass + '/' + entity.id, JSON.stringify(entity));
        } else {
            return this._ajax('POST', 'entities/' + metaClass, JSON.stringify(entity));
        }
    }

    loadMetadata() {
        return this._ajax('GET', 'metadata/entities', null);
    }

    loadEntityMetadata(metaClass) {
        return this._ajax('GET', 'metadata/entities' + '/' + metaClass, null);
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
        var ajaxSettings:any = {
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
