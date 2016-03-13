;(function(factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else if(typeof exports === 'object') {
        module.exports = factory(require("jquery"));
    }
    else {
        factory(jQuery);
    }
}
(function($) {
    var pluginName = "tinycolorpicker"
    ,   defaults   = {
            colors : ["#ffffff", "#A7194B","#FE2712","#FB9902","#FABC02","#FEFE33","#D0EA2B","#66B032","#0391CE","#0247FE","#3D01A5","#8601AF"]
        ,   backgroundUrl : null
        ,   sharedId : null
        ,   change: null
        }
    ;

    function Plugin($container, options) {
        /**
         * The options of the colorpicker extended with the defaults.
         *
         * @property options
         * @type Object
         */
        this.options = $.extend({}, defaults, options);

        /**
         * @property _defaults
         * @type Object
         * @private
         * @default defaults
         */
        this._defaults = defaults;

        /**
         * @property _name
         * @type String
         * @private
         * @final
         * @default 'tinycolorpicker'
         */
        this._name = pluginName;

        var self = this;
        var $color = $container.find(".color")
        ,   $canvas = null
        ,   $colorInput = $container.find(".colorInput")
        ,   $dropdown = null;

        if (self.options.sharedId) {
            $dropdown = $(document).find("#" + self.options.sharedId + "-dropdown");
        }
        else {
            $dropdown = $container.find(".dropdown");
        }

        var context = null
        ,   mouseIsDown = false
        ,   hasCanvas = false
        ,   touchEvents = "ontouchstart" in document.documentElement
        ;

        /**
         * The current active color in hex.
         *
         * @property colorHex
         * @type String
         * @default ""
         */
        this.colorHex = "";

        /**
         * The current active color in rgb.
         *
         * @property colorRGB
         * @type String
         * @default ""
         */
        this.colorRGB = "";

        /**
         * @method _initialize
         * @private
         */
        function _initialize() {
            var dropdownItems = $dropdown.children();
            if (dropdownItems.length === 0) {
                $.each(self.options.colors, function(index, color) {
                    var $item = $("<li>");

                    $item.css("backgroundColor", color);
                    $item.attr("data-color", color);

                    $dropdown.append($item);
                });
            }

            _setEvents();

            return self;
        }

        /**
         * @method _setEvents
         * @private
         */
        function _setEvents() {
            var eventType = touchEvents ? "touchstart" : "mousedown";

            $color.bind("mousedown", function(event) {
                event.preventDefault();
                event.stopPropagation();

                if (self.options.sharedId) {
                    $dropdown.appendTo($container);
                }
                $dropdown.toggle();
                _bindPickerClicks($container);
            });
        }

        function _bindPickerClicks($parent) {
            $dropdown.delegate("li", "mousedown", function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                var color = $(this).attr("data-color");

                self.setColor(color, $container);

                if (self.options.change) {
                    self.options.change($parent, self.colorHex, self.colorRGB);
                }
                self.close();
            });
        }

        /**
         * Set the color to a given hex or rgb color.
         *
         * @method setColor
         * @chainable
         */
        this.setColor = function(color, $invokingContainer) {
            if(color.indexOf("#") >= 0) {
                self.colorHex = color;
                self.colorRGB = self.hexToRgb(self.colorHex);
            }
            else {
                self.colorRGB = color;
                self.colorHex = self.rgbToHex(self.colorRGB);
            }

            var $myColor = $invokingContainer.find(".color");
            $myColor.find(".colorInner").css("backgroundColor", self.colorHex);
            $myColor.find(".colorInput").val(self.colorHex);
        };

        /**
         * Close the picker
         *
         * @method close
         * @chainable
         */
        this.close = function() {
            mouseIsDown = false;

            $dropdown.undelegate("li", "mousedown");
            $dropdown.hide();
        };

        /**
         * Convert hex to rgb
         *
         * @method hexToRgb
         * @chainable
         */
        this.hexToRgb = function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")";
        };

        /**
         * Convert rgb to hex
         *
         * @method rgbToHex
         * @chainable
         */
        this.rgbToHex = function(rgb) {
            var result = rgb.match(/\d+/g);

            function hex(x) {
                var digits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
                return isNaN(x) ? "00" : digits[(x - x % 16 ) / 16] + digits[x % 16];
            }

            return "#" + hex(result[0]) + hex(result[1]) + hex(result[2]);
        };

       return _initialize();
    }

    /**
     * @class tinycolorpicker
     * @constructor
     * @param {Object} options
        @param {Array} [options.colors=[]] fallback colors for old browsers (ie8-).
        @param {String} [options.backgroundUrl=''] It will look for a css image on the track div. If not found it will look if there's a url in this property.
     */
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if(!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            }
        });
    };
}));
