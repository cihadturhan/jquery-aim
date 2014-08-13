(function($) {

    var elementList = [];
    /**
     * v Velocity of the mouse pointer
     * vd Magnitude of velocity
     * p Position of the mouse pointer
     * t Average delta time for a simple calculation of new position, x = x0 +  v * t
     * mouseX the last retrived x coordinate of mouse cursor
     * mouseY the last retrived y coordinate of mouse cursor
     * anticipator a jquery object to debug where mouse is aiming
     * anticipator.size, anticipator.radius, anticipator.center, anticipator.rect anticipator related properties
     * anRad Radius (or size) of the anticipator, increases as mouse move faster
     */

    var v = {x: 0, y: 0},
    vd = 0,
    p = {x: 0, y: 0},
    t = 12,
    mouseX = 0,
    mouseY = 0,
    DEBUG = false,
    anticipator = {
        size: 50,
        center: {x: 0, y: 0},
        effectiveSize: 1
    };
    anticipator.rect = {x0: 0, y0: 0, x1: anticipator.size, y1: anticipator.size};

    /*
     * Default anticipate function 
     * 
     * @function anticipateFunc
     * 
     * @param {type} p position of anticipator
     * @param {type} v velocity of anticipator
     * @param {type} mouseX mouse X coordinate
     * @param {type} mouseY mouse Y coordinate
     * @param {type} anticipator anticipator object
     * @returns {undefined}
     */

    function anticipateFunc(p, v, mouseX, mouseY, anticipator) {
        var a = anticipator;

        //smoothen velocity values with ratio 0.7/0.3
        if (p.x && p.y) {
            v.x = v.x * 0.7 + (mouseX - p.x) * 0.3;
            v.y = v.y * 0.7 + (mouseY - p.y) * 0.3;
        }

        p.x = mouseX;
        p.y = mouseY;

        //find velocity magnitude
        vd = Math.sqrt(v.x * v.x + v.y * v.y);
        vd < 0.1 && (v.x = 0, v.y = 0);

        //change radius according to velocity magnitude
        a.effectiveSize = Math.sqrt(a.size * vd + 1);

        //assign anticipator coordinates according to new velocity values and smoothen it with ratio 0.7/0.3
        a.center.x = a.center.x * 0.7 + (p.x + v.x * t) * 0.3;
        a.center.x < 0 && (a.center.x = 0);
        (a.center.x > $(window).width() - a.effectiveSize) && (a.center.x = $(window).width() - a.effectiveSize);

        a.rect.x0 = a.center.x - a.effectiveSize;
        a.rect.x1 = a.center.x + a.effectiveSize;

        a.center.y = a.center.y * 0.7 + (p.y + v.y * t) * 0.3;
        a.center.y < 0 && (a.center.y = 0);
        (a.center.y > $(window).height() - a.effectiveSize) && (a.center.y = $(window).height() - a.effectiveSize);

        a.rect.y0 = a.center.y - a.effectiveSize;
        a.rect.y1 = a.center.y + a.effectiveSize;
    }


    $.fn.aim = function(opts) {
        // Initialize menu-aim for all elements in jQuery collection
        this.each(function() {
            init.call(this, opts);
        });

        return this;
    };

    /*
     * Sets debug mode to true or false. If debug mode is set to true, a circle showing the 
     * position and radius of anticipator will be created
     * 
     * @param {type} val
     * @returns {undefined}
     */
    
    $.aim = {};

    $.aim.setDebug = function(val) {
        if (val) {
            if ($('#jquery-aim-debug').length) {
                return;
            }
            anticipator.elem = createDebugObject();

        } else {
            $('#jquery-aim-debug').remove();
            anticipator.elem = null;
        }
        DEBUG = val;
    };


    $.aim.setAnticipateFunction = function(func) {
        if (typeof func === 'function') {
            anticipateFunc = func;
        }
    };

    /*
     * Adds properties with jquery `.data()` function so each time it doesn't recalculate every property
     *  
     * @param {type} elem Jquery element to add properties
     * @returns {undefined} none
     */

    function addProperties($elem) {
        var percent = 0.25;
        var w = $elem.outerWidth();
        var h = $elem.outerHeight();
        var x = $elem.offset().left;
        var y = $elem.offset().top;

        var max = Math.sqrt(w * w + h * h);
        var r = max / 2 * (1 + percent);

        $elem.data('aim-data', {
            rect: {
                x0: x,
                y0: y,
                x1: x + w,
                y1: y + h
            },
            center: {x: x, y: y},
            increment: 0
        }
        );
    }

    /*
     * Creates a circle jquery object which is to be used to 
     * show where the anticipator is at any time
     * 
     * @returns {Object}
     */
    function createDebugObject() {
        var s = anticipator.size;
        var elem = $('<div>')
                .attr({
                    id: 'jquery-aim-debug'
                })
                .css({
                    width: 2 * s + 'px',
                    height: 2 * s + 'px',
                    'margin-left': -s + 'px',
                    'margin-top': -s + 'px',
                    top: 0,
                    left: 0,
                    border: '2px solid #333',
                    opacity: 0.3,
                    'background-color': 'yellowgreen',
                    position: 'absolute',
                    'pointer-events':'none'
                })
                .appendTo($('body'));
        return elem;
    }

    /*
     * Tests rectangle - rectangle intersection and gives the ratio of intersection. Max 1, min 0.
     * 
     * @param {type} rect The first rectange
     * @param {type} rect2 The second rectange
     * @returns {Number} Ratio of intersection area to area of tailblazer
     */

    function intersectRatio(rect, rect2) {

        var x_overlap = Math.max(0, Math.min(rect.x1, rect2.x1) - Math.max(rect.x0, rect2.x0));
        var y_overlap = Math.max(0, Math.min(rect.y1, rect2.y1) - Math.max(rect.y0, rect2.y0));

        return x_overlap * y_overlap / (anticipator.effectiveSize * anticipator.effectiveSize);
    }

    function init(opts) {
        var $this = $(this);
        if ($.inArray($this, elementList) > -1)
            return;

        elementList.push($this);
        addProperties($this);
        $this.data('aim-data').options = opts;
    }

    $().ready(function() {
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX,
            mouseY = e.clientY;
        }, false);
    });


    var timer = setInterval(function() {
        var a = anticipator;

        if (!elementList.length)
            return;

        anticipateFunc(p, v, mouseX, mouseY, a);


        var prop = 'translate(' + a.center.x + 'px,' + a.center.y + 'px) scale(' + a.effectiveSize / a.size + ')';

        DEBUG && a.elem.css({
            '-webkit-transform': prop,
            '-moz-transform': prop,
            '-ms-transform': prop,
            'transform': prop
                    /*width: tbRad * 2,
                     height: tbRad * 2,
                     marginLeft: -tbRad + 'px',
                     marginTop: -tbRad + 'px'*/
        });

        /* 
         * Iterate over each elements and calculate increment for all
         * In each cycle, it increases by a value between 0 - 0.2 (reaches max if it fully intersects) and decreases by 0.05
         * Increment can be between 0 and 2
         * If it's greater than 1, aimEnter function will be called
         * if it's less than or equal to 0, aimExit function will be called 
         */
        for (var i = 0; i < elementList.length; i++) {

            var target = elementList[i];

            var data = target.data('aim-data');

            var isctRat = intersectRatio(data.rect, a.rect);

            //check if they intersects and mouse is not on the element
            if (isctRat && vd !== 0) {

                data.increment = data.increment + isctRat * 0.2;
                if (data.increment > 1 && data.increment < 2) {
                    if (data.options.className)
                        target.addClass(data.options.className);
                    else if (data.options.aimEnter && typeof data.options.aimEnter === 'function')
                        data.options.aimEnter.call(target, true);

                    if (data.increment > 2) {
                        data.increment = 2;
                    }
                    DEBUG && a.elem.css('background-color', 'tomato');
                } else if (data.increment > 2) {
                    data.increment = 2;
                    DEBUG && a.elem.css('background-color', 'tomato');
                }
                break;
            } else {
                DEBUG && a.elem.css('background-color', 'yellowgreen');
            }

            if (data.increment !== 0) {
                data.increment = data.increment - 0.05;
                if (data.increment < 0) {
                    data.increment = 0;
                    if (data.options.className)
                        target.removeClass(data.options.className);
                    else if (data.options.aimExit && typeof data.options.aimExit === 'function')
                        data.options.aimExit.call(target, true);
                }
            }
        }

    }, 16); //~60 FPS

})(jQuery);