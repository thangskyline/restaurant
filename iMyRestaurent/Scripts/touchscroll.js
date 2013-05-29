/* This function makes a div scrollable with android and iphone */

function isAndroid2() {
    var ua = navigator.userAgent.toLowerCase();

    if (ua.indexOf('android') > 0) {
        var androidVer = parseFloat(ua.slice(ua.indexOf('android') + 8));
        if (androidVer < 3) {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }        
        }
    }

    return false;

//    /* Added Android 3.0 honeycomb detection because touchscroll.js breaks
//    the built in div scrolling of android 3.0 mobile safari browser */
//    if ((navigator.userAgent.match(/android 3/i)) ||
//		(navigator.userAgent.match(/honeycomb/i)))
//        return false;
    
}

function touchScroll(selector) {
    //if touch events exist & no dragging currently
    if (isAndroid2()) {
        $.each($(selector), function (index, control) {
            var scrollStartPosY = 0;
            var scrollStartPosX = 0;

            control.addEventListener("touchstart", function (event) {
                if (flags.canTouchScroll) {
                    scrollStartPosY = this.scrollTop + event.touches[0].pageY;
                    scrollStartPosX = this.scrollLeft + event.touches[0].pageX;
                    //event.preventDefault(); // Keep this remarked so you can click on buttons and links in the div
                }
            }, false);

            control.addEventListener("touchmove", function (event) {
                if (flags.canTouchScroll) {
                    // These if statements allow the full page to scroll (not just the div) if they are
                    // at the top of the div scroll or the bottom of the div scroll
                    // The -5 and +5 below are in case they are trying to scroll the page sideways
                    // but their finger moves a few pixels down or up.  The event.preventDefault() function
                    // will not be called in that case so that the whole page can scroll.
                    if ((this.scrollTop < this.scrollHeight - this.offsetHeight &&
				    this.scrollTop + event.touches[0].pageY < scrollStartPosY - 5) ||
				    (this.scrollTop != 0 && this.scrollTop + event.touches[0].pageY > scrollStartPosY + 5))
                        event.preventDefault();
                    if ((this.scrollLeft < this.scrollWidth - this.offsetWidth &&
				    this.scrollLeft + event.touches[0].pageX < scrollStartPosX - 5) ||
				    (this.scrollLeft != 0 && this.scrollLeft + event.touches[0].pageX > scrollStartPosX + 5))
                        event.preventDefault();
                    this.scrollTop = scrollStartPosY - event.touches[0].pageY;
                    this.scrollLeft = scrollStartPosX - event.touches[0].pageX;
                }
            }, false);
        });
    }
}
