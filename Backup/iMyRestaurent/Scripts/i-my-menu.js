
$(document).ready(function () {
    //    $('#btn-save').live('click', saveMyMenu);
    //    $('input[name="MenuID"]').live('change', updateGlobal);
    $('#menu-detail').live('click', showPreview);
});
var MenusGlobal;
var iMyMenuMode = "";

// SonTH fix bug #25. Add overwrite event to process when dialog is closed
function openMyMenu(eventId, day, overrideHiddenEvent) {
    iMyMenuMode = "";
    var html = "";
    html += '<div class="imymenu-dialog center-box clearfix" id="' + eventId + '" onclick="closeSearchDialog();" >';
    html += '   <div id="header" class="clearfix">';
    html += '       <button type="button" class="image-button button-imymenu-search left" onclick="openSearchDialog(event);">';
    html += '       </button>';
    html += '       <span>iMyMenu Upload Preview</span>';
    html += '       <div class="right" style="margin-right: 80px;">';
    html += '           <span style="font-weight: normal;">' + DAY_NAMES[day] + '</span>';
    html += '       </div>';
    html += '       <div id="search-dialog" style="display: none;">';
    html += '           <div id="search-div">';
    html += '               <input type="text" />';
    html += '           </div>';
    html += '           <ul></ul>';
    html += '       </div>';
    html += '   </div>';
    html += '   <div id="image-viewer">';
    html += '       <div id="slide" class="clearfix center-box">';
    html += '           <div id="prev" class="left"></div>';
    html += '           <div id="next" class="right"></div>';
    html += '           <div id="center" class="center-box">';
    html += '           </div>';
    html += '       </div>';
    html += '       <div id="image-info" class="center-box hidden">';
    html += '           <div>';
    html += '               <input type="text" readonly="readonly" id="txt-image-name" />';
    html += '           </div>';
    html += '           <div id="button-edit" class="center-box"></div>';
    html += '       </div>';
    html += '   </div>';
    html += '   <div id="button-panel" class="clearfix">';
    html += '       <div class="button-group left">';
    html += '           <button type="button" class="image-button button-imymenu-change left" style="position: relative;">';
    if (jQuery.browser.mobile) {
        html += '           <div class="mobile-mask"></div>';
    } else {
        html += '           <input type="file" name="Image" accept="image/*, application/pdf" />';
    }
    html += '           </button>';
    html += '           <button type="button" class="image-button button-imymenu-add left" style="position: relative;">';
    if (jQuery.browser.mobile) {
        html += '           <div class="mobile-mask"></div>';
    } else {
        html += '           <input type="file" name="Images" accept="image/*, application/pdf" />';
    }
    html += '           </button>';
    html += '       </div>';
    html += '       <div class="button-group left">';
    html += '           <button type="button" class="image-button button-imymenu-upload left"></button>';
    html += '           <button type="button" class="image-button button-imymenu-cancel left" onclick="cancel();"></button>';
    html += '       </div>';
    html += '       <div class="button-group left">';
    html += '           <button type="button" class="image-button button-imymenu-delete left" onclick="deleteImage();"></button>';
    html += '       </div>';
    html += '       <div class="button-group left">';
    html += '           <button type="button" class="image-button button-imymenu-copy left" onclick="openCopyDialog();"></button>';
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

    getImages(eventId);
}
function showPreview() {
}
//function updateGlobal() {
//    $('input[name="MenuID"]:checked').each(function () {
//        var menu = jLinq.from(MenusGlobal).ignoreCase().startsWith('MenuID', $(this).val()).first();
//        menu.IsMapped = 1;
//    });
//    var mappedMenus = jLinq.from(MenusGlobal).ignoreCase().startsWith('IsMapped', 1).select();
//    getImagesMenuMapping(mappedMenus);
//}
//function saveMyMenu() {
//    showProgressDialog('Saving');
//    //collect data
//    //    var events = new Array();
//    var events = '';
//    $('input[name="EventID"]').each(function () {
//        if ($(this).attr('checked')) {
//            //            events.push($(this).val());
//            events += $(this).val() + ';';
//        }
//    });
//    //    var menus = new Array();
//    var menus = '';
//    $('input[name="MenuID"]').each(function () {
//        if ($(this).attr('checked')) {
//            //            menus.push($(this).val());
//            menus += $(this).val() + ';';
//        }
//    });
//    $.ajax({
//        type: 'post',
//        url: '/BusinessHours/SetMappings',
//        data: {
//            Events: events,
//            Menus: menus
//        },
//        complete: function () {
//            hideProgressDialog();
//            //            handler.setting.close();
//        },
//        success: function (response) {
//        }
//    });
//}
//function openMyMenu1(eventId, day, overrideHiddenEvent) {
//    showProgressDialog('Openning Menu Mapping');
//    //thangma
//    var events = '';
//    for (var i = 0; i <= 6; i++) {
//        if ($('.event-id.' + i.toString()).find('span').html() != eventId) {
//            events += $('.event-id.' + i.toString()).find('span').html() + ';';
//        }
//    }
//    $.ajax({
//        url: "/BusinessHours/GetMappings",
//        type: "POST",
//        dataType: "json",
//        data: {
//            EventID: eventId,
//            OtherEvents: events
//        },
//        complete: function () {
//            hideProgressDialog();
//        },
//        success: function (itemData) {
//            if (itemData.IsSucceed) {
//                MenusGlobal = itemData.Menus;
//                iMyMenuMode = "";
//                var html = "";

