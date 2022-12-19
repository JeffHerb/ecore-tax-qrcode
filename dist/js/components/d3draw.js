/*! Empire 2
 *  @description  eCore
 *  @version      0.1.0.REL20221118
 *  @copyright    2022 New York State Office of Information Technology Services
 */

// The d3 library needs to be custom build from source in the AMD output format to get it to work!
define(['d3', 'topoClient'], function(d3, topojson) {

    console.log("Draw3d");

    console.log("d3");
    console.log(d3);

    var _priv = {
        bInit: false,
        oLoadedMaps: {},
        oFocusedRegion: null
    };

    var dMainScript = document.querySelector('script#require');

    var sMainScriptPath = dMainScript.getAttribute('src');

    // Get Script 
    var sScriptRootPaths = sMainScriptPath.split('/main.js?')[0] + "/scripts/_map";

    window.d3 = d3;

    var d3Draw = function() {
        return this;
    };

    // Loads one or more map files
    d3Draw.prototype.loadMaps = function _d3Draw_load_maps(aMapNames, fCB) {

        if (aMapNames && aMapNames.length) {

            var sOrignalMapName = aMapNames.shift();
            var sFullMapName = null;

            if (sOrignalMapName.indexOf('_nys_') !== 0) {

                sFullMapName = "_nys_" + sOrignalMapName;
            }
            else {

                sFullMapName = sOrignalMapName
            }

            if (!_priv.oLoadedMaps[sOrignalMapName]) {

                var sFullMapPath = sScriptRootPaths + sFullMapName;

                cui.load(sFullMapPath, function(oMap) {

                    // Store the map in a usable area
                    _priv.oLoadedMaps[sOrignalMapName] = oMap;
    
                    if (aMapNames && aMapNames.length) {

                        this.loadMaps(aMapNames, fCB);
                    }
                    else {

                        if (fCB && typeof fCB === "function") {
                            fCB();
                        }
                    }
                    
                }.bind(this));

            }

        }

    };

    d3Draw.prototype.drawMap = function _d3Draw_load_map(sMapName, oMeta, sTargetID, oInteractive) {

        if (_priv.oLoadedMaps[sMapName]) {

            // Set/Default Map size (Make sure the exported maps are properly sized)
            var iWidth = oMeta.iWidth || 900;
            var iHeight = oMeta.iHeight || 600;

            var dSVG = d3
                .select(sTargetID)
                .append("svg")
                .attr("width", iWidth)
                .attr("height", iHeight)
            
            var dG = dSVG.append("g");

            // Get the proper object outline
            var outlineObjectName = Object.keys(_priv.oLoadedMaps[sMapName].objects)[0];

            var outlineData = topojson.feature(_priv.oLoadedMaps[sMapName], _priv.oLoadedMaps[sMapName].objects[outlineObjectName]).features;

            //var projection = d3.geoMercator();
            var path = d3.geoPath().projection(null);
            var bounds = path.bounds(_priv.oLoadedMaps[sMapName]);

            if (!oInteractive) {

                // Blank just draw the map
                dG.selectAll("path").data(outlineData).enter().append("path")
                    .attr("d", path)
                    .style("fill", "none")
                    .style("stroke", "black");
            }
            else {

                dG.selectAll("path")
                    .data(outlineData)
                    .join(function(enter) {

                        var p = enter.append("path");

                        if (oInteractive.mouseover) {

                            p.on("mouseover", function(evt, d) {

                                var dShape = d3.select(this);

                                oInteractive["mouseover"](evt, d, dShape);

                            });

                        }

                        if (oInteractive.mouseleave) {

                            p.on("mouseleave", function(evt, d) {

                                var dShape = d3.select(this);

                                oInteractive["mouseleave"](evt, d, dShape);

                            });

                        }

                        if (oInteractive.mousemove) {

                            p.on("mousemove", function(evt, d) {

                                var dShape = d3.select(this);

                                oInteractive["mousemove"](evt, d, dShape);

                            });

                        }

                        if (oInteractive.click) {

                            p.on("click", function(evt, d) {

                                var dShape = d3.select(this);

                                oInteractive["click"](evt, d, dShape);

                            });

                        }

                        
                        return p;
                    })
                    .attr("d", path)
                    .style("fill", "#FFF")
                    .style("stroke", "black");

            }

        }
        else {

            console.log(_priv.oLoadedMaps);

            journal.log({ type: 'error', owner: 'UI', module: 'd3Draw', submodule: '', func: 'drawMap' }, 'Requested Map Topo "' + sMapName + '" is not loaded.');

        }

    };

    d3Draw.prototype.seeLoaded = function _d3Draw_see_loaded() {

        console.log(_priv.oLoadedMaps);

    };

    d3Draw.prototype.select = function(d) {



    };

    return d3Draw;



});
