/// <reference path="../typings/index.d.ts" />
declare class Cuba {
    apiUrl: string;
    restClientId: string;
    restClientSecret: string;
    static REST_TOKEN_STORAGE_KEY: string;
    static USER_NAME_STORAGE_KEY: string;
    private loginCallbacks;
    private tokenExpiryCallbacks;
    constructor(apiUrl?: string, restClientId?: string, restClientSecret?: string);
    restApiToken: string;
    login(login: string, password: string): JQueryPromise<{
        access_token: string;
    }>;
    onLogin(cb: Function): void;
    logout(): JQueryPromise<any>;
    onTokenExpiry(cb: any): void;
    loadEntities(entityName: any, options?: {
        view?: string;
        sort?: string;
        limit?: number;
        offset?: number;
    }): JQueryPromise<any[]>;
    loadEntity(entityName: any, id: any, options?: {
        view?: string;
    }): JQueryPromise<any>;
    deleteEntity(entityName: any, id: any): JQueryPromise<any>;
    commitEntity(entityName: string, entity: any): JQueryPromise<any>;
    invokeService(serviceName: string, methodName: string, params: any, ajaxSettings?: JQueryAjaxSettings): JQueryPromise<any>;
    query(entityName: string, queryName: string, params?: any): JQueryPromise<any>;
    loadMetadata(): JQueryPromise<any>;
    loadEntityMetadata(entityName: string): JQueryPromise<any>;
    getPermissions(): JQueryPromise<any>;
    getUserInfo(): JQueryPromise<any>;
    _getBasicAuthHeaders(): {
        [header: string]: string;
    };
    static clearAuthData(): void;
    ajax(type: any, path: any, data?: any, ajaxSettings?: JQueryAjaxSettings): JQueryXHR;
    static isTokenExpiredResponse(resp: JQueryXHR): boolean;
}