//                var eventIDMonday = $('td[class="event-id 0"]').find('span').html();
//                var indexMonday = $.inArray(eventIDMonday, itemData.EventsSame);
//                var CheckedMonday = $('td[class="event-id 0"]').find('span').html() == eventId ? 'checked="checked"' : (indexMonday != -1 ? 'checked="checked"' : '');

//                var eventIDTuesday = $('td[class="event-id 1"]').find('span').html();
//                var indexTuesday = $.inArray(eventIDTuesday, itemData.EventsSame);
//                var CheckedTuesday = $('td[class="event-id 1"]').find('span').html() == eventId ? 'checked="checked"' : (indexTuesday != -1 ? 'checked="checked"' : '');

//                var eventIDWednesday = $('td[class="event-id 2"]').find('span').html();
//                var indexWednesday = $.inArray(eventIDWednesday, itemData.EventsSame);
//                var CheckedWednesday = $('td[class="event-id 2"]').find('span').html() == eventId ? 'checked="checked"' : (indexWednesday != -1 ? 'checked="checked"' : '');

//                var eventIDThursday = $('td[class="event-id 3"]').find('span').html();
//                var indexThursday = $.inArray(eventIDThursday, itemData.EventsSame);
//                var CheckedThursday = $('td[class="event-id 3"]').find('span').html() == eventId ? 'checked="checked"' : (indexThursday != -1 ? 'checked="checked"' : '');

//                var eventIDFriday = $('td[class="event-id 4"]').find('span').html();
//                var indexFriday = $.inArray(eventIDFriday, itemData.EventsSame);
//                var CheckedFriday = $('td[class="event-id 4"]').find('span').html() == eventId ? 'checked="checked"' : (indexFriday != -1 ? 'checked="checked"' : '');

//                var eventIDSaturday = $('td[class="event-id 5"]').find('span').html();
//                var indexSaturday = $.inArray(eventIDSaturday, itemData.EventsSame);
//                var CheckedSaturday = $('td[class="event-id 5"]').find('span').html() == eventId ? 'checked="checked"' : (indexSaturday != -1 ? 'checked="checked"' : '');

//                var eventIDSunday = $('td[class="event-id 6"]').find('span').html();
//                var indexSunday = $.inArray(indexSunday, itemData.EventsSame);
//                var CheckedSunday = $('td[class="event-id 6"]').find('span').html() == eventId ? 'checked="checked"' : (indexSunday != -1 ? 'checked="checked"' : '');

//                html += '<div style="height:350px;" class="imymenu-dialog center-box clearfix" id="' + eventId + '" onclick="closeSearchDialog();" >';
//                html += '   <div >';
//                html += '       <div id="left-col">';
//                html += '           <div>';
//                html += '           </div>';
//                html += '           <div>';
//                html += '               <div id="list-checkbox-name" >Apply for selected days';
//                html += '               </div>';
//                html += '               <div class="list-checkbox">';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" value="" >';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>All</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';

