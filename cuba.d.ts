declare let $: any;
declare class Cuba {
    apiUrl: string;
    restClientId: string;
    restClientSecret: string;
    private loginCallbacks;
    constructor(apiUrl?: string, restClientId?: string, restClientSecret?: string, loginCallbacks?: any);
    restApiToken: string;
    login(login: string, password: string): Promise<{
        access_token: string;
    }>;
    onLogin(cb: Function): void;
    logout(): Promise<any>;
    loadEntities(entityName: any, view?: string, sort?: any): Promise<any[]>;
    loadEntity(entityName: any, id: any, view?: string): Promise<any>;
    commitEntity(entityName: string, entity: any): Promise<any>;
    invokeService(serviceName: string, methodName: string, params: any): Promise<any>;
    loadMetadata(): Promise<any>;
    loadEntityMetadata(entityName: string): Promise<any>;
    getPermissions(): Promise<any>;
    getUserInfo(): Promise<any>;
    _getBasicAuthHeaders(): {
        [header: string]: string;
    };
    _ajax(type: any, path: any, data: any): any;
}
