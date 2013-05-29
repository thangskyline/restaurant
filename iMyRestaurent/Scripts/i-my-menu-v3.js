var flagSaveClose = false;
var currentDay = 0;
var initPairDayMenu = '';
$(document).ready(function () {
    $('#btn-save').live('click', validateBeforeSave);
    $('input[name="MenuID"]').live('change', updateGlobal);
    $('input[name="EventID"][class="day"]').live('change', function () {
        //validate for all day checkbox
        var NotAll = false;
        $('input[name="EventID"][class="day"]').each(function () {
            if (!$(this).is(':checked')) {
                NotAll = true;
                return true;
            }
        });
        NotAll ? $('#all-day').removeAttr('checked', '') : $('#all-day').attr('checked', 'checked');
        //check save button
        CheckSaveButton();
    });
    $('#all-day').live('change', function () {
        $('#all-day').is(':checked') ? $('input[name="EventID"][class="day"]').attr('checked', 'checked') : $('input[name="EventID"][class="day"]').removeAttr('checked', '');
    });
    $('#btn-setting-close').live('click', function () {
        if (IsChange()) {
            MessageBox.show({
                message: ['Do you want to save changes?'],
                buttons: {
                    yes: function () {
                        flagSaveClose = true;
                        validateBeforeSave();
                    },
                    no: function () {
                        closeMyMenu();
                    }
                }
            });
        }
        else {
            closeMyMenu();
        }

    })
    $('div[type="menu"]').live('click', function () {
        var checked = $(this).find('input[name="MenuID"]').is(':checked');
        var thisValue = $(this).find('input[name="MenuID"]').val();
        if (checked) {
            //move slide
            var arrayInputs = $('input[name="MenuID"]:checked');
            index = findIndexByKeyValue(arrayInputs, 'value', thisValue);
            moveSlide(index);
        }
    })
});
var MenusGlobal;
var iMyMenuMode = "";
function closeMyMenu() {
    //                    $('.imymenuv3-dialog').remove();
    //                    $('#fullscreen-menu-viewer-overlay').remove();
    $('.classic-popup').remove();
    $('#overlay-popup').remove();
    flagSaveClose = false;
    currentDay = 0;
    initPairDayMenu = '';
}
function CheckSaveButton() {
    //validate disable save button
    $('input[name="EventID"][class="day"]').each(function () {
        var haveChecked = HaveCheckedDay();
        //            haveChecked ? $('#btn-save').removeAttr('disabled', '') : $('#btn-save').attr('disabled', 'disabled');
        var menuHaveChecked = HaveCheckedMenu();
        if (!haveChecked && !menuHaveChecked) {
            //disable save button
            $('#btn-save').attr('disabled', 'disabled');
            $('#btn-save').css('opacity', '0.3');
        }
        else {
            //enable save button
            $('#btn-save').removeAttr('disabled', '');
            $('#btn-save').css('opacity', '');
        }
    });
}
function updateGlobal() {
    //check save button
    CheckSaveButton();

    $('input[name="MenuID"]').each(function () {
        var menu = jLinq.from(MenusGlobal).ignoreCase().startsWith('MenuID', $(this).val()).first();
        $(this).is(':checked') ? menu.IsMapped = 1 : menu.IsMapped = 0;
    });
    var mappedMenus = jLinq.from(MenusGlobal).ignoreCase().startsWith('IsMapped', 1).select();
    getImagesMenuMapping(mappedMenus);

}
function getCurrentPairDayMenu() {
    var value = '';
    $('input[class="day"]:checked').each(function () {
        value += $(this).val();
    });
    $('input[class="list-menu-mapping"]:checked').each(function () {
        value += $(this).val();
    });
    return value;
}
function HaveCheckedMenu() {
    var menuHaveChecked = false;
    $('input[name="MenuID"]').each(function () {
        if ($(this).is(':checked')) {
            menuHaveChecked = true;
            return true;
        }
    });
    return menuHaveChecked
}
function HaveCheckedDay() {
    var haveChecked = false;
    $('input[name="EventID"][class="day"]').each(function () {
        if ($(this).is(':checked')) {
            haveChecked = true;
            return true;
        }
    });
    return haveChecked;
}
function IsChange() {
    return initPairDayMenu != getCurrentPairDayMenu() ? true : false;
}
function validateBeforeSave() {
    if (haveOtherDays()) {
        MessageBox.show({
            message: ['This setting will replace all existing menus of selected days. Do you want to continue this?'],
            buttons: {
                yes: function () {
                    saveMyMenu();
                },
                no: function () {
                    return;
                }
            }
        });
    }
    else {
        saveMyMenu();
    }


}
function haveOtherDays() {
    return $('input[class="day"][day!="' + currentDay + '"]:checked').length > 0 ? true : false;
}
function saveMyMenu() {
    //validate
    if (HaveCheckedDay()) {
        showProgressDialog('Saving');
        //collect data
        //    var events = new Array();
        var events = '';
        $('input[name="EventID"][class="day"]').each(function () {
            if ($(this).attr('checked')) {
                //            events.push($(this).val());
                events += $(this).val() + ';';
            }
        });
        //    var menus = new Array();
        var menus = '';
        $('input[name="MenuID"]').each(function () {
            if ($(this).attr('checked')) {
                //            menus.push($(this).val());
                menus += $(this).val() + ';';
            }
        });
        $.ajax({
            type: 'post',
            url: '/BusinessHours/SetMappings',
            data: {
                Events: events,
                Menus: menus
            },
            complete: function () {
                hideProgressDialog();
                //            handler.setting.close();
                initPairDayMenu = getCurrentPairDayMenu();
                if (flagSaveClose)
                    closeMyMenu();
            },
            success: function (response) {
            }
        });
    }
    else {
        MessageBox.show({
            message: ['Please select at least one day to save.'],
            buttons: { ok: null }
        });
        return;
    }

}
function Open(eventId, day, eventName, eventList) {
    var tr = $('span:contains(' + eventId + ')').parents('tr');
    showProgressDialog('Openning Menu Mapping');
    //thangma
    $.ajax({
        url: "/BusinessHours/GetMappings",
        type: "POST",
        dataType: "json",
        data: {
            EventID: eventId
        },
        complete: function () {
            hideProgressDialog();
        },
        success: function (itemData) {
            if (itemData.IsSucceed) {
                initPairDayMenu = eventId;
                MenusGlobal = itemData.Menus;
                iMyMenuMode = "";
                var html = "";

                html += '<div style="height:350px;" class="imymenuv3-dialog center-box clearfix" id="' + eventId + '" onclick="closeSearchDialog();" >';
                html += '   <div style="float:right;" >';
                html += '<a id="btn-setting-close" href="#" class="classic-popup-close" title="Close"><img src="/Content/images/details-close-btn.png" width="21" height="21"></a>';
                html += '   </div >';
                html += '   <div style="color:#9a3334;font-weight:bold;text-align:center;padding-top:10px" >iMyMenu for ';
                if (typeof eventName != 'undefined') {
                    html += eventName;
                }
                else {
                    html += $('span:contains(' + eventId + ')').parents('tbody').find('input[class="txt-menu-name"]').val();
                }

                html += '   </div >';
                html += '   <div >';
                html += '       <div id="left-col">';
                html += '           <div>';
                html += '           </div>';
                html += '           <div>';
                html += '               <div id="list-checkbox-name" >Apply for selected days';
                html += '               </div>';
                html += '               <div class="list-checkbox">';
                html += '                   <div class="line clearfix">';
                html += '                       <div class="checkbox">';
                html += '                           <input id="all-day" type="checkbox" value="" >';
                html += '                       </div>';
                html += '                       <div class="item-name">';
                html += '                           <span>All</span>';
                html += '                       </div>';
                html += '                   </div>';
                //bind data for day

                if (typeof eventList != 'undefined') {
                    for (event in eventList) {
                        var eventItem = eventList[event];
                        var checkDay = eventItem.Day == day ? 'checked="checked"' : '';
                        html += '                   <div class="line clearfix">';
                        html += '                       <div class="checkbox">';
                        html += '                           <input class="day" day="' + eventItem.Day + '" type="checkbox" ' + checkDay + ' value="' + eventItem.EventID + '" name="EventID">';
                        html += '                       </div>';
                        html += '                       <div class="item-name">';
                        html += '                           <span>' + DAY_NAMES[eventItem.Day] + '</span>';
                        html += '                       </div>';
                        html += '                   </div>';
                    }
                }
                else {
                    var indexDay = 0;
                    $(tr).find('td[class]').each(function () {
                        var checkDay = $(this).find('span').html() == eventId ? 'checked="checked"' : '';
                        html += '                   <div class="line clearfix">';
                        html += '                       <div class="checkbox">';
                        html += '                           <input class="day" day="' + indexDay + '" type="checkbox" ' + checkDay + ' value="' + $(this).find('span').html() + '" name="EventID">';
                        html += '                       </div>';
                        html += '                       <div class="item-name">';
                        html += '                           <span>' + DAY_NAMES[indexDay] + '</span>';
                        html += '                       </div>';
                        html += '                   </div>';
                        indexDay++;
                    })
                }
                html += '               </div>';
                html += '               <div id="list-checkbox-name" >Menu List';
                html += '               </div>';
                html += '               <div class="list-checkbox">';
                //bind data for menu
                for (var i = 0; i < MenusGlobal.length; i++) {
                    var menuName = MenusGlobal[i].Name.length > 0 ? MenusGlobal[i].Name : '[Unnamed]';
                    if (MenusGlobal[i].IsMapped == 1) {
                        initPairDayMenu += MenusGlobal[i].MenuID;
                    }
                    var isMapped = MenusGlobal[i].IsMapped == 1 ? 'checked="checked"' : '';
                    html += '               <div type="menu" class="line clearfix">';
                    html += '                   <div class="checkbox">';
                    html += '                       <input class="list-menu-mapping" type="checkbox" ' + isMapped + ' value="' + MenusGlobal[i].MenuID + '" name="MenuID">';
                    html += '                   </div>';
                    html += '                   <div  class="item-name">';
                    html += '                       <span>' + menuName + '</span>';
                    html += '                   </div>';
                    html += '               </div>';
                }
                html += '               </div>';
                html += '           </div>';
                html += '       </div>';
                html += '       <div id="right-col" style="float:right;" >';
                html += '           <div id="search-button" >';
                //                html += '               <input type="text" readonly="readonly" />';
                html += '               <button type="button" class="image-button button-imymenu-search left" onclick="openSearchDialog(event);">';
                html += '               </button>';
                html += '<span style="float:right;margin-top:10px" >' + DAY_NAMES[day] + '</span>';
                html += '               <div id="search-dialog" style="display: none;">';
                html += '                   <div id="search-div">';
                html += '                       <input type="text" />';
                html += '                   </div>';
                html += '                   <ul></ul>';
                html += '               </div>';
                html += '           </div>';
                html += '           <div  id="image-menu-viewer">';
                html += '           <div id="slide"  class="clearfix center-box">';
                html += '               <div id="prev" class="left"></div>';
                html += '               <div id="next" class="right"></div>';
                html += '               <div id="center" class="center-box">';
                html += '               </div>';
                html += '           </div>';
                html += '           <div id="image-info" class="center-box hidden">';
                html += '               <div>';
                html += '                   <span id="menu-name" ></span><input type="text" style="display:none;"readonly="readonly" id="txt-image-name" />';
                html += '               </div>';
                html += '           </div>';
                html += '       </div>';
                html += '       </div>';
                html += '   </div>';

                html += '   <div class="hidden" id="form-store">';
                html += '       <form action="/Menu/AddFiles" method="post" enctype="multipart/form-data" id="add">';
                html += '           <input type="hidden" name="TotalNo" id="total-image-no" />';
                html += '           <input type="hidden" name="EventID" value="' + eventId + '" />';
                html += '           <input type="hidden" name="ImageNames" id="image-names" />';
                html += '       </form>';
                html += '       <form action="/Menu/ChangeFile" method="post" enctype="multipart/form-data" id="change">';
                html += '           <input type="hidden" name="EventID" value="' + eventId + '" />';
                html += '           <input type="hidden" name="ImageName" />';
                html += '           <input type="hidden" name="ImageID" />';
                html += '           <input type="hidden" name="ImageIndex" />';
                html += '       </form>';
                html += '       <div id="restore-image"></div>';
                html += '   </div>';
                html += '   <div id="button-save">';
                html += '       <button id="btn-save" class="image-button biz-dialog-button left" >Save</button>';
                html += '   </div>';
                html += '</div>';


                popup_ex.hide("iMyMenuDialog");
                popup_ex.show("iMyMenuDialog", "", html, {
                    background: {
                        'background-color': 'transparent'
                    }, border: {
                        'background-color': 'transparent',
                        'padding': '0px'
                    }, title: {
                        'display': 'none'
                    }, content: {
                        'padding': '0px',
                        'width': '850px'
                    }, position: 'center-center'
                }, function () {
                    if (typeof overrideHiddenEvent != 'undefined') {
                        overrideHiddenEvent();
                    }
                    popup_ex.hide('iMyMenuDialog');
                });      // SonTH fix bug #25. Add overwrite event to process when dialog is closed

                setTimeout(assignEventHandlers, 500);

                //                getImages(eventId);
                var mappedMenus = jLinq.from(MenusGlobal).ignoreCase().startsWith('IsMapped', 1).select();
                getImagesMenuMapping(mappedMenus);
                $('.classic-popup-title1').hide();
                $('input[name="MenuID"]').change();
            }
        }
    })
    //end thangma

}
function openMyMenu1(eventId, day, sittingId, eventName, overrideHiddenEvent) {
    currentDay = day;
    var eventList = new Array();
    if (typeof sittingId != 'undefined') {
        $.ajax({
            url: "/BusinessHours/GetEventList",
            type: "POST",
            dataType: "json",
            data: {
                SittingID: sittingId
            },
            complete: function () {
                hideProgressDialog();
            },
            success: function (response) {
                if (response.IsSucceed) {
                    eventList = response.Events;
                    Open(eventId, day, eventName, eventList);
                }
            }
        });
    }
    else {
        Open(eventId, day);
    }
    //colect all event data


}
function getImagesMenuMapping(mappedMenus) {
    $('#slide #center').empty();
    $('#menu-name').html('');
    $("#image-viewer").data("imageNo", 0);

    if (mappedMenus != null) {
        $("#image-viewer").data("imageNo", mappedMenus.length);
        $("#image-store").data("total", mappedMenus.length);
        $("#image-store").data("counter", 0);

        //showProgressDialog("0% loaded");
        for (var i = 0; i < mappedMenus.length; i++) {
            if (mappedMenus[i].MenuImageURL.endsWith('.pdf')) {
                $('#slide #center')
                                .append($('<div class="slide-element" style="left: ' + (i * 260) + 'px;" />')
                                .append($('<div class="image" />').append($('<a class="pdf" href="' + mappedMenus[i].MenuImageURL + '" target="_blank" />')))
                                .append($('<div class="hidden image-id" />').html(mappedMenus[i].MenuID))
                                .append($('<div class="hidden image-name"/>').html(mappedMenus[i].Name))
                            );
            } else {

                var imgObj = new Image();
                $(imgObj).attr('id', i);
                $(imgObj).attr('menuid', mappedMenus[i].MenuID);
                imgObj.onload = function () {
                    $(this).data('width', $(this).width());
                    $(this).data('height', $(this).height());
                    resizeImage($(this).parents('.slide-element'), 200);
                };

                //var imageHolder = $('#slide #center');

                $('#slide #center')
                                .append($('<div class="slide-element" style="left: ' + (i * 260) + 'px;" />')
                                .append($('<div id="menu-detail" class="image" />').append(imgObj))
                                .append($('<div class="hidden image-id" />').html(mappedMenus[i].MenuID))
                                .append($('<div class="hidden image-name"/>').html(mappedMenus[i].Name))
                            );

                imgObj.src = mappedMenus[i].MenuImageURL;
            }
        }
    }

    if (mappedMenus != null && mappedMenus.length > 0) {
        fillImageInfo(0);
    }
}

function findIndexByKeyValue(obj, key, value) {
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return null;
}