//                html += '                           <input type="checkbox" ' + CheckedMonday + ' value="' + $('td[class="event-id 0"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Monday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" ' + CheckedTuesday + ' value="' + $('td[class="event-id 1"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Tuesday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" ' + CheckedWednesday + ' value="' + $('td[class="event-id 2"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Wednesday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" ' + CheckedThursday + ' value="' + $('td[class="event-id 3"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Thursday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" ' + CheckedFriday + ' value="' + $('td[class="event-id 4"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Friday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" ' + CheckedSaturday + ' value="' + $('td[class="event-id 5"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Saturday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '                   <div class="line clearfix">';
//                html += '                       <div class="checkbox">';
//                html += '                           <input type="checkbox" ' + CheckedSunday + ' value="' + $('td[class="event-id 6"]').find('span').html() + '" name="EventID">';
//                html += '                       </div>';
//                html += '                       <div class="item-name">';
//                html += '                           <span>Sunday</span>';
//                html += '                       </div>';
//                html += '                   </div>';
//                html += '               </div>';
//                html += '               <div id="list-checkbox-name" >Menu List';
//                html += '               </div>';
//                html += '               <div class="list-checkbox">';
//                for (var i = 0; i < MenusGlobal.length; i++) {
//                    var menuName = MenusGlobal[i].Name.length > 0 ? MenusGlobal[i].Name : '[Unnamed]';
//                    var isMapped = MenusGlobal[i].IsMapped == 1 ? 'checked="checked"' : '';
//                    html += '               <div class="line clearfix">';
//                    html += '                   <div class="checkbox">';
//                    html += '                       <input type="checkbox" ' + isMapped + ' value="' + MenusGlobal[i].MenuID + '" name="MenuID">';
//                    html += '                   </div>';
//                    html += '                   <div class="item-name">';
//                    html += '                       <span>' + menuName + '</span>';
//                    html += '                   </div>';
//                    html += '               </div>';
//                }
//                html += '               </div>';
//                html += '           </div>';
//                html += '       </div>';
//                html += '       <div id="right-col" style="float:right;" >';
//                html += '           <div id="search-button" >';
//                //                html += '               <input type="text" readonly="readonly" />';
//                html += '               <button type="button" class="image-button button-imymenu-search left" onclick="openSearchDialog(event);">';
//                html += '               </button>';
//                
//                html += '               <div id="search-dialog" style="display: none;">';
//                html += '                   <div id="search-div">';
//                html += '                       <input type="text" />';
//                html += '                   </div>';
//                html += '                   <ul></ul>';
//                html += '               </div>';
//                html += '           </div>';
//                html += '           <div  id="image-viewer">';
//                html += '           <div id="slide"  class="clearfix center-box">';
//                html += '               <div id="prev" class="left"></div>';
//                html += '               <div id="next" class="right"></div>';
//                html += '               <div id="center" class="center-box">';
//                html += '               </div>';
//                html += '           </div>';
//                html += '           <div id="image-info" class="center-box hidden">';
//                html += '               <div>';
//                html += '                   <span id="menu-name" ></span><input type="text" style="display:none;"readonly="readonly" id="txt-image-name" />';
//                html += '               </div>';
//                html += '           </div>';
//                html += '       </div>';
//                html += '       </div>';
//                html += '   </div>';

//                html += '   <div class="hidden" id="form-store">';
//                html += '       <form action="/Menu/AddFiles" method="post" enctype="multipart/form-data" id="add">';
//                html += '           <input type="hidden" name="TotalNo" id="total-image-no" />';
//                html += '           <input type="hidden" name="EventID" value="' + eventId + '" />';
//                html += '           <input type="hidden" name="ImageNames" id="image-names" />';
//                html += '       </form>';
//                html += '       <form action="/Menu/ChangeFile" method="post" enctype="multipart/form-data" id="change">';
//                html += '           <input type="hidden" name="EventID" value="' + eventId + '" />';
//                html += '           <input type="hidden" name="ImageName" />';
//                html += '           <input type="hidden" name="ImageID" />';
//                html += '           <input type="hidden" name="ImageIndex" />';
//                html += '       </form>';
//                html += '       <div id="restore-image"></div>';
//                html += '   </div>';
//                html += '   <div id="button-save">';
//                html += '       <button id="btn-save" class="image-button biz-dialog-button left" >Save</button>';
//                html += '   </div>';
//                html += '</div>';


//                popup_ex.hide("iMyMenuDialog");
//                popup_ex.show("iMyMenuDialog", "", html, {
//                    background: {
//                        'background-color': 'transparent'
//                    }, border: {
//                        'background-color': 'transparent',
//                        'padding': '0px'
//                    }, title: {
//                        'display': 'none'
//                    }, content: {
//                        'padding': '0px',
//                        'width': '850px'
//                    }, position: 'center-center'
//                }, function () {
//                    if (typeof overrideHiddenEvent != 'undefined') {
//                        overrideHiddenEvent();
//                    }
//                    popup_ex.hide('iMyMenuDialog');
//                });      // SonTH fix bug #25. Add overwrite event to process when dialog is closed

//                setTimeout(assignEventHandlers, 500);

//                //                getImages(eventId);
//                var mappedMenus = jLinq.from(MenusGlobal).ignoreCase().startsWith('IsMapped', 1).select();
//                getImagesMenuMapping(mappedMenus);
//            }
//        }
//    })
//    //end thangma


