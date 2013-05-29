var fullsizeViewerTimeout;

$(window).resize(function () {
    clearTimeout(fullsizeViewerTimeout);

    fullsizeViewerTimeout = setTimeout(function () {
        if ($('#fullscreen-viewer').length > 0) {
            FullscreenViewer.dock();
        }
    }, 100);

});

var FullscreenViewer = {
    showPreview: function (menuid) {
        if ($('#fullscreen-viewer').length == 0) {
            $('body').append($('<div id="fullscreen-viewer-overlay" />'));

            $('body').append($('<div id="fullscreen-viewer" />'));


            var html = '';
//            html += '  <button id="btn-back" class="image-button button-back inline">';
//            html += '      </button>';
            html += '        <div class="preview-show-hide-lang-desc">';
            html += '          Language';
            html += '          <select id="drop-language">';

            html += '          </select>';
            html += '           <input type="checkbox" id="showSecondLang" checked="checked" value="true" /><span>Show';
            html += '               Secondary Language</span>';
            html += '          <input type="checkbox" id="showDescription" checked="checked" value="true" /><span>Show';
            html += '              Description</span>';
            html += '      </div>';
            html += '      <div id="preview-containment" style="width:625px">';
            html += '          <xml-containment></xml-containment>';
            html += '      </div>';
            $('#fullscreen-viewer').html(html);
            $.ajax({
                type: 'post',
                url: '/Menu/Preview',
                data: {
                    MenuID: menuid,
                    LangID:100000
                },
                success: function (response) {
                    if (response.IsSucceed) {
                        editor.global.menu = response.Menu;
                        
//                        editor.global.menu.RestaurantName = $('#restaurant-name').val();
//                        editor.global.menu.RestaurantAddress = $('#restaurant-address').val();
                        $('xml-containment').attr('style-id', editor.global.menu.CSSID);
                        $('xml-containment').attr('currency', editor.global.menu.CurrencyID);
                        preview.generate();

                        FlexibleLayout.adapt();
                    } else {
                        Utils.showError();
                    }
                }
            });
//            FullscreenViewer.dock();
            $('#fullscreen-viewer-overlay').width(Utils.pageW());
            $('#fullscreen-viewer-overlay').height(Utils.pageH());
            //            $('#fullscreen-viewer-overlay, #fullscreen-viewer').click(this.hide);
        }
    },
    show: function () {
        if ($('#fullscreen-viewer').length == 0) {
            $('body').append($('<div id="fullscreen-viewer-overlay" />'));

            $('body').append($('<div id="fullscreen-viewer" />'));

            var file = $('.slide-element')[getViewedIndex()];

            var url = $(file).find('img').attr('src');

            var img = new Image();
            img.onload = function () {
                FullscreenViewer.dock();
            };
            img.src = url;

            $('#fullscreen-viewer').append(img);

            $('#fullscreen-viewer-overlay, #fullscreen-viewer').click(this.hide);
        }
    },
    hide: function () {
        $('#fullscreen-viewer-overlay').remove();
        $('#fullscreen-viewer').remove();
    },
    dock: function () {
        // resize image to fit screen
        var docW = Utils.pageW();
        var docH = Utils.pageH();

        var imgW = $('#fullscreen-viewer img').width();
        var imgH = $('#fullscreen-viewer img').height();

        var ratio = imgW / imgH;

        if (imgW > docW) {
            imgW = docW;
            imgH = imgW / ratio;
        }

        if (imgH > docH) {
            imgH = docH;
            imgW = imgH * ratio;
        }

        $('#fullscreen-viewer img').width(imgW);
        $('#fullscreen-viewer img').height(imgH);

        $('#fullscreen-viewer-overlay').width(Utils.pageW());
        $('#fullscreen-viewer-overlay').height(Utils.pageH());

        Utils.positioningDialog($('#fullscreen-viewer'), 'center', 'center');
    }
};