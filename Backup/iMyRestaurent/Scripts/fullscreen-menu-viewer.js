var fullsizeViewerTimeout;

//$(window).resize(function () {
//    clearTimeout(fullsizeViewerTimeout);

//    fullsizeViewerTimeout = setTimeout(function () {
//        if ($('#fullscreen-menu-viewer').length > 0) {
//            FullscreenViewer.dock();
//        }
//    }, 100);

//});

var FullscreenViewer = {
    showPreview: function (menuid) {
        $.ajax({
            type: 'post',
            url: '/Menu/Preview',
            data: {
                MenuID: menuid
            },
            success: function (response) {
                if (response.IsSucceed) {
                    if ($('#fullscreen-menu-viewer').length == 0) {
                        $('body').append($('<div id="fullscreen-menu-viewer-overlay" />'));
                        $('body').append($('<div id="fullscreen-menu-viewer" />'));

                        var html = '';

                        html += '        <div class="clearfix" style="width:625px;height:25px">';
                        html += '           <button id="btn-back" class="image-button button-back inline">';
                        html += '           </button>';
                        html += '        </div>';
                        html += '        <div style="color:white;width:625px;height:25px" class="preview-show-hide-lang-desc">';
                        html += '           <div style="float:left;">';
                        html += '          Language';
                        html += '          <select style="width:100px" id="drop-language">';

                        for (lang in response.Languages) {
                            var langItem = response.Languages[lang];
                            html += '          <option shortname="' + langItem.ShortName + '" value="' + langItem.LangID + '">' + langItem.Name + '</option>';
                        }

                        html += '          </select>';
                        html += '        </div>';
                        html += '        <div style="margin-top:4px;float:right;">';
                        html += '           <input type="checkbox" id="showSecondLang" checked="checked" value="true" /><span>Show';
                        html += '               Secondary Language</span>';
                        html += '          <input type="checkbox" id="showDescription" checked="checked" value="true" /><span>Show';
                        html += '              Description</span>';
                        html += '        </div>';
                        html += '      </div>';
                        html += '      <div id="preview-containment" style="width:625px">';
                        html += '          <xml-containment></xml-containment>';
                        html += '      </div>';
                        $('#fullscreen-menu-viewer').html(html);

                        editor.global.menu = response.Menu;
                        if (editor.global.menu != null) {
                            //
                            $('#drop-language').val(editor.global.menu.PrimaryLang.LangID);
                            // store loaded language
                            editor.global.menu.loadedLangs = new Array();
                            // push into stored array
                            editor.global.menu.loadedLangs.push(editor.global.menu.PrimaryLang.LangID);
                            if (editor.global.menu.SecondLang != null && editor.global.menu.SecondLang.LangID != 0) {
                                // push into stored array
                                editor.global.menu.loadedLangs.push(editor.global.menu.SecondLang.LangID);
                            }
                        }
                        $('xml-containment').attr('style-id', editor.global.menu.CSSID);
                        $('xml-containment').attr('currency', editor.global.menu.CurrencyID);

                        preview.generate();
                        FlexibleLayout.adapt();

                        //            FullscreenViewer.dock();
                        $('#fullscreen-menu-viewer-overlay').width(Utils.pageW());
                        $('#fullscreen-menu-viewer-overlay').height(Utils.pageH());
                        var left = Utils.pageW() - $('#fullscreen-menu-viewer').width();
                        $('#fullscreen-menu-viewer').css('left', left / 2 + 'px');
                        //                        $('#preview-containment').click(function () {
                        //                            $('#fullscreen-menu-viewer-overlay').hide();
                        //                            $('#fullscreen-menu-viewer').hide();
                        //                            $('#fullscreen-menu-viewer-overlay').remove();
                        //                            $('#fullscreen-menu-viewer').remove();
                        //                        });
                    }
                } else {
                    Utils.showError();
                }
            }
        });

    },
    hide: function () {
        $('#fullscreen-menu-viewer-overlay').remove();
        $('#fullscreen-menu-viewer').remove();
    },
    dock: function () {
        // resize image to fit screen
        var docW = Utils.pageW();
        var docH = Utils.pageH();

        var imgW = $('#fullscreen-menu-viewer img').width();
        var imgH = $('#fullscreen-menu-viewer img').height();

        var ratio = imgW / imgH;

        if (imgW > docW) {
            imgW = docW;
            imgH = imgW / ratio;
        }

        if (imgH > docH) {
            imgH = docH;
            imgW = imgH * ratio;
        }

        $('#fullscreen-menu-viewer img').width(imgW);
        $('#fullscreen-menu-viewer img').height(imgH);

        $('#fullscreen-menu-viewer-overlay').width(Utils.pageW());
        $('#fullscreen-menu-viewer-overlay').height(Utils.pageH());

        Utils.positioningDialog($('#fullscreen-menu-viewer'), 'center', 'center');
    }
};