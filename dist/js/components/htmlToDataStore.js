/*! Empire 2
 *  @description  eCore
 *  @version      0.1.0.REL20221118
 *  @copyright    2022 New York State Office of Information Technology Services
 */

define(['kind', 'dataStore'], function (kind, ds) {

    /////////////////////
    // Private methods //
    /////////////////////

    var _definitions = {
        'table': {
            root: 'div.emp-table',
            rule: function _tableRule($table) {

                function styleProperty(obj, value) {

                    if (!obj.hasOwnProperty('style')) {

                        obj.style = value;
                    }
                    else {

                        obj.style += ',' + value;
                    }

                    return obj;
                }

                function rowsDefintion($section, $rows, skipIndex, globalSettings) {

                    var rows = [];

                    // Loop through rows
                    $rows.each(function (i) {

                        // Create row definition
                        var row = {
                            columns: []
                        };

                        var $row = $(this);
                        var $cols = $row.find('th, td');

                        var rowStyles = "";

                        var rowAttributes = _priv.pullAttributes($row, ['style']);

                        if (rowAttributes) {

                            if (rowAttributes.hasOwnProperty('className')) {

                                var rowElmClasses = rowAttributes.className;

                                // Add the min width style
                                if (rowElmClasses.indexOf('emp-bold') !== -1) {

                                    // Add the min width style property
                                    rowStyles += "bold";

                                    // Remove the class
                                    rowElmClasses.className = rowAttributes.className.replace('emp-bold', '').trim();
                                }

                                if (rowElmClasses.indexOf('emp-highlight-row') !== -1) {

                                    row.focus = true;
                                    row.highlight = true;

                                    // Remove the class
                                    rowElmClasses.className = rowAttributes.className.replace('emp-bold', '').trim();
                                }
                            }

                        }

                        if (rowStyles) {

                            row.style = rowStyles;
                        }

                        // Loop through columns
                        $cols.each(function (i) {

                            // Check to make sure this is not an index we can safely skip
                            if (skipIndex.indexOf(i) === -1) {

                                // Create col definition
                                var col = {
                                        responsive: {}
                                    };

                                var $col = $(this);

                                if ($col[0].nodeName === 'TH') {
                                    col.type = 'header';
                                }

                                var attributes = _priv.pullAttributes($col, ['style']);

                                if (attributes) {

                                    // Extract special styles based on classes.
                                    if (attributes.hasOwnProperty('className')) {

                                        var elmClasses = attributes.className;

                                        // Add the min width style
                                        if (elmClasses.indexOf('emp-min-width') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'min-width');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('emp-min-width', '').trim();
                                        }

                                        // Add the no-wrap style
                                        if (elmClasses.indexOf('cui-no-wrap') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'no-wrap');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('cui-no-wrap', '').trim();
                                        }

                                        // Add the currency style
                                        if (elmClasses.indexOf('cui-currency') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'currency');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('cui-currency', '').trim();
                                        }

                                        if (elmClasses.indexOf('cui-align-right') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'align-right');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('cui-align-right', '').trim();
                                        }

                                        if (elmClasses.indexOf('cui-align-center') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'align-center');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('cui-align-center', '').trim();
                                        }

                                        if (elmClasses.indexOf('emp-force-uppercase') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'uppercase');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('emp-force-uppercase', '').trim();
                                        }

                                        if (elmClasses.indexOf('emp-key-value-pairs') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'key-value');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('emp-key-value-pairs', '').trim();
                                        }

                                        if (elmClasses.indexOf('emp-negative-number') !== -1) {

                                            // Add the min width style property
                                            styleProperty(col, 'negative-number');

                                            // Remove the class
                                            attributes.className = attributes.className.replace('emp-negative-number', '').trim();
                                        }

                                        // Check to see if the className attribute needs to be removed
                                        if (attributes.className === '') {
                                            delete attributes.className;
                                        }

                                    }

                                    if (attributes.hasOwnProperty('data-sort')) {

                                        // Add data-type if its missing
                                        if (!attributes.hasOwnProperty('data-type')) {
                                            attributes['data-type'] = attributes['data-sort'];
                                        }

                                    }

                                    if (attributes['data-type'] !== 'button' && attributes['data-sort'] !== 'button') {

                                        if (globalSettings.sort && attributes['data-sort']) {

                                            col.sortable = true;
                                        }

                                    }

                                    if (attributes.hasOwnProperty('data-table-column-priority')) {

                                        if (!col.responsive) {
                                            col.responsive = {};
                                        }

                                        col.responsive.priority = parseInt(attributes['data-table-column-priority']);
                                    }

                                    if (attributes.hasOwnProperty('data-table-primary-button')) {

                                        if (!col.responsive) {
                                            col.responsive = {};
                                        }

                                        col.responsive.primaryButton = true;

                                        attributes['data-type'] = "primaryButton";
                                    }

                                    // Responsive Column markers
                                    if (attributes.hasOwnProperty('data-table-responsive-type')) {

                                        if (!col.responsive) {
                                            col.responsive = {};
                                        }

                                        col.responsive.type = attributes['data-table-responsive-type'];
                                    }

                                    // Help
                                    if (attributes.hasOwnProperty('data-help')) {

                                        if(attributes.hasOwnProperty('data-help') != "" && !col.help){

                                            var helpId = attributes['data-help'];
                                            var itagElem = document.getElementById(helpId);
                                            var helpText = "";

                                            if(itagElem && itagElem.childNodes && itagElem.childNodes.length > 0){

                                                for(var j = 0; j < itagElem.childNodes.length; j++){

                                                    var itagChildNode = itagElem.childNodes[j];


                                                    if (itagChildNode.tagName !== "HEADER") {                                                        

                                                        if(itagChildNode.nodeType == Node.TEXT_NODE){
                                                            helpText += itagChildNode.textContent.trim();
                                                        }
                                                        else{
                                                            helpText += itagChildNode.outerHTML;    
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            if(helpText != ""){
                                                col.help = [
                                                    {
                                                        "template": "output",
                                                        "raw": true,
                                                        "text": helpText
                                                    }
                                                ];
                                            }
                                        }
                                    }

                                    col.attributes = attributes;
                                }

                                if (col && col.attributes && col.attributes['data-contents'] && col.attributes['data-contents'] === "rawHTML") {

                                    var innerContents = $col[0].innerHTML;

                                    col.contents = [
                                        {
                                            "template": "raw",
                                            "raw": innerContents
                                        }
                                    ];

                                }
                                else {

                                    // Check to see if this column has children definition
                                    if ($col.children().length > 0) {

                                        var childObj;

                                        // Loop through all children elements
                                        var $children = $col.children();

                                        // Check to see if its a style controlled child (span normally)
                                        if ($children.length === 1 && $children[0].nodeName === 'SPAN') {

                                            if ($children.hasClass('cui-hide-from-screen')) {

                                                col.hideLabel = true;

                                                col.text = $col.text().trim();
                                            }
                                            else if ($children.hasClass('emp-tooltip')) {

                                                col.contents = [];

                                                childObj = parseElement($children);

                                                col.contents.push(ds.getStore(childObj));

                                            }
                                            else {

                                                col.contents = [];

                                                childObj = parseElement($children);

                                                if (childObj) {

                                                    if (ds.hasStore(childObj)) {

                                                        col.contents.push(ds.getStore(childObj));

                                                    }
                                                    else {

                                                        col.contents.push(childObj);
                                                    }
                                                }

                                            }

                                        }
                                        else if ($col.children('br').length === $col.children().length) {

                                            var childrenHTML = $col.html();
                                            var regex = /<br\s*[\/]?>/gi;

                                            col.text = $col.html().replace(/(<br>|\n|\r)/g, '\n');

                                            // Clean out redundant /n
                                            col.text = col.text.replace(/\n\n+/g, '\n');

                                        }
                                        else {

                                            // We meed tp check to see if we0
                                            col.contents = [];

                                            // Loop through all the children content
                                            $children.each(function (i) {

                                                var $childElem = $(this);

                                                var childObj = parseElement($childElem);

                                                if (childObj) {

                                                    if (ds.hasStore(childObj)) {

                                                        col.contents.push(ds.getStore(childObj));

                                                    }
                                                    else {

                                                        col.contents.push(childObj);
                                                    }
                                                }

                                            });

                                            if(col.contents.lencth > 0){
                                                // This is a catch function because of some contents not always setup to return contents.
                                                col.text = $col.text().trim().replace(/\s{2,}/,' ');    
                                            }
                                            
                                        }

                                    }
                                    else {
                                        col.text = $col.text().trim();
                                    }
                                }


                                // Check to see if the column has priority.
                                if ($col.attr('data-table-col-priority')) {

                                    var priority = $col.attr('data-table-col-priority');

                                    if (!isNaN(priority)) {

                                        if (typeof priority === 'string') {
                                            priority = parseInt(priority);
                                        }

                                        col.responsive.priority = priority;
                                    }
                                }

                                row.columns.push(col);

                            }

                        });

                        if (data.selectable) {

                            var $firstCol = $cols.eq(0);

                            var $firstColChildren = $firstCol.children();

                            row.selection = {};

                            if ($firstColChildren.length) {

                                var $input = $firstColChildren.filter('input');

                                if ($input.length) {
                                    if ($input.is(':checked')) {
                                        row.selection.checked = true;
                                    }
                                    else {
                                        row.selection.checked = false;
                                    }
                                }
                                else {

                                    var $span = $firstColChildren.filter('span');

                                    if ($span.length) {
                                        row.selection.checked = true;
                                        row.selection.readOnly = true;
                                    }

                                }

                            }
                            else {

                                row.selection.empty = true;
                            }
                        }

                        rows.push(row);

                    });

                    return rows;
                }

                // New root object
                var data = {
                    template: 'table'
                };

                if ($table.attr('data-limit')) {

                    data.limit = parseInt($table.attr('data-limit'));
                }

                var settings = {};

                var paging = $table.attr('data-paging');
                var pagingExtend = $table.attr('data-paging-extend');
                var pagingText = $table.attr('data-paging-text');
                var pagingCursor = $table.attr('data-pagingCursor');

                if (paging === "true") {

                    // Add the basic paging example
                    data.paging = {
                        "previous": {
                            "type": "button",
                            "template": "field",
                            "input": {
                                "attributes": {
                                    "type": "button",
                                    "name": "E_Previous",
                                    "id": "E_Previous",
                                    "title": "Previous"
                                },
                                "text": "Previous"
                            }
                        },
                        "next": {
                            "type": "button",
                            "template": "field",
                            "input": {
                                "attributes": {
                                    "type": "button",
                                    "name": "E_Next",
                                    "id": "E_Next",
                                    "title": "Next"
                                },
                                "text": "Next"
                            }
                        }
                    };

                    if (pagingExtend) {

                        data.paging.first = {
                            "type": "button",
                            "template": "field",
                            "input": {
                                "attributes": {
                                    "type": "button",
                                    "name": "E_FIRST",
                                    "id": "E_FIRST",
                                    "title": "First"
                                },
                                "text": "First"
                            }
                        };

                        data.paging.last = {
                            "type": "button",
                            "template": "field",
                            "input": {
                                "attributes": {
                                    "type": "button",
                                    "name": "E_LAST",
                                    "id": "E_LAST",
                                    "title": "Last"
                                },
                                "text": "Last"
                            }
                        };

                        if (pagingText) {
                            data.pagingText = pagingText;
                        }

                    }

                    if(pagingCursor){

                        data.pagingCursor = {};

                        data.pagingCursor.limit = [];

                        var pagingCursorLimit = pagingCursor.split(',');

                        data.pagingCursor.currentLimit = pagingCursorLimit[0];

                        for(var l = 0; l < pagingCursorLimit.length; l++){

                            var button = {
                                "type": "button",
                                "template": "field",
                                "input": {
                                    "attributes": {
                                        "type": "button",
                                        "name": "",
                                        "id": "",
                                        "title": ""
                                    },
                                    "text": "All"
                                }
                            };

                            button.input.attributes.name = 'BTN_' + pagingCursorLimit[l];
                            button.input.attributes.id = 'BTN_' + pagingCursorLimit[l];
                            button.input.attributes.title = 'View ' + pagingCursorLimit[l] + ' items';
                            button.input.text =  pagingCursorLimit[l];
                            
                            data.pagingCursor.limit.push(button);
                        }
                    } 

                    settings.paging = true;
                }
                else {

                    settings.paging = false;
                }

                if ($table.attr('data-sticky') === "false") {
                    settings.sticky = false;
                }
                else {
                    settings.sticky = true;
                }

                if ($table.attr('data-filter') === "false") {

                    settings.filter = false;
                }
                else {

                    settings.filter = true;
                }

                if ($table.attr('data-resize') === "false") {

                    settings.resize = false;
                }
                else {

                    settings.resize = true;
                }

                if ($table.attr('data-responsive') === "false") {

                    settings.responsive = false;
                }
                else {

                    settings.responsive = true;
                }

                if ($table.attr('data-responsive-columns') === "false") {

                    settings.responsive = false;
                }
                else {

                    settings.responsive = true;
                }

                if ($table.attr('data-sort') === "false") {

                    settings.sort = false;
                }
                else {

                    settings.sort = true;
                }

                if ($table.attr('data-buttonMenu') === "false") {
                    settings.buttonMenu = false;
                }
                else {
                    settings.buttonMenu = true;
                }

                data.enabledButtonMenu = settings.buttonMenu;

                // Check to see if the table is an order table
                if ($table[0].classList.contains('emp-order-table')) {
                    data.type = "order";
                }

                var attributes = _priv.pullAttributes($table, ['style']);

                data.attributes = attributes;

                var skipIndex = [];

                var $caption = $table.find('caption');
                var $thead = $table.find('thead');
                var $tbody = $table.find('tbody');
                var $tfoot = $table.find('tfoot');

                var $firstColumn = $tbody.find('tr > :nth-child(1)');

                var $selectInputs = $firstColumn.find('input[type="checkbox"], input[type="radio"]');

                // Title Check
                if ($caption.length === 1) {
                    data.title = $caption.text();
                }

                // Selection Inputs
                if ($firstColumn.hasClass('table-control-col')) {

                    if ($selectInputs.length >= 1) {

                        data.selectable = true;

                        // Add index to skip
                        skipIndex.push(0);

                        var $checkboxes = $table.find('input[type="checkbox"]');

                        if ($checkboxes.length >= 1) {

                            data.selectionType = 'multiple';

                            if ($thead.find('tr').find('input[type="checkbox"]').length) {
                                data.selectAll = true;
                            }

                        }
                        else {
                            data.selectionType = 'single';
                        }
                    }
                    else {
                        data.selectable = false;
                    }
                }
                else {
                    data.selectable = false;
                }

                var $rows;

                // Work the table header
                if ($thead.length === 1) {

                    $rows = $thead.find('tr');

                    $headerRow = $($rows[0]);

                    $clientControlCols = $headerRow.find('th.clientControls');

                    //console.log($clientControlCols);

                    for (var cc = 0, ccLen = $clientControlCols.length; cc < ccLen; cc++) {
                        $clientControlCol = $($clientControlCols[cc]);

                        //console.log($clientControlCol.index());

                        skipIndex.push($clientControlCol.index());
                    }

                    data.head = {
                        rows: []
                    };

                    data.head.rows = rowsDefintion($thead, $rows, skipIndex, settings);
                }

                // Work the table body
                if ($tbody.length === 1) {

                    $rows = $tbody.find('tr');

                    data.body = {
                        rows: []
                    };

                    if ($tbody.hasClass('emp-empty-table')) {

                        delete data.body;

                    }
                    else {

                        data.body.rows = rowsDefintion($tbody, $rows, skipIndex, settings);

                    }
                }

                var $preSelectedRows = $tbody.find('tr.emp-highlight-row');

                if ($preSelectedRows.length === 1) {
                    data.preselected = $preSelectedRows.index();
                }

                // Work the table footer
                if ($tfoot.length === 1) {

                    $rows = $tfoot.find('tr');

                    data.footer = {
                        rows: []
                    };

                    data.footer.rows = rowsDefintion($tfoot, $rows, skipIndex, settings);
                }

                var buttonCols = [];
                var iconCols = [];
                var c;
                var i;
                var r;
                var len;
                var clen;
                var ilen;
                var columns;
                var colContents;

                // Lets go back through the body and look for special things,
                if (!$tbody.hasClass('emp-empty-table')) {

                    for (r = 0, len = data.body.rows.length; r < len; r++) {

                        columns = data.body.rows[r].columns;

                        for (c = 0, clen = columns.length; c < clen; c++) {

                            if (columns[c].hasOwnProperty('contents')) {

                                for (i = 0, ilen = columns[c].contents.length; i < ilen; i++) {

                                    colContents = columns[c].contents[i];

                                    if (colContents && colContents.hasOwnProperty('template')) {

                                        switch (colContents.template) {

                                            case 'field':

                                                if (colContents.type === 'button') {

                                                    // check to see if the column is already listed
                                                    if (buttonCols.indexOf(c) === -1) {
                                                        buttonCols.push(c);
                                                    }

                                                }

                                                break;

                                            case 'icon':

                                                if (iconCols.indexOf(c) === -1) {
                                                    iconCols.push(c);
                                                }

                                                break;
                                        }
                                    }
                                    else {

                                    }

                                }

                            }

                        }

                    }
                }

                // Update header definitions based on found results
                for (c = 0, len = data.head.rows[0].columns.length; c < len; c++) {

                    var column = data.head.rows[0].columns[c];

                    if (buttonCols.indexOf(c) !== -1) {

                        if (!column.hasOwnProperty('attributes')) {
                            column.attributes = {
                                'data-type': 'button'
                            };
                        }
                        else {
                            column.attributes['data-type'] = 'button';
                        }
                    }

                    if (iconCols.indexOf(c) !== -1) {

                        if (!column.hasOwnProperty('attributes')) {
                            column.attributes = {
                                'data-type': 'icon'
                            };
                        }
                        else {
                            column.attributes['data-type'] = 'icon';
                        }
                    }

                }

                // Now time to check for table controls.
                var $tableControls = $table.parents('.emp-table').eq(0).find('.emp-table-controls');

                if ($tableControls.length) {

                    $tableControls.each(function() {

                        var $controlContainer = $(this).children('.emp-header-controls, .emp-footer-controls');

                        if ($controlContainer.length && $controlContainer.length === 1) {

                            var contents = [];
                            var $controlChildren = $controlContainer.children();

                            // Loop through all the children content
                            $controlChildren.each(function (i) {

                                var $childElem = $(this);

                                var childObj = parseElement($childElem);

                                if (childObj) {

                                    if (ds.hasStore(childObj)) {

                                        contents.push(ds.getStore(childObj));

                                    }
                                    else {

                                        contents.push(childObj);
                                    }
                                }

                            });

                            if (contents.length > 0) {

                                if ($controlContainer.hasClass('emp-header-controls')) {

                                    data.headerControls = {};

                                    data.headerControls.contents = contents;
                                }
                                else if ($controlContainer.hasClass('emp-footer-controls')) {

                                    data.footerControls = {};

                                    data.footerControls.contents = contents;
                                }

                            }

                        }


                    });
                }

                //Table legend check
                var $tableLegend = $table.parents('.emp-table').eq(0).find('.emp-table-legend');

                if($tableLegend.length){

                    var legendObj = {
                        contents: []
                    };

                    var legendsContainer = $tableLegend.find('ul')[0];

                    for(var lC = 0; lC < legendsContainer.children.length; lC++){

                        var liElem = legendsContainer.children[lC];

                        if(liElem.children.length){

                            var legend = {
                                "template": "icon",
                                "attributes": {
                                    "title": ""
                                },
                                "icon": "",
                                "text": "" 
                            };

                            var iconElem = liElem.querySelector('i');

                            //icon title
                            var legendIconTitle = iconElem.getAttribute('title');

                            //icon
                            var legendIcon = iconElem.getAttribute('class');
                                legendIcon = legendIcon.substr(legendIcon.indexOf('icon-') + 5);

                            //legend text
                            var legendText = liElem.querySelector('span').innerHTML.trim();

                            legend.attributes.title = legendIconTitle;
                            legend.icon = legendIcon;
                            legend.text = legendText;

                            legendObj.contents.push(legend);

                        //No icon
                        }else{

                            var noIconLegend = {};

                            noIconLegend.text = liElem.textContent.trim();

                            legendObj.contents.push(noIconLegend);
                        }
                    }

                    data.legend = legendObj;
                }

                data.htmlToDataStore = true;

                return data;
            }
        },
        'emp-table': {
            alias: 'table',
            target: function _tableTarget($oldTarget) {

                var $newTableTarget = $oldTarget.find('table');

                if ($newTableTarget.length === 1) {
                    return $newTableTarget;
                }
                else {
                    return false;
                }
            }
        },
        'emp-tabs': {
            root: '.emp-tabs',
            rule: function _sectionRule($tabs) {

                var data = {
                    "template": "tabs",
                    "tabs": []
                };

                var $tabContainer = $tabs.find('.emp-tab-container');
                var $anchors = $tabContainer.find('a');

                $anchors.each(function() {

                    var tabJSON = {
                        "container": []
                    };

                    var $anchor = $(this);
                    var $container = $anchor.next();

                    tabJSON.title = $anchor.text().trim();

                    var containerAttributes = _priv.pullAttributes($container, ['style']) || {};

                    if (containerAttributes.hasOwnProperty('className')) {

                        var elmClasses = containerAttributes.className;

                        // check for icon classes
                        if (elmClasses.indexOf('emp-tab-contents') !== -1) {

                            elmClasses = elmClasses.replace('emp-tab-contents', '');
                        }

                        // Check to see if the className attribute needs to be removed
                        if (elmClasses === '') {
                            delete containerAttributes.className;
                        }

                    }

                    tabJSON.attributes = containerAttributes;

                    if ($anchor.hasClass('emp-selected')) {
                       tabJSON.selected = true;
                    }

                    var $children = $container.children();

                    if ($children.length) {

                        $children.each(function() {

                            var $child = $(this);

                            var childObj = parseElement($child);

                            if (childObj) {

                                if (ds.hasStore(childObj)) {

                                    tabJSON.container.push(ds.getStore(childObj));

                                }
                                else {

                                    tabJSON.container.push(childObj);
                                }
                            }

                        });

                    }

                    data.tabs.push(tabJSON);
                });

                return data;
            }
        },
        'rating': {
            rule: function _ratingRule($rating) {

                var data = {
                    "type": "rating",
                    "template": "composite",
                    "parts": {},
                    "properties": {}
                };

                var label = {
                    "type": "label",
                    "template": "field",
                    "label": {
                        "text": "",
                        "visibility": "hidden",
                        "hasLayout": false
                    }
                };

                var hidden =  {
                    "type": "hidden",
                    "template": "field",
                    "input": {
                        "attributes": {
                            "id": "",
                            "value": ""
                        }
                    }
                };

                var $container = $rating.find('.emp-rating-stars-container');

                if ($container.hasClass('emp-rating-readonly')) {

                    data.properties.readOnly = true;
                }

                $container = $container.parents('.emp-field').eq(0);

                // Look for a lable
                var $label = $container.find('label');

                if ($label.length === 0) {

                    // Look for a span
                    $label = $container.children('span').eq(0);
                }

                // Update the label
                label.label.text = $label.text();

                $value = $container.find(".emp-rating-value");

                if ($value.length === 1) {

                    $value = $value.text().replace('Rating:', '').trim();
                }
                else {
                    $value = 0;
                }

                hidden.input.attributes.value = $value;

                // Update the data element.
                data.parts.label = label;
                data.parts.hidden = hidden;

                return data;

            }
        },
        'button': {

            rule: function _button($button) {

                var data = {
                    type: 'button',
                    template: 'field',
                    input: {}
                };

                // Start by checking buttons for attributes
                var attributes = _priv.pullAttributes($button, ['style']);

                if (attributes.hasOwnProperty('className')) {

                    var elmClasses = attributes.className;

                    // check for icon classes
                    if (elmClasses.indexOf('emp-icon') !== -1) {

                        var iconTest = elmClasses.match(/\bemp\-icon\-\S+\b/g);

                        if (Array.isArray(iconTest)) {
                            data.input.icon = iconTest[0].replace('emp-icon-', '');

                            // Remove the icon class
                            attributes.className = elmClasses.replace(iconTest, '').trim();
                        }

                    }

                    if (elmClasses.indexOf('emp-external-actions-menu') !== -1) {

                        data.input.style = "action";

                        attributes.className = elmClasses.replace('emp-external-actions-menu', '').trim();
                    }

                    // Check to see if the className attribute needs to be removed
                    if (attributes.className === '') {
                        delete attributes.className;
                    }

                }

                if (attributes && Object.keys(attributes).length >= 1) {
                    data.input.attributes = attributes;
                }

                if ($button.text() !== '') {
                    data.input.text = $button.text().trim();
                }

                if ($button.children('.emp-popup').length) {
                    data.input.popup = true;
                }

                return data;

            }
        },
        'i': {

            rule: function _icon($icon) {

                var data = {
                    template: 'icon'
                };

                // Start by checking buttons for attributes
                var attributes = _priv.pullAttributes($icon, ['style']);

                if (attributes.hasOwnProperty('className')) {

                    var elmClasses = attributes.className;

                    // check for icon classes
                    if (elmClasses.indexOf('emp-icon') !== -1) {

                        var iconTest = elmClasses.match(/\bemp\-icon\-\S+\b/g);

                        for (var i = 0, len = iconTest.length; i < len; i++) {

                            var iconClass = iconTest[i].replace('emp-icon-', '').trim();

                            data.icon = iconClass;

                            attributes.className = elmClasses.replace(iconTest[i], '').trim();
                        }

                    }

                    // Check to see if the className attribute needs to be removed
                    if (attributes.className === '') {
                        delete attributes.className;
                    }

                }

                if (Object.keys(attributes).length >= 1) {
                    data.attributes = attributes;
                }

                if ($icon.text() !== '') {
                    data.text = $icon.text().trim();
                }

                return data;

            }
        },
        'emp-field': {

            rule: function _empField($field) {

                var data = {
                    template: 'field'
                };

                var $label = $field.find('.cui-label');
                var $input = $field.find('.cui-data');

                // Check for a label
                if ($label.length === 1) {

                    $label = $label.children('label');

                    // Create the storage space
                    data.label = {};

                    var labelAttributes = _priv.pullAttributes($label, []);

                    if (labelAttributes.hasOwnProperty('className')) {

                        var elmClasses = labelAttributes.className;

                        // check for icon classes
                        if (elmClasses.indexOf('emp-icon') !== -1) {

                            if (elmClasses.indexOf('cui-hide-from-screen') !== -1) {

                                data.label.visibility = "hidden";
                                data.lable.hasLayout = false;

                                labelAttributes.replace('cui-hide-from-screen', '');
                            }

                        }

                        // Check to see if the className attribute needs to be removed
                        if (labelAttributes.className === '') {
                            delete labelAttributes.className;
                        }

                    }

                    if (labelAttributes) {

                        data.label.attributes = labelAttributes;

                    }

                    if ($label.text() !== '') {
                        data.label.text = $label.text().trim();
                    }


                }

                // Check for the input
                if ($input.length === 1) {

                    // Check for all input types
                    $input = $input.children('input, textarea, select');

                    if ($input.length === 1) {

                        // input
                        data.input = {};

                        // Get the attributes
                        var inputAttributes = _priv.pullAttributes($input, []);

                        // Get attributes
                        data.input.attributes = inputAttributes;

                        switch ($input[0].nodeName.toLowerCase()) {

                            case 'input':

                                data.type = $input.attr('type');

                                if (data.type === 'checkbox' || data.type === 'radio') {

                                    if ($input.is(':checked')) {
                                        data.input.attributes.checked = true;
                                    }

                                }

                                break;

                            case 'select':

                                data.type = 'select';

                                //hook for eCORE template
                                var blankOptionAttr = $input.attr('data-blank-option');

                                if(blankOptionAttr ==='false'){

                                    data.input.noBlankOption = true;
                                }

                                // process options
                                var $options = $input.children('option');

                                if ($options.length > 0) {

                                    // Create the object space
                                    data.input.options = {};

                                    var selected = [];

                                    // Loop through all the options
                                    $options.each(function (i) {

                                        var $option = $(this);

                                        if ($option.val() !== '') {


                                            // Get the value first
                                            var optVal = $option.val();

                                            if (optVal === undefined) {

                                                optVal = i;
                                            }

                                            // Get all the attributes
                                            var optAttr = _priv.pullAttributes($option, []);

                                            // In case no attributes are defined
                                            if (optAttr === false) {

                                                optAttr = {};

                                                if (optVal !== "") {
                                                    optAttr.value = optVal;
                                                }

                                            }



                                            optAttr.text = $option.text();

                                            if ($option.is(':selected')) {
                                                selected.push(optVal);
                                            }

                                            // Create the option
                                            data.input.options[optVal] = optAttr;

                                        }

                                    });

                                    if (selected.length > 1) {

                                        data.input.value = selected.join();
                                    }
                                    else if (selected.length === 1) {

                                        data.input.value = selected[0];
                                    }

                                }
                                else {
                                    //console.log("Unable to find options for select box");
                                }

                                break;

                            case 'textarea':

                                data.type = 'textarea';

                                break;
                        }

                    }
                    else {

                        // Multiple inputs

                    }

                }

                return data;
            }
        },
        'a': {

            rule: function ($link) {

                var data = {
                    template: 'link'
                };

                var attributes = _priv.pullAttributes($link, ['style']);

                // Merge attriutes if they exist
                if (attributes) {

                    data.attributes = attributes;
                }

                if ($link.text() !== '') {
                    data.text = $link.text();
                }

                if ($link.children('.emp-popup').length) {

                    data.popup = true;
                }

                return data;

            }
        },
        'input': {
            check: function () {

                console.warn('It is recommend to look for inputs using the class .emp-field');

                return true;
            }
        },
        'br': {

            skip: true
        },
        'ul': {
            rule: function ($list) {

                var data = {
                    type: 'unordered',
                    template: 'lists'
                };

                var attributes = _priv.pullAttributes($list, ['style']);

                // Merge attriutes if they exist
                if (attributes) {

                    data.attributes = attributes;
                }

                if ($list.children('li').length >= 1) {

                    data.options = {};

                    var $listItems = $list.children('li');

                    $listItems.each(function(i) {

                        $item = $(this);

                        if ($item.children('strong')) {

                            data.style="key-value";

                            var key = $item.children('strong').text();
                            var value = $item.text().replace(key, '').trim();

                            data.options[key] = { "text": value };

                        }
                        else {

                            data.options.push({'text': $item.text().trim()});
                        }

                    });
                }

                return data;
            }
        },
        'emp-indicator': {

            rule: function ($notfier) {

                var data = {
                    template: 'notifier'
                };

                var attributes = _priv.pullAttributes($notfier, ['style']);

                if (attributes) {
                    data.attributes = attributes;
                }

                if ($notfier[0].tagName === "SPAN") {

                    data.type = "static";
                }
                else {

                    data.type = "interactive";
                }

                data.text = $notfier.text();

                return data;

            }
        },
        'emp-indicator-1': {

            alias: 'emp-indicator',
            target: function _empIndicator1 ($oldTarget) {

                // We are safe to return the current instance
                return $oldTarget;
            }
        },
        'emp-indicator-2': {

            alias: 'emp-indicator',
            target: function _empIndicator2 ($oldTarget) {

                // We are safe to return the current instance
                return $oldTarget;
            }
        },
        'emp-indicator-3': {

            alias: 'emp-indicator',
            target: function _empIndicator3 ($oldTarget) {

                // We are safe to return the current instance
                return $oldTarget;
            }
        },
        'span': {

            rule: function ($span) {

                var data = {
                    template: 'span'
                };

                var attributes = _priv.pullAttributes($span, ['style']);

                data.attributes = attributes;

                data.text = $span.text();

                return data;

            }
        },
        'emp-search-composite': {

            rule: function _emp_search_composite($field) {

                var data = {
                    type: "search",
                    template: 'composite',
                    parts: {
                        label: {},
                        text: {},
                        button: {}
                    }
                };

                // Build the label definition
                var label = {
                    template: 'field',
                    label: {}
                };

                var $label = $field.find('label');

                var labelAttributes = _priv.pullAttributes($label, []);

                if (labelAttributes) {

                    label.label.attributes = labelAttributes;

                    if (label.label.attributes.hasOwnProperty('className') && label.label.attributes.className.indexOf('cui-hide-from-screen') !== -1) {

                        label.label.visibility = "hidden";
                        label.label.hasLayout = false;

                        label.label.attributes.className = label.label.attributes.className.replace('cui-hide-from-screen', '').trim();

                        if (label.label.attributes.className === "") {
                            delete label.label.attributes.className;
                        }

                    }

                }

                if ($label.text() !== '') {
                   label.label.text = $label.text().trim();
                }

                // Build the text definition
                var text = {
                    template: 'field',
                    input: {}
                };

                var $text = $field.find('.cui-data .emp-field').eq(0).children('input, select, textarea');

                // Get the attributes
                var inputAttributes = _priv.pullAttributes($text, []);

                // Get attributes
                text.input.attributes = inputAttributes;

                switch ($text[0].nodeName.toLowerCase()) {

                    case 'input':

                        text.type = $text.attr('type');

                        if (text.type === undefined) {

                            text.type = "text";
                        }

                        if (text.type === 'checkbox' || text.type === 'radio') {

                            if ($text.is(':checked')) {
                                text.text.attributes.checked = true;
                            }

                        }

                        break;

                    case 'select':

                        text.type = 'select';

                        // process options
                        var $options = $text.children('option');

                        if ($options.length > 0) {

                            // Create the object space
                            text.input.options = [];

                            var selected = [];

                            // Loop through all the options
                            $options.each(function (i) {

                                var $option = $(this);

                                var optionText = $option.text();

                                var optionVal = ($option.val()) ? $option.val() : i;

                                if ($option.val() !== '') {

                                    var optAttr = _priv.pullAttributes($option, []);
                                    optAttr.text = $option.text();

                                    if ($option.is(':selected')) {
                                        selected.push(optionVal);
                                    }
                                }

                                var newOptionObj = {
                                    text: optionText,
                                    value: optionVal
                                };

                                if (optionText.length > 1) {

                                    text.input.options.push(newOptionObj);
                                }

                            });

                            if (selected.length > 1) {

                                text.input.value = selected.join();
                            }
                            else if (selected.length === 1) {

                                text.input.value = selected[0];
                            }


                        }

                        break;

                    case 'textarea':

                        text.type = 'textarea';

                        break;

                }

                var button = {
                    type: 'button',
                    template: 'field',
                    input: {}
                };

                var $button = $field.find('.cui-data .emp-field').eq(1).children('button');

                // Start by checking buttons for attributes
                var buttonAttributes = _priv.pullAttributes($button, ['style']);

                if (buttonAttributes.hasOwnProperty('className')) {

                    var elmClasses = buttonAttributes.className;

                    // check for icon classes
                    if (elmClasses.indexOf('emp-icon') !== -1) {

                        var iconTest = elmClasses.match(/\bemp\-icon\-\S+\b/g);

                        if (Array.isArray(iconTest)) {
                            button.input.icon = iconTest[0].replace('emp-icon-', '');

                            // Remove the icon class
                            buttonAttributes.className = elmClasses.replace(iconTest, '').trim();
                        }

                    }

                    // Check to see if the className attribute needs to be removed
                    if (buttonAttributes.className === '') {
                        delete buttonAttributes.className;
                    }

                }

                if (Object.keys(buttonAttributes).length >= 1) {
                    button.input.attributes = buttonAttributes;
                }

                if ($button.text() !== '') {
                    button.input.text = $button.text().trim();
                }

                // Merge
                data.parts.label = label;
                data.parts.text = text;
                data.parts.button = button;

                return data;

            }
        },
        'emp-score-container': {

            rule: function ($span) {

                var data = {
                    "template": "score",
                    "score": $span.children('.emp-score-number').text(),
                    "percentage": $span.children('.emp-score-bar').attr('style').replace('width:', '').replace('%;', '').trim(),
                    "base": $span.attr('title').split('of')[2].trim()
                };

                if ($span.hasClass('emp-score-bar-green')) {

                    data.color = "green";
                }
                else if ($span.hasClass('emp-score-bar-red')) {

                    data.color = "red";
                }
                else {

                    data.color = "yellow";
                }

                return data;
            }
        },
        'fieldset': {
            rule: function _tableRule($fieldset) {

                var data = {
                    "template": "inputGroup",
                    "legend": "",
                    "options": []
                };

                var $legend = $fieldset.find('legend');

                data.legend = $legend.text();

                var $inputContainer = $fieldset.find('.emp-input-collection .emp-field, .emp-input-collection button');

                if ($inputContainer.length) {

                    data.type="input";

                    $inputContainer.each(function() {

                        var $input = $(this);

                        var childObj = parseElement($input);

                        if (childObj) {

                            if (ds.hasStore(childObj)) {

                                data.options.push(ds.getStore(childObj));

                            }
                            else {

                                data.options.push(childObj);
                            }
                        }

                    });

                }
                else {

                    data.type = "checkbox";

                    var $selectionContainer = $fieldset.find('.cui-selection-group input');

                    if ($selectionContainer.length) {

                        $selectionContainer.each(function () {

                            var $input = $(this);
                            var $label = $input.next();

                            var inputData = {
                                "template": "field",
                                "input": {
                                },
                                "label": {
                                }
                            };

                            var inputAttributes = _priv.pullAttributes($input, []);

                            inputData.input.attributes = _priv.pullAttributes($input, []);

                            inputData.type = inputData.input.attributes.type;

                            inputData.label.attributes = _priv.pullAttributes($label, []);

                            inputData.label.text = $label.text();

                            data.options.push(inputData);

                        });

                    }
                }


                return data;
            }
        },
        'cui-row': {

            rule: function _tableRule($fieldset) {

                var data = {
                    "type": "row",
                    "template": "grid",
                    "contents": []
                };

                var $children = $fieldset.children();

                if ($children.length) {

                    $children.each(function() {

                        var $child = $(this);

                        var childObj = parseElement($child);

                        if (childObj) {

                            if (ds.hasStore(childObj)) {

                                data.contents.push(ds.getStore(childObj));

                            }
                            else {

                                data.contents.push(childObj);
                            }
                        }

                    });

                }

                return data;

            }
        },
        'emp-col-full': {

            rule: function _tableRule($column) {

                var data = {
                  "type": "column",
                  "template": "grid",
                  "contents": []
                };

                var attributes = _priv.pullAttributes($column, ['style']);

                if (attributes.hasOwnProperty('className')) {

                    var elmClasses = attributes.className;

                    // check for icon classes
                    if (elmClasses.indexOf('emp-icon') !== -1) {

                        if (elmClasses.indexOf('cui-align-right') !== -1) {

                            data.style = "align-right";

                            elmClasses.replace('cui-align-right', '').trim();
                        }

                    }

                    // Check to see if the className attribute needs to be removed
                    if (elmClasses.className === '') {
                        delete elmClasses.className;
                    }

                }

                var $children = $column.children();

                if ($children.length) {

                    $children.each(function() {

                        var $child = $(this);

                        var childObj = parseElement($child);

                        if (childObj) {

                            if (ds.hasStore(childObj)) {

                                data.contents.push(ds.getStore(childObj));

                            }
                            else {

                                data.contents.push(childObj);
                            }
                        }

                    });

                }

                return data;
            }
        },
        'emp-col-half': {

            rule: function _tableRule($fieldset) {
                var data = {
                  "type": "column",
                  "template": "grid",
                  "width": "half",
                  "contents": []
                };

                if ($fieldset.hasClass('cui-align-right')) {
                    data.style = "align-right";
                }

                var $children = $fieldset.children();

                if ($children.length) {

                    $children.each(function() {

                        var $child = $(this);

                        var childObj = parseElement($child);

                        if (childObj) {

                            if (ds.hasStore(childObj)) {

                                data.contents.push(ds.getStore(childObj));

                            }
                            else {

                                data.contents.push(childObj);
                            }
                        }

                    });

                }

                return data;
            }
        },
        'p': {
            root: 'p',
            rule: function($p) {

                var data = {
                    "template": "output",
                    "text": ""
                };

                data.text = $p.text();

                return data;
            }
        },
        'strong': {
            root: 'strong',
            rule: function($strong) {

                var data = {
                    "tag": "strong",
                    "template": "universal",
                    "text": false
                };

                data.text = $strong.text();

                return data;
            }
        },
        'section': {
            rule: function($section) {

                var data = {
                    "type": "section",
                    "contents": []
                };

                var $children = $section.children();

                if ($children.length) {

                    $children.each(function() {

                        var $child = $(this);

                        var childObj = parseElement($child);

                        if (childObj) {

                            if (ds.hasStore(childObj)) {

                                data.contents.push(ds.getStore(childObj));

                            }
                            else {

                                data.contents.push(childObj);
                            }
                        }

                    });

                }

                return data;
            }
        },
        'header': {
            rule: function($header) {

                var data = false;

                if ($header.hasClass('emp-form-lines-header')) {

                    data = {
                        "type": "formLineExtendedHeader",
                        "template": "composite",
                        "properties": {},
                        "parts": {}
                    };

                    // Get Title
                    data.properties.title = $header.find('.emp-section-title h3 span').text().trim();

                    // Get Tax Due Amount
                    data.properties.taxDue = $header.find('.form-lines-tax-due .emp-data').text().trim();

                    var $extDiv = $header.find('.form-lines-extension');

                    var $notifiersDiv = $extDiv.find('.form-lines-notifiers');
                    var $headerControls = $extDiv.find('.form-lines-buttons');

                    if ($notifiersDiv.children().length > 0) {

                        var notifiersList = {
                            "template": "notifierGroup",
                            "notifiers": []
                        };

                        var $notifiers = $notifiersDiv.find('li span');

                        if ($notifiers.length) {

                            $notifiers.each(function() {

                                var notifierData = {
                                    "type": "static",
                                    "template": "notifier",
                                    "attributes": {}
                                };

                                var $notifier = $(this);

                                notifierData.text = $notifier.text();
                                notifierData.attributes.alt = $notifier.attr('alt');

                                if (notifierData.text) {
                                    notifiersList.notifiers.push(notifierData);
                                }
                            });
                        }

                        if (notifiersList.notifiers.length) {

                            data.parts.notifiers = notifiersList;
                        }
                    }

                    if ($headerControls.children().length > 0) {

                        var $buttons = $headerControls.children('button');

                        if ($buttons.length) {

                            $buttons.each(function() {

                                var $button = $(this);

                                var buttonObj = {
                                    "type": "button",
                                    "template": "field",
                                    "input": {
                                        "attributes": false,
                                    }
                                };

                                buttonObj.input.attributes = _priv.pullAttributes($button, []);

                                buttonObj.input.text = $button.text();

                                var partName = $button.text().toLowerCase().trim().replace('"', '');

                                data.parts[partName] = buttonObj;
                            });

                        }

                    }

                }
                else {

                    data = {
                        "type": "header",
                        "template": "group",
                        "title": ""
                    };

                    data.title = $header.find('h3').text().trim();
                }

                return data;
            }
        },
        // Deprecated Setup but still supported for older mockups JAH 5/3/2018
        'form-lines-sections': {
            rule: function($flSections) {

                var data = {
                    "type": "formLineSection",
                    "template": "composite",
                    "properties": {},
                    "parts": {}
                };

                if ($flSections.hasClass('form-lines-force-adjust')) {
                    data.properties.forceAdjust = true;
                }

                if ($flSections.hasClass('form-lines-force-reason')) {
                    data.properties.forceAdjust = true;
                }

                var $flHeader = $flSections.children('.form-lines-flex-row.form-line-header');

                // Get the section labels
                var lineSectionLabel = $flHeader.find(".form-lines-line-number").text().trim();
                var lineSectionLabelDescription = $flHeader.find(".form-lines-label").text().trim();
                var lineSectionTypeTitle = $flHeader.find(".form-lines-section-values-label").text().trim();
                var lineSectionValueTitle = $flHeader.find(".form-lines-section-values-value").text().trim();
                var lineSectionNotifierTitle = $flHeader.find(".form-lines-section-values-notifier").text().trim();
                var lineSectionAdjustmentTitle = $flHeader.find(".form-lines-section-values-adjustment-line").text().trim();
                var lineSectionReasonTitle = $flHeader.find(".form-lines-section-values-reason-line").text().trim();

                // The Lines (first column)
                if (lineSectionLabel.length && lineSectionLabel !== "Line") {
                    data.properties.lineTitle = lineSectionLabel;
                }

                // Line Description (second column)
                if (lineSectionLabelDescription.length) {
                    data.properties.lineDescriptionTitle = lineSectionLabelDescription;
                }

                // Line Type Tile (third column)
                if (lineSectionTypeTitle.length) {
                    data.properties.lineValueTypeTitle = lineSectionTypeTitle;
                }

                // Line Value Title (forth column)
                if (lineSectionValueTitle.length) {
                    data.properties.lineValueTitle = lineSectionValueTitle;
                }

                // Line Notifier Title (fifth column)
                if (lineSectionNotifierTitle.length) {
                    data.properties.lineValueNotifierTitle = lineSectionNotifierTitle;
                }

                // Line Adjustment Title (sixth column)
                if (lineSectionAdjustmentTitle.length) {
                    data.properties.lineAdjustmentTitle = lineSectionAdjustmentTitle;
                }

                // Line Reason Title (seventh column)
                if (lineSectionReasonTitle.length) {
                    data.properties.lineAdjustmentReasonTitle = lineSectionReasonTitle;
                }

                $flLines = $flSections.children('.form-lines-flex-row').not('.form-line-header');

                // Check for lines
                if ($flLines.length) {

                    data.parts.lines = [];

                    // Loop through each
                    $flLines.each(function(line) {

                        var $line = $($flLines[line]);

                        var childObj = false;

                        var lineData = {
                            "type": "formLineRow",
                            "template": "composite",
                            "properties": {},
                            "parts": {}
                        };

                        // Get current line number
                        var $lineNumberDescription = $line.children('.form-lines-section-label');

                        var lineNumber = $lineNumberDescription.find('.form-lines-line-number .form-line-table-cell span').text();
                        var lineDescription = $lineNumberDescription.find('.form-lines-label .form-line-table-cell').children('span').not('.form-line-mobile-only-line-number').text();

                        if (lineNumber) {
                            lineData.properties.lineNumber = lineNumber;
                        }

                        if (lineDescription) {
                            lineData.properties.lineLabel = lineDescription;
                        }

                        var $lineValueRows = $line.children('.form-lines-section-values').children('.form-lines-section-values-row');

                        // Line row values
                        if ($lineValueRows.length) {
                            lineData.properties.lineValues = [];

                            $lineValueRows.each(function(valueRow) {

                                $valueRow = $($lineValueRows[valueRow]);

                                var valueObj = {};

                                var valueLabel = $valueRow.find('.form-lines-section-values-label .form-line-table-cell span').text();
                                var valueValue = $valueRow.find('.form-lines-section-values-value .form-line-table-cell span').text();
                                var $valueNotifier = $valueRow.find('.form-lines-section-values-notifier').children();

                                if (valueLabel.length) {
                                    valueObj.valueLabel = valueLabel;
                                }

                                if (valueValue.length) {
                                    valueObj.valueVal = valueValue;
                                }

                                if ($valueNotifier.length) {

                                    var notifierText = $valueNotifier.text();
                                    var notifierTooltip = $valueNotifier.attr('alt');

                                    valueObj.valueNotifierText = notifierText;
                                    valueObj.valueNotifierTooltip = notifierTooltip;
                                    valueObj.valueNotifierColor =  "red";
                                }

                                lineData.properties.lineValues.push({ "properties": valueObj });

                            });

                        }

                        // Adjustment column
                        var $lineAdjustmentColumn = $line.children('.form-lines-section-values-adjustment-line');

                        var lineAdjustmentColumnLabel = $lineAdjustmentColumn.children('.form-line-adjustment-label').find('.form-line-table-cell span').text();
                        var $lineAdjustmentColumnControl = $lineAdjustmentColumn.find('.form-line-adjustment-value .emp-field');

                        // check to see if line adjustment label text
                        if (lineAdjustmentColumnLabel || $lineAdjustmentColumnControl) {

                            if (lineAdjustmentColumnLabel) {
                                lineData.properties.adjustLabel = lineAdjustmentColumnLabel;
                            }

                            if ($lineAdjustmentColumnControl.length === 1) {

                                childObj = parseElement($lineAdjustmentColumnControl) || false;

                                if (childObj) {

                                    if (ds.hasStore(childObj)) {

                                        lineData.parts.adjustments = ds.getStore(childObj);
                                    }
                                    else {

                                        lineData.parts.adjustments = childObj;
                                    }
                                }

                            }

                        }

                        // Reason Column
                        var $lineReasonColumn = $line.children('.form-lines-section-values-reason-line');

                        var lineReasonColumnLabel = $lineReasonColumn.children('.form-line-adjustment-label').find('.form-line-table-cell span').text();
                        var $lineReasonColumnControl = $lineReasonColumn.find('.form-line-adjustment-value .emp-field');

                        // check to see if line adjustment label text
                        if (lineReasonColumnLabel || $lineReasonColumnControl) {

                            if (lineAdjustmentColumnLabel) {
                                lineData.properties.reasonLabel = lineAdjustmentColumnLabel;
                            }

                            if ($lineReasonColumnControl.length === 1) {

                                childObj = parseElement($lineReasonColumnControl) || false;

                                if (childObj) {

                                    if (ds.hasStore(childObj)) {

                                        lineData.parts.reason = ds.getStore(childObj);
                                    }
                                    else {

                                        lineData.parts.reason = childObj;
                                    }
                                }

                            }

                        }

                        data.parts.lines.push(lineData);

                    });

                }

                return data;
            }
        },
        'form-line-sections-2': {
            rule: function ($flSections) {

                var data = {
                    "type": "formLineSection2",
                    "template": "composite",
                    "properties": {},
                    "parts": {}
                };

                var $headerRow = $flSections.find('.line-row.header-row');

                // Header Text
                $lineHNumber = $headerRow.find('.line-number span');

                if ($lineHNumber.length === 1) {
                    data.properties.lineNumberTitle = $lineHNumber.text();
                }

                $lineHDescription = $headerRow.find('.line-description span');

                if ($lineHDescription.length === 1) {
                    data.properties.lineDescriptionTitle = $lineHDescription.text();
                }

                $lineHValueType = $headerRow.find('.line-values-row .value-type span');

                if ($lineHValueType.length === 1) {
                    data.properties.lineValueTypeTitle = $lineHValueType.text();
                }

                $lineHValueValue = $headerRow.find('.line-values-row .value-value span');

                if ($lineHValueValue.length === 1) {
                    data.properties.lineValueTitle = $lineHValueValue.text();
                }

                $lineHValueNotifier = $headerRow.find('.line-values-row .value-notifier span');

                if ($lineHValueNotifier.length === 1) {
                    data.properties.lineValueNotifierTitle = $lineHValueNotifier.text();
                }

                $lineHAdjustments = $headerRow.find('.line-adjustment span');

                if ($lineHAdjustments.length === 1) {
                    data.properties.lineAdjustmentTitle = $lineHAdjustments.text();
                }

                $lineHReasons = $headerRow.find('.line-reason span');

                if ($lineHReasons.length === 1) {
                    data.properties.lineAdjustmentReasonTitle = $lineHReasons.text();
                }

                $lines = $flSections.find('.line-row:not(.header-row)');

                if ($lines.length) {

                    data.parts.lines = [];

                    for (var i = 0, len = $lines.length; i < len; i++) {

                        var lineData = {
                            "type": "formLineRow",
                            "template": "composite",
                            "properties": {},
                            "parts": {}
                        };

                        var $line = $($lines[i]);

                        // Line Number and Description
                        var $lineNumber = $line.find('.line-number span');
                        var $lineDescription = $line.find('.line-description span');

                        lineData.properties.lineNumber = ($lineNumber.length) ? $lineNumber.text() : "";
                        lineData.properties.lineLabel = ($lineDescription.length) ? $lineDescription.text() : "";

                        // Value Rows
                        var $lineValueRows = $line.find('.line-values-container .line-values-row');

                        if ($lineValueRows.length) {

                            lineData.parts.lineValues = [];

                            // Loop through each value row
                            for (var r = 0, rLen = $lineValueRows.length; r < rLen; r++) {

                                var lineValueData = {};

                                var $valueRow = $($lineValueRows[r]);
                                var $valueType = $valueRow.find('.value-type span');
                                var $valueValue = $valueRow.find('.value-value span');
                                var $valueNotifier = $valueRow.find('.value-notifier span');

                                lineValueData.valueLabel = ($valueType.length) ? $valueType.text() : "";
                                lineValueData.valueVal = ($valueValue.length) ? $valueValue.text() : "";

                                if ($valueNotifier.length && $valueNotifier.text().length) {
                                    lineValueData.valueNotifierText = ($valueNotifier.text().length) ? $valueNotifier.text() : "";
                                    lineValueData.valueNotifierTooltip = ($valueNotifier.attr('title')) ? $valueNotifier.attr('title') : "";

                                    var colorList = $valueNotifier.attr('class');

                                    if (colorList.length) {
                                        colorList = colorList.split(' ');
                                    }

                                    for (var c = 0, cLen = colorList.length; c < cLen; c++) {

                                        if (colorList[c].length && colorList[c].indexOf('emp-notifier-color') !== -1) {

                                            var color = colorList[c].replace('emp-notifier-color-', '');

                                            lineValueData.valueNotifierColor = color;

                                        }

                                    }
                                }

                                lineData.parts.lineValues.push(lineValueData);
                            }

                        }

                        // Adjustments column
                        var $lineAdjustments = $line.find('.line-adjustment .value-container');

                        // Check for control
                        var $lineAdjChild = $lineAdjustments.children().eq(0);

                        if ($lineAdjChild.length) {

                            if ($lineAdjChild.hasClass('emp-field')) {

                                var childObj = parseElement($lineAdjChild[0]);

                                if (childObj) {

                                    if (ds.hasStore(childObj)) {

                                        lineData.parts.adjustments = ds.getStore(childObj);
                                    }
                                    else {

                                        lineData.parts.adjustments = childObj;
                                    }
                                }
                            }
                            else if ($lineAdjChild[0].nodeName === "SPAN") {

                                var staticText = $lineAdjChild.text();

                                var staticObj = {
                                    "type": "text",
                                    "template": "field",
                                    "input": {
                                        "attributes": {
                                            "value": staticText
                                        },
                                        "readOnly": true
                                    },
                                    "label": {
                                        "text": "",
                                        "visibility": "hidden",
                                        "hasLayout": false
                                    }
                                };

                                lineData.parts.adjustments = staticObj;
                            }
                        }

                        // Adjustments column
                        var $lineReason = $line.find('.line-reason .value-container');

                        // Check for control
                        var $lineResChild = $lineReason.children().eq(0);

                        if ($lineResChild.length) {

                            if ($lineResChild.hasClass('emp-field')) {

                                var childObjRes = parseElement($lineResChild[0]);

                                if (childObjRes) {

                                    if (ds.hasStore(childObjRes)) {

                                        lineData.parts.reason = ds.getStore(childObjRes);
                                    }
                                    else {

                                        lineData.parts.reason = childObjRes;
                                    }
                                }
                            }
                            else if ($lineResChild[0].nodeName === "SPAN") {

                                var staticTextRes = $lineResChild.text();

                                var staticObjRes = {
                                    "type": "text",
                                    "template": "field",
                                    "input": {
                                        "attributes": {
                                            "value": staticTextRes
                                        },
                                        "readOnly": true
                                    },
                                    "label": {
                                        "text": "",
                                        "visibility": "hidden",
                                        "hasLayout": false
                                    }
                                };

                                lineData.parts.reason = staticObjRes;
                            }
                        }

                        data.parts.lines.push(lineData);

                    }

                }

                return data;
            }
        },
        'emp-button-row': {
            rule: function _tableRule($fieldset) {

                var data = {
                    "type": "row",
                    "template": "buttonGroup",
                    "contents": []
                };

                var $children = $fieldset.children();

                if ($children.length) {

                    $children.each(function() {

                        var $child = $(this);

                        var childObj = parseElement($child);

                        if (childObj) {

                            if (ds.hasStore(childObj)) {

                                var tempChildObj = ds.getStore(childObj);

                                tempChildObj.template = "buttonGroup";

                                data.contents.push(tempChildObj);

                            }
                            else {

                                data.contents.push(childObj);
                            }
                        }

                    });

                }

                return data;

            }
        },
        'nav': {
            rule: function _nav($nav) {

                var data = {};

                $menuContents = $nav.find('.emp-nav-contents');

                data.items = false;

                var processList = function _process_list($list, level) {

                    var $lis = $list.children('li');

                    var listItems = [];

                    $lis.each(function() {

                        var $listItem = $(this);

                        var $controlContents = $listItem.children('button, a, header, span');
                        var $subLevel = $listItem.children('ul');

                        // Only take the first matching control
                        var $control = $controlContents.eq(0);

                        var item = {
                            text: $control.text()
                        };

                        if ($control[0].nodeName === "A") {
                            item.href = $control.attr('href');
                        }
                        else if ($control[0].nodeName === "SPAN") {
                            // DO nothing
                        }
                        else if ($control[0].nodeName === "BUTTON") {

                            if ($subLevel.length) {
                                item.items = processList($subLevel, level++);
                            }
                        }
                        else if ($control[0].nodeName === "HEADER") {
                            item.isHeader = true;

                            if ($subLevel.length) {
                                item.items = processList($subLevel, level++);
                            }
                        }

                        listItems.push(item);
                    });

                    return listItems;

                };

                $menuContents.children('ul').each(function() {

                    var items = processList($(this), 1);

                    data.items = items;

                });


                return data;
            }
        }
    };

    var _priv = {

        pullAttributes: function _pullAttributes($elem, ignore) {

            var attr = false;

            if ($elem.length === 0) {
                return [];
            }

            $.each($elem[0].attributes, function (i, attrib) {

                if (ignore.indexOf(attrib.name) === -1) {

                    // Turn attr into an object if we find something to save.
                    if (attr === false) {
                        attr = {};
                    }

                    switch (attrib.name) {

                        case 'class':

                            attr.className = attrib.value;

                            break;

                        case 'required':
                        case 'selected':
                        case 'multiple':
                        case 'checked':
                            // Do nothing.
                            break;

                        default:
                            attr[attrib.name] = attrib.value;
                            break;

                    }
                }

            });

            return attr;
        },

        lookupDefinition: function _lookupDefinition($target, htmlRoot, classList) {

            var def = false;
            var skip = false;

            if (classList) {

                for (var i = 0, len = classList.length; i < len; i++) {

                    var classLookup = classList[i];

                    if (_definitions.hasOwnProperty(classLookup)) {

                        // Check for a special log response
                        if (_definitions[classLookup].hasOwnProperty('check')) {

                            skip = _definitions[classLookup].check();

                        }

                        if (!skip) {

                            def = classLookup;
                            break;
                        }

                    }

                }

                if (!def && _definitions.hasOwnProperty(htmlRoot)) {

                    // Check for a special log response
                    if (_definitions[htmlRoot].hasOwnProperty('check')) {

                        skip = _definitions[htmlRoot].check();

                    }

                    if (!skip) {

                        def = htmlRoot;
                    }

                }

            }
            else if (_definitions.hasOwnProperty(htmlRoot)) {

                // Check for a special log response
                if (_definitions[htmlRoot].hasOwnProperty('check')) {

                    skip = _definitions[htmlRoot].check();

                }

                if (!skip) {

                    def = htmlRoot;
                }

            }

            if (def) {

                if (_definitions[def].hasOwnProperty('skip') && _definitions[def].skip) {
                    return {};
                }

                // Check to see if this is an alias
                if (_definitions[def].hasOwnProperty('alias')) {

                    // Update the target
                    $target = _definitions[def].target($target);

                    // Update the definition name
                    def = _definitions[def].alias;

                }

                if ($target instanceof jQuery) {

                   return _definitions[def].rule($target);

                }
                else {

                    console.error('[htmlToDataStore] No reliable target could be provided for html conversion rule: ' + def);

                    return false;
                }

            }
            else if (skip) {

                console.error('[htmlToDataStore] No definition could be found for passed reference: ', $target);

                return {};
            }
            else {

                console.error('[htmlToDataStore] No definition could be found for passed reference: ', $target);

                return false;
            }
        }
    };

    ////////////////////
    // Public methods //
    ////////////////////

    /**
     * Parses the entire page and add it to the data store
     */
    var parsePage = function _parsePage (elems) {

        var $elems, htmlRoot, classList;

        function findTarget(elems) {
            var $elemTest;

            if (elems instanceof jQuery) {

                $elems = elems;

                if ($elems.length === 0) {

                    $elems = false;
                }

            }
            else if (typeof elems === 'string') {

                // Lookup based on ID
                var $idTest = $('#' + elems);

                if ($idTest.length > 0) {

                    $elems = $idTest;

                }
                else {

                    // Lookup based on class
                    var $classTest = $('.' + elems);

                    if ($classTest.length > 0) {

                        $elems = $classTest;

                    }
                    else {

                        // We cant find this by class, or id, so this might just be an element...
                        $elemTest = $(elems);

                        if ($elemTest.length > 0) {

                            $elems = $elemTest;

                        }
                        else {

                            //console.error('[htmlToDataStore.parsePage] Unknown element definition provided: ' + kind(elems));

                        }

                    }

                }

            }
            else if (kind(elems) === 'element') {

                $elemTest = $(elems);

                if ($elemTest.length > 0) {

                    $elems = $elemTest;

                }
                else {

                    console.error('[htmlToDataStore.parsePage] Unknown element definition provided: ', elems);

                }

            }
            else {

                //console.error('[htmlToDataStore.parsePage] Unknown element definition provided: ' + kind(elems));

            }

            if ($elems !== undefined && $elems.length >= 1) {

                // Process all of these elements and create the data store for them
                $elems.each(function (i) {

                    var $elem = $(this);

                    if ($elem.attr('data-store-id') !== undefined || $elem.attr('data-store-id') !== null) {

                        htmlRoot = $elem[0].nodeName.toLowerCase();
                        classList = $elem.attr('class');

                        if (typeof classList === 'string') {

                            classList = classList.split((/\s/g));
                        }
                        else {

                            classList = false;
                        }

                        var dataObj = _priv.lookupDefinition($elem, htmlRoot, classList);

                        var storeKey = ds.createStore(dataObj);

                        // Add the dataStore reference to the table
                        $elem.attr('data-store-id', storeKey);

                    }

                });
            }

        }

        if (!Array.isArray(elems)) {

            elems = [elems];
        }

        // Loop through all defined lookup elements
        for (var i = 0, len = elems.length; i < len; i++) {

            findTarget(elems[i]);

        }

        return true;
    };

    /**
     * Parse a single element and add it to the data store
     * @param   {Mixed}   elem  Element to parse. May be a DOM element, ID string, or jQuery object
     * @return  {Object}        Data store for that element
     */
    var parseElement = function _parseElement (elem) {

        var $elem;

        if (elem instanceof jQuery) {

            $elem = elem;

            if ($elem.length > 1) {

                console.error('[htmlToDataStore] jQuery referenced more than a single element to convert');
            }
            else if ($elem.length === 0) {

                console.error('[htmlToDataStore] jQuery reference contained no selected elements.');
            }

        }
        else if (typeof elem === 'string') {

            // Lookup based on ID
            var $idTest = $('#' + elem);

            if ($idTest.length === 1) {

                $elem = $idTest;
            }
            else  {

                // Lookup based on class
                var $classTest = $('.' + elem);

                if ($classTest.length === 1) {

                    $elem = $classTest;
                }
                else {

                    var $elemTest = $(elem);

                    if ($elemTest.length === 1) {

                        $elem = $elemTest;
                    }
                    else {

                        console.error('[htmlToDataStore] Could not find reliable element references based on string: "' + elem + '"');
                    }

                }

            }

        }
        else if (kind(elem) === 'element') {

            $elem = $(elem);

            if ($elem.length > 1) {

                console.error('[htmlToDataStore] Element reference returned more than single conversion');
            }
            else if ($elem.length === 0) {

                console.error('[htmlToDataStore] Could not fine refence to any "' + elem + '" element');
            }

        }

        // Get element key parts.
        var htmlRoot = $elem[0].nodeName.toLowerCase();

        var classList = $elem.attr('class');

        if (typeof classList === 'string') {

            classList = classList.split((/\s/g));
        }
        else {

            classList = false;
        }

        // Create the data object.
        var dataObj = _priv.lookupDefinition($elem, htmlRoot, classList);

        var storeKey = ds.createStore(dataObj);

        // Add the dataStore reference to the table
        $elem.attr('data-store-id', storeKey);

        return storeKey;
    };

    /////////////////////////////
    // Expose public functions //
    /////////////////////////////

    return {
        parsePage: parsePage,
        parseElement: parseElement
    };
});
