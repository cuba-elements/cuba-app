declare let cubaApp:CubaApp;

@component("cuba-app")
class CubaApp extends polymer.Base {

    @property({type: String, value: "http://localhost:8080/app/dispatch/api/", observer: "_apiUrlChanged"})
    apiUrl: string;

    ready() {
        window['cubaApp'] = new Cuba(this.apiUrl);
    }

    private _apiUrlChanged():void {
        cubaApp.apiUrl = this.apiUrl;
    }

}