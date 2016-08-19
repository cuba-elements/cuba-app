declare let $: any;
declare class Cuba {
    apiUrl: string;
    restClientId: string;
    restClientSecret: string;
    constructor(apiUrl?: string, restClientId?: string, restClientSecret?: string);
    restApiToken: any;
    login(login: any, password: any): any;
    logout(): any;
    loadEntities(metaClass: any, view?: string, sort?: any): any;
    loadEntity(metaClass: any, id: any, view?: string): any;
    commitEntity(metaClass: any, entity: any): any;
    loadMetadata(): any;
    loadEntityMetadata(metaClass: any): any;
    getPermissions(): any;
    getUserInfo(): any;
    _getBasicAuthHeaders(): {
        "Authorization": string;
    };
    _ajax(type: any, path: any, data: any): any;
}
