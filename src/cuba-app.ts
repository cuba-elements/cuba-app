/// <reference path="../bower_components/polymer-ts/polymer-ts.d.ts"/>

declare let cubaApp:CubaApp;

@component("cuba-app")
class CubaApp extends polymer.Base {

    cubaApp: Cuba;

    @property({type: String, observer: "_apiUrlChanged"})
    apiUrl: string;

    created() {
        this.cubaApp = new Cuba();
        window['cubaApp'] = this.cubaApp;
    }

    private _apiUrlChanged():void {
        this.cubaApp.apiUrl = this.apiUrl;
    }

}

CubaApp.register();