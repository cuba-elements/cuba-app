declare let $: any;

export class CubaApp {

    private loginCallbacks;

    constructor (public apiUrl) {
        this.loginCallbacks = $.Callbacks();
    }

    get restApiToken() {
        return sessionStorage.getItem('cubaAccessToken');
    }

    set restApiToken(token) {
        sessionStorage.setItem('cubaAccessToken', token);
    }

    get userName() {
        return sessionStorage.getItem('cubaUserName');
    }

    set userName(userName) {
        sessionStorage.setItem('cubaUserName', userName);
    }

    get loggedIn() {
        return typeof this.restApiToken !== 'undefined' && this.restApiToken != null;
    }

    login(login, password) {
        return $.ajax({
            url: this.apiUrl + 'oauth/token',
            type: 'POST',
            headers: {
                "Authorization": "Basic Y2xpZW50OnNlY3JldA==" //todo minaev config
            },
            dataType: 'json',
            data: {grant_type: 'password', username: login, password: password}
        }).then((data) => {
            this.restApiToken = data.access_token;
            this.userName = login;
            this.loginCallbacks.fire();
        });
    }

    logout() {
        this.userName = null;
        var ajaxSettings = {
            type: 'POST',
            url: this.apiUrl + 'oauth/revoke',
            data: {token: this.restApiToken},
            headers: {
                "Authorization": "Basic Y2xpZW50OnNlY3JldA==" //todo minaev config
            }
        };
        sessionStorage.removeItem('cubaAccessToken');
        sessionStorage.removeItem('cubaUserName');
        return $.ajax(ajaxSettings);
    }

    onLogin(cb) {
        this.loginCallbacks.add(cb);
    }

    loadEntities(metaClass, view = '_local', sort = null) {
        var opts = {view: view};
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
        return this._ajax('GET', 'metadata/entities');
    }

    loadEntityMetadata(metaClass) {
        return this._ajax('GET', 'metadata/entities' + '/' + metaClass);
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