//}
function openCopyDialog() {
    var parentDialog = $('.imymenu-dialog');

    $('body').append($('<div id="copy-dialog-mask" />'));

    $('#copy-dialog-mask').width(Utils.pageW());
    $('#copy-dialog-mask').height(Utils.pageH());

    $('#copy-dialog-mask').click(function () {
        $(this).remove();
        $('#copy-dialog').remove();
    });

    // generate html
    var html = '';
    html += '<div id="copy-dialog">';
    html += '   <div class="copy-selection" id="location-selection">';
    html += '       <ul>';
    html += '       </ul>';
    html += '   </div>';
    html += '   <div class="copy-selection" id="menu-selection">';
    html += '       <ul>';
    html += '       </ul>';
    html += '   </div>';
    html += '   <div class="copy-selection" id="day-selection">';
    html += '       <ul>';
    html += '       </ul>';
    html += '   </div>';
    html += '</div>';
    $('body').append(html);

    Utils.touchScroll('#copy-dialog ul');

    var top = parseInt($('#iMyMenuDialog').css('top')) + 90;

    Utils.positioningDialog($('#copy-dialog'), top, 'center');

    showProgressDialog('Loading location list');

    // get location list
    $.ajax({
        type: 'post',
        url: '/Location/GetLocationList',
        success: function (response) {
            hideProgressDialog();
            if (response.IsSucceed) {
                if (response.Locations != null) {
                    for (var i = 0; i < response.Locations.length; i++) {
                        var className = i == 0 ? ' class="first"' : '';
                        $('#location-selection ul').append($('<li' + className + ' />').attr('id', response.Locations[i].LocationID).text(response.Locations[i].Name));
                    }

                    $('#location-selection ul li').click(selectLocation);
                }
            } else {
                Utils.showError();
            }
        }
    });
}

function selectLocation() {
    $('#location-selection ul li.selected').removeClass('selected');
    $(this).addClass('selected');

    var locationId = $(this).attr('id');

    showProgressDialog('Loading menu list');
    $('#menu-selection ul').empty();
    $('#day-selection ul').empty();

    $.ajax({
        type: 'post',
        url: '/BusinessHours/GetMenuList',
        data: {
            LocationID: locationId
        },
        success: function (response) {
            hideProgressDialog();
            if (response.IsSucceed) {
                if (response.Menus != null) {
                    for (var i = 0; i < response.Menus.length; i++) {
                        var className = i == 0 ? ' class="first"' : '';
                        $('#menu-selection ul').append($('<li' + className + ' />').attr('id', response.Menus[i].SittingID).text(response.Menus[i].EventName));
                    }

                    $('#menu-selection ul li').click(selectMenu);
                }
            } else {
                Utils.showError();
            }
        }
    });
}

function selectMenu() {
    $('#menu-selection ul li.selected').removeClass('selected');
    $(this).addClass('selected');

    var sittingId = $(this).attr('id');

    showProgressDialog('Loading event list');
    $('#day-selection ul').empty();

    $.ajax({
        type: 'post',
        url: '/BusinessHours/GetEventList',
        data: {
            SittingID: sittingId
        },
        success: function (response) {
            hideProgressDialog();

            if (response.IsSucceed) {
                for (var i = 0; i < response.Events.length; i++) {
                    var className = i == 0 ? ' class="first"' : '';
                    $('#day-selection ul').append($('<li' + className + ' />').attr('id', response.Events[i].EventID).text(DAY_NAMES[i]));
                }

                $('#day-selection ul li').click(copyMenu);
            } else {
                Utils.showError();
            }
        }
    });
}

function copyMenu() {
    var eventId = $(this).attr('id');
    $(this).addClass('selected');

    showProgressDialog('Copying menu');

    $.ajax({
        type: 'post',
        url: '/Menu/Copy',
        data: {
            TargetEventID: $('.imymenu-dialog').attr('id'),
            SourceEventID: eventId
        },
        success: function (response) {
            hideProgressDialog();

            if (response.IsSucceed) {
                showAndHideProgressDialog('Copy menu successfully!');
                $('#copy-dialog-mask').click();
                $('#slide #center').empty();
                $('#image-info').addClass('hidden');
                getImages($('.imymenu-dialog').attr('id'));
                cancel();
            } else {
                Utils.showError();
            }
        }
    });
}

function closeSearchDialog() {
    $('#search-dialog').fadeOut('slow');
}

function openSearchDialog(e) {
    $('#search-dialog').css('top', '63px');
    $('#search-dialog').css('left', '210px');
    e.stopPropagation();

    $('#search-dialog').fadeIn('slow');
    searchImage();
}

function searchImage() {
    var pattern = $.trim($("#search-dialog input").val());

    var results = {};

    $.each($('#slide #center .slide-element'), function (key, value) {
        var imageName = $(value).find('.image-name').text();

        if (pattern.length === 0 || imageName.toLowerCase().indexOf(pattern.toLowerCase(), 0) != -1) {
            results[key] = imageName;
        }
    });

    var list = $("#search-dialog ul");
    list.empty();

    for (key in results) {
        list.append($('<li class="' + key + '"/>').html(results[key]));
    }

    $("#search-dialog li").click(function (e) {
        e.stopPropagation();
        var index = parseInt($(this).attr("class"));
        closeSearchDialog();
        moveSlide(index);
    });
}

