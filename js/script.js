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
    var fromEl, toEl, fromOptions, toOptions, defaultColor;

    // init variables and listeners
    function init() {
        fromEl = $('#from');
        toEl = $('#to');
        // pills
        fromOptions = $('#from-options');
        toOptions = $('#to-options');
        defaultColor = new Color("#155474");

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
            toOptions.find('li').removeClass('disabled');
            toOptions.find('li[data-value="'+pill.attr('data-value')+'"]').addClass('disabled');

            // has a value in from? convert it using the current value in toEl
            if (fromEl.val()) {
                convert(toEl);
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
            fromOptions.find('li').removeClass('disabled');
            fromOptions.find('li[data-value="'+pill.attr('data-value')+'"]').addClass('disabled');

            // has a value in from? convert it using the current value in toEl
            if (toEl.val()) {
                convert(fromEl);
            }

        });

        // random color
        $("#btn-random").click(getRandomColor);
        // format tooltips
        var tooltips = $(".tooltip");
        tooltips.click(function (e) {
            e.preventDefault();
        });
        tooltips.tooltipster({
            theme: "tooltipster-noir",
            trigger: "click",
            position: "left"
        });
        // about tooltip
        var about = $("#about");
        about.click(function (e) {
            e.preventDefault();
        });
        about.tooltipster({
            theme: "tooltipster-noir",
            trigger: "click",
            position: "bottom",
            interactive: true,
            maxWidth: 490,
            content: $("<div class=\"about\">Hi there! My name is Viktor, I created this little utility to help me convert from Hexadecimal to RGB. Hope it's useful for you as well.<br><br>You can see more on <a href=\"https://github.com/Towanime/Hex-To\" target=\"_blank\" class=\"about-link\">Github</a> or if you want to chat, hit me <a href=\"https://twitter.com/towanime\" target=\"_blank\" class=\"about\">@towanime</a>.</div>")
        });
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
        /* var from = $(this);
         var type = from.attr("id");
         if (from.val() === "" && type != "css") {
         clearFields();
         return;
         }
         var value = validateValue(type, from.val());
         if (value !== false) {
         from.val(value);
         }*/
    }

    function convert(fromField) {
        // get target field
        var toField = (fromField.attr('id') == fromEl.attr('id')) ? toEl : fromEl;
        // get formats
        var fromFormat = $('#' + fromField.attr('id') + '-options').find('.active').attr('data-value');
        var toFormat = $('#' + toField.attr('id') + '-options').find('.active').attr('data-value');

        // origin type to convert from
        var value = validateValue(fromFormat, fromField.val());
        if (value === false) {
            clearFields(fromField);
            return;
        }
        var toValue = getFormatValue(toFormat, value);
        if (toValue !== false) {
            toField.val(toValue);
        }

        // update from field too
        fromField.val(value);
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
    }

    function update(color) {
        body.attr("style", "background-color:" + color.hexString() + ";");
        if (isLight(color.red(), color.green(), color.blue())) {
            body.attr("class", "dark");
        } else {
            body.attr("class", "light");
        }
    }

    function isLight(r, g, b) {
        // taken from http://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
        /*var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
         if (luma < 100) {
         return false;
         }else{
         return true;
         }*/
        // Better results with this one - http://stackoverflow.com/questions/1754211/evaluate-whether-a-hex-value-is-dark-or-light
        var luma = (r * 0.299 + g * 0.587 + b * 0.114) / 256;
        if (luma < 0.55) {
            return false;
        } else {
            return true;
        }
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
        hexEl.val(color);
        convert(hexEl);
    }

    function shades(color) {
        // save original
        var rgb = color.rgbString();
        var html = "";
        var height = window.innerHeight / 10;
        // create divs with different colors
        for (var i = 0; i < 5; i++) {
            color.darken(0.5);
            html = getShadeDiv(color, height, "") + html;
        }
        // add main color
        color = new Color(rgb);
        html += getShadeDiv(color, height, " - Main");
        // now lighter
        for (var i = 0; i < 5; i++) {
            color.lighten(0.5);
            html += getShadeDiv(color, height, "");
        }
        shadeContainer.html(html);
        shadeContainer.offset({top: window.innerHeight});
        shadeContainer.show();
        shadeContainer.animate({
            top: 0
        }, "fast");
    }

    function getShadeDiv(color, height, extra) {
        var textClass = "";
        if (isLight(color.red(), color.green(), color.blue())) {
            textClass = "dark";
        } else {
            textClass = "light";
        }
        return "<div class=\"shade " + textClass + "\" style=\"background-color:" + color.rgbString() + ";height:" + height + "px;\"><p>" + color.rgbString() + extra + "</p></div>"
    }

    return {
        init: init
    };

})(jQuery);


$(document).ready(function () {
    hexTo.init();
});