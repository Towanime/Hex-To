"use strict";

var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

// module definition
var hexTo = (function ($) {
    // input
    var fromEl, toEl, fromOptions, toOptions, title, defaultColor, helpFrom, helpTo;

    // init variables and listeners
    function init() {
        fromEl = $('#from');
        toEl = $('#to');
        helpFrom = $('#help-from');
        helpTo = $('#help-to');
        // pills
        fromOptions = $('#from-options');
        toOptions = $('#to-options');
        title = $('#title');
        defaultColor = "#8C8888";

        // register listeners for the fields
        fromEl.keyup(onKeyUp);
        toEl.keyup(onKeyUp);
        fromEl.blur(onBlur);
        toEl.blur(onBlur);

        // change format
        fromOptions.find('li').click(function (e) {
            var pill = $(this);
            // if it has disabled class it can't click it
            if (pill.hasClass('disabled')) {
                e.preventDefault();
                return false;
            }

            // clear all active and set this one
            fromOptions.find('li').removeClass('active');
            pill.addClass('active');
            // set disable it's equal on the other pills
            disableFormat(toOptions, pill.attr('data-value'));

            // in case you write something not valid, check if new format is valid with the value
            if (toEl.val()) {
                convert(toEl);
            }else{
                convert(fromEl);
            }

        });

        toOptions.find('li').click(function (e) {
            var pill = $(this);
            // if it has disabled class it can't click it
            if (pill.hasClass('disabled')) {
                e.preventDefault();
                return false;
            }

            // clear all active and set this one
            toOptions.find('li').removeClass('active');
            pill.addClass('active');
            // set disable it's equal on the other pills
            disableFormat(fromOptions, pill.attr('data-value'));

            if (fromEl.val()) {
                convert(fromEl);
            }else{
                convert(toEl)
            }

        });

        // random color
        $("#btn-random").click(getRandomColor);

        // help
        helpFrom.click(help);
        helpTo.click(help)
    }

    function onKeyUp(e) {
        // ignore some keys
        if (e.which == 9 || (e.which >= 16 && e.which <= 20) || (e.which >= 37 && e.which <= 40)) return;
        var from = $(this);
        delay(function () {
            convert(from);
        }, 200);
    }

    function onBlur() {
        var from = $(this);
        var format = getActiveOptionOn(from.attr('id'));

        var value = validateValue(format, from.val());
        if (value !== false) {
            from.val(value);
        }
    }

    function convert(fromField) {
        // get target field
        var toField = (fromField.attr('id') == fromEl.attr('id')) ? toEl : fromEl;
        // get formats
        var fromFormat = getActiveOptionOn(fromField.attr('id'));
        var toFormat = getActiveOptionOn(toField.attr('id'));

        // origin type to convert from
        var value = validateValue(fromFormat, fromField.val());
        if (value === false) {
            clearFields(fromField);
            return;
        }
        var toValue = getFormatValue(toFormat, value);
        if (toValue !== false) {
            toField.val(toValue);
            // update title color
            update(new Color(value));
        }else{
            clearFields(fromField);
        }
    }

    /**
     * Returns the format selected on the list by the name provided.
     * Only two options, to and from.
     *
     * @param listName
     * @returns {*}
     */
    function getActiveOptionOn(listName) {
        return $('#' + listName + '-options').find('.active').attr('data-value');
    }

    function disableFormat(options, format){
        options.find('li').removeClass('disabled');
        options.find('li[data-value="' + format + '"]').addClass('disabled');
    }

    /**
     * Returns a string with value with the target format or false if not valid.
     *
     * @param format hex, rgb, hsl, hwb, css
     * @param value
     * @returns {*}
     */
    function getFormatValue(format, value) {
        try {
            var color = new Color(value);
            switch (format) {
                case 'hex':
                    return color.hexString();

                case 'rgb':
                    return color.rgbString();

                case 'hsl':
                    return color.hslString();

                case 'hwb':
                    return color.hwbString();

                case 'css':
                    return color.keyword();
            }
        } catch (e) {
            return false;
        }
    }

    // Depending on the origin check against regular expressions to avoid exceptions.
    function validateValue(type, value) {
        if (value.length < 3) return false;
        switch (type) {
            case "hex":
                var hexRE = /([#]?)([0-9a-f]{3})([0-9a-f]{3})?/i;
                var match = hexRE.exec(value);
                // ["#FFF153", "#", "FFF", "153", index: 0, input: "#FFF153"]
                if (match && match.input.length == match[0].length) {
                    var validated = match[0];
                    // check if there's a #
                    if (match[1] === "") validated = "#" + validated;
                    return validated.toUpperCase();
                }
                break;

            case "rgb":
                var rgbRE = /(rgb[a]?\(?)?(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(,?\s?([0-1]\.?[0-9]?))?\)?/i;
                var match = rgbRE.exec(value);
                //["rgba(255, 1, 55, 0.7)", "rgba(", "255", "1", "55", ", 0.7", "0.7", index: 0, input: "rgba(255, 1, 55, 0.7)"]
                if (match && match.input.length == match[0].length &&
                    match[2] && match[3] && match[4]) {
                    var start = match[1] ? match[1] : "rgb(", end = ")", r = match[2], g = match[3], b = match[4], a = 1;
                    // does it have alpha?
                    if (match[6] || start == "rgba(") {
                        var aValue = !match[6] ? a : parseFloat(match[6]);
                        if (aValue <= 1) {
                            a = aValue;
                            start = "rgba(";
                            end = ", " + a + ")";
                        } else {
                            return false;
                        }
                    }
                    // less tan 255
                    if (parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255) {
                        return start + r + ", " + g + ", " + b + end;
                    }
                }
                break;

            case "hsl":
            case "hwb":
                var re = /(hsl[a]?\(?|hwb\(?)?(\d{1,3}),\s?(\d{1,3}%),\s?(\d{1,3}%)(,?\s?([0-1]\.?[0-9]?))?\)?/i;
                var match = re.exec(value);
                // ["hsla(0, 0%, 100%, 1)", "hsla(", "0", "0%", "100%", ", 1", "1", index: 0, input: "hsla(0, 0%, 100%, 1)"]
                // or
                //["hwb(0, 100%, 0%, 1)", "hwb(", "0", "100%", "0%", ",1", "1", index: 0, input: "hwb(0, 100%, 0%, 1)"]
                if (match && match.input.length == match[0].length
                    && match[2] && match[3] && match[4]) {
                    var start = match[1] ? match[1] : type + "(", end = ")", p1 = match[2], p2 = match[3], p3 = match[4], a = 1;
                    // does it have alpha?
                    if (match[6] || start == "hsla(") {
                        var aValue = !match[6] ? a : parseFloat(match[6]);
                        if (aValue <= 1) {
                            a = aValue;
                            // hsla or hwb
                            start = (type == "hsl" ? "hsla(" : type + "(");
                            end = ", " + aValue + ")";
                        } else {
                            return false;
                        }
                    }
                    // less tan 255
                    if (parseInt(p1) <= 360 && parseInt(p2) <= 100 && parseInt(p3) <= 100) {
                        return start + p1 + ", " + p2 + ", " + p3 + end;
                    }
                }
                break;

            default:
                // for css strings
                return value;
                break;
        }
        return false;
    }

    function clearFields(ignore) {
        if (!ignore || fromEl.attr('id') != ignore.attr('id'))fromEl.val('');
        if (!ignore || toEl.attr('id') != ignore.attr('id'))toEl.val('');
        update();
    }

    function update(color) {
        // no color? restore to normal
        if (!color) {
            title.attr("style", "color:" + defaultColor + ";");
            return;
        }
        // new animation
        title.removeClass().addClass('animated bounceIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass();
        });
        title.attr("style", "color:" + color.hexString() + ";");
    }

    function getRandomColor(e) {
        e.preventDefault();
        // taken from http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
        // might need something better
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        // set it to hex
        fromOptions.find('li').removeClass('active');
        fromOptions.find('li[data-value="hex"]').addClass('active');
        disableFormat(toOptions, 'hex');
        // if by change the other options are hex then set to rgb
        if (getActiveOptionOn('from') == 'hex') {
            toOptions.find('li').removeClass('active');
            toOptions.find('li[data-value="rgb"]').addClass('active');
            disableFormat(fromOptions, 'rgb');
        }

        // set the text
        fromEl.val(color);
        // convert it and show
        convert(fromEl);
    }

    // show notify div with the valid formats
    function help(){
        var fieldId = $(this).prev('input').attr('id');
        var format = getActiveOptionOn(fieldId);
        $.notify(helpFor(format));
    }

    // gets an example string depending on the format
    function helpFor(format){
        switch (format){

            case 'hex':
                return '000, #000, 000000<br> or #000000';

            case 'rgb':
                return 'rgb(255, 255, 255), rgba(255, 255, 255, 1)<br> or 255, 145, 124';

            case 'hsl':
                return 'hsl(0, 0%, 100%), hsla(0, 0%, 100%, 1)<br> or 0, 85%, 50%';

            case 'hwb':
                return 'hwb(0, 0%, 100%) or 0, 85%, 50%';

            case 'css':
                return 'yellow, blue, red';
        }
    }

    return {
        init: init
    };

})(jQuery);


$(document).ready(function () {
    hexTo.init();
});