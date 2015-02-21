"use strict";
//window.Color = require("color")

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

// module definition
var hexTo = (function ($) {
 	// input
    var body, hexEl, rgbEl, hslEl, hwbEl, cssEl, fields, defaultColor;

    // init variables and listeners
    function init() {
    	hexEl = $("#hex"), rgbEl = $("#rgb"), hslEl = $("#hsl"),
    		hwbEl = $("#hwb"), cssEl = $("#css");
        defaultColor = new Color("#3d4d4d");
        body = $("body");
    	fields = $("input[type='text']");
    	fields.keyup(function(e) {
    		// ignore some keys
    		if (e.which == 9 || (e.which >= 16 && e.which <= 20) || (e.which >= 37 && e.which <= 40)) return;
    		var from = $(this);
    		delay(function(){
    			convert(from);
    		}, 200);
		});
		fields.blur(function(){
			var from = $(this);
			var type = from.attr("id");
			if(from.val() == '' && type != "css"){
				clearFields();
				return;
			}
    		var value = validateValue(type, from.val());
    		if(value !== false){
    			from.val(value);
    		}
		});
        // random color
        $("#btn-random").click(getRandomColor);
    }

    function convert(from){
    	var type = from.attr('id');
    	var value = validateValue(type, from.val());
    	if(value === false){
    		clearFields(type);
    		return;
    	}
    	try {
    		var color = new Color(value);
    		if(type != 'hex'){
    			hexEl.val(color.hexString());
    		}
    		if(type != 'rgb'){
    			rgbEl.val(color.rgbString());
    		}
    		if(type != 'hsl'){
    			hslEl.val(color.hslString());
    		}
    		if(type != 'hwb'){
    			hwbEl.val(color.hwbString());
    		}
    		if(type != 'css'){
    			cssEl.val(color.keyword());
    		}
            // update theme
            update(color);
    	} catch(e){
    		clearFields(type);
    	}
    }

    // Depending on the origin check against regular expressions to avoid exceptions.
    function validateValue(type, value){
    	if(value.length < 3) return false;
    	switch(type){
    		case "hex":
    			var hexRE = /([#]?)([0-9a-f]{3})([0-9a-f]{3})?/i;
				var match = hexRE.exec(value);
                // ["#FFF153", "#", "FFF", "153", index: 0, input: "#FFF153"]
				if(match && match.input.length == match[0].length){
					var validated = match[0];
					// check if there's a #
					if(match[1] === "") validated = "#"+validated;
					return validated.toUpperCase();
				}
    		break;

    		case "rgb":
    			var rgbRE = /(rgb[a]?\(?)?(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(,?\s?([0-1]\.?[0-9]?))?\)?/i;
				var match = rgbRE.exec(value);
                //["rgba(255, 1, 55, 0.7)", "rgba(", "255", "1", "55", ", 0.7", "0.7", index: 0, input: "rgba(255, 1, 55, 0.7)"]
				if(match && match.input.length == match[0].length
					&& match[2] && match[3] && match[4]){
					var start = match[1]?match[1]:"rgb(", end = ")", r = match[2], g = match[3], b = match[4], a = 1;
					// does it have alpha?
                     if(match[6] || start=="rgba("){
                        var aValue = !match[6]?a:parseFloat(match[6]);
                        if(aValue <= 1){
                            a = aValue;
							start = "rgba(";
                            end = ", " + a + ")";
						}else{
							return false;
						}
					}
					// less tan 255
					if(parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255){
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
                if(match && match.input.length == match[0].length
                    && match[2] && match[3] && match[4]){
                    var start = match[1]?match[1]:type+"(", end = ")", p1 = match[2], p2 = match[3], p3 = match[4], a = 1;
                    // does it have alpha?
                    if(match[6] || start=="hsla("){
                        var aValue = !match[6]?a:parseFloat(match[6]);
                        if(aValue <= 1){
                            a = aValue;
                            // hsla or hwb
                            start = (type=="hsl"?"hsla(":type+"(");
                            end = ", " + aValue + ")";
                        }else{
                            return false;
                        }
                    }
                    // less tan 255
                    if(parseInt(p1) <= 360 && parseInt(p2) <= 100 && parseInt(p3) <= 100){
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

    function clearFields(ignore){
    	fields.each(function(index, element){
    		var el = $(element);
    		if(el.attr('id') != ignore) el.val('');
    	});
        update(defaultColor);
    }

    function update(color){
        body.attr("style", "background-color:"+color.hexString()+";");
        if(isLight(color.red(), color.green(), color.blue())){
            body.attr("class", "dark");
        }else{
            body.attr("class", "light");
        }
    }

    function isLight(r, g, b){
        // taken from http://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        if (luma < 100) {
            return false;
        }else{
            return true;
        }
    }

    function getRandomColor() {
        // taken from http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
        // might need something better
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        hexEl.val(color);
        convert(hexEl);
    }

    return {
        init: init
    };

})(jQuery);


$(document).ready(function() 
{
	hexTo.init();
});