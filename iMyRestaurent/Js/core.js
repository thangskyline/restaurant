var popup = {
    /*----- start method hide popup ------*/
    hide: function (popup_id) {
        var popupItem = lib.get_ele(popup_id);
        if (lib.is_ele(popupItem)) {
            //remove popup;
            popupItem.parentNode.removeChild(popupItem);
        }

        var popupOverlay = lib.get_ele('overlay-popup');
        if (lib.is_ele(popupOverlay)) {
            //remove overlay;
            popupOverlay.parentNode.removeChild(popupOverlay);
        }
    },

    join: function (str) {
        var store = [str];
        return function extend(other) {
            if (other != null && 'string' == typeof other) {
                store.push(other);
                return extend;
            }
            return store.join('');
        }
    }
};


var popup_ex = {

    // show popup
    show: function (popup_id, title, content, option, overrideHideEvent) {
        //get site dimension;
        var windowHeight = jQuery(window).height();
        var windowWidth = jQuery(window).width();
        //var pageHeight = jQuery(document).height();
        //var pageWidth = jQuery(document).width();
        var pageHeight = Utils.pageH();
        var pageWidth = Utils.pageW();

        // data config default for popup
        var config = {
            auto_hide: 0,
            position: 'center-center', //default, center-center, top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
            pos_type: 'absolute',
            esc: true,
            overlay: {
                'background-color': '#000',
                'opacity': '0.3'
            },
            background: {
                'background-color': 'transparent'
            },
            border: {
                'background-color': 'transparent',
                'padding': '5px'
            },
            title: {
                'background-color': '#F2D5C7',
                'color': '#fff',
                'status': 1,
                'display': 'block'
            },
            content: {
                'background-color': '#F2D5C7',
                'width': '500px',
                'height': 'auto',
                'padding': '20px',
                'display': 'block'
            },
            process: function () { }
        };

        // update default config follows config parameters
        if (lib.is_exists(option)) { //load config;
            for (var item in option) {
                if (!Object.prototype[item] && lib.is_exists(option[item])) {
                    if (lib.is_func(option[item])) {
                        config[item] = option[item];
                    } else if (lib.is_obj(option[item])) {
                        for (var i in option[item]) {
                            var sub_opt = option[item];
                            if (!Object.prototype[i] && lib.is_exists(sub_opt[i])) {
                                config[item][i] = sub_opt[i];
                            }
                        }
                    } else {
                        config[item] = option[item];
                    }
                }
            }
        }

        // if exists id, remove it
        var id = lib.get_ele(popup_id);
        jQuery(id).remove();

        // create template and add to body
        jQuery('<div id="overlay-popup"> </div>')
            .css({
                'background-color': config.overlay['background-color'],
                'opacity': config.overlay['opacity'],
                'position': config.pos_type,
                'top': '0px',
                'left': '0px',
                'z-index': '332',
                'width': Utils.pageW(),
                'height': Utils.pageH()
            }).appendTo('body');

        var oPopup = jQuery('<div id="' + popup_id + '" class="core-popup"></div>')
	          .css({
	              'background-color': config.border['background-color'],
	              'position': config.pos_type,
	              'padding': config.border['padding'],
	              'opacity': '0.4',
	              'z-index': '333',
	              'width': config.content['width']
	          });

        var blockContent = jQuery('<div style="background-color: ' + config.background['background-color'] + '"></div>');

        var oContent = jQuery('<div id="popup-container" style="padding: 20px; color: black"></div>')
	          .css({
	              'font-size': lib.is_exists(config.content['font-size']) ? config.content['font-size'] : '14px',
	              'height': config.content['height'],
	              'padding': config.content['padding'],
	              'display': config.content['display']
	          });

        var html = popup.join
          ('<div class="classic-popup">')
	          ('<div class="classic-popup-top"><div class="right"><div class="bg"></div></div></div>')
	          ('<div class="classic-popup-main">')
		          ('<div class="classic-popup-title1">')
			          ('<div class="fl">' + title + '</div>')
                      ('<a href="javascript:void(0)" class="classic-popup-close" title="Close" ' + '><img src="/Content/images/details-close-btn.png" width="21" height="21" /></a>')
			          ('<div class="c"></div>')
		          ('</div>')
		          ('<div class="classic-popup-content1">' + content + '</div>')
	          ('</div>')
	          ('<div class="classic-popup-bottom"><div class="right"><div class="bg"></div></div></div>')
          ('</div>')();

        oContent.html(html);
        blockContent.append(oContent);
        oPopup.append(blockContent).css('top', 0).appendTo('body').fadeTo("slow", 1);

        //display popup;
        switch (config.position) {
            case 'top-left': oPopup.css({ 'top': 0, 'left': 0 }); break;
            case 'top-center': oPopup.css({ 'top': 0, 'left': (pageWidth - oPopup.width()) / 2 }); break;
            case 'top-right': oPopup.css({ 'top': 0, 'right': 0 }); break;
            case 'center-center': oPopup.css({ 'top': (Utils.pageH() - oPopup.height()) / 2, 'left': (pageWidth - oPopup.width()) / 2 }); break;
            case 'bottom-left': oPopup.css({ 'bottom': 0, 'left': 0 }); break;
            case 'bottom-center': oPopup.css({ 'bottom': 0, 'left': (pageWidth - oPopup.width()) / 2 }); break;
            case 'bottom-right': oPopup.css({ 'bottom': 0, 'right': 0 }); break;
            case 'defined-top': oPopup.css({ 'top': config.top, 'left': (pageWidth - oPopup.width()) / 2 }); break;
            case 'default': oPopup.css({ 'top': this.get_top_page() + 86, 'left': (pageWidth - oPopup.width()) / 2 }); break;
        }

        // SonTH fix bug #25. Need to bind override closed event handler
        var closeBtn = $(".classic-popup > .classic-popup-main > .classic-popup-title1 > .classic-popup-close");
        closeBtn.unbind();

        if (overrideHideEvent != null && overrideHideEvent != "") {
            closeBtn.bind("click", function () { overrideHideEvent(); });
        } else {
            closeBtn.bind("click", function () { popup.hide(popup_id); });
        }

        //auto hide;
        if (config.auto_hide) {
            setTimeout(function () {
                oPopup.fadeTo('show', 0, function () {
                    popup.hide(popup_id);
                });
            },
	        config.auto_hide);
        }

        config.process(oPopup);

        //close when press exit esc
        if (config.esc) {
            jQuery(document).keydown(
		function (event) {
		    if (event.keyCode == 27) {
		        //popup.hide(popup_id);
		        $(".classic-popup > .classic-popup-main > .classic-popup-title1 > .classic-popup-close").click();
		    }
		});
        }
        return oPopup;
    },

    /*----- start method hide popup ------*/
    hide: function (popup_id) {
        var popupItem = lib.get_ele(popup_id);
        if (lib.is_ele(popupItem)) {
            //remove popup;
            popupItem.parentNode.removeChild(popupItem);
        }

        var popupOverlay = lib.get_ele('overlay-popup');
        if (lib.is_ele(popupOverlay)) {
            //remove overlay;
            popupOverlay.parentNode.removeChild(popupOverlay);
        }
    },

    join: function (str) {
        var store = [str];
        return function extend(other) {
            if (other != null && 'string' == typeof other) {
                store.push(other);
                return extend;
            }
            return store.join('');
        }
    },

    get_top_page: function () {
        if (lib.is_exists(window.pageYOffset)) {
            return window.pageYOffset;
        } uh
        if (lib.is_exists(document.compatMode) && document.compatMode != 'BackCompat') {
            return document.documentElement.scrollTop;
        }
        if (lib.is_exists(document.body)) {
            scrollPos = document.body.scrollTop;
        }
        return 0;
    },

    error: {
        set: function (id, msg, width) {
            msg = msg ? msg : '';
            width = width ? width : 430;
            var html = popup.join
	        ('<div class="my_msg" style="width: ' + width + 'px; color:red; margin: 6px auto; padding:6px; background:rgb(255, 249, 215); border: 1px solid rgb(226, 200, 34); text-align: center; font-size: 13px;">')
	          (msg)
	        ('</div>')();
            jQuery('#errorInfo').html(html);
            jQuery(id).focus();
        },
        close: function () {
            jQuery('#errorInfo').html('');
        }
    }
};