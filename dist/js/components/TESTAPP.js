/*! Empire 2
 *  @description  eCore
 *  @version      0.1.0.REL20221118
 *  @copyright    2022 New York State Office of Information Technology Services
 */

define([], function () {

    // Prerender Hook to allow the table to have additional column limits
    var preRenderHook = function (data) {

        console.log("Prerender called!");
    };

    return {
        preRenderHook: preRenderHook
    };
});
