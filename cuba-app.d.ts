/// <reference path="../bower_components/polymer-ts/polymer-ts.d.ts" />
declare let cubaApp: CubaApp;
declare class CubaApp extends polymer.Base {
    private cubaApp;
    apiUrl: string;
    created(): void;
    private _apiUrlChanged();
}
