/// <reference 

declare let cubaApp:CubaApp;

@component("cuba-app")
class CubaApp extends polymer.Base {

    @property({type: String, value: "http://localhost:8080/app/dispatch/api/", observer: "_apiUrlChanged"})
    apiUrl: string;

    private _apiUrlChanged():void {
        cubaApp.apiUrl = this.apiUrl;
    }

}