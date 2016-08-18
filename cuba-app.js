var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CubaApp = (function (_super) {
    __extends(CubaApp, _super);
    function CubaApp() {
        this.cubaApp = new Cuba(this.apiUrl);
        window['cubaApp'] = this.cubaApp;
    }
    CubaApp.prototype._apiUrlChanged = function () {
        if (this.cubaApp) {
            this.cubaApp.apiUrl = this.apiUrl;
        }
    };
    __decorate([
        property({ type: String, value: "http://localhost:8080/app/dispatch/api/", observer: "_apiUrlChanged" })
    ], CubaApp.prototype, "apiUrl", void 0);
    CubaApp = __decorate([
        component("cuba-app")
    ], CubaApp);
    return CubaApp;
}(polymer.Base));
CubaApp.register();
