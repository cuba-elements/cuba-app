declare let cubaApp:CubaApp;

@component("cuba-app")
class CubaApp extends polymer.Base {

    private cubaApp: Cuba;

    @property({type: String, value: "http://localhost:8080/app/dispatch/api/", observer: "_apiUrlChanged"})
    apiUrl: string;

    created() {
        this.cubaApp = new Cuba(this.apiUrl);
        window['cubaApp'] = this.cubaApp;
    }

    private _apiUrlChanged():void {
        this.cubaApp.apiUrl = this.apiUrl;
    }

}

CubaApp.register();