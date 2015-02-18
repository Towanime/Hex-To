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
    var hexEl, rgbEl, hslEl, hwbEl, cssEl, fields;

    // init variables and listeners
    function init() {
    	hexEl = $("#hex"), rgbEl = $("#rgb"), hslEl = $("#hsl"),
    		hwbEl = $("#hwb"), cssEl = $("#css");
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
			var type = from.attr('id');
			if(from.val() == ''){
				clearFields();
				return;
			}
    		var value = validateValue(type, from.val());
    		if(value !== false){
    			from.val(value);
    		}
		});	
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
    	} catch(e){
    		console.log(e);
    		//fields.val('');
    		//from.val(value);
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
				if(match && match.input.length == match[0].length){
					var validated = match[0];
					// check if there's a #
					if(match[1] === '') validated = "#"+validated;
					return validated.toUpperCase();
				}
				console.log(match)
    		break;

    		case "rgb":
    			var rgbRE = /(rgb[a]?)?\(?(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(,?\s?([0-1]\.?[0-9]?))?\)?/i;
				var match = rgbRE.exec(value);
				console.log(match)
				if(match && match.input.length == match[0].length
					&& match[2] && match[3] && match[4]){
					var begin = match[1]?match[1]:"rgb", r = match[2], g = match[3], b = match[4], a = 1;
					// does it have alpha?
					if(match[6]){
						if(parseFloat(match[6]) <= 1){
							a = match[6];
							begin = "rbga";
						}else{
							return false;
						}
					}
					// less tan 255
					if(parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255){
						if(begin == "rgb"){
							return "rgb("+r+", "+g+", "+b+")";
						}else{
							return "rgba("+r+", "+g+", "+b+", "+a+")";
						}
					}
				}
    		break;

    		default:
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
    }

    return {
        init: init
    };

})(jQuery);


$(document).ready(function() 
{
	hexTo.init();
});