function cancel() {
    if (iMyMenuMode === "Add") {
        //var currentIndex = parseInt($("#image-viewer #slide #center .slide-element").attr("class").replace("slide-element ", ""));

        var currentIndex = getViewedIndex();

        // clear all added image
        $.each($('#slide #center .slide-element'), function (key, value) {
            var imageId = $(value).find('.image-id').text();

            if (imageId.length === 0) {
                $(value).remove();
            }
        });

        $('#form-store form#add input[type="file"]').remove();

        moveSlide(newIndex(currentIndex));

    } else if (iMyMenuMode === 'Change') {
        var restoringImg = $('#form-store #restore-image .image');

        var index = parseInt(restoringImg.attr('class').replace('image ', ''));
        restoringImg.attr('class', 'image');

        $($('#slide #center .slide-element')[index]).find('.image').remove();

        $($('#slide #center .slide-element')[index]).append(restoringImg);

        moveSlide(index);

        // restore file input
        $(".button-imymenu-change").append('<input type="file" name="Image" accept="image/*, application/pdf" />');
        $(".button-imymenu-change input").change(changeImage);
        $(".button-imymenu-change input").click(preChangeImage);

        // empty resotre image
        $("#restore-image").empty();
    }

    iMyMenuMode = "";
}

function deleteImage() {
    var element = $('#slide #center .slide-element');

    if (element.length > 0) {
        MessageBox.show({
            message: ['Do you want to delete this menu?'],
            buttons: {
                no: null,
                yes: function () {
                    var currentIndex = getViewedIndex();

                    var imageId = $(element[currentIndex]).find('.image-id').text();

                    if (imageId.length > 0) {
                        // ajax call to delete in DB
                        showProgressDialog('Deleting');

                        $.ajax({
                            type: 'post',
                            data: {
                                imageId: imageId
                            },
                            url: '/Menu/DeleteImage',
                            success: function (response) {
                                hideProgressDialog();

                                if (response.IsSucceed) {
                                    // delete in local
                                    $($('#slide #center .slide-element')[currentIndex]).remove();

                                    moveSlide(newIndex(currentIndex));
                                } else {
                                    Utils.showError();
                                }
                            }
                        });
                    } else {
                        // delete in local
                        $($('#slide #center .slide-element')[currentIndex]).remove();

                        // remove input control
                        $($("#form-store form#add input[type='file']")[currentIndex - imageNo]).remove();

                        moveSlide(newIndex(currentIndex));
                    }
                }
            }
        });
    }
}

function newIndex(index) {
    var total = $('#slide #center .slide-element').length;

    if (total == 0) {
        $('#image-info').addClass("hidden");
        return -1;
    }

    if (index >= total) return (total - 1);

    return index;
}

