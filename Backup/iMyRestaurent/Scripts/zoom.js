var ZoomControl = {
    callback: null,
    target: null,
    currentScale: 1,
    setup: function (selector, initialValue, callback) {
        ZoomControl.target = selector;

        ZoomControl.callback = callback;

        ZoomControl.update(initialValue);
    },
    zoomin: function (selector) {
        var zoomScale;

        if (ZoomControl.currentScale < 1) {
            zoomScale = 1;
        } else if (ZoomControl.currentScale >= 1 && ZoomControl.currentScale < 3) {
            zoomScale = ZoomControl.currentScale + 1;
        }

        ZoomControl.update(zoomScale, selector);
    },
    zoomout: function (selector) {
        var zoomScale;

        if (ZoomControl.currentScale < 1.1) {
            zoomScale = 0.6;
        } else if (ZoomControl.currentScale > 1 && ZoomControl.currentScale <= 3) {
            zoomScale = ZoomControl.currentScale - 1;
        }

        ZoomControl.update(zoomScale, selector);
    },
    update: function (scale, selector) {
        if ($(ZoomControl.target) != null) {
            ZoomControl.currentScale = scale == null ? ZoomControl.currentScale : parseFloat(scale);
            $(ZoomControl.target).css('zoom', ZoomControl.currentScale);
            $(selector).val(ZoomControl.currentScale);

            if (ZoomControl.callback != null) {
                ZoomControl.callback();
            }
        }
    }
};

function initZoomScale(containment) {
    var zoomScale = parseFloat($("input[name='LayoutZoomScale']").val());
    containment.css("zoom", zoomScale);
}

function zoomOut(containment) {
    var zoomScale = parseFloat(containment.css("zoom"));
    var nZoomScale;

    // 2012.07.01 SonTH fix bug #7,8. Minimum scale is 0.6
    //if (zoomScale < 0.7) {
    //    nZoomScale = 0.4;
    //} else 
    if (zoomScale < 1.1) {
        nZoomScale = 0.6;
    } else if (zoomScale > 1 && zoomScale <= 4) {
        nZoomScale = zoomScale - 1;
    }

    containment.css("zoom", nZoomScale);

    $('#zoom-scale').val(nZoomScale);
    ZoomControl.zoomScale = nZoomScale;

    return nZoomScale;
}

function zoomIn(containment) {
    var zoomScale = parseFloat(containment.css("zoom"));
    var nZoomScale;

    // 2012.07.01 SonTH fix bug #7,8. Minimum scale is 0.6
    //if (zoomScale < 0.6) {
    //    nZoomScale = 0.6;
    //} else 
    if (zoomScale < 1) {
        nZoomScale = 1;
    } else if (zoomScale >= 1 && zoomScale < 4) {
        nZoomScale = zoomScale + 1;
    }

    containment.css("zoom", nZoomScale);

    $('#zoom-scale').val(nZoomScale);
    ZoomControl.zoomScale = nZoomScale;

    return nZoomScale;
}