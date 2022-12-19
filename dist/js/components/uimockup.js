/*! Empire 2
 *  @description  eCore
 *  @version      0.1.0.REL20221118
 *  @copyright    2022 New York State Office of Information Technology Services
 */

define(['jquery', 'cui', 'htmlToDataStore', 'dataStore', 'render'], function ($, cui, htmlToDataStore, ds, render) {

    // Public methods
    var printData = {
        tables: {},
        headerID: false,
        entityLookup: false
    };

    var body = document.getElementById('body-wrapper');

    // Special arggregate function for creating dataStores.
    var createElementDataStore = function _createElementDataStore (targets, safe, cb) {
        var results;

        if (typeof safe === 'function') {
            cb = safe;
            safe = false;
        }

        if (Array.isArray(targets)) {
            var contents = [];

            for (var i = 0, len = targets.length; i < len; i++) {
                var target = targets[i];
                var targetObject = htmlToDataStore.parseElement(target);

                contents.push(targetObject);
            }

            results = contents;
        }
        else {
            results = htmlToDataStore.parseElement(targets, safe);
        }

        // Call the callback if its defined
        if (typeof cb === 'function') {
            cb(results);
        }
        else {
            return results;
        }
    };

    var fixChangedSpecs = function _fixChangedSpecs () {
        var $tables = $('table');

        if ($tables.length !== 0) {
            $headers = $tables.find('th[data-sort]:not(.emp-sortable)');

            if ($headers.length !== 0) {
                $headers.addClass('emp-sortable');
            }
        }
    };

    var createTableColumnList = function _createTableColumnList (id) {

        var tableRef = emp.reference.tables[id];

        if (tableRef) {

            printData.tables[id] = {
                title: false,
                columns: [],
                buttons: [],
                notifiers: false
            };

            var buttonList = [];
            var notifierList = {};
            var actionList = [];

            if (emp.reference.tables && emp.reference.tables[id] && emp.reference.tables[id].dataStore.title) {

                printData.tables[id].title = emp.reference.tables[id].dataStore.title;
            }
            else {

                $section = emp.reference.tables[id].$self.parents('section').eq(0);

                headerText = $section.find('h3').text();

                printData.tables[id].title = headerText;
            }

            var notAllowedType = ['button', 'buttonMenu'];

            for (var c = 0, cLen = tableRef.dataStore.head.rows[0].columns.length; c < cLen; c++) {

                if (tableRef.dataStore.head.rows[0].columns[c].attributes && tableRef.dataStore.head.rows[0].columns[c].attributes['data-type'] && notAllowedType.indexOf(tableRef.dataStore.head.rows[0].columns[c].attributes['data-type']) === -1) {

                    printData.tables[id].columns.push(tableRef.dataStore.head.rows[0].columns[c].text);
                }

            }

            if (tableRef.dataStore.body && tableRef.dataStore.body.rows) {

                bodyRow:
                for (var r = 0, rLen = tableRef.dataStore.body.rows.length; r < rLen; r++) {

                    if (tableRef.dataStore.body.rows[r].columns.length) {

                        rowColumns:
                        for (var rc = 0, rcLen = tableRef.dataStore.body.rows[r].columns.length; rc < rcLen; rc++) {

                            if (tableRef.dataStore.body.rows[r].columns[rc].contents && tableRef.dataStore.body.rows[r].columns[rc].contents.length) {

                                rowColumnContents:
                                for (var rcc = 0, rccLen = tableRef.dataStore.body.rows[r].columns[rc].contents.length; rcc < rccLen; rcc++) {

                                    if (tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].template === "field" &&
                                        tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].type === "button") {

                                        var buttonText = tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].input.text;

                                        if (buttonList.indexOf(buttonText) === -1 && buttonText !== "Button Menu") {
                                            buttonList.push(buttonText);
                                        }
                                        else if(buttonText === "Button Menu"){

                                            var buttonMenu = tableRef.dataStore.body.rows[r].columns[rc].contents[rcc];

                                            if(buttonMenu.options && buttonMenu.options.length > 0){

                                                for(var ai = 0; ai < buttonMenu.options.length; ai++){
                                                    if(actionList.indexOf(buttonMenu.options[ai].text) === -1){
                                                        actionList.push(buttonMenu.options[ai].text);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else if (tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].template === "notifier") {

                                        if (!notifierList[tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].text]) {

                                            notifierList[tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].text] = {
                                                text: tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].text,
                                                title: tableRef.dataStore.body.rows[r].columns[rc].contents[rcc].attributes.title
                                            };

                                        }
                                    }
                                    else {

                                        //console.log(tableRef.dataStore.body.rows[r].columns[rc].contents[rcc]);
                                    }

                                }
                            }
                        }
                    }
                }

                printData.tables[id].buttons = buttonList.concat();
                printData.tables[id].notifiers = notifierList;
                printData.tables[id].actions = actionList.concat();
            }
        }

    };

    var createHeaderIDList = function _createHeaderIDList () {

        var $headerIDDropdown = $('#HEADER_ID_TYPE');

        if ($headerIDDropdown.length === 1 && $headerIDDropdown[0].nodeName === "SELECT") {

            var optionList = [];

            var $options = $headerIDDropdown.children('option');

            $options.each(function() {

                optionList.push($(this)[0].innerText);
            });

            if (optionList.length) {
                printData.headerID = optionList;
            }

        }

    };

    var createEntityLookupList = function _createEntityLookupList() {

        var sections = document.querySelectorAll('section');

        var entityObj = {};

        if (sections.length) {

            for (var s = 0, sLen = sections.length; s < sLen; s++) {

                var section = sections[s];

                var sectionTitle = section.querySelectorAll('h2, h3, h4, h5, h6');

                var entityLookup = section.querySelectorAll('.emp-composite.emp-entity-lookup');

                if (entityLookup.length) {

                    for (var el = 0, elLen = entityLookup.length; el < elLen; el++) {

                        var dropdownOpt = entityLookup[el].querySelector('.emp-entity-lookup-toggle select');
                        var dropdownContainers = entityLookup[el].querySelectorAll('.emp-entity-containers');

                        if (dropdownOpt && dropdownContainers) {



                            var sectionTitleText = (sectionTitle[0].innerText) ? sectionTitle[0].innerText : sectionTitle[0].textContent;

                            var optionList = {};

                            var options = dropdownOpt.querySelectorAll('option');

                            for (var o = 0, oLen = options.length; o < oLen; o++) {

                                //var optionText = options[o].innerText;
                                var optionText = (options[o].innerText) ? options[o].innerText : options[o].textContent;
                                var optionValue = options[o].value;

                                var selector = '.emp-entity-container[data-entity-key="' + optionValue + '"]';

                                // find the option container
                                var optionContainer = entityLookup[el].querySelector('.emp-entity-containers .emp-entity-container[data-entity-key="' + optionValue + '"]');
                                var optionContainerInputs = optionContainer.querySelectorAll('.emp-field');

                                var fields = [];

                                for (var oci = 0, ociLen = optionContainerInputs.length; oci < ociLen; oci++) {

                                    var fieldLabel = optionContainerInputs[oci].querySelector('label, span.emp-label');
                                    var fieldInput = optionContainerInputs[oci].querySelector('input, select, textarea, span.emp-data');


                                    if (fieldLabel !== null && fieldInput.tagName !== null && fieldInput.tagName !== "BUTTON") {

                                        fields.push({
                                            "label": (fieldLabel.innerText) ? fieldLabel.innerText : fieldLabel.textContent,
                                            "readOnly": (fieldInput.tagName === "SPAN") ? true : false
                                        });
                                    }


                                }

                                optionList[optionText] = {
                                    selectValue: optionValue,
                                    fields: fields
                                };


                            }

                            if (Object.keys(optionList).length) {

                                entityObj[sectionTitleText] = optionList;
                            }

                        }

                    }
                }

            }

            if (Object.keys(entityObj).length) {
                printData.entityLookup = entityObj;
            }

        }

    };

    var createPageMetaData = function _createPageMetaData () {

        setTimeout(function() {

            if (printData.headerID) {

                var headerSection = document.createElement('div');
                var headerSectionClass = document.createAttribute('class');
                headerSectionClass.value = 'emp-print-only';

                headerSection.setAttributeNode(headerSectionClass);

                // Create root header
                var searchboxHeader = document.createElement('header');
                var searchboxHeaderClass = document.createAttribute('class');

                searchboxHeaderClass.value = "emp-ui-mockup-table-print-header";

                searchboxHeader.setAttributeNode(searchboxHeaderClass);

                var searchboxHeaderText = document.createTextNode("Searchbox Meta Data:");

                searchboxHeader.appendChild(searchboxHeaderText);

                headerSection.appendChild(searchboxHeader);

                var options = false;

                for (var o = 0, oLen = printData.headerID.length; o < oLen; o++) {

                    if (options) {
                        options += ", " + printData.headerID[o];
                    }
                    else {
                        options = printData.headerID[o];
                    }
                }

                var searchBoxOptionsResults = document.createElement('p');
                var searchBoxOptionsResultsClass = document.createAttribute('class');
                searchBoxOptionsResultsClass.value = 'emp-ui-mockup-table-print-containers-info';

                searchBoxOptionsResults.setAttributeNode(searchBoxOptionsResultsClass);

                var searchBoxOptionsResultsText = document.createTextNode("Options: " + options);

                searchBoxOptionsResults.appendChild(searchBoxOptionsResultsText);

                headerSection.appendChild(searchBoxOptionsResults);

                body.appendChild(headerSection);

            }

            if (Object.keys(printData.tables).length) {

                var section = document.createElement('div');
                var sectionClass = document.createAttribute('class');
                sectionClass.value = 'emp-print-only';

                section.setAttributeNode(sectionClass);

                var tableObject = Object.keys(printData.tables);

                for (var t = 0, tLen = tableObject.length; t < tLen; t++) {

                    // get table info;
                    var tableInfo = printData.tables[tableObject[t]];

                    // Create the table container
                    var tableContainer = document.createElement('div');
                    var tableContainerClass = document.createAttribute('class');

                    tableContainerClass.value = "emp-ui-mockup-table-print-containers";

                    tableContainer.setAttributeNode(tableContainerClass);

                    // Create root header
                    var tableHeader = document.createElement('header');
                    var tableHeaderClass = document.createAttribute('class');

                    tableHeaderClass.value = "emp-ui-mockup-table-print-header";

                    tableHeader.setAttributeNode(tableHeaderClass);

                    var tableHeaderText = document.createTextNode(tableInfo.title + " (" + tableInfo.columns.length + " Columns) " + "Meta Data:");

                    tableHeader.appendChild(tableHeaderText);

                    tableContainer.appendChild(tableHeader);

                    // ===== Table Columns ======

                    var columns = false;

                    for (var tc = 0, tcLen = tableInfo.columns.length; tc < tcLen; tc++) {
                        if (columns) {
                            columns += ", " + tableInfo.columns[tc];
                        }
                        else {
                            columns = tableInfo.columns[tc];
                        }
                    }

                    var tableColumnHeaderResults = document.createElement('p');
                    var tableColumnHeaderResultsClass = document.createAttribute('class');
                    tableColumnHeaderResultsClass.value = 'emp-ui-mockup-table-print-containers-info';

                    tableColumnHeaderResults.setAttributeNode(tableColumnHeaderResultsClass);

                    var tableColumnTextResultsLabel = document.createElement('strong');
                    tableColumnTextResultsLabel.textContent = "Columns: ";
                    var tableColumnTextResults = document.createTextNode(columns);

                    tableColumnHeaderResults.appendChild(tableColumnTextResultsLabel);
                    tableColumnHeaderResults.appendChild(tableColumnTextResults);

                    // Append table column header results to table container
                    tableContainer.appendChild(tableColumnHeaderResults);

                    // ===== Table Buttons ======

                    var buttons = false;

                    if (tableInfo.buttons.length) {

                        for (var tb = 0, tbLen = tableInfo.buttons.length; tb < tbLen; tb++) {
                            if (buttons) {
                                buttons += ", " + tableInfo.buttons[tb];
                            }
                            else {
                                buttons = tableInfo.buttons[tb];
                            }
                        }
                    }
                    else {
                        buttons = "No buttons" ;
                    }

                    var tableButtonHeaderResults = document.createElement('p');
                    var tableButtonHeaderResultsClass = document.createAttribute('class');
                    tableButtonHeaderResultsClass.value = 'emp-ui-mockup-table-print-containers-info';

                    tableButtonHeaderResults.setAttributeNode(tableButtonHeaderResultsClass);

                    var tableButtonTextResultsLabel = document.createElement('strong');
                    tableButtonTextResultsLabel.textContent = "Buttons: ";

                    var tableButtonTextResults = document.createTextNode(buttons);

                    tableButtonHeaderResults.appendChild(tableButtonTextResultsLabel);
                    tableButtonHeaderResults.appendChild(tableButtonTextResults);

                    // Append table column header results to table container
                    tableContainer.appendChild(tableButtonHeaderResults);


                     // ===== Table Actions ======

                    var actions = false;

                    if (tableInfo.actions.length) {

                        for (var ta = 0, taLen = tableInfo.actions.length; ta < taLen; ta++) {
                            if (actions) {
                                actions += ", " + tableInfo.actions[ta];
                            }
                            else {
                                actions = tableInfo.actions[ta];
                            }
                        }
                    }
                    else {
                        actions = "No actions" ;
                    }

                    var tableActionHeaderResults = document.createElement('p');
                    var tableActionHeaderResultsClass = document.createAttribute('class');
                    tableActionHeaderResultsClass.value = 'emp-ui-mockup-table-print-containers-info';

                    tableActionHeaderResults.setAttributeNode(tableActionHeaderResultsClass);

                    var tableActionTextResultsLabel = document.createElement('strong');
                    tableActionTextResultsLabel.textContent = "Actions: ";

                    var tableActionTextResults = document.createTextNode(actions);

                    tableActionHeaderResults.appendChild(tableActionTextResultsLabel);
                    tableActionHeaderResults.appendChild(tableActionTextResults);

                    // Append table column header results to table container
                    tableContainer.appendChild(tableActionHeaderResults);

                    // ===== Table Notifiers ======

                    var notifiers = false;

                    if (Object.keys(tableInfo.notifiers).length) {

                        for (var note in tableInfo.notifiers) {

                            if (notifiers) {

                                notifiers += ", " + note + " - " + tableInfo.notifiers[note].title;
                            }
                            else {
                                notifiers = note + " - " + tableInfo.notifiers[note].title;
                            }

                        }

                    }

                    var tableNotifierHeaderResults = document.createElement('p');
                    var tableNotifierHeaderResultsClass = document.createAttribute('class');
                    tableNotifierHeaderResultsClass.value = 'emp-ui-mockup-table-print-containers-info';

                    tableNotifierHeaderResults.setAttributeNode(tableNotifierHeaderResultsClass);

                    var tableNotifierTextResultsLabel = document.createElement('strong');
                    tableNotifierTextResultsLabel.textContent = "Notifiers: ";

                    var tableNotifierTextResults = document.createTextNode(notifiers);

                    tableNotifierHeaderResults.appendChild(tableNotifierTextResultsLabel);
                    tableNotifierHeaderResults.appendChild(tableNotifierTextResults);

                    // Append table column header results to table container
                    tableContainer.appendChild(tableNotifierHeaderResults);

                    section.appendChild(tableContainer);
                }

                // Append to page

                body.appendChild(section);

            }

            if (printData.entityLookup) {

                var headerSectionEntity = document.createElement('div');
                var headerSectionEntityClass = document.createAttribute('class');
                headerSectionEntityClass.value = 'emp-print-only';

                headerSectionEntity.setAttributeNode(headerSectionEntityClass);

                for (var el in printData.entityLookup) {

                    var entityLookup = printData.entityLookup[el];

                    var entityLookupContainer = document.createElement('div');
                    var entityLookupContainerClass = document.createAttribute('class');

                    entityLookupContainerClass.value = "emp-ui-mockup-entity-lookup-print-containers";

                    entityLookupContainer.setAttributeNode(entityLookupContainerClass);

                    // Create root header
                    var entityLookupHeader = document.createElement('header');
                    var entityLookupHeaderClass = document.createAttribute('class');

                    entityLookupHeaderClass.value = "emp-ui-mockup-entity-lookup-print-header";

                    entityLookupHeader.setAttributeNode(entityLookupHeaderClass);

                    var entityLookupHeaderText = document.createTextNode("Entity Lookup - " + el + " Meta Data:");

                    entityLookupHeader.appendChild(entityLookupHeaderText);

                    entityLookupContainer.appendChild(entityLookupHeader);

                    for (var elOption in entityLookup) {

                        var entityLookupOptionContainer = document.createElement('div');
                        var entityLookupOptionContainerClass = document.createAttribute('class');
                        entityLookupOptionContainer.value = "emp-ui-mockup-entity-lookup-sub-containers";

                        var entityLookupOptionContainerLabel = document.createElement('p');
                        var entityLookupOptionContainerLabelClass = document.createAttribute('class');
                        entityLookupOptionContainerLabelClass.value = "no-margin-padding";
                        entityLookupOptionContainerLabel.setAttributeNode(entityLookupOptionContainerLabelClass);
                        var entityLookupOptionContainerLabelText = document.createTextNode(elOption);

                        entityLookupOptionContainerLabel.appendChild(entityLookupOptionContainerLabelText);

                        entityLookupOptionContainer.appendChild(entityLookupOptionContainerLabel);

                        var fields = entityLookup[elOption].fields;

                        for (var f = 0, fLen = fields.length; f < fLen; f++) {

                            var entityLookupOptionContainerInput = document.createElement('p');
                            var entityLookupOptionContainerInputClass = document.createAttribute('class');

                            if (f === fLen -1) {

                                entityLookupOptionContainerInputClass.value = "indent-left";
                            }
                            else {
                                entityLookupOptionContainerInputClass.value = "indent-left no-padding-bottom";
                            }


                            entityLookupOptionContainerInput.setAttributeNode(entityLookupOptionContainerInputClass);

                            var inputLabel = fields[f].label.replace(':', '');

                            if (fields[f].readOnly) {
                                inputLabel += " - Read Only";
                            }

                            var entityLookupOptionContainerInputText = document.createTextNode(inputLabel);

                            entityLookupOptionContainerInput.appendChild(entityLookupOptionContainerInputText);

                            entityLookupOptionContainer.appendChild(entityLookupOptionContainerInput);
                        }

                        entityLookupContainer.appendChild(entityLookupOptionContainer);
                    }


                    headerSectionEntity.appendChild(entityLookupContainer);
                }


                body.appendChild(headerSectionEntity);
            }

        }, 2000);

    };

    var createPageDataStore = function _createPageDataStore (types, cb) {
        // Stub out fwData globals with usable placeholder data

        if (!window.fwData) {
            window.fwData = {};
            window.fwData.context = {
                screen: {},
                urls: {
                    errorReport: {}
                }
            };
            window.fwData.preferences = {
                global: {
                    data: {}
                },
                tabset: {
                    data: {}
                }
            };
        }

        // Menu
        if (!window.fwData.menus) {
            window.fwData.menus = {};
            window.fwData.menus.global = {};
        }

        if (!window.fwData.menus.global.display) {
            window.fwData.menus.global.display = {
                className: 'emp',
            };
        }


        if (!window.fwData.menus.global.items) {

            var htmlElm = document.querySelector('html');

            if (htmlElm.classList.contains('external-app')) {

                // Check for html version
                var $menu = $('nav#main');

                if ($menu.length) {

                    var menuDS = htmlToDataStore.parseElement($menu);

                    var dsMenuStore = ds.getStore(menuDS);

                    window.fwData.menus.global.items = dsMenuStore.items;

                    $menu.remove();

                }
                else {

                    window.fwData.menus.global.items = [
                        {
                            "text": "Application Collection",
                            "isHeader": true,
                            "items": [
                                {
                                    "text": "Application Link",
                                    "href": "#"
                                },
                                {
                                    "text": "Application Link",
                                    "href": "#"
                                },
                                {
                                    "text": "Application Collection",
                                    "items": [
                                        {
                                            "text": "Application Link",
                                        "href": "#"
                                        },
                                        {
                                            "text": "Application Link",
                                            "href": "#"
                                        }
                                    ]
                                },
                                {
                                    "text": "Application Link",
                                    "href": "#"
                                }
                            ]
                        },
                        {
                            "text": "Application Collection",
                            "isHeader": true,
                            "items": [
                                {
                                    "text": "Application Link",
                                    "href": "#"
                                },
                                {
                                    "text": "Application Link",
                                    "href": "#"
                                },
                                {
                                    "text": "Application Collection",
                                    "items": [
                                        {
                                            "text": "Application Link",
                                        "href": "#"
                                        },
                                        {
                                            "text": "Application Link",
                                            "href": "#"
                                        }
                                    ]
                                },
                                {
                                    "text": "Application Link",
                                    "href": "#"
                                }
                            ]
                        }
                    ];
                }

            }
            else {

                window.fwData.menus.global.items = [
                    {label: 'Client Information',items: [{label: 'Inquire On Client',url:'#', bookmarkable: true, resourceId:'5099ce92'},{label: 'Maintain Client', items: [{label: 'Item 1', items: [{label: 'Item 1',id: 'Item1',url:'#', bookmarkable: true, resourceId:'c81b200a'},{label: 'Item 2',id: 'Item2',url:'#', bookmarkable: true, resourceId:'a8d7b4b9'}]},{label: 'Item 2', items: [{label: 'Item 2.1',id: 'Item21',url:'#', bookmarkable: true, resourceId:'71861028'},{label: 'Item 2.2', items: [{label: 'Item 2.2.1',id: 'Item221',url:'#', bookmarkable: true, resourceId:'b11d6c69'}]},{label: 'Item 2.3',id: 'item23',url:'#', bookmarkable: true, resourceId:'e9834a29'}]},{label: 'Item 3',id: 'item3',url:'#', bookmarkable: true, resourceId:'39ea4c7d'}]}, {label: 'Search for Client',id: 'SearchforClient',tooltip: 'Looking for a client? Try here.',url: 'ht bookmarkable: true, tp://tax.ny.gov',urlTarget: '_blank'}, {label: 'Event Management',id: 'EventManagement',url:'#', bookmarkable: true, resourceId:'14750a72'}, {label: 'Business Profile Inquiry',id: 'BusinessProfileInquiry',url:'#', bookmarkable: true, resourceId:'e13371f8'}, {label: 'Address Inq',id: 'AddressInq',url:'#', bookmarkable: true, resourceId:'a95f8180'}]},
                    {label: 'Account Information',items: [{label: 'Inquire on Account',items: [{label: 'Converstion Inq',id: 'ConverstionInq',url:'#', bookmarkable: true, resourceId:'e7dcc941'},{label: 'Accounting Inq',items: [{label: 'Item 1',id: 'Item1a',url:'#', bookmarkable: true, resourceId:'197a5c5e'},{label: 'Item 2',id: 'Item2a',url:'#', bookmarkable: true, resourceId:'475399da'}]},{label: 'Taxpayer Account Inq',id: 'TaxpayerAccountInq',url:'#', bookmarkable: true, resourceId:'725bbb90'},{label: 'Reqturns Inq',id: 'ReqturnsInq',url:'#', bookmarkable: true, resourceId:'b5a51cca'},{label: 'Audit Screening',items: [{label: 'Audit Screening 1',id: 'AuditScreening1',url:'#', bookmarkable: false, resourceId:'dd4356f9'},{label: 'Audit Screening 2',id: 'AuditScreening2',url:'#', bookmarkable: true, resourceId:'2fad2026'}]}]}, {label: 'Search on Account',id: 'SearchonAccount',url:'#', bookmarkable: true, resourceId:'1a580afd'}, {label: 'Collection Agency',id: 'CollectionAgency',url:'#', bookmarkable: true, resourceId:'abdabc45'}]},
                    {label: 'Work Management',items: [{label: 'Worklist Management',id: 'WorklistManagement',url:'#', bookmarkable: true, resourceId:'eb6ab635'}, {label: 'Work Item Search',id: 'WorkItemSearch',url:'#', bookmarkable: true, resourceId:'e137df4a'}, {label: 'Audit',items: [{label: 'Audit Case Work',id: 'AuditCaseWork',url:'#', bookmarkable: true, resourceId:'e12677f6'},{label: 'Inventory Management',id: 'InventoryManagement',url:'#', bookmarkable: true, resourceId:'a0b3a228'}]}, {label: 'BCMS',items: [{label: 'BCMS Casework',id: 'BCMSCasework',url:'#', bookmarkable: true, resourceId:'590dfa9d'},{label: 'Inventory Management',id: 'InventoryManagement',url:'#', bookmarkable: true, resourceId:'5190086e'}]}]},
                    {label: 'Special Services',items: [{label: 'Reporting',id: 'Reporting',url:'#', bookmarkable: true, resourceId:'ed19f4b3'}, {label: 'EDMS',id: 'EDMS',url:'#', bookmarkable: true, resourceId:'9883fa4c'}, {label: 'You should never see this and its label length should have no impact on the other items in this group',dividerType: 'blank'}, {label: 'Order Forms',id: 'OrderForms',url:'#', bookmarkable: true, resourceId:'69ba4820'}]}
                ];
            }

        }

        // Favorites
        if (!window.fwData.context.favorites) {
            window.fwData.context.favorites = {};
        }

        if (!window.fwData.context.favorites.data) {
            window.fwData.context.favorites.data = {
                id: 'favorites',
            };
        }

        if (!window.fwData.context.favorites.data.tabsets) {
            window.fwData.context.favorites.data.tabsets = [];
        }

        if (!window.fwData.context.favorites.data.tabsets.length) {
            window.fwData.context.favorites.data.tabsets = [
                {
                    id: 'LP123',
                    url: 'LP123.gateway?jadeAction=TB0822N_BUSINESS_SUMMARY_RETRIEVE_ACTION&amp;fwFromNav=Y',
                    name: 'Liability Period',
                    label: 'Liability Period',
                    parent: 'favorites',
                },
                {
                    id: 'TI_folder',
                    label: 'TI',
                    isOpen: true,
                    parent: 'favorites',
                    tabsets: [
                        {
                            id: 'CPERSI01',
                            url: 'CPERSI01.gateway?jadeAction=TB0822N_BUSINESS_SUMMARY_RETRIEVE_ACTION&amp;fwFromNav=Y',
                            name: 'Individual Taxpayer Profile Inquiry',
                            label: 'Ind TP Inquiry',
                            parent: 'favorites',
                        },
                    ],
                },
                {
                    id: 'CM123',
                    url: 'CM123.gateway',
                    name: 'Case Management',
                    label: 'Case Management',
                    parent: 'favorites',
                },
            ];
        }

        //External Page Info
        if(document.querySelector('html').classList.contains("external-app")){
        	var pageInfoElem = document.querySelector(".emp-page-info");

        	if(pageInfoElem){
        		var pageTitleHeaderElem = pageInfoElem.querySelector(".emp-page-title h2");
	        	var pageInstructionElem = pageInfoElem.querySelector(".emp-page-instructions");
	        	var pageLegendElem = pageInfoElem.querySelector('.emp-page-legend');

	        	var renderJSON = {
	                "template": "pageInfo",
                    "title": "",
                    "mode": "test",
	                "instructions": [
	                    {
	                        "template": "output",
	                        "text": ""
	                    }
	                ],
	                "pageLegend": {
	                    "required": false,
	                    "helpText": false
	                }
	            };

	            if(pageTitleHeaderElem){

                    var modeElem = pageTitleHeaderElem.querySelector('span');

                    if (modeElem) {

                        renderJSON.mode = modeElem.textContent;

                        pageTitleHeaderElem.removeChild(modeElem);

                        renderJSON.title = pageTitleHeaderElem.textContent;
                    }
                    else {

                        renderJSON.mode = false;

                        if(pageTitleHeaderElem.textContent !== ""){
                            renderJSON.title = pageTitleHeaderElem.textContent;
                        }
                    }

	            }

	        	if(pageInstructionElem){
                    var pageInstructionContent = pageInstructionElem.innerHTML.trim();

	        		if(pageInstructionContent !== ""){
	        			renderJSON.instructions[0].text = pageInstructionContent;
	        		}
	        	}

	        	if(pageLegendElem){
	        		if(pageLegendElem.querySelector('.cui-required')){
		        		renderJSON.pageLegend.required = true;
		        	}
		        	if(pageLegendElem.querySelector('.emp-icon-help')){
		        		renderJSON.pageLegend.helpText = true;
		        	}
                }

	        	render.section(undefined, renderJSON, 'return', function(html, store) {
	            	pageInfoElem.parentNode.replaceChild(html, pageInfoElem);
	            });
        	}
        }

        // Let components know that this is an HTML-based mockup and is not running on a web server
        window.fwData.isMockup = true;

        // Move cb over to the right variable just incase no types are defined
        if (typeof types === 'function') {
            cb = types;
            types = undefined;
        }

        // Check to see something is defined, otherwise here are our defaults.
        if (!types) {
            types = ['table', 'section.emp-tabs'];
        }

        // Array of elements we want to process.
        var elements = types;

        var result = htmlToDataStore.parsePage(elements);

        // Call our generic fix function that is being used to polyfill changes happening over time.
        fixChangedSpecs();

        // Find tables
        var $tables = $('table');
        var $tabs = $('section.emp-tabs');
        var $navMenu = $('nav');

        if ($tables.length) {

            $tables.each(function () {
                var $table = $(this);
                var id = $table.attr('id');
                var store = ds.getStore($table.attr('data-store-id'));

                if (id === 'empty-table') {
                    delete store.body;
                }

                var root = $table.parent('.emp-table').eq(0);

                if (store && typeof store === "object") {
                    // Rerender the table per the new render code and optimization spec (JH: 3/21/2016)
                    render.section(undefined, store, 'return', function(html, store) {

                        var currentTable = root[0];
                        var parentContainer = currentTable.parentNode;

                        parentContainer.insertBefore(html.firstChild, currentTable);

                        parentContainer.removeChild(currentTable);

                        // if (emp.reference.tables && !emp.reference.tables[id]) {
                        //     emp.reference.tables[id] = store;
                        // }

                        setTimeout(function() {

                            // Now build out the mockup column and button lists
                            createTableColumnList(id);

                        }, 700);

                    });
                }

            });
        }

        if ($tabs.length) {

            $tabs.each(function() {

                var $tabSection = $(this);
                var id = $tabSection.attr('id');

                if (!id) {

                    $tabSection.attr('id', 'UIHTMLDATASTORETEMPTABS');
                }

                var store =  ds.getStore($tabSection.attr('data-store-id'));

                var parent = $tabSection.parent();

                if (store && typeof store === "object") {

                    // Rerender the table per the new render code and optimization spec (JH: 3/21/2016)
                    render.section(undefined, store, 'return', function(html, store) {

                        var currentTabSection = $tabSection[0];
                        var parentContainer = currentTabSection.parentNode;

                        parentContainer.insertBefore(html.firstChild, currentTabSection);

                        parentContainer.removeChild(currentTabSection);

                    });

                }

            });

        }

        createHeaderIDList();
        createEntityLookupList();

        createPageMetaData();

        if (typeof cb === 'function') {

            cb(result);
        }
        else {

            return result;
        }

    };


    var createRegistrationJSON = function _createRegistrationJSON () {
        var registrationJSON = {
            "pageID": "",
            "pageTitle": "",
            "sections": [],
            "fields": [],
            "buttons": []
        };

        var removeDuplicatesFromList = function _removeDuplicatesFromList(list){
            var keyRef = {};
            list.reverse();

            for(var i = list.length-1; i >= 0; i--){
                var currentItem = list[i];

                if(currentItem.label && currentItem.label !== ""){

                    if(!keyRef[currentItem.label]){
                        keyRef[currentItem.label] = [];
                        keyRef[currentItem.label].push(currentItem);
                    }
                    else{
                        //Label exists in our reference object. Compare at each object.
                        var currentProperties = Object.getOwnPropertyNames(currentItem);
                        var keyExists = true;

                        for(var j = 0; j < keyRef[currentItem.label].length; j++){
                            var comparisonKey = keyRef[currentItem.label][j];
                            var keyArrayProperties = Object.getOwnPropertyNames(comparisonKey);

                            if(currentProperties.length !== keyArrayProperties.length){
                                keyExists = false;
                            }
                            else{
                                for (var k = 0; k < currentProperties.length; k++) {
                                    var propName = currentProperties[k];

                                    // If values of same property are not equal,
                                    // objects are not equivalent
                                    if (currentItem[propName] !== comparisonKey[propName]) {
                                        keyExists = false;
                                    }
                                }
                            }
                        }

                        if(keyExists){
                            // Remove from list
                            list.splice(i, 1);
                        }
                        else{
                            // Add to reference object
                            keyRef[currentItem.label].push(currentItem);
                        }
                    }
                }
            }

            list.reverse();

            return list;
        };

        var getPageID = function _getPageID(){
            var pageID = "";

            try{
                pageID = fwData.context.screen.id;

                //Cleanup page ID if starts with number(filename)
                if(parseInt(pageID.slice(0, 1)) >= 0){
                    var pieces = pageID.split('_');

                    pageID = pieces[1] + "_" + pieces[2].substring(0,2);
                }

            } catch(evt){

                journal.log({ type: 'error', owner: 'UI', module: 'uimockup', submodule: 'createRegistrationJSON', func: 'getPageID' }, 'Error parsing page id' + evt);
            }

            return pageID;
        };

        var getPageTitle = function _getPageTitle(){
            var titleElem = document.querySelector(".emp-page-title h2");
            var pageTitle = titleElem.textContent.trim();

            return pageTitle;
        };

        var getEnvironment = function _getEnvironment(){
            var htmlElem = document.querySelector("html");
            var environment = htmlElem.dataset.environment;

            return environment;
        };

        var getSectionListJSON = function _getSectionListJSON(){
            var sectionList = [];
            var sections = document.querySelectorAll('main section');

            for(var i=0; i<sections.length;i++){
                var sectionJSON = {};

                // Section Title Content
                var sectionTitleElement = sections[i].querySelector('.emp-section-title h3');

                if(sectionTitleElement && sectionTitleElement.innerHTML !== "" && sectionTitleElement.closest('section') === sections[i]){
                    sectionJSON.title = sectionTitleElement.innerHTML.trim();
                }

                // Section Instruction Content
                var sectionInstructionElement = sections[i].querySelector('.emp-section-instructions');

                if(sectionInstructionElement && sectionInstructionElement.innerHTML !== "" && sectionInstructionElement.closest('section') === sections[i]){

                    sectionJSON.instructionText = sectionInstructionElement.innerHTML.trim();
                    sectionJSON.instructionType = "HTML";
                }

                if(Object.keys(sectionJSON).length > 0){
                    sectionList.push(sectionJSON);
                }
            }

            sectionList = removeDuplicatesFromList(sectionList);

            return sectionList;
        };

        var revealRegions = function _revealRegions(){
            //Expand all regions (otherwise they are hidden)
            var expandableRegions = document.querySelectorAll('.emp-expandable-region');

            for(var i = 0; i < expandableRegions.length; i++){
                expandableRegions[i].style.display ="block";
            }
        };

        var revertRegions = function _revertRegions(){
            //Revert all regions. The style property isn't used during normal rendering so it should be save to remove.
            var expandableRegions = document.querySelectorAll('.emp-expandable-region');

            for(var i = 0; i < expandableRegions.length; i++){
                expandableRegions[i].style.removeProperty("display");
            }
        };

        var getItagTextFromButton = function _getItagTextFromButton(button){
            var tooltipSource = button.dataset.tooltipSource;

            if(tooltipSource){
                var tooltipContent = document.getElementById(tooltipSource);

                if(tooltipContent){
                    return tooltipContent.innerHTML;
                }
            }

            return "";
        };

        var trimFieldID = function _trimFieldID(id){
            //Cleanup any prefix/suffix
            if(id.indexOf(':')>-1){
                var pieces = id.split(':');

                for(var p=0; p<pieces.length;p++){

                    if(pieces[p].indexOf("EC_") > -1){
                       return pieces[p];
                    }
                }
            }

            return id;
        };

        var getFieldListJSON = function _getFieldListJSON(){
            var fieldList = [];

            var viewKeys = [];

            var dataWrappers = document.querySelectorAll('main .emp-field, main .emp-composite');

            for (var i = 0; i < dataWrappers.length; i++){

                var readOnlyLabels = dataWrappers[i].querySelectorAll(".emp-label");

                for (var j = 0; j<readOnlyLabels.length; j++){
                    var readOnlyLabel = readOnlyLabels[j];
                    var readOnlyJSON = {};

                    if(readOnlyLabel.textContent !== ""){
                        readOnlyJSON.label = readOnlyLabel.textContent.replace(":","");
                    }

                    if(readOnlyLabel.id !== ""){
                        readOnlyJSON.name = trimFieldID(readOnlyLabel.id);
                    }

                    //Handle read only fields with iTags.
                    var wrapperItags = dataWrappers[i].querySelectorAll("button.emp-icon-help");
                    // Only process if there is only one itag.
                    if(wrapperItags.length == 1){
                        readOnlyJSON.helpText = getItagTextFromButton(wrapperItags[0]);
                    }

                    if(Object.keys(readOnlyJSON).length > 0){
                        fieldList.push(readOnlyJSON);
                    }
                }

                /* jshint ignore:start */
                var labels = dataWrappers[i].querySelectorAll("label");

                for (var j = 0; j<labels.length; j++){
                    var label = labels[j];
                    var fieldJSON = {};

                    if(label.textContent !== ""){
                        fieldJSON.label = label.textContent.replace(":","");
                    }

                    if(label.htmlFor != ""){
                        var input = document.querySelector("#"+label.htmlFor.replace(":","\\:"));

                        fieldJSON.name = trimFieldID(label.htmlFor);

                        if(input){

                            if(input.type !== "radio" && input.type !== "checkbox"){
                                if(input.size){
                                    fieldJSON.size = input.size;
                                }
                                if(input.maxLength){
                                    fieldJSON.maxLength = input.maxLength;
                                }
                            }

                            var siblingHelpButton = input.parentNode.querySelector("button.emp-icon-help");

                            if(siblingHelpButton){
                                fieldJSON.helpText = getItagTextFromButton(siblingHelpButton);
                            }
                        }
                    }

                    if(Object.keys(fieldJSON).length > 0){
                        fieldList.push(fieldJSON);
                    }
                }
                /* jshint ignore:end */
            }

            //Get any legend viewkeys.
            /* jshint ignore:start */
            var legendElements = document.querySelectorAll('main legend');
            for (var i = 0; i < legendElements.length; i++){
                var fieldJSON = {};

                if(legendElements[i].textContent && legendElements[i].textContent !== ""){
                    fieldJSON.label = legendElements[i].textContent;
                }

                if(legendElements[i].id && legendElements[i].id !== ""){
                    fieldJSON.name = legendElements[i].id;
                }

                if(Object.keys(fieldJSON).length > 0){
                    fieldList.push(fieldJSON);
                }
            }
            /* jshint ignore:end */
            fieldList = removeDuplicatesFromList(fieldList);

            return fieldList;
        };

        var getButtonListJSON = function _getButtonListJSON(){

            var processHtmlButton = function _processHtmlButton(button){
                var buttonJSON = {};

                if(button.id){
                    buttonJSON.id = button.id;
                }

                if(button.label && button.label !== ""){
                    buttonJSON.label = button.label;
                }
                else if(button.textContent && button.textContent !== ""){
                    buttonJSON.label = button.textContent;
                }

                if(button.type && button.type !== ""){
                    buttonJSON.type = button.type;
                }

                if(button.title && button.title !== ""){
                    buttonJSON.tooltip = button.title;
                }

                if(button.accessKey){
                    // buttonJSON.accessKey = "";
                }

                if(button.physicalType){
                    // buttonJSON.physicalType = "";
                }

                if(Object.keys(buttonJSON).length > 0){
                    return buttonJSON;
                }

                return false;
            };

            var buttonList = [];

            //Button row buttons
            var buttonRows = document.querySelectorAll('.emp-button-row .emp-button-group, .emp-button-group');

            for (var i = 0; i < buttonRows.length; i++){

                var buttons = buttonRows[i].querySelectorAll('button');

                for (var j = 0; j < buttons.length; j++){
                    var buttonJSON = processHtmlButton(buttons[j]);
                    if(buttonJSON){
                        buttonList.push(buttonJSON);
                    }
                }
            }

            //Field buttons
            var fieldButtons = document.querySelectorAll('.emp-field button:not(.emp-icon-help):not(.cui-c-datepicker):not(.emp-password-toggle)');
            /* jshint ignore:start */
            for(var i = 0; i < fieldButtons.length; i++){
                var buttonJSON = processHtmlButton(fieldButtons[i]);
                if(buttonJSON){
                    buttonList.push(buttonJSON);
                }
            }
            /* jshint ignore:end */

            //Table buttons
            var tableDataStoreKeys = emp.ds.getStoreType("table");
            /* jshint ignore:start */
            for(var i = 0; i < tableDataStoreKeys.length; i++){

                tableData = emp.ds.getStore(tableDataStoreKeys[i]);

                //Get button columns / action drop down items.
                if(tableData.head
                    && tableData.head.rows
                    && tableData.head.rows[0]
                    && tableData.head.rows[0].columns
                    && tableData.head.rows[0].columns.length > 0 ){

                    var tableHeaderColumnsData = tableData.head.rows[0].columns;

                    for(var j = 0; j < tableHeaderColumnsData.length; j++){
                        var columnData = tableHeaderColumnsData[j];

                        if(columnData.attributes
                            && columnData.attributes["data-type"]
                            && columnData.attributes["data-type"] == "button"){

                            var tableButtonJSON = {};

                            if(columnData.text){
                                tableButtonJSON.label = columnData.text;
                            }

                            if(Object.keys(tableButtonJSON).length > 0){
                                buttonList.push(tableButtonJSON);
                            }
                        }
                    }
                }
            }
            /* jshint ignore:end */

            buttonList = removeDuplicatesFromList(buttonList);

            return buttonList;
        };

        var createModal = function _createModal(text) {
            var regModal = $.modal({
                autoOpen: true,
                html: text,
                closeDestroy: true,
            });
        };

        revealRegions();
        registrationJSON.environment = getEnvironment();
        registrationJSON.pageID = getPageID();
        registrationJSON.pageTitle = getPageTitle();
        registrationJSON.sections = getSectionListJSON();
        registrationJSON.fields = getFieldListJSON();
        registrationJSON.buttons = getButtonListJSON();
        revertRegions();

        var modalContent = JSON.stringify(registrationJSON);
        modalContent = modalContent.replace(/</g, "&lt;");
        modalContent = modalContent.replace(/>/g, "&gt;");

        // Check to see if the require module
        if (require.defined('modal')) {

            // Create the modal
            createModal(modalContent);
        }
        else {
            // Load the require module and then create the modal
            cui.load('modal', function _selection_modal() {
                createModal(modalContent);
            });
        }
    };

    // Public methods of the `uimockup` object
    return {
        createPageDataStore: createPageDataStore,
        createElementDataStore: createElementDataStore,
        createPageMetaData: createPageMetaData,
        createRegistrationJSON: createRegistrationJSON
    };
});