function assignEventHandlers() {
    Utils.touchScroll('#search-dialog ul');

    $('.mobile-mask').click(function () {
        MessageBox.show({
            message: [
                'iMyMenu file load/ maintenance is not supported on mobile devices! ' +
                'Please use your PC or Mac to upload or maintain your restaurant\'s menus.'
            ],
            buttons: {
                ok: null
            }
        });
    });
    // assign handler
    $('#slide #prev').click(moveSlidePrev);
    $('#slide #next').click(moveSlideNext);

    $("#search-dialog, #search-dialog *").not("li").click(function (e) {
        e.stopPropagation();
    });
    $("#search-dialog input").bind("keydown keyup", function (event) {
        searchImage();
    });

    //$("#txt-image-name").focusout(editImageName);
    $(".button-imymenu-add input").change(addImage);
    $(".button-imymenu-add input").click(preAddImage);
    $(".button-imymenu-change input").change(changeImage);
    $(".button-imymenu-change input").click(preChangeImage);
    $("#button-edit").click(triggerEditImageName);
    $(".button-imymenu-upload").click(uploadImages);
    $("#form-store form#add").ajaxForm(function (response) {
        if (response.IsSucceed) {
            iMyMenuMode = "";
            showAndHideProgressDialog("Menus have been uploaded successfully!");

            var inputs = $("#form-store form#add input[type='file']");
            $.each(inputs, function (key, value) {
                $(value).remove();
            });

            // update image-id
            var addingLength = response.ImageIDs.length;

            var totalNo = $('#slide #center .slide-element').length;

            for (var i = 0; i < addingLength; i++) {
                var element = $('#slide #center .slide-element')[totalNo - addingLength + i];

                $(element).find('.image-id').text(response.ImageIDs[i].ImageID);

                if ($(element).find('img').length > 0) {
                    $(element).find('img').attr('src', response.ImageIDs[i].URLPath);
                } else {
                    $(element).find('a').attr('href', response.ImageIDs[i].URLPath);
                }
            }

            //            var stores = $("#image-store .slide-element");

            //            $("#image-viewer").data("imageNo", stores.length);

            //            var currentIndex = parseInt($("#image-viewer #slide").attr("class"));

            //            for (var i = 0; i < addingLength; i++) {
            //                // update id
            //                var element = $(stores[stores.length - addingLength + i]);
            //                element.find(".image-id").text(response.ImageIDs[i]);
            //            }

            //            moveSlide(currentIndex);

        } else {
            hideProgressDialog();
            Utils.showError();
        }
    });

    $("#form-store form#change").ajaxForm(function (response) {

        if (response.IsSucceed) {
            iMyMenuMode = "";

            showAndHideProgressDialog("Menus have been uploaded successfully!");

            // update url
            var element = $('#slide #center .slide-element')[response.Index];

            if ($(element).find('a').length > 0) {
                $(element).find('a').attr('href', response.Url);
            } else {
                $(element).find('img').attr('src', response.Url);
            }

            // restore file input
            $(".button-imymenu-change").append('<input type="file" name="Image" accept="image/*, application/pdf" />');
            $(".button-imymenu-change input").change(changeImage);
            $(".button-imymenu-change input").click(preChangeImage);

            // delete
            $("#restore-image").empty();
        } else {
            hideProgressDialog();
            Utils.showError();
        }
    });

    $("#image-viewer #center img").live('click', function () {
        FullscreenViewer.show();
    });
    //assign handler for Menu mapping
    $("#image-menu-viewer #center img").live('click', function () {
        FullscreenViewer.showPreview($(this).attr('menuid'));
    });
    // show hide secondary language & description
    $('#showSecondLang').live('change', function () {
        if ($('#showSecondLang').is(':checked')) {
            $('*[langtype="secondary"]').show();
        } else {
            $('*[langtype="secondary"]').hide();
        }
    });
    $('#showDescription').live('change', function () {
        if ($('#showDescription').is(':checked')) {
            $('*[for="description"]').show();
        } else {
            $('*[for="description"]').hide();
        }
    });
    $('#drop-language').live('change', editor.lang.change);
    $('#btn-back').live('click', function () {
        $('#fullscreen-menu-viewer-overlay').hide();
        $('#fullscreen-menu-viewer').hide();
        $('#fullscreen-menu-viewer-overlay').remove();
        $('#fullscreen-menu-viewer').remove();
    })
}


function getImages(eventId) {
    showProgressDialog("Loading image list");
    $.ajax({
        type: "post",
        url: "/Menu/GetImages",
        data: {
            EventID: eventId
        },
        timeout: 600000,
        error: function (x, t, m) {
            hideProgressDialog();
            MessageBox.show({
                message: [t],
                buttons: {
                    ok: null
                }
            });
        },
        success: function (response) {
            hideProgressDialog();
            $("#image-viewer").data("imageNo", 0);

            if (response.IsSucceed) {
                if (response.Images != null) {
                    $("#image-viewer").data("imageNo", response.Images.length);
                    $("#image-store").data("total", response.Images.length);
                    $("#image-store").data("counter", 0);

                    //showProgressDialog("0% loaded");
                    for (var i = 0; i < response.Images.length; i++) {
                        if (response.Images[i].URLPath.endsWith('.pdf')) {
                            $('#slide #center')
                                .append($('<div class="slide-element" style="left: ' + (i * 260) + 'px;" />')
                                .append($('<div class="image" />').append($('<a class="pdf" href="' + response.Images[i].URLPath + '" target="_blank" />')))
                                .append($('<div class="hidden image-id" />').html(response.Images[i].ImageID))
                                .append($('<div class="hidden image-name"/>').html(response.Images[i].ImageName))
                            );
                        } else {

                            var imgObj = new Image();
                            $(imgObj).attr('id', i);

                            imgObj.onload = function () {
                                $(this).data('width', $(this).width());
                                $(this).data('height', $(this).height());
                                resizeImage($(this).parents('.slide-element'), 200);
                            };

                            //var imageHolder = $('#slide #center');

                            $('#slide #center')
                                .append($('<div class="slide-element" style="left: ' + (i * 260) + 'px;" />')
                                .append($('<div class="image" />').append(imgObj))
                                .append($('<div class="hidden image-id" />').html(response.Images[i].ImageID))
                                .append($('<div class="hidden image-name"/>').html(response.Images[i].ImageName))
                            );

                            imgObj.src = response.Images[i].URLPath;
                        }
                    }
                }

                if (response.Images != null && response.Images.length > 0) {
                    fillImageInfo(0);
                }
            } else {
                Utils.showError();
            }
        }
    });
}

