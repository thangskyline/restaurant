var dDragController = {
    offsetX: 0,
    offsetY: 0,
    scrollX: 0,
    scrollY: 0,
    options: {
        restricted: true,
        restrictTop: 0,
        restrictLeft: 0,
        restrictBottom: 0,
        restrictRight: 0,
        drag: undefined,
        dragstart: undefined,
        dragend: undefined,
        container: null,
        scrollableContainer: null,
        target: ''
    },
    restrictMovement: function (element, top, left, update) {
        left = left > dDragController.options.restrictLeft ? left : dDragController.options.restrictLeft;
        top = top > dDragController.options.restrictTop ? top : dDragController.options.restrictTop;

        if (dDragController.options.restricted) {
            left = left > $(dDragController.options.container).width() - element.outerWidth() ? $(dDragController.options.container).width() - element.outerWidth() - dDragController.options.restrictRight : left;
            top = top > $(dDragController.options.container).height() - element.outerHeight() ? $(dDragController.options.container).height() - element.outerHeight() - dDragController.options.restrictBottom : top;
        }

        if (update) {
            element.css({ top: top, left: left });

            if (typeof dDragController.options.drag != 'undefined') {
                dDragController.options.drag(element);
            }
        }

        return { top: top, left: left };
    },
    move: function (element) {
        var deltaX = parseFloat(element.data('delta-x'));
        var deltaY = parseFloat(element.data('delta-y'));
        var top = Math.round(dDragController.offsetY + (deltaY / ZoomControl.currentScale)) + ($(dDragController.options.scrollableContainer).scrollTop() - dDragController.scrollY) / ZoomControl.currentScale;
        var left = Math.round(dDragController.offsetX + (deltaX / ZoomControl.currentScale)) + ($(dDragController.options.scrollableContainer).scrollLeft() - dDragController.scrollX) / ZoomControl.currentScale;

        var newPos = dDragController.restrictMovement(element, top, left, false);

        dScroller.check(element, newPos.top, newPos.left);

        if (dScroller.active) {
            if (dScroller.down) {
                if (dScroller.vTimer == null) {
                    $(dDragController.options.scrollableContainer)[0].scrollTop = $(dDragController.options.scrollableContainer)[0].scrollTop + 5;
                    dDragController.restrictMovement(element, newPos.top + (5 / ZoomControl.currentScale), newPos.left, true);

                    dScroller.vTimer = setTimeout(function () {
                        dScroller.vTimer = null;
                        dDragController.move(element);
                    }, 10);
                }
            } else if (dScroller.up) {
                if (dScroller.vTimer == null) {
                    $(dDragController.options.scrollableContainer)[0].scrollTop = $(dDragController.options.scrollableContainer)[0].scrollTop - 5;
                    dDragController.restrictMovement(element, newPos.top - (5 / ZoomControl.currentScale), newPos.left, true);

                    dScroller.vTimer = setTimeout(function () {
                        dScroller.vTimer = null;
                        dDragController.move(element);
                    }, 10);
                }
            }
            if (dScroller.left) {
                if (dScroller.hTimer == null) {
                    $(dDragController.options.scrollableContainer)[0].scrollLeft = $(dDragController.options.scrollableContainer)[0].scrollLeft - 5;
                    dDragController.restrictMovement(element, newPos.top, newPos.left - (5 / ZoomControl.currentScale), true);

                    dScroller.hTimer = setTimeout(function () {
                        dScroller.hTimer = null;
                        dDragController.move(element);
                    }, 10);
                }
            } else if (dScroller.right) {
                if (dScroller.hTimer == null) {
                    $(dDragController.options.scrollableContainer)[0].scrollLeft = $(dDragController.options.scrollableContainer)[0].scrollLeft + 5;
                    dDragController.restrictMovement(element, newPos.top, newPos.left + (5 / ZoomControl.currentScale), true);

                    dScroller.hTimer = setTimeout(function () {
                        dScroller.hTimer = null;
                        dDragController.move(element);
                    }, 10);
                }
            }
        } else {
            // normal drag, no scrolling
            dDragController.restrictMovement(element, top, left, true);
        }
    },
    init: function (params) {
        for (key in params) {
            dDragController.options[key] = params[key];
        }

        $(dDragController.options.target).drag(function (ev, dd) {
            $(this).data('delta-x', dd.deltaX);
            $(this).data('delta-y', dd.deltaY);
            dDragController.move($(this));
        }).bind('dragstart', function () {
            var currentPos = d.lib.offset($(this), $(dDragController.options.container));
            dDragController.offsetX = currentPos.left;
            dDragController.offsetY = currentPos.top;
            dDragController.scrollX = $(dDragController.options.scrollableContainer).scrollLeft();
            dDragController.scrollY = $(dDragController.options.scrollableContainer).scrollTop();
            if (typeof dDragController.options.dragstart != 'undefined') {
                dDragController.options.dragstart($(this));
            }
        }).bind('dragend', function () {
            dScroller.clearTimers();
            if (typeof dDragController.options.dragend != 'undefined') {
                dDragController.options.dragend($(this));
            }
        });

        dScroller.init(dDragController.options.container, dDragController.options.scrollableContainer, dDragController.options.restrictTop);
    }
};

var dScroller = {
    restrictTop: 0,
    hTimer: null,
    vTimer: null,
    up: false,
    down: false,
    left: false,
    right: false,
    active: false,
    clearTimers: function () {
        clearTimeout(dScroller.hTimer);
        dScroller.hTimer = null;
        clearTimeout(dScroller.vTimer);
        dScroller.vTimer = null;
    },
    zoom: null,
    container: null,
    scrollableContainer: null,
    check: function (element, top, left) {
        // reset check result
        dScroller.active = dScroller.up = dScroller.down = dScroller.left = dScroller.right = false;

        if ($(dScroller.container).length == 0 || $(dScroller.scrollableContainer).length == 0) {
            return;
        }

        var zoomScale = ZoomControl.currentScale;

        // calculate 4 sides of element & containment
        var cp = d.lib.offset($(dScroller.container), $(dScroller.scrollableContainer));

        var c = $(dScroller.scrollableContainer);
        var bt = cp.top + dScroller.restrictTop;
        //var bt = parseFloat($(dScroller.container).css('top')) + 20;
        if (isNaN(bt)) { bt = 0; }
        var bl = cp.left;
        //var bl = parseFloat($(dScroller.container).css('left'));
        if (isNaN(bl)) { bl = 0; }

        // check up
        var et = top + bt;
        var ct = c[0].scrollTop;
        
        dScroller.up = (et - dScroller.restrictTop) * zoomScale < ct;

        // check down
        var eb = et + element.outerHeight();
        var cb = ct + c.outerHeight();

        dScroller.down = eb * zoomScale > cb;

        // check left
        var el = left + bl;
        var cl = c[0].scrollLeft;

        dScroller.left = el * zoomScale < cl;

        // check right
        var er = el + $(element).outerWidth();
        var cr = cl + c.outerWidth();

        dScroller.right = (er + 20) * zoomScale > cr;

        // check 
        dScroller.active = dScroller.up || dScroller.down || dScroller.left || dScroller.right;

        if (!dScroller.active) {
            dScroller.clearTimers();
        }
    },
    init: function (container, scrollableContainer, restrictTop) {
        dScroller.container = container;
        dScroller.scrollableContainer = scrollableContainer;
        dScroller.restrictTop = restrictTop;
    }
};