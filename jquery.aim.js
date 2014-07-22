(function($) {

    var elementList = [];
    var v = {x: 0, y: 0, r: 0, t: 0}, p = {x: 0, y: 0}, vr = 0, t = 12, mouseX = 0, mouseY = 0,
            DEBUG = false, trailblazer = null, tbSize = 50, tbRadius = 50, tbCenter = {x: 0, y: 0}, tbRect = {x0: 0, y0: 0, x1: tbSize, y1: tbSize}, tbRad = 1;

    $.fn.aim = function(opts) {
        // Initialize menu-aim for all elements in jQuery collection
        this.each(function() {
            init.call(this, opts);
        });

        return this;
    };

    $.aimDebug = setDebugMode;

    function setDebugMode(val) {
        if (val) {
            if ($('#jquery-aim-debug').length) {
                return;
            }
            trailblazer = createDebugObject();

        } else {
            $('#jquery-aim-debug').remove();
            trailblazer = null;
        }
        DEBUG = val;
    }

    function addRadius(elem) {
        var percent = 0.25;
        var w = elem.outerWidth();
        var h = elem.outerHeight();
        var x = elem.offset().left;
        var y = elem.offset().top;

        var max = Math.sqrt(w * w + h * h);
        var r = max / 2 * (1 + percent);

        elem.data('aim-data', {
            rect: {
                x0: x,
                y0: y,
                x1: x + w,
                y1: y + h
            },
            radius: r,
            center: {x: x, y: y},
            hover: 0
        }
        );
    }

    function createDebugObject() {
        var elem = $('<div>')
                .attr({
                    id: '#jquery-aim-debug'
                })
                .css({
                    width: 2 * tbRadius,
                    height: 2 * tbRadius,
                    'margin-left': -tbRadius,
                    'margin-top': -tbRadius,
                    'border-radius': '50%',
                    top: 0,
                    left: 0,
                    border: '2px solid yellowgreen',
                    'background-color': 'hsla(0,0%,0%, 0.05)',
                    position: 'absolute'
                })
                .appendTo($('body'));
        return elem;
    }

    function intersects(c1, r1, c2, r2) {
        var d2 = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
        //console.log((r1 + r2 > d2) ? (r1 + r2 - d2) / (r1 + r2) : false);
        return (r1 + r2 > d2) ? (r1 + r2 - d2) / (r1 + r2) : false;
    }

    function intersectsRects(rect, rect2) {


        var x_overlap = Math.max(0, Math.min(rect.x1, rect2.x1) - Math.max(rect.x0, rect2.x0));
        var y_overlap = Math.max(0, Math.min(rect.y1, rect2.y1) - Math.max(rect.y0, rect2.y0));

        return x_overlap * y_overlap / (tbRad * tbRad);
    }

    function init(opts) {
        var $this = $(this);
        if ($.inArray($this, elementList) > -1)
            return;

        elementList.push($this);
        addRadius($this);//TO-DO check performance of rectangular intersection
        $this.data('aim-data').options = opts;

    }

    $().ready(function() {
        document.addEventListener('mousemove', function(e) {
            mouseX = e.x, mouseY = e.y; //TO-DO: check if pageX, pageY is cross-browser or this one
        }, false);
    });


    var timer = setInterval(function() {

        if (!elementList.length)
            return;

        if (p.x && p.y) {
            v.x = v.x * 0.7 + (mouseX - p.x) * 0.3;
            v.y = v.y * 0.7 + (mouseY - p.y) * 0.3;
        }

        p.x = mouseX;
        p.y = mouseY;


        var vd = Math.sqrt(v.x * v.x + v.y * v.y);
        vd < 0.1 && (v.x = 0, v.y = 0);
        //console.log(vd);
        tbRad = Math.sqrt(tbSize * vd + 1);

        tbCenter.x = tbCenter.x * 0.7 + (p.x + v.x * t) * 0.3;
        tbCenter.x < 0 && (tbCenter.x = 0);
        (tbCenter.x > $(window).width() - tbRad) && (tbCenter.x = $(window).width() - tbRad);

        tbRect.x0 = tbCenter.x - tbRad;
        tbRect.x1 = tbCenter.x + tbRad;

        tbCenter.y = tbCenter.y * 0.7 + (p.y + v.y * t) * 0.3;
        tbCenter.y < 0 && (tbCenter.y = 0);
        (tbCenter.y > $(window).height() - tbRad) && (tbCenter.y = $(window).height() - tbRad);

        tbRect.y0 = tbCenter.y - tbRad;
        tbRect.y1 = tbCenter.y + tbRad;


        //Math.sqrt(tbRadius * vd * 5 + 1);


        //console.log(v.y);
        DEBUG && trailblazer.css({
            '-webkit-transform': 'translate(' + tbCenter.x + 'px,' + tbCenter.y + 'px) scale(' + tbRad / tbRadius + ')',
            /*width: tbRad * 2,
            height: tbRad * 2,
            marginLeft: -tbRad + 'px',
            marginTop: -tbRad + 'px'*/
        });
        for (var i = 0; i < elementList.length; i++) {

            var target = elementList[i];

            var data = target.data('aim-data');

            //var isct = intersects(data.center, data.radius, tbCenter, tbRad);
            var isct = intersectsRects(data.rect, tbRect);
            if (isct && vd !== 0) {
                data.hover = data.hover + isct * 0.2;
                // target.html(data.hover.toFixed(2));
                if (data.hover > 1 && data.hover < 1.31) {
                    if (data.options.className)
                        target.addClass(data.options.className);
                    else if (data.options.aimEnter && typeof data.options.aimEnter === 'function')
                        data.options.aimEnter.call(target, true);

                    if (data.hover > 2) {
                        data.hover = 2;
                    }
                    DEBUG && trailblazer.css('border-color', 'tomato');
                } else if (data.hover > 2) {
                    data.hover = 2;
                    DEBUG && trailblazer.css('border-color', 'tomato');
                }
                break;
            } else {
                DEBUG && trailblazer.css('border-color', 'yellowgreen');
            }

            if (data.hover !== 0) {
                data.hover = data.hover - 0.05;
                // target.html(data.hover.toFixed(2));
                if (data.hover < 0) {
                    data.hover = 0;
                    if (data.options.className)
                        target.removeClass(data.options.className);
                    else if (data.options.aimExit && typeof data.options.aimExit === 'function')
                        data.options.aimExit.call(target, true);
                }
            }
        }

    }, 16);

})(jQuery);