function fillImageInfo(index) {
    $('#image-info').removeClass('hidden');

    var image = $('#slide #center .slide-element')[index];

    $('#txt-image-name').val($(image).find('.image-name').text());

    $('#button-edit').removeClass('active');

    $('#txt-image-name').attr('readonly', 'readonly');

    $('#menu-name').html($(image).find('.image-name').text());
}

function preChangeImage() {
    return iMyMenuMode.length === 0 && $("#slide #center .slide-element").length > 0;
}

function changeImage(event) {
    iMyMenuMode = 'Change';

    showProgressDialog('Changing');

    // get current index
    var index = getViewedIndex();

    var files = this.files;

    // store old file for recovering
    var oldImg = $($('#slide #center .slide-element')[index]).find('.image');

    $('#form-store #restore-image').append(oldImg.attr('class', 'image ' + index));

    if (files[0].type == 'application/pdf') {
        $($('#slide #center .slide-element')[index]).append($('<div class="image" />').append($('<a class="pdf" target="_blank" />')));

        showAndHideProgressDialog('Change image successfully!');
    } else {

        var reader = new FileReader();

        reader.onload = (function (theFile) {
            return function (e) {
                var objImg = new Image();

                objImg.onload = function () {
                    showAndHideProgressDialog('Change image successfully!');

                    $(this).data('width', $(this).width());
                    $(this).data('height', $(this).height());
                    resizeImage($(this).parents('.slide-element'), 200);
                };

                $($('#slide #center .slide-element')[index]).append($('<div class="image" />').append(objImg));

                objImg.src = e.target.result;
            };
        })(files[0]);

        // Read in the image file as a data URL.
        reader.readAsDataURL(files[0]);
    }

    // move input control to form#change
    $(".button-imymenu-change input").appendTo($("#form-store form#change"));
}

function uploadImages() {
    if (iMyMenuMode == 'Add') {
        var form = $('#form-store form#add');

        if (form.children('input[type="file"]').length > 0) {

            showProgressDialog('Uploading');
            form.children('input#total-image-no').val($('#slide #center .slide-element').length);

            var imageNames = '';

            $.each($('#slide #center .slide-element'), function (key, value) {
                var id = $(value).find('.image-id').text();

                if (id.length === 0) {
                    imageNames += $(value).find('.image-name').text() + "|";
                }
            });

            imageNames = imageNames.substring(0, imageNames.length - 1);

            form.children('input#image-names').val(imageNames);

            form.submit();
        }
    } else if (iMyMenuMode === 'Change') {
        var index = parseInt($('#restore-image .image').attr('class').replace('image ', ''));

        var imageName = $($('#slide #center .slide-element')[index]).find('.image-name').text();
        var imageId = $($('#slide #center .slide-element')[index]).find('.image-id').text();

        $('#form-store form#change input[name="ImageIndex"]').val(index);
        $('#form-store form#change input[name="ImageName"]').val(imageName);
        $('#form-store form#change input[name="ImageID"]').val(imageId);

        showProgressDialog('Uploading');
        $('#form-store form#change').submit();
    }
}

function preAddImage() {
    if (iMyMenuMode === "Add" || iMyMenuMode.length === 0) {
        return true;
    } else {
        return false;
    }
}

function addImage(event) {
    iMyMenuMode = "Add";

    //alert($(this).val());   
    showProgressDialog('Adding');
    var files = this.files;
    $(this).unbind();

    // check type
    if (files[0].type == 'application/pdf') {
        var lastPos = parseInt($('#slide #center .slide-element:last').css('left'));

        if (isNaN(lastPos)) { lastPos = -260; }

        $('#slide #center')
            .append($('<div class="slide-element" style="left: ' + (lastPos + 260) + 'px;" />')
            .append($('<div class="image"/>').append($('<a class="pdf" target="_blank" />')))
            .append($('<div class="hidden image-id" />'))
            .append($('<div class="hidden image-name"/>').html(files[0].name)));

        moveSlide($('#slide #center .slide-element').length - 1);

        showAndHideProgressDialog('Add image successfully!');
    } else {

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var objimg = new Image();

                objimg.onload = function () {
                    $(this).data('width', $(this).width());
                    $(this).data('height', $(this).height());
                    resizeImage($(this).parents('.slide-element'), 200);

                    moveSlide($('#slide #center .slide-element').length - 1);

                    showAndHideProgressDialog('Add image successfully!');
                };

                var lastPos = parseInt($('#slide #center .slide-element:last').css('left'));

                if (isNaN(lastPos)) { lastPos = -260; }

                $('#slide #center')
                .append($('<div class="slide-element" style="left: ' + (lastPos + 260) + 'px;" />')
                .append($('<div class="image"/>').append(objimg))
                .append($('<div class="hidden image-id" />'))
                .append($('<div class="hidden image-name"/>').html(theFile.name)));

                objimg.src = e.target.result;
            };
        })(files[0]);

        // Read in the image file as a data URL.
        reader.readAsDataURL(files[0]);
    }

    var form = $('#form-store form#add');

    // move element
    $('.button-imymenu-add input').appendTo(form);

    // create new file input
    $('.button-imymenu-add').append('<input type="file" name="Images" accept="image/*, application/pdf" />');
    $('.button-imymenu-add input').change(addImage);
    $('.button-imymenu-add input').click(preAddImage);
}

