/*! Empire 2
 *  @description  eCore
 *  @version      0.1.0.REL20221118
 *  @copyright    2022 New York State Office of Information Technology Services
 */

define(['jquery', 'cui'], function ($, cui) {
    var VERSION = {
            name: 'datepicker',
            version: '1.0.0',
            date: '20010101'
        };

    // Constants
    var MONTH_EN = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

    var MSHORT_EN = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

    var DAYS_WK_EN = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

    var DAYS_MON = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var CULTURES = {
            USA: {
                mask: 'MM|DD|YYYY',
                delim: '/',
            },
            INT: {
                mask: 'DD|MM|YYYY',
                delim: '/',
            },
            SYS: {
                mask: 'YYYY|MM|DD',
                delim: '-',
            },
        };

    // CSS hooks
    var CLASSES = {
            hidden: 'cui-hidden',
            selected: 'selected',
            invalidDate: 'invalidDate',
        };

    var SELECTORS = {
            icon: '.cui-c-datepicker',
        };

    var ID_PREFIXES = {
            datePicker: 'datePicker_',
            calIcon: 'cal_',
            selectedMonth: 'selMon_',
            selectedYear: 'selYr_',
        };

    var ICON_TOOLTIP = {
            show: 'Open the calendar popup',
            hide: 'Close the calendar popup',
        };

    var OPTIONS_TOOLTIP = {
            show: 'Open options',
            hide: 'Close options',
        };

    // Common element caches
    var $body;
    var $window;

    // Private API
    var _priv = {};
    var _events = {};
    var _imgPath = '../../dist/images/';
    var _defaultSettings = {
            datePickers: [
                {
                    inputId: '',
                    culture: 'USA',
                    minDate: '01/01/1950',
                    maxDate: '12/31/2150',
                    display: {
                        theme: 0,
                        autoError: false,
                        enableBoundaryDetection: true,
                    },
                },
            ],
        };

    var _mySettings = {
            datePickers: [],
        };

    /////////////////
    // Constructor //
    /////////////////

    var DatePicker = function (elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;

        // This next line takes advantage of HTML5 data attributes
        // to support customization of the plugin on a per-element
        // basis. For example,
        // <div class='item' data-datepicker-options='{"message":"Goodbye World!"}'></div>
        this.metadata = this.$elem.data('datepicker-options');
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    DatePicker.prototype = {};

    // Default user options
    DatePicker.prototype.defaults = {};

    /**
     * Initializes the plugin and date picker and adds a click event to the icon
     * May be called multiple times. If no date pickers are provided, some general setup will be performed.
     * @return {Object}   Instance of DatePicker
     */
    DatePicker.prototype.init = function () {
        var $icons = $(SELECTORS.icon);

        // Introduce defaults that can be extended either globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        // Cache common elements
        $body = $('body');
        $window = $(window);

        // Add click event on calendar icons
        this.$elem.on('click', _events._iconClick);

        // Try to find all date icons
        $icons = $(SELECTORS.icon);

        // Add events to date inputs
        if ($icons.length) {
            $icons.each(function () {

                var iconSelector = '#' + (this.id.substring(this.id.indexOf(ID_PREFIXES.calIcon) + 4));

                //console.log('#' + (this.id.substring(this.id.indexOf(ID_PREFIXES.calIcon) + 4)));

                if (iconSelector !== "#" && iconSelector.length > 1) {

                    var $input = $('#' + (this.id.substring(this.id.indexOf(ID_PREFIXES.calIcon) + 4)));

                    if ($input.length) {
                        $input.on('blur', _events._inputBlur);
                        $input.on('keyup', _events._inputKeyup);
                    }

                    // Icon
                    $(this).attr('title', ICON_TOOLTIP.show);
                }

            });
        }
        // No icons found, so get the input manually by looking for a sibling
        //TODO: I think this condition is always met and the block above is leftover from iflow but does not apply to Empire 2 (CP 4/12/16)
        else {
            // Add events for its input
            this.$elem.prev('input').on('keyup', _events._inputKeyup);
        }

        return this;
    };

    ////////////////////
    // Public methods //
    ////////////////////

    var _setImagesPath = function _setImagesPath (url) {
            if (typeof url === 'string' && url && $.trim(url).length > 0) {
                _imgPath = url;
            }
        };

    var _customize = function _customize (settings) {
            var minDefaultDate = new Date(_defaultSettings.datePickers[0].minDate);
            var maxDefaultDate = new Date(_defaultSettings.datePickers[0].maxDate);
            var dp;
            var i;
            var j;
            var k;

            // check if any settings are passed
            if (settings && typeof settings === 'object') {
                i = settings.datePickers.length;

                while (j < i) {
                    dp = settings.datePickers[j];

                    if (dp && dp.inputId) {
                        if ($.trim(dp.inputId).length > 0) {
                            // check if display was passed, else add it
                            if (!dp.display) {
                                dp.display = {};
                            }

                            // if id exists, add to mySettings
                            _mySettings.datePickers[k] = {
                                inputId: dp.inputId,
                                culture: dp.culture || _defaultSettings.datePickers[0].culture,
                                minDate: dp.minDate || _priv.setDateToCulture({day: minDefaultDate.getDate(), month: (minDefaultDate.getMonth()+1), year: minDefaultDate.getFullYear()}, dp.inputId, CULTURES[dp.culture]),
                                maxDate: dp.maxDate || _priv.setDateToCulture({day: maxDefaultDate.getDate(), month: (maxDefaultDate.getMonth()+1), year: maxDefaultDate.getFullYear()}, dp.inputId, CULTURES[dp.culture]),
                                display: {
                                    theme: dp.display.theme || _defaultSettings.datePickers[0].display.theme,
                                    autoError: dp.display.autoError || _defaultSettings.datePickers[0].display.autoError,
                                    enableBoundaryDetection: dp.display.enableBoundaryDetection || _defaultSettings.datePickers[0].display.enableBoundaryDetection
                                }
                            };

                            k += 1;
                        }
                    }

                    j += 1;
                }
            }
        };

    var _hideAll = function _hideAll () {
            _priv.hideAllDatePickers();
        };

    /////////////////////
    // Private methods //
    /////////////////////

    _priv.generateID = function _generateID () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    _priv.getSettings = function _getSettings (inputId) {
        var i = _mySettings.datePickers.length;

        // make sure custom settings were set, else return default
        if (i === 0) {
            return _defaultSettings.datePickers[0];
        }

        while ((i -= 1) >= 0) {
            // find custom settings and return those if match
            if (_mySettings.datePickers[i].inputId === inputId) {
                return _mySettings.datePickers[i];
            }
        }

        // return default settings
        return _defaultSettings.datePickers[0];
    };

    _priv.showHideDatePicker = function _showHideDatePicker (calIcon, cal, forceHide) {
        var inputId = calIcon.id.substring(calIcon.id.indexOf(ID_PREFIXES.calIcon) + 4);

        forceHide = forceHide || false;

        // Check if calendar already exists for this associated control
        if (cal) {

            // If it exists, show it or hide it
            if ($(cal).hasClass(CLASSES.hidden) && !forceHide) {
                // Refresh calendar
                cal = _priv.refreshDatePickerHtml(cal);

                // Position calendar
                _priv.setDatePickerPosition(cal);

                _priv.showDatePicker(cal);

                if (_priv.getSettings(inputId).display.enableBoundaryDetection) {
                    _priv.handleBoundaryDetection(cal);
                }

                $('#dpCalWrap_' + inputId).focus();
            }
            else {
                _priv.hideDatePicker(cal);

                $(calIcon).focus();
            }
        }
        else {

            cal = _priv.createDatePicker(calIcon);

            // Position calendar
            _priv.setDatePickerPosition(cal);


            if (_priv.getSettings(inputId).display.enableBoundaryDetection) {
                _priv.handleBoundaryDetection(cal);
            }

            _priv.showDatePicker(cal);

            $('#dpCalWrap_' + inputId).focus();

            calIcon.title = ICON_TOOLTIP.hide;

            // // Watch for body clicks and window resizing
            // $body.on('click', _events._bodyClick);
            // $window.on('resize', _events._windowResize);
        }
    };

    /**
     * Creates a new date picker for a given icon and adds it to the DOM
     * @param   {Element}  elem  Icon element
     * @return  {Element}        Date picker element
     */
    _priv.createDatePicker = function _createDatePicker (elem) {
        var inputId = elem.id.substring(elem.id.indexOf(ID_PREFIXES.calIcon) + 4);
        var $cal = $('<div/>');

        $cal
            .attr('id', ID_PREFIXES.datePicker + inputId)
            .attr('style', 'inline-block')
            .addClass('dp')
            .html(_priv.getDatePickerHtml(_priv.getDatePickerInitialDate(inputId), inputId));

        $body.append($cal);

        // Add click event to calendar and use delegation to handle clicks on it
        $cal
            .on('click', _events._calClick)
            .on('dblclick', _events._calClick)
            // Add keydown event to handle keystrokes like 'esc'
            .on('keydown',  _events._calKeydown);

        $cal
            .on('click', '.dp', _events._calClick)
            .on('dblclick', '.dp', _events._calClick)
            // Add keydown event to handle keystrokes like 'esc'
            .on('keydown', '.dp', _events._calKeydown);



        return $cal.get(0);
    };

    _priv.refreshDatePickerHtml = function _refreshDatePickerHtml (cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));

        cal.innerHTML = _priv.getDatePickerHtml(_priv.getDatePickerInitialDate(inputId), inputId);

        return cal;
    };

    _priv.getDatePickerHtml = function _getDatePickerHtml (dmyCal, inputId) {
        var html = '';
        var calDate = null;
        var weekday = -1;
        var lastDayMonth = 0;
        var lastDayPrevMonth = 0;
        var prevMon = 0;
        var prevYr = 0;
        var nextMon = 0;
        var nextYr = 0;
        var i = 0;
        var rows = 0;
        var daysCnt = 0;
        var titleDate = null;
        var today = new Date();
        var _getDayTitle = function _getDayTitle (date) {
                return DAYS_WK_EN[date.getDay()] +
                       ', ' +
                       MONTH_EN[date.getMonth()] +
                       ' ' +
                       date.getDate() +
                       ', ' +
                       date.getFullYear();
            };

        dmyCal = _priv.convertDMYToNumeric(dmyCal);

        // Calendar wrapper
        // ---------------------------
        html += '<div id="dpCalWrap_' + inputId + '" class="dpCalWrap" tabindex="0">' +
                    '<div class="dpCal">';

        // Calendar main
        // ---------------------------
        // Header
        html += _priv.getHeaderHtml(dmyCal, inputId);

        // Body
        // One-letter abbreviation for each single day
        html +=         '<div class="dpBody">' +
                            '<div class="dpDayDesc">' +
                                '<ul><li>S</li><li>M</li><li>T</li><li>W</li><li>T</li><li>F</li><li>S</li></ul>' +
                            '</div>' +
                            '<div class="dpWeekNbrDays">';

        // Days
        html +=                 '<div class="dpDays">' +
                                    '<ul>';

        // Calculate the day where the 1st of the month falls
        calDate = new Date(dmyCal.month.toString() + '/01/' + dmyCal.year.toString());
        weekday = calDate.getDay();

        // Calculate the last day of the month
        lastDayMonth = _priv.getLastDayOfMonth(calDate);

        // Get next and previous months/year
        nextMon = dmyCal.month + 1;
        nextYr = dmyCal.year;
        if (dmyCal.month === 1) {
            prevMon = 12;
            prevYr = dmyCal.year - 1;
        }
        else {
            prevMon = dmyCal.month - 1;
            prevYr = dmyCal.year;

            if (nextMon > 12) {
                nextMon = 1;
                nextYr += 1;
            }
        }

        // Calculate the last day of the previous month if applicable
        lastDayPrevMonth = _priv.getLastDayOfMonth(new Date(prevMon + '/01/' + prevYr));

        // Start with previous month days when applicable
        // If the first of the month falls on a Sunday, add one extra row with previous month's days
        if (weekday === 0) {
            weekday = 7;
        }

        while (weekday > 0) {
            // Counts the number of days used in row (1...7)
            daysCnt += 1;

            html += '<li class="prevMonthDay';

            if (i === 0) {
                html += ' newLine';
                rows += 1;
                i += 1;
            }

            // Validate date and show as clickable or read-only
            titleDate = new Date(prevMon + '/' + (lastDayPrevMonth - weekday + 1) + '/' + prevYr);

            if (_priv.validateMinMaxRange({day: (lastDayPrevMonth - weekday + 1), month: prevMon, year: prevYr}, inputId)) {
                html += '"><a href="#" role="button" title="' + _getDayTitle(titleDate) + '" tabindex="0">' + (lastDayPrevMonth - weekday + 1) + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + (lastDayPrevMonth - weekday + 1) + '</span></li>';
            }

            weekday -= 1;
        }
        i = 0;

        // Month's days
        while (i < lastDayMonth) {
            // Counts the number of days used in row (1...7)
            daysCnt += 1;

            html += '<li class="';

            if (daysCnt === 8) {
                html += 'newLine';
                rows += 1;
                daysCnt = 1;
            }

            // Check if today's date falls into this month
            if (today.getDate() === (i + 1) && today.getMonth() === (dmyCal.month - 1) && today.getFullYear() === dmyCal.year) {
                html += ' today';
            }

            // Check if there is a selected day
            dateParsed = _priv.processDate($.trim(document.getElementById(inputId).value), inputId);
            if (dateParsed.valid) {
                if (parseInt(dateParsed.dmy.day, 10) === (i + 1) && parseInt(dateParsed.dmy.month, 10) === dmyCal.month && parseInt(dateParsed.dmy.year, 10) === dmyCal.year) {
                    html += ' selectedDay';
                }
            }

            // Validate date and show as clickable or read-only
            titleDate = new Date(dmyCal.month.toString() + '/' + (i + 1) + '/' + dmyCal.year.toString());
            if (_priv.validateMinMaxRange({day: (i + 1), month: dmyCal.month, year: dmyCal.year}, inputId)) {
                html += '"><a href="#" role="button" title="' + _getDayTitle(titleDate) + '" tabindex="0">' + (i + 1) + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + (i + 1) + '</span></li>';
            }

            i += 1;
        }
        i = 0;

        // Next month's day when applicable
        if (daysCnt === 7) {
            daysCnt = 0;
        }
        while (daysCnt < 7) {
            html += '<li class="nextMonthDay';

            if (daysCnt === 0) {
                html += ' newLine';
                rows += 1;
            }

            // Validate date and show as clickable or read-only
            titleDate = new Date(nextMon + '/' + (i + 1) + '/' + nextYr);

            if (_priv.validateMinMaxRange({day: (i + 1), month: nextMon, year: nextYr}, inputId)) {
                html += '"><a href="#" role="button" title="' + _getDayTitle(titleDate) + '" tabindex="0">' + (i + 1) + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + (i + 1) + '</span></li>';
            }

            daysCnt += 1;
            i += 1;

            if (daysCnt === 7 && rows < 6) {
                // Add extra row to keep consistent 6-row calendar
                daysCnt = 0;
            }
        }
        i = 0;

        // Footer
        // html +=                     '</ul>' +
        //                         '</div>' +
        //                     '</div>' +
        //                     '<div class="dpFoot">' +
        //                         '<div class="dpFootLeft">' +
        //                             '<div class="dpPrevYear">' +
        //                                 '<button type="button" class="dpPrevYearJan1" >Jan 1</button>' +
        //                             '</div>' +
        //                         '</div>' +
        //                         '<div class="dpFootRight">' +
        //                             '<div class="dpPrevYear">' +
        //                                 '<button type="button" class="dpPrevYearDec31">Dec 31</button>' +
        //                             '</div>' +
        //                         '</div>' +
        //                     '</div>' +
        //                 '</div>' +
        //             '</div>';

        // End of calendar wrapper
        html += '</div>';

        // Options
        // ---------------------------
        html += '<div id="dpOptions_' + inputId + '" class="dpOptWrap ' + CLASSES.hidden + '" tabindex="0">';

        // Months
        html +=     '<div class="dpOpt">' +
                        '<div class="dpMon">' + _priv.setOptionsMonths(dmyCal, inputId) + '</div>';

        // Years
        html +=         '<div class="dpYr">' + _priv.setOptionsYears(dmyCal, inputId) + '</div>';

        // Other
        html +=         '<div id="dpOther_' + inputId + '" class="dpOther">' +
                            '<div class="dpOtherL">' +
                                '<a href="#" role="button" title="Today" tabindex="0">Today</a>' +
                            '</div>' +
                            '<div class="dpOtherR">' +
                                '<a href="#" role="button" id="dpOK_' + inputId + '" title="OK" tabindex="0">OK</a>' +
                                '<a href="#" role="button" title="Cancel" tabindex="0">Cancel</a>' +
                            '</div>' +
                        '</div>';

        // Options shadow
        html +=     '</div>' +
                '</div>';

        return html;
    };

    _priv.getHeaderHtml = function _getHeaderHtml (dmyCal, inputId) {
        var html = '';
        var settings = _priv.getSettings(inputId);
        var minDate = _priv.parseDateStringToDateObject(settings.minDate, inputId);
        var maxDate = _priv.parseDateStringToDateObject(settings.maxDate, inputId);

        html = '<div class="dpHead">';

        // Previous navigation items
        if (dmyCal.month === (minDate.getMonth() + 1) && dmyCal.year === minDate.getFullYear()) {
            html += '<ul class="lIcons"><li><span class="grayedOut"></span></li><li><span class="grayedOut"></span></li></ul>';
        }
        else {
            html += '<ul class="lIcons"><li><a href="#" class="fastNavPrevQtr" title="Previous quarter" tabindex="0"></a></li><li><a href="#" class="navPrevMon" title="Previous month" tabindex="0"></a></li></ul>';
        }

        // Month year
        html += '<div class="title"><a href="#" class="monthYear" title="' + OPTIONS_TOOLTIP.show + '" tabindex="0">' + MONTH_EN[dmyCal.month - 1] + ' ' + dmyCal.year.toString()  + '</a><input type="hidden" id="dpSel_' + inputId + '" value="' + dmyCal.month.toString() + '/' + dmyCal.year.toString() + '"></div>';

        // Next navigation items
        if (dmyCal.month === (maxDate.getMonth() + 1) && dmyCal.year === maxDate.getFullYear()) {
            html += '<ul class="rIcons"><li><span class="grayedOut"></span></li><li><span class="grayedOut"></span></li></ul>';
        }
        else {
            html += '<ul class="rIcons"><li><a href="#" class="navNextMon" title="Next month" tabindex="0"></a></li><li><a href="#" class="fastNavNextQtr" title="Next quarter" tabindex="0"></a></li></ul>';
        }

        html += '</div>';

        return html;
    };

    _priv.setDatePickerPosition = function _setDatePickerPosition (cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var input = document.getElementById(inputId);
        var inputParent = null;
        var coord = [];
        var offset;
        var borderTop = 0;
        var borderBottom = 0;

        if (input) {
            // Using the parent help us determine the (x,y) for calendar
            inputParent = input.parentNode;

            // Parent must be positioned at least relative
            inputParent.style.position = 'relative';

            // Get parent's coordinates
            offset = $(inputParent).offset();
            coord = [offset.left, offset.top];

            // Set 'x' value to calendar
            cal.style.left = coord[0] + 'px';

            // Calculate 'y' value
            borderTop = parseInt($(input).css('border-top-width'), 10);
            borderBottom = parseInt($(input).css('border-bottom-width'), 10);

            // Set 'y' value to calendar
            cal.style.top = (coord[1] + input.clientHeight + borderTop + borderBottom + input.offsetTop) + 'px';

            cal.style.width = '260px';
        }
    };

    _priv.showDatePicker = function _showDatePicker (cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.calIcon + '_') + (ID_PREFIXES.calIcon.length + 1));

        $(cal).removeClass('cui-hidden');

        $('#' + ID_PREFIXES.calIcon + inputId).attr('title', ICON_TOOLTIP.hide);

        // Watch for body clicks and window resizing
        $body.on('click', _events._bodyClick);
        $window.on('resize', _events._windowResize);
    };

    _priv.hideDatePicker = function _hideDatePicker (cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.calIcon + '_') + (ID_PREFIXES.calIcon.length + 1));

        $(cal).addClass(CLASSES.hidden);

        $('#' + ID_PREFIXES.calIcon + inputId).attr('title', ICON_TOOLTIP.show);
    };

    _priv.hideAllDatePickers = function _hideAllDatePickers (inputId) {
        if (!inputId || typeof inputId !== 'string') {
            inputId = '';
        }

        $('div.dp').each(function () {
            var $cal = $(this);
            var icon;

            if (this.id !== (ID_PREFIXES.datePicker + inputId)) {
                if (!$cal.hasClass(CLASSES.hidden)) {
                    $cal.addClass(CLASSES.hidden);

                    icon = document.getElementById(ID_PREFIXES.calIcon + this.id.substring(this.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)));

                    if (icon) {
                        icon.title = ICON_TOOLTIP.show;
                    }
                }
            }
        });

        // Stop watching for body clicks and window resizing
        $body.off('click', _events._bodyClick);
        $window.off('resize', _events._windowResize);
    };

    _priv.showHideOptions = function _showHideOptions (elem, opts, forceHide) {

        var inputId = opts.id.substring(opts.id.indexOf('_') + 1);
        var $opts = $(opts);
        var cal = document.getElementById(ID_PREFIXES.datePicker + inputId);
        var monthYear = _priv.getMonthYearFromCalHeader(cal);

        forceHide = forceHide || false;

        if ($opts.hasClass(CLASSES.hidden) && !forceHide) {
            // get current month and year in calendar and set hidden in case they changed
            document.getElementById(ID_PREFIXES.selectedMonth + inputId).value = monthYear[0];
            document.getElementById(ID_PREFIXES.selectedYear + inputId).value = monthYear[1];

            // then refresh options to have selected month/year
            $opts.find('div.dpMon').html(_priv.setOptionsMonths(_priv.convertDMYToNumeric({day: 1, month: monthYear[0], year: monthYear[1]}), inputId));

            $opts.find('div.dpYr').html(_priv.setOptionsYears(_priv.convertDMYToNumeric({day: 1, month: monthYear[0], year: monthYear[1]}), inputId));

            _priv.positionOptions(elem, opts);

            elem.title = OPTIONS_TOOLTIP.hide;

            _priv.showOptions(opts);

            if (_priv.getSettings(inputId).display.enableBoundaryDetection) {
                _priv.handleBoundaryDetection(opts);
            }

            $opts.focus();
        }
        else {
            elem.title = OPTIONS_TOOLTIP.show;

            _priv.hideOptions(opts);

            $(elem).focus();
        }
    };

    _priv.setOptionsSelectedMonth = function _setOptionsSelectedMonth (elem, opts, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var selMonth = document.getElementById(ID_PREFIXES.selectedMonth + inputId);

        // Unhighlight all months
        $(opts).find('a, span.disabled').each(function () {
            $(this).parent().removeClass(CLASSES.selected);
        });

        // Highlight selected month
        $(elem).parent().addClass(CLASSES.selected);

        selMonth.value = _priv.getMonthValFromShortStr(elem.innerHTML);
    };

    _priv.setOptionsSelectedYear = function _setOptionsSelectedYear (elem, opts, cal) {
        var yr = elem.innerHTML;
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var selMonth = document.getElementById(ID_PREFIXES.selectedMonth + inputId);
        var selYear = document.getElementById(ID_PREFIXES.selectedYear + inputId);
        var divMonths = $('#dpOptions_' + inputId + ' div.dpMon').get(0);

        // Unhighlight all years
        $(opts).find('a').each(function () {
            $(this).parent().removeClass(CLASSES.selected);
        });

        // Highlight selected year
        $(elem).parent().addClass(CLASSES.selected);

        selYear.value = yr;

        // Make sure only proper months are available for selected yr
        divMonths.innerHTML = _priv.setOptionsMonths(_priv.convertDMYToNumeric({day: 1, month: selMonth.value, year: yr}), inputId);
    };

    _priv.setOptionsYears = function _setOptionsYears (dmyCal, inputId) {
        var html = '';
        var i = 0;
        var selYear = document.getElementById(ID_PREFIXES.selectedYear + inputId);

        dmyCal.year = parseInt(dmyCal.year, 10);

        if (selYear) {
            selYear = parseInt(selYear.value, 10);
        }
        else {
            selYear = dmyCal.year;
        }

        html += '<ul>';

        while (i < 10) {
            html += '<li class="';
            if ((i % 2) === 0) {
                html += 'newLine';
            }

            if ((dmyCal.year - (5 - i)) === selYear) {
                html += ' selected';
            }

            // Validate date and show as clickable or read-only
            if (_priv.validateMinMaxRange({day: 0, month: 0, year: (dmyCal.year - (5 - i))}, inputId)) {
                html += '"><a href="#" title="' + (dmyCal.year - (5 - i)) + '" tabindex="0">' + (dmyCal.year - (5 - i)) + '</a>';
            }
            else {
                html += '"><span class="disabled">' + (dmyCal.year - (5 - i)) + '</span>';
            }

            // Set hidden for efficiency on navigation purposes
            if (i === 0) {
                html += '<input type="hidden" id="startOptYr_' + inputId + '" value="' + (dmyCal.year - (5 - i)) + '"></li>';
            }
            else if (i === 9) {
                html += '<input type="hidden" id="endOptYr_' + inputId + '" value="' + (dmyCal.year - (5 - i)) + '"></li>';
            }
            else {
                html += '</li>';
            }
            i += 1;
        }

        // Option"s actions
        if (_priv.validateMinMaxRange({day: 0, month: 0, year: (dmyCal.year - 6)}, inputId)) {
            html += '<li class="newLine"><a href="#" class="fastNavPrevYrs" title="Previous years" tabindex="0"></a></li>';
        }
        else {
            html += '<li class="newLine"><span class="grayedOut"></span></li>';
        }

        if (_priv.validateMinMaxRange({day: 0, month: 0, year: (dmyCal.year + 5)}, inputId)) {
            html += '<li><a href="#" class="fastNavNextYrs" title="Next years" tabindex="0"></a></li>';
        }
        else {
            html += '<li><span class="grayedOut"></span></li>';
        }

        html += '</ul><input type="hidden" id="selYr_' + inputId + '" value="' + selYear.toString() + '">';

        return html;
    };

    _priv.setOptionsMonths = function _setOptionsMonths (dmyCal, inputId) {
        var html ='';
        var i = 0;
        var selMonth = document.getElementById(ID_PREFIXES.selectedMonth + inputId);

        if (selMonth) {
            selMonth = parseInt(selMonth.value, 10);
        }
        else {
            selMonth = dmyCal.month;
        }

        html += '<ul>';

        // Add available months
        while (i < 12) {
            html += '<li class="';
            if ((i % 2) === 0) {
                html += 'newLine';
            }

            // If month is 0, ignore highlighting keep current one
            if ((i + 1) === selMonth) {
                html += ' selected';
            }

            // Validate date and show as clickable or read-only
            if (_priv.validateMinMaxRange({day: 1, month: (i + 1), year: dmyCal.year}, inputId) || _priv.validateMinMaxRange({day: _priv.getLastDayOfMonth(new Date((i + 1) + '/01/' + dmyCal.year)), month: (i + 1), year: dmyCal.year}, inputId)) {
                html += '"><a href="#" title="' + MONTH_EN[i] + '" tabindex="0">' + MSHORT_EN[i] + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + MSHORT_EN[i] + '</span></li>';
            }

            i += 1;
        }

        html += '</ul><input type="hidden" id="selMon_' + inputId + '" value="' + selMonth.toString() + '">';

        return html;
    };

    _priv.positionOptions = function _positionOptions (elem, option) {
        // Set 'x' and 'y' value to options
        option.style.left = parseInt(elem.offsetLeft + (elem.clientWidth / 2), 10) + 'px';
        option.style.top = elem.clientHeight + 'px';
    };

    _priv.showOptions = function _showOptions (opts) {
        $(opts).removeClass(CLASSES.hidden);
    };

    _priv.hideOptions = function _hideOptions (opts) {
        $(opts).addClass(CLASSES.hidden);
    };

    _priv.handleBoundaryDetection = function _handleBoundaryDetection (elem) {
        var bodyElem = document.body;
        var scrollLeft = bodyElem.scrollLeft;
        var scrollTop = bodyElem.scrollTop;
        var viewportHeight = window.innerHeight || document.body.parentElement.offsetHeight;

        // Get scrollbar positions
        if (scrollTop === 0) {
            if (bodyElem.parentElement.scrollTop !== 0) {
                scrollTop = bodyElem.parentElement.scrollTop;
            }
        }
        if (scrollLeft === 0) {
            if (bodyElem.parentElement.scrollLeft !== 0) {
                scrollLeft = bodyElem.parentElement.scrollLeft;
            }
        }

        // Vertical boundary top
        if ((viewportHeight - (elem.parentNode.offsetTop + 1) - (elem.offsetTop - scrollTop) - 20) < elem.clientHeight) {
            window.scrollBy(0, elem.clientHeight - (viewportHeight - (elem.parentNode.offsetTop + 1) - (elem.offsetTop - scrollTop) - 20));
        }

        // Horizontal boundary left
        if ((bodyElem.clientWidth - (elem.offsetLeft + elem.parentNode.offsetLeft) + scrollLeft - 5) < elem.clientWidth) {
            window.scrollBy(elem.clientWidth - (bodyElem.clientWidth - (elem.offsetLeft + elem.parentNode.offsetLeft) + scrollLeft) + 5, 0);
        }

        // Horizontal boundary right
        if (scrollLeft - elem.offsetLeft - elem.parentNode.offsetLeft + 5 > 0) {
            window.scrollBy(-1 * (scrollLeft - elem.offsetLeft - elem.parentNode.offsetLeft + 5), 0);
        }
    };

    _priv.getMonthValFromLongStr = function _getMonthValFromLongStr (monthStr) {
        var i = MONTH_EN.length;

        while ((i -= 1) >= 0) {
            if (monthStr === MONTH_EN[i]) {
                i += 1;
                break;
            }
        }

        return i;
    };

    _priv.getMonthValFromShortStr = function _getMonthValFromShortStr (monthStr) {
        var i = MSHORT_EN.length;

        while ((i -= 1) >= 0) {
            if (monthStr === MSHORT_EN[i]) {
                i += 1;
                break;
            }
        }

        return i;
    };

    _priv.getMonthYearFromCalHeader = function _getMonthYearFromCalHeader (cal) {
        var monthYear = $(cal).find('a.monthYear').get(0);
        var splitMonYr = monthYear.innerHTML.split(' ');
        var mon = _priv.getMonthValFromLongStr(splitMonYr[0]);
        var yr = splitMonYr[1];

        return [mon, yr];
    };

    _priv.getLastDayOfMonth = function _getLastDayOfMonth (date) {
        var mon = date.getMonth() + 1;
        var lastDayMonth = 0;
        var dateTest = null;

        lastDayMonth = DAYS_MON[mon - 1];
        // Check for leap year
        if (mon === 2) {
            dateTest = new Date('02/29/' + date.getFullYear());
            if ((dateTest.getMonth() + 1) === mon) {
                lastDayMonth += 1;
            }
        }

        return lastDayMonth;
    };

    _priv.getDatePickerInitialDate = function _getDatePickerInitialDate (inputId) {
        var input = document.getElementById(inputId);

        // Returns date as 'Month Year'
        var _buildCalDate = function _buildCalDate (dateParsed) {
                // local variables
                var date = null;

                if (!dateParsed.valid) {
                    date = new Date();
                }
                else {
                    date = new Date(dateParsed.dmy.month + '/' + dateParsed.dmy.day + '/' + dateParsed.dmy.year);
                }
                return {
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear()
                };
            };

        if (input) {
            // Clean and validate date
            return _buildCalDate(_priv.processDate($.trim(input.value), inputId));
        }
    };

    _priv.getFormattedDate = function _getFormattedDate (dateStr, inputId) {
        var dateParsed = {};

        // Validate date
        dateParsed = _priv.processDate($.trim(dateStr), inputId);

        if (dateParsed.valid) {
            return dateParsed.stringValue;
        }

        return null;
    };

    _priv.processDate = function _processDate (dateStr, inputId) {
        var dateParsed = {
                valid: false,
                dmy: {},
                stringValue: ''
            };
        var splitDate = {};
        var dateTest = null;
        var settings = _priv.getSettings(inputId);

        dateParsed.stringValue = dateStr;

        // Get day, month and year separate
        splitDate = _priv.getDateFromCulture(dateStr, inputId);

        dateParsed.dmy = splitDate.dmy;
        dateParsed.stringValue = splitDate.ordered[0] + CULTURES[settings.culture].delim + splitDate.ordered[1] + CULTURES[settings.culture].delim + splitDate.ordered[2];

        // Normalized date string (0d/0m/yyyy)
        dateStr = dateParsed.stringValue;

        // Validate
        if (dateStr.length === CULTURES[settings.culture].mask.length) {
            dateTest = new Date(dateParsed.dmy.month + '/' + dateParsed.dmy.day + '/' + dateParsed.dmy.year);

            // Month has to match otherwise either day of month are invalid (checks for leap year)
            if (parseInt(dateParsed.dmy.month, 10) === (dateTest.getMonth() + 1)) {
                dateParsed.valid = _priv.validateMinMaxRange(_priv.convertDMYToNumeric(dateParsed.dmy), inputId);
            }
        }

        return dateParsed;
    };

    _priv.convertDMYToNumeric = function _convertDMYToNumeric (dmy) {
        return {
            day: parseInt(dmy.day, 10),
            month: parseInt(dmy.month, 10),
            year: parseInt(dmy.year, 10)
        };
    };

    _priv.validateMinMaxRange = function _validateMinMaxRange (dmyCal, inputId) {
        var settings = _priv.getSettings(inputId);
        var minDate = _priv.parseDateStringToDateObject(settings.minDate, inputId);
        var maxDate = _priv.parseDateStringToDateObject(settings.maxDate, inputId);
        var dateTest = null;

        if (dmyCal.day === 0 && dmyCal.month === 0) {
            // Validate year only
            if (dmyCal.year >= minDate.getFullYear() && dmyCal.year <= maxDate.getFullYear()) {
                return true;
            }
        }
        else {
            dateTest = new Date(dmyCal.month + '/' + dmyCal.day + '/' + dmyCal.year);

            if (dateTest >= minDate && dateTest <= maxDate) {
                return true;
            }
        }

        return false;
    };

    _priv.getDateFromCulture = function _getDateFromCulture (dateStr, inputId) {
        var dateParsed = {
                dmy: {
                    day: '',
                    month: '',
                    year: ''
                },
                ordered: []
            };
        var day = '';
        var mon = '';
        var yr = '';
        var settings = _priv.getSettings(inputId);
        var dateSplit = dateStr.split(CULTURES[settings.culture].delim);
        var maskSplit = CULTURES[settings.culture].mask.split('|');
        var i = dateSplit.length;
        var j = 0;

        // Date split and mask split must match in length
        if (i === maskSplit.length) {
            // Get day, month and year and add to [day, mon, yr] array
            while (j < i) {
                switch (maskSplit[j]) {
                    case 'DD':
                        day = parseInt(dateSplit[j], 10);
                        if (!isNaN(day)) {
                            if (day < 10) {
                                dateParsed.dmy.day = '0' + day;
                            }
                            else {
                                dateParsed.dmy.day = day.toString();
                            }
                            dateParsed.ordered[j] = dateParsed.dmy.day;
                        }

                        break;
                    case 'MM':
                        mon = parseInt(dateSplit[j], 10);
                        if (!isNaN(mon)) {
                            if (mon < 10) {
                                dateParsed.dmy.month = '0' + mon;
                            }
                            else {
                                dateParsed.dmy.month = mon.toString();
                            }
                            dateParsed.ordered[j] = dateParsed.dmy.month;
                        }
                        break;
                    case 'YYYY':
                        yr = parseInt(dateSplit[j], 10);
                        if (!isNaN(yr)) {
                            dateParsed.dmy.year = yr.toString();
                            dateParsed.ordered[j] = dateParsed.dmy.year;
                        }
                        break;
                    default:
                        break;
                }

                j += 1;
            }
        }

        return dateParsed;
    };

    _priv.parseDateStringToDateObject = function _parseDateStringToDateObject (dateStr, inputId) {
        var dateDMY = _priv.getDateFromCulture(dateStr, inputId);

        return new Date(dateDMY.dmy.month + '/' + dateDMY.dmy.day + '/' + dateDMY.dmy.year);
    };

    _priv.setDateToCulture = function _setDateToCulture (dmyCal, inputId, culture) {
        if (typeof culture === 'undefined') {
            return _priv.setDateToSelectedCulture(dmyCal, inputId, CULTURES[_priv.getSettings(inputId).culture]);
        }
        else {
            return _priv.setDateToSelectedCulture(dmyCal, inputId, culture);
        }
    };

    _priv.setDateToSelectedCulture = function _setDateToSelectedCulture (dmyCal, inputId, culture) {
        var maskSplit = culture.mask.split('|');
        var i = maskSplit.length;
        var j = 0;
        var dateStr = '';

        // Set day, month and year as a string date based on the culture's date
        while (j < i) {
            switch (maskSplit[j]) {
                case 'DD':
                    dateStr += dmyCal.day.toString() + culture.delim;
                    break;
                case 'MM':
                    dateStr += dmyCal.month.toString() + culture.delim;
                    break;
                case 'YYYY':
                    dateStr += dmyCal.year.toString() + culture.delim;
                    break;
                default:
                    break;
            }

            j += 1;
        }

        return dateStr.substring(0, dateStr.length - 1);
    };

    _priv.runOptionsActions = function _runOptionsActions (elem, opts, cal) {
        var actions = $(opts).find('a');
        var i = actions.length;
        var j = 0;

        while (j < i) {
            if (actions.get(j) === elem) {
                switch (j) {
                    case 0:
                        _priv.runOptionsToday(cal);
                        break;

                    case 1:
                        _priv.runOptionsOK(cal);
                        break;

                    case 2:
                        _priv.runOptionsClose(cal);
                        break;

                    default:
                        break;
                }

                break;
            }

            j += 1;
        }
    };

    _priv.runOptionsToday = function _runOptionsToday (cal) {
        _priv.setSelectedDate(null, cal);
    };

    _priv.runOptionsOK = function _runOptionsOK (cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var selMonth = document.getElementById(ID_PREFIXES.selectedMonth + inputId);
        var selYear = document.getElementById(ID_PREFIXES.selectedYear + inputId);
        var settings = _priv.getSettings(inputId);
        var minDate = _priv.parseDateStringToDateObject(settings.minDate, inputId);
        var maxDate = _priv.parseDateStringToDateObject(settings.maxDate, inputId);
        var dateTest = new Date(selMonth.value + '/01/' + selYear.value);

        // Check if month is available for year selected, else default to minDate/maxDate's month
        if (!_priv.validateMinMaxRange(_priv.convertDMYToNumeric({day: 1, month: selMonth.value, year: selYear.value}), inputId)) {
            if (dateTest < minDate) {
                selMonth.value = minDate.getMonth() + 1;
            }
            else if (dateTest > maxDate) {
                selMonth.value = maxDate.getMonth() + 1;
            }
        }

        cal.innerHTML = _priv.getDatePickerHtml(
                            _priv.convertDMYToNumeric(
                                {
                                    day: 1,
                                    month: selMonth.value,
                                    year: selYear.value
                                }
                            ), inputId);

        _priv.runOptionsClose(cal);
    };

    _priv.runOptionsClose = function _runOptionsClose (cal) {
        _priv.showHideOptions($(cal).find('a.monthYear').get(0), document.getElementById('dpOptions_' + cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1))), true);
    };

    _priv.getSelectedDate = function _getSelectedDate (elem, cal) {
        var dmyCal = {};
        var inputId = '';
        var hidden = null;
        var splitHdn = [];
        var $parent;
        var todaysDate = new Date();

        if (elem) {
            // Get date from calendar click
            inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
            hidden = document.getElementById('dpSel_' + inputId);
            splitHdn = hidden.value.split('/');
            dmyCal = {
                day: parseInt(elem.innerHTML, 10),
                month: parseInt(splitHdn[0], 10),
                year: parseInt(splitHdn[1], 10)
            };

            $parent = $(elem.parentNode);

            if ($parent.hasClass('prevMonthDay')) {
                dmyCal.month -= 1;

                if (dmyCal.month < 1) {
                    dmyCal.month = 12;
                    dmyCal.year -= 1;
                }
            }
            else if ($parent.hasClass('nextMonthDay')) {
                dmyCal.month += 1;

                if (dmyCal.month > 12) {
                    dmyCal.month = 1;
                    dmyCal.year += 1;
                }
            }
        }
        else {
            // Use today's date
            dmyCal = {day: todaysDate.getDate(), month: todaysDate.getMonth() + 1, year: todaysDate.getFullYear()};
        }

        return dmyCal;
    };

    /**
     * Set the date to the beginning or end of the previous year
     *
     * Note that this function is almost identical to `_priv.setSelectedDate` (which is called when the user clicks on a date) except that it alters the date before writing to the input
     *
     * @param   {Element}  elem       Button that was clicked (semi-optional; see `quickDate`)
     * @param   {Element}  cal        Datepicker (required)
     * @param   {Object}   alterDate  Defines how the date should be altered (optionl, but requires that `elem` is defined properly)
     */
    _priv.setSelectedDate = function _setSelectedDate (elem, cal, alterDate) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var input = document.getElementById(inputId);
        var dmyCal = _priv.getSelectedDate(elem, cal);
        var settings = _priv.getSettings(inputId);

        // Handle quick links that insert special dates
        if (elem && alterDate) {
            // Previous year
            if (alterDate.type === 'prevYear') {
                // Change date to the previous year
                dmyCal.year -= 1;

                // End of that year
                if (alterDate.value === 'dec31') {
                    dmyCal.day = 31;
                    dmyCal.month = 12;
                }
                // Beginning of that year
                else if (alterDate.value === 'jan1') {
                    dmyCal.day = 1;
                    dmyCal.month = 1;
                }
            }
        }

        // Set input's value with selected day
        input.value = _priv.getFormattedDate(_priv.setDateToCulture(dmyCal, inputId), inputId);

        // Inform event listeners that are attached to this input that its value has changed
        $(input).trigger('change');

        if (settings.display.autoError) {
            _priv.removeInlineError(input);
        }

        _priv.hideDatePicker(cal);

        $('#' + ID_PREFIXES.calIcon + inputId).focus();
    };

    _priv.handleCalHeaderNavigation = function _handleCalHeaderNavigation (elem, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var monthYear = _priv.getMonthYearFromCalHeader(cal);
        var dmyCal = {
                day: 1,
                month: monthYear[0],
                year: monthYear[1]
            };
        var settings = _priv.getSettings(inputId);
        var minDate = _priv.parseDateStringToDateObject(settings.minDate, inputId);
        var maxDate = _priv.parseDateStringToDateObject(settings.maxDate, inputId);
        var minDateMonth = minDate.getMonth() + 1;
        var maxDateMonth = maxDate.getMonth() + 1;
        var minDateYear = minDate.getFullYear();
        var maxDateYear = maxDate.getFullYear();
        var className = '';

        if (typeof elem === 'string') {
            className = elem;
        }
        else {
            className = elem.className;
        }

        switch (className) {
            case 'fastNavPrevQtr':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === minDateMonth && dmyCal.year === minDateYear)) {
                    dmyCal.day = _priv.getLastDayOfMonth(new Date('01/' + monthYear[0] + '/' + monthYear[1]));
                    dmyCal = _priv.previousQuarter(_priv.convertDMYToNumeric(dmyCal));

                    if (_priv.validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);

                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                    else {
                        // Move to the earliest month as I can go allowed by minDate
                        if (dmyCal.month < minDateMonth || dmyCal.year < minDateYear) {
                            dmyCal.month = minDateMonth;
                            dmyCal.year = minDateYear;
                            cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);

                            if (cal.innerHTML.indexOf(elem.className) > -1) {
                                $(cal).find('a.' + elem.className).focus();
                            }
                            else {
                                $(cal).find('a.monthYear').focus();
                            }
                        }
                    }
                }
                break;

            case 'navPrevMon':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === minDateMonth && dmyCal.year === minDateYear)) {
                    dmyCal.day = _priv.getLastDayOfMonth(new Date('01/' + monthYear[0] + '/' + monthYear[1]));
                    dmyCal = _priv.previousMonth(_priv.convertDMYToNumeric(dmyCal));

                    if (_priv.validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);

                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                }
                break;

            case 'navNextMon':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal = _priv.nextMonth(_priv.convertDMYToNumeric(dmyCal));

                    if (_priv.validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);

                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                }
                break;

            case 'fastNavNextQtr':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal = _priv.nextQuarter(_priv.convertDMYToNumeric(dmyCal));

                    if (_priv.validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);

                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                    else {
                        // Move to the latest month as I can go allowed by maxDate
                        if (dmyCal.month > maxDateMonth || dmyCal.year > maxDate.getFullYear()) {
                            dmyCal.month = maxDateMonth;
                            dmyCal.year = maxDateYear;
                            cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);

                            if (cal.innerHTML.indexOf(elem.className) > -1) {
                                $(cal).find('a.' + elem.className).focus();
                            }
                            else {
                                $(cal).find('a.monthYear').focus();
                            }
                        }
                    }
                }
                break;

            case 'navPrevYear':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal.day = _priv.getLastDayOfMonth(new Date('01/' + monthYear[0] + '/' + monthYear[1]));
                    dmyCal = _priv.previousYear(_priv.convertDMYToNumeric(dmyCal));

                    if (_priv.validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);
                    }
                }
                break;

            case 'navNextYear':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal = _priv.nextYear(_priv.convertDMYToNumeric(dmyCal));

                    if (_priv.validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv.getDatePickerHtml(dmyCal, inputId);
                    }
                }
                break;

            default:
                break;
        }
    };

    _priv.handleOptionsNavigation = function _handleOptionsNavigation (elem, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var startOptYr = parseInt(document.getElementById('startOptYr_' + inputId).value, 10);
        var endOptYr = parseInt(document.getElementById('endOptYr_' + inputId).value, 10);
        var selYear = parseInt(document.getElementById(ID_PREFIXES.selectedYear + inputId).value, 10);
        var divMonths = $('#dpOptions_' + inputId).find('div.dpMon').get(0);
        var divYears = $('#dpOptions_' + inputId).find('div.dpYr').get(0);
        var settings = _priv.getSettings(inputId);
        var minDate = _priv.parseDateStringToDateObject(settings.minDate, inputId);
        var maxDate = _priv.parseDateStringToDateObject(settings.maxDate, inputId);

        switch (elem.className) {
            case 'fastNavPrevYrs':
                // Make sure we can only navigate to allowed years by min/max date
                if (_priv.validateMinMaxRange({day: 31, month: 12, year: (startOptYr - 1)}, inputId)) {
                    divYears.innerHTML = _priv.setOptionsYears({day: 1, month: 1, year: (startOptYr - 5)}, inputId);

                    if (selYear >= (startOptYr - 10) && selYear < startOptYr) {
                        divMonths.innerHTML = _priv.setOptionsMonths({day: 31, month: 12, year: selYear}, inputId);
                    }
                    else {
                        divMonths.innerHTML = _priv.setOptionsMonths({day: 31, month: 12, year: (startOptYr - 1)}, inputId);
                    }

                    if (minDate.getFullYear() < (startOptYr - 10)) {
                        $(cal).find('a.' + elem.className).focus();
                    }
                    else {
                        $(cal).find('a.fastNavNextYrs').focus();
                    }
                }
                break;

            case 'fastNavNextYrs':
                // Make sure we can only navigate to allowed years by min/max date
                if (_priv.validateMinMaxRange({day: 1, month: 1, year: (endOptYr + 1)}, inputId)) {
                    divYears.innerHTML = _priv.setOptionsYears({day: 1, month: 1, year: (endOptYr + 6)}, inputId);

                    if (selYear > endOptYr && selYear <= (endOptYr + 10)) {
                        divMonths.innerHTML = _priv.setOptionsMonths({day: 1, month: 1, year: selYear}, inputId);
                    }
                    else {
                        divMonths.innerHTML = _priv.setOptionsMonths({day: 1, month: 1, year: (endOptYr + 1)}, inputId);
                    }

                    if (maxDate.getFullYear() > (endOptYr + 10)) {
                        $(cal).find('a.' + elem.className).focus();
                    }
                    else {
                        $(cal).find('a.fastNavPrevYrs').focus();
                    }
                }
                break;
        }
    };

    /**
     * Subtract 3 months and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.previousQuarter = function _previousQuarter (dmyCal) {
        dmyCal.month += -3;

        return _priv.recalculateDMY(dmyCal);
    };

    /**
     * Subtract 1 month and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.previousMonth = function _previousMonth (dmyCal) {
        dmyCal.month += -1;

        return _priv.recalculateDMY(dmyCal);
    };

    /**
     * Add 1 month and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.nextMonth = function _nextMonth (dmyCal) {
        dmyCal.month += 1;

        return _priv.recalculateDMY(dmyCal);
    };

    /**
     * Add 3 months and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.nextQuarter = function _nextQuarter (dmyCal) {
        dmyCal.month += 3;

        return _priv.recalculateDMY(dmyCal);
    };

    /**
     * Subtract 1 year and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.previousYear = function _previousYear (dmyCal) {
        dmyCal.month += -12;

        return _priv.recalculateDMY(dmyCal);
    };

    /**
     * Add 1 year and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.nextYear = function _nextYear (dmyCal) {
        dmyCal.month += 12;

        return _priv.recalculateDMY(dmyCal);
    };

    /**
     * Correct the date for a calendar that has had its month or year changed
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv.recalculateDMY = function _recalculateDMY (dmyCal) {
        if (dmyCal.month <= 0) {
            dmyCal.month += 12;
            dmyCal.year -= 1;
        }
        else if (dmyCal.month > 12) {
            dmyCal.month -= 12;
            dmyCal.year += 1;
        }

        return dmyCal;
    };

    _priv.showInlineError = function _showInlineError (elem) {
        $(elem).addClass(CLASSES.invalidDate);
    };

    _priv.removeInlineError = function _removeInlineError (elem) {
        $(elem).removeClass(CLASSES.invalidDate);
    };

    _priv.forceOptionsOK = function _forceOptionsOK (cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var okBtn = document.getElementById('dpOK_' + inputId);
        var opts = document.getElementById('dpOther_' + inputId);

        _priv.runOptionsActions(okBtn, opts, cal);
    };

    ////////////
    // Events //
    ////////////

    _events._iconClick = function _iconClick (ev) {
        var target = ev.target;

        if (!target.id) {
            var $button = $(target);
            var $input = $button.prev('input');
            var inputId = $input.attr('id');

            if (inputId === undefined || inputId === null) {
                var tempId = _priv.generateID();

                $input.attr('id', tempId);
                $button.attr('id', 'cal_' + tempId);
            }
            else {
                $button.attr('id', 'cal_' + inputId);
            }
        }

        var iconId = target.id.substring(target.id.indexOf(ID_PREFIXES.calIcon) + ID_PREFIXES.calIcon.length);
        var cal = document.getElementById(ID_PREFIXES.datePicker + iconId);

        // Hide other datepickers
        _priv.hideAllDatePickers(iconId);

        _priv.showHideDatePicker(target, cal);

        // Do we need this?
        ev.stopPropagation();
    };

    _events._inputKeyup = function _inputKeyup (evt) {
        var $input;
        var entry;
        var newDate;
        var dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
        // Validate the user's entry and normalize the date value as mm/dd/yyyy
        var __validateDate = function __validateDate (value) {
            var parts; // Pieces of the date (month, day, and year)

            // Only proceed if the value is a valid date
            if (dateRegex.test(value)) {
                // Make sure the month and day are zero-padded so it exactly fits the MM/DD/YYYY format
                parts = dateRegex.exec(value);

                // Reset the value to an empty string which will will build back up with the matching pieces from the regex
                value = '';

                // Month
                if (parts[1].length === 1) {
                    value += '0';
                }

                value += parts[1] + '/';

                // Day
                if (parts[2].length === 1) {
                    value += '0';
                }

                value += parts[2] + '/';

                // Year
                value += parts[3];

                return value;
            }
            else {
                return '';
            }
        };
        var __formatDate = function __formatDate (dateObj) {
            var newDateMonth;
            var newDateDay;

            // Month
            newDateMonth = dateObj.getMonth() + 1;

            // Zero-pad month
            if (newDateMonth < 10) {
                newDateMonth = '0' + newDateMonth;
            }

            // Date
            newDateDate = dateObj.getDate();

            // Zero-pad date
            if (newDateDate < 10) {
                newDateDate = '0' + newDateDate;
            }

            return newDateMonth + '/' + newDateDate + '/' + dateObj.getFullYear();
        };

        // Only proceed if the up or down arrow key was pressed
        if (evt.keyCode !== 38 && evt.keyCode !== 40) {
            return true;
        }

        $input = $(evt.target);

        // Validate date
        // entry = __validateDate($input.val().trim());
        entry = $input.val().trim();

        if (!dateRegex.test(entry)) {
            return true;
        }

        // Up arrow was pressed
        if (evt.keyCode === 38) {
            // If the date is valid, go to the next date
            newDate = new Date(entry);

            // Increment date object
            newDate.setDate(newDate.getDate() + 1);

            $input.val(__formatDate(newDate));
        }
        // Down arrow was pressed
        else {
            // If the date is valid, go to the previous date
            newDate = new Date(entry);

            // Increment date object
            newDate.setDate(newDate.getDate() - 1);

            $input.val(__formatDate(newDate));
        }
    };

    _events._inputBlur = function _inputBlur (ev) {

        var input = ev.target;
        var dateParsed = null;
        var settings = _priv.getSettings(input.id);

        if (input) {
            if ($.trim(input.value).length > 0) {
                dateParsed = _priv.getFormattedDate(input.value, input.id);
                if (dateParsed) {
                    input.value = dateParsed;
                    if (settings.display.autoError) {
                        _priv.removeInlineError(input);
                    }
                }
                else {
                    if (settings.display.autoError) {
                        _priv.showInlineError(input);
                    }
                }
            }
            else {
                if (settings.display.autoError) {
                    _priv.removeInlineError(input);
                }
            }
        }
    };

    _events._inputTextBlur = function _inputBlur (ev) {

    };

    _events._calClick = function _calClick (ev) {
        var icon = ev.target;
        var parent = icon;
        var clickElem = null;
        var clickParent = null;

        // Use delegation on the calendar div container to know what was clicked
        while (parent && parent.id.indexOf(ID_PREFIXES.datePicker) < 0) {
            if (parent.nodeName === 'A' || parent.nodeName === 'BUTTON') {
                clickElem = parent;
            }

            parent = parent.parentNode;

        }

        if (clickElem) {
            // We need to stop the click event from bubbling up to the body and triggering `_events._bodyClick()`. Here, we will be calling functions that replace the innerHTML of parents of the clicked element. When that happens, the target of the original event will be orphaned. When `_events._bodyClick()` checks to see if the event is inside a calendar it will not find a suitable parent; it will assume that the click happened outside a calendar and close all calendars.
            ev.stopPropagation();

            switch (clickElem.className) {
                case 'fastNavPrevQtr':
                case 'navPrevMon':
                case 'navNextMon':
                case 'fastNavNextQtr':
                    _priv.handleCalHeaderNavigation(clickElem, parent);
                    break;

                case 'monthYear':

                    _priv.showHideOptions(clickElem, document.getElementById('dpOptions_' + parent.id.substring(parent.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1))));
                    break;

                case 'fastNavPrevYrs':
                case 'fastNavNextYrs':
                    _priv.handleOptionsNavigation(clickElem, parent);
                    break;

                default:
                    // Check on parent's container to determine what was clicked
                    // Options - mon, yr, footer links, cal days
                    clickParent = clickElem;
                    while (clickParent !== parent && clickParent.nodeName !== 'BODY') {
                        if (clickParent.className === 'dpMon') {
                            _priv.setOptionsSelectedMonth(clickElem, clickParent, parent);
                            if (ev.type === 'dblclick') {
                                _priv.forceOptionsOK(parent);
                            }
                            break;
                        }
                        else if (clickParent.className === 'dpYr') {
                            _priv.setOptionsSelectedYear(clickElem, clickParent, parent);
                            if (ev.type === 'dblclick') {
                                _priv.forceOptionsOK(parent);
                            }
                            break;
                        }
                        else if (clickParent.className === 'dpOther') {
                            _priv.runOptionsActions(clickElem, clickParent, parent);
                            break;
                        }
                        // Specific date link
                        else if (clickParent.className === 'dpDays') {
                            _priv.setSelectedDate(clickElem, parent);
                            break;
                        }
                        // Quick date link
                        else if (clickParent.className === 'dpPrevYear') {
                            if (clickElem.className === 'dpPrevYearJan1') {
                                _priv.setSelectedDate(clickElem, parent, {type: 'prevYear', value: 'jan1'});
                            }
                            else if (clickElem.className === 'dpPrevYearDec31') {
                                _priv.setSelectedDate(clickElem, parent, {type: 'prevYear', value: 'dec31'});
                            }

                            break;
                        }

                        clickParent = clickParent.parentNode;
                    }

                    break;
            }
        }

        // Do we need this?
        ev.preventDefault();
    };

    _events._calKeydown = function _calKeydown (ev) {
        var elem = ev.target;
        var parentId = $(elem).closest('.dp').attr('id');
        var inputId = parentId.substring(parentId.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
        var $dpOptions = $('#dpOptions_' + inputId);
        var $calIcon = $('#' + ID_PREFIXES.calIcon + inputId);
        var calIcon = $calIcon.get(0);
        var $cal = $('#' + ID_PREFIXES.datePicker + inputId);
        var cal = $cal.get(0);
        var linksCal = [];
        var linksOpts = [];
        var isDpOptsHidden = $dpOptions.hasClass(CLASSES.hidden);

        switch (ev.keyCode) {
            case 27: // 'Esc' was pressed, close calendar
                _priv.showHideDatePicker(calIcon, cal, true);

                break;

            case 9: // 'Shift + Tab' (ev.shiftKey) or 'Tab' (!ev.shiftKey)
                linksCal = $('#dpCalWrap_' + inputId).find('a');
                linksOpts = $dpOptions.find('a');

                // Calendar
                if ((elem.id === ('dpCalWrap_' + inputId) && ev.shiftKey) || (linksCal[linksCal.length - 1] === elem && !ev.shiftKey)) {
                    _priv.hideDatePicker(cal);
                    $calIcon.focus();
                }
                // Options
                if ((elem.id === ('dpOptions_' + inputId) && ev.shiftKey) || (linksOpts[linksOpts.length - 1] === elem && !ev.shiftKey)) {
                    _priv.runOptionsClose(cal);
                }

                break;

            case 37: // left arrow goes back 1 month
                if (isDpOptsHidden) {
                    _priv.handleCalHeaderNavigation($cal.find('.navPrevMon').get(0), cal);
                }

                break;

            case 39: // right arrow goes forward 1 month
                if (isDpOptsHidden) {
                    _priv.handleCalHeaderNavigation($cal.find('.navNextMon').get(0), cal);
                }

                break;

            case 38: // up arrow goes forward 1 year
                if (isDpOptsHidden) {
                    _priv.handleCalHeaderNavigation('navNextYear', cal);
                    $cal.find('a.monthYear').focus();
                }

                break;

            case 40: // down arrow goes back 1 year
                if (isDpOptsHidden) {
                    _priv.handleCalHeaderNavigation('navPrevYear', cal);
                    $cal.find('a.monthYear').focus();
                }

                break;

            default:
                break;
        }
    };

    _events._bodyClick = function _bodyClick (ev) {
        var $target = $(ev.target);
        var $parent = $target.closest(SELECTORS.icon + ', .dp, .dpCalWrap, .dpOptWrap');

        // Check to see whether click happened inside or outside calendar
        if (!$parent.length) {
            // Make sure calendar is closed
            _priv.hideAllDatePickers();
        }
    };

    _events._windowResize = function _windowResize ( /*ev*/ ) {
        // Reposition opened calendars
        $('div.dp:not(.hidden)').each(function () {
            _priv.setDatePickerPosition(this);
        });
    };

    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    DatePicker.defaults = DatePicker.prototype.defaults;

    DatePicker.version = VERSION;

    // Define jQuery plugin
    window.$.fn.datepicker = function (options) {
        return this.each(function () {
            new DatePicker(this, options).init();
        });
    };

    // Reveal public API
    window.$.datepicker = {
        setImagesPath: _setImagesPath,
        customize: _customize,
        hideAll: _hideAll
    };
});
