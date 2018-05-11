/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   cuba-app.html
 */

/// <reference path="../polymer/types/polymer.d.ts" />
/// <reference path="cuba-js-script.d.ts" />

/**
 * The `cuba-app` element is used for initialization and configuration connection to CUBA REST API.
 * Adds `cuba` object to the global JS scope.
 */
interface CubaAppElement extends Polymer.Element {

  /**
   * Connection URL to CUBA REST API v2.
   * Trailing slash required.
   */
  apiUrl: string|null|undefined;

  /**
   * App name
   */
  name: string|null|undefined;

  /**
   * Instance of CubaApp, see https://github.com/cuba-platform/cuba-rest-js.git
   */
  readonly app: cuba.CubaApp|null;
  _setupApp(apiUrl: any, name: any): void;
}

interface HTMLElementTagNameMap {
  "cuba-app": CubaAppElement;
}