function triggerEditImageName() {
    var isEditing = $("#button-edit").hasClass("active");

    if (!isEditing) {
        // begin edit
        $("#button-edit").addClass("active");
        $("#txt-image-name").removeAttr("readonly");
        $("#txt-image-name").focus();
    } else {
        editImageName();
    }
}

function editImageName() {
    // stop edit, update name
    var imageName = $.trim($('#txt-image-name').val());

    if (imageName.length == 0) {
        MessageBox.show({
            message: ['Please enter in the menu name! (I.e. Lunch, Main Course, Desert or Drinks)'],
            buttons: {
                ok: function () {
                    $('#txt-image-name').focus();
                }
            }
        });
        return;
    }

    //var imageId = $("#slide #center .slide-element").find(".image-id").text();
    //var index = $("#slide #center .slide-element").attr("class").replace("slide-element ", "");
    var index = getViewedIndex();
    var imageId = $($('#slide #center .slide-element')[index]).find('.image-id').text();

    if (imageId.length === 0) {
        // recently add, isn't in DB -> change name local
        $('#button-edit').removeClass('active');
        $('#txt-image-name').attr('readonly', 'readonly').value(imageName);
        //$('#txt-image-name')
        $($('#slide #center .slide-element')[index]).find('.image-name').text(imageName);

        return;
    }

    showProgressDialog("Saving");

    $.ajax({
        type: "post",
        url: "/Menu/EditImageName",
        data: {
            imageId: imageId,
            imageName: imageName
        },
        success: function (response) {
            hideProgressDialog();

            $('#button-edit').removeClass("active");
            $('#txt-image-name').attr('readonly', 'readonly').val(imageName);
            //$('#txt-image-name')
            $($('#slide #center .slide-element')[index]).find('.image-name').text(imageName);
        }
    });
}

function getViewedIndex() {
    var index = -1;

    $.each($('#slide #center .slide-element'), function (key, value) {
        if (parseInt($(value).css('left'), 10) == 0) {
            index = key;
            return false;
        }
    });

    return index;
}

function moveSlidePrev() {
    moveSlide(getViewedIndex() - 1);
}

function moveSlideNext() {
    moveSlide(getViewedIndex() + 1);
}

function resizeImage(element, limit) {
    var img = element.find("img");

    var imgH = parseFloat(img.data('height'));
    var imgW = parseFloat(img.data('width'));
    var ratio = imgW / imgH;

    // compare height & width
    if (imgW > imgH) {
        // width > height
        if (imgW > limit) {
            imgW = limit;
            imgH = limit / ratio;
        }
    } else {
        // width < height
        if (imgH > limit) {
            imgH = limit;
            imgW = limit * ratio;
        }
    }

    img.width(imgW);
    img.height(imgH);

    var marginT = (element.height() - imgH) / 2;

    img.parent().css("padding-top", marginT);
}

function moveSlide(target) {
    var total = $("#slide #center .slide-element").length;
    $("#slide").unbind();

    if (0 <= target && target < total) {
        var destination = $($('#slide #center .slide-element')[target]);

        var offset = parseInt(destination.css('left'), 10);

        $('#slide #prev, #slide #next').unbind();

        $("#slide").bind('stopMoving', function () {
            // restore handler
            $('#slide #prev').click(moveSlidePrev);
            $('#slide #next').click(moveSlideNext);

            // show info
            fillImageInfo(target);
        });

        $.each($('#slide #center .slide-element'), function (key, value) {
            var left = parseInt($(value).css('left'), 10);
            $(value).animate({
                left: (key - target) * 260
            }, 500, function () {
                if (key == total - 1) {
                    $('#slide').trigger('stopMoving');
                }
            });
        });
    }
}

/**
* jQuery.browser.mobile (http://detectmobilebrowser.com/)
*
* jQuery.browser.mobile will be true if the browser is a mobile device
*
**/
(function (a) { jQuery.browser.mobile = /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera);