declare let cubaApp:CubaApp;

@component("cuba-app")
class CubaApp extends polymer.Base {

    cubaApp: Cuba;

    @property({type: String, value: "http://localhost:8080/app/dispatch/api/", observer: "_apiUrlChanged"})
    apiUrl: string;

    constructor() {
        this.cubaApp = new Cuba(this.apiUrl);
        window['cubaApp'] = this.cubaApp;
    }

    private _apiUrlChanged():void {
        if (this.cubaApp) {
            this.cubaApp.apiUrl = this.apiUrl;
        }
    }

}

CubaApp.register();