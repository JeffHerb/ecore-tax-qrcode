define([], function() {

    var _priv = {
        dMapContainer: false,
        bInit: false,
        d3Draw: false,
        loadedMapes: {}
    };

    /// Page Script function to request the appropriate mapes to load as its page buisness logic
    var loadMap = function(sMap, fCB) {

        if (!_priv.loadedMapes[sMap]) {

            cui.load(_priv.d3Draw.loadMap(sMap), fCB());

        }
        else {

            fCB();
        }

    };

    // Example function creating the counties map
    var drawCounty = function() {

        var dMapCountiesContainer = document.querySelector('#nys-counties');

        var dTooltip = document.createElement('div');
        dTooltip.classList.add('emp-map-tooltip');
        
        dMapCountiesContainer.appendChild(dTooltip);

        var oMetaSize = {
            iWidth: 640,
            iHeight: 480,
            oMargin: {
                iTop: 10,
                iLeft: 10,
                iRight: 10,
                iBottom: 10
            }
        };

        var oInteractions = {
            mouseover: function _onMouseOver(evt, d, dShape) {

                var dTooltip = document.querySelector('.emp-map-tooltip');

                dTooltip.innerHTML = d.properties.NAME;

                dShape.transition()
                .duration(200)
                .style("fill", "#09464c");

                dTooltip.style.display = 'block';
            },
            mouseleave: function _onMouseLeave(evt, d, dShape) {

                var dTooltip = document.querySelector('.emp-map-tooltip');

                dShape.transition()
                .duration(200)
                .style("fill", "#FFF");

                dTooltip.style.display = null;
            },
            mousemove: function _onMouseMove(evt, d, dShape) {

                var dTooltip = document.querySelector('.emp-map-tooltip');

                dTooltip.style.left = evt.pageX + 20 + 'px';
                dTooltip.style.top = (evt.pageY - 240) + 20 + 'px';

            },
        }

        _priv.d3Draw.drawMap('albany_county', oMetaSize, '#nys-counties', oInteractions );
    };

    var init = function _init() {

        // Load the actual D3 library
        cui.load('d3draw', function(d3Draw) {

            _priv.d3Draw = new d3Draw();
            _priv.bInit = true;

            // State outline map
            dMapContainer = document.querySelector('#nys-counties');

            _priv.d3Draw.loadMaps(['albany_county'], function() {

                drawCounty();

            });

        });

    };

    return {
        init: init
    };

});