$(document).ready(function () {
    showAndHideProgressDialog('Loading the Menu list');
    // handle events
    handler.initialize();

    // reset view
    editor.resetter.menu();

    //$("#menu-preview-icon").hide();
    //$("#menu-inputfile-icon").hide();
    if (jQuery.browser.mobile) {
        $('div[class="image-button search-for-icon"]').html('');
        $('div[class="image-button search-for-icon"]').append('<div class="mobile-mask"></div>');
        $('div[class="image-button search-for-image"]').html('');
        $('div[class="image-button search-for-image"]').append('<div class="mobile-mask"></div>');
    }
});

var handler = {
    initialize: function () {
        handler.common();
        handler.get();
        handler.add();
        handler.save();
        handler.callback();
        handler.submit();
        handler.change();
        handler.del();
        handler.ChangeDisplayOrder();
        handler.delicon();
        //for upload image
        $(".menu-input-file").change(editor.helper.displayPreview);
        $("#menu-select-imageicon,#item-select-imageicon").change(editor.helper.imageGroupHandle);
        $(".menu-input-file").click(editor.helper.handleValidateIcon);
    },
    setting: {
        flagSaveClose: false,
        isChange: function () {
            return handler.setting.initState != handler.setting.getCurrentState() ? true : false;
        },
        initState: '',
        getCurrentState: function () {
            var value = '';
            $('input[for="block-order"]').each(function () {
                value += $(this).is(':checked') ? 'true' : 'false';
            });
            $('input[for="delivable"]').each(function () {
                value += $(this).is(':checked') ? 'true' : 'false';
            });
            $('input[for="delivery-zone"]').each(function () {
                value += $(this).val();
            });
            $('input[for="pick-up"]').each(function () {
                value += $(this).is(':checked') ? 'true' : 'false';
            });
            return value;
        },
        // handler.setting.open
        open: function () {
            showProgressDialog('Opening settings');
            $.ajax({
                type: 'post',
                url: '/Menu/GetLocationList',
                complete: function () {
                    hideProgressDialog();
                },
                success: function (response) {
                    var html = '';
                    html += '<div id="setting-dialog" class="popup-dialog lv4 detail-dialog" style="background: #f2d5c7;">';
                    html += '   <div class="header-setting" ><div class="title"  >Common Menu Settings for Locations</div><div style="float:right;" >';
                    html += '<a id="btn-setting-close" href="#" class="classic-popup-close" title="Close"><img src="/Content/images/details-close-btn.png" width="21" height="21"></a>';
                    html += '</div></div>';
                    html += '   <div>';
                    html += '       <table id="table-setting" class="setting" >';
                    html += '           <tr class="header" >';
                    html += '               <td class="location-name">Location Name';
                    html += '               </td>';
                    html += '               <td>Block Order';
                    html += '               </td>';
                    html += '               <td>Deliverable';
                    html += '               </td>';
                    html += '               <td>Delivery Zone(km)';
                    html += '               </td>';
                    html += '               <td>Pick up';
                    html += '               </td>';
                    html += '           </tr>';
                    html += '           <tr class="first">';
                    html += '               <td class="location-name" >All';
                    html += '               </td>';
                    html += '               <td><input to="block-order" id="all-block-order" type="checkbox">';
                    html += '               </td>';
                    html += '               <td><input to="delivable" id="all-delivable" type="checkbox">';
                    html += '               </td>';
                    html += '               <td><input class="delivery-zone" id="all-delivery-zone" type="textbox">';
                    html += '               </td>';
                    html += '               <td><input to="pick-up" id="all-pick-up" type="checkbox">';
                    html += '               </td>';
                    html += '           </tr>';
                    if (response.Locations != null) {
                        for (var i = 0; i < response.Locations.length; i++) {
                            var locationName = response.Locations[i].LocationName;
                            var locationID = response.Locations[i].LocationID;
                            var isBlockOrder = response.Locations[i].IsBlockOrder == 1 ? 'checked="checked"' : '';
                            var isPickup = response.Locations[i].IsPickup == 1 ? 'checked="checked"' : '';
                            var isDelivable = response.Locations[i].IsDelivable == 1 ? 'checked="checked"' : '';
                            var deliveryZone = response.Locations[i].DeliveryZone;
                            html += '           <tr locationid="' + locationID + '" >';
                            html += '               <td class="location-name" >' + locationName;
                            html += '               </td>';
                            html += '               <td><input for="block-order" ' + isBlockOrder + ' type="checkbox">';
                            html += '               </td>';
                            html += '               <td><input for="delivable" ' + isDelivable + ' type="checkbox">';
                            html += '               </td>';
                            html += '               <td><input for="delivery-zone" class="delivery-zone" value="' + deliveryZone.toFixed(2) + '" type="textbox">';
                            html += '               </td>';
                            html += '               <td><input for="pick-up" ' + isPickup + ' type="checkbox">';
                            html += '               </td>';
                            html += '           </tr>';
                        }
                    }
                    html += '       </table>';
                    html += '   </div>';
                    html += '   <p></p>';
                    html += '   <div id="button-save">';
                    html += '       <button id="btn-setting-save" class="image-button biz-dialog-button left" >Save</button>';
                    html += '   </div>';
                    html += '</div>';

                    $('body').append(html);
                    $('body').append($('<div class="overlay lv4 black" for="setting-dialog" />'));
                    $('.overlay[for="setting-dialog"]').height(0).width(0);
                    $('#setting-dialog').css({ top: 0, left: 0 });
                    FlexibleLayout.adapt();
                    Utils.positioningDialog('#setting-dialog', 'center', 'center');
                    $('.overlay[for="setting-dialog"]').height(Utils.pageH()).width(Utils.pageW());
                    $('input[for="block-order"],input[for="delivery-zone"],input[for="delivable"],input[for="pick-up"]').change();
                    handler.setting.initState = handler.setting.getCurrentState();
                }
            });

        },
        // handler.setting.close
        close: function () {
            $('#setting-dialog').remove();
            $('.overlay[for="setting-dialog"]').remove();
            handler.setting.flagSaveClose = false;
        },
        // handler.setting.save
        save: function () {
            var locationJson = new Array();
            var result;
            $('tr[locationid]').each(function () {
                var blockOrder = $(this).find('input[for="block-order"]').is(':checked') ? '1' : '0';
                var delivable = $(this).find('input[for="delivable"]').is(':checked') ? '1' : '0';
                var deliveryZone = $.trim($(this).find('input[for="delivery-zone"]').val()).length > 0 ? $.trim($(this).find('input[for="delivery-zone"]').val()) : '0';
                var pickUp = $(this).find('input[for="pick-up"]').is(':checked') ? '1' : '0';
                locationJson.push({
                    locationid: $(this).attr('locationid'),
                    deliveryzone: deliveryZone,
                    delivable: delivable,
                    isblockorder: blockOrder,
                    pickup: pickUp
                });
            });
            showProgressDialog('Saving');
            $.ajax({
                type: 'post',
                url: '/Menu/SetLocationList',
                data: {
                    LocationJson: JSON.stringify(locationJson)
                },
                complete: function () {
                    hideProgressDialog();
                    //                    handler.setting.close();
                    handler.setting.initState = handler.setting.getCurrentState();
                    if (handler.setting.flagSaveClose)
                        handler.setting.close();
                },
                success: function (response) {
                }
            });
        }
    },
    //    util: {
    //        isAutoTrans: function () {
    //            var bool = false;
    //            MessageBox.show({
    //                message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
    //                buttons: {
    //                    yes: function () {
    //                        bool = true;
    //                    },
    //                    no: function () {
    //                        $('#auto-trans').focus();
    //                        bool = false;
    //                    }
    //                }
    //            });
    //            return bool;
    //        }
    //    },
    common: function () {
        // for mobile gui
        $('.mobile-mask').live('click', function () {
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
        //for mapping
        $('#btn-mapping').click(function () {
            //            window.location = '/Location/EditBusinessHours';
            $('#form-menu-mapping').submit();
        })
        //for setting
        $('.delivery-zone').live('blur', function (data) {
            var amt = parseFloat(this.value);
            if (isNaN(amt))
                $(this).val('');
            else
                $(this).val(amt);
            if ($(this).context.id == 'all-delivery-zone') {
                //                $('.delivery-zone').each(function () {
                //                    $(this).val($('#all-delivery-zone').val());
                //                });
                $('#all-delivery-zone').val('');
            }
        });
        $('#all-delivery-zone').live('keypress', function () {
            setTimeout(function () {
                $('.delivery-zone').val($('#all-delivery-zone').val());
            }, 100);
        })
        $('#btn-setting-close').live('click', function () {
            if (handler.setting.isChange()) {
                MessageBox.show({
                    message: ['Do you want to save changes?'],
                    buttons: {
                        yes: function () {
                            handler.setting.flagSaveClose = true;
                            handler.setting.save();
                        },
                        no: function () {
                            handler.setting.close();
                        }
                    }
                });
            }
            else {
                handler.setting.close();
            }
        })
        $('#all-block-order,#all-delivable,#all-pick-up').live('change', function () {
            $(this).is(':checked') ? $('input[for="' + $(this).attr('to') + '"]').attr('checked', true) : $('input[for="' + $(this).attr('to') + '"]').attr('checked', false)
        });
        $('input[for="delivery-zone"]').live('change', function () {
            var lastValue = '';
            $('input[for="delivery-zone"]').each(function () {
                lastValue = $(this).val();
                return true;
            });
            var haveDiff = false;
            $('input[for="delivery-zone"]').each(function () {
                if (lastValue != $(this).val()) {
                    haveDiff = true;
                    return true;
                }
            });
            haveDiff ? $('#all-delivery-zone').val('') : $('#all-delivery-zone').val(lastValue);
        });
        $('input[for="block-order"],input[for="delivable"],input[for="pick-up"]').live('change', function () {
            var IsCheckAll = true;
            $('input[for="' + $(this).attr('for') + '"]').each(function () {
                if (!$(this).attr('checked')) {
                    IsCheckAll = false;
                    return false;
                }
            })
            $('#all-' + $(this).attr('for')).attr('checked', IsCheckAll);
        });
        //price on blur
        $('#txt-item-price,#txt-group-price,#txt-option-price').bind('blur', function (data) {
            var amt = parseFloat(this.value);
            if (isNaN(amt))
                $(this).val('');
            else
                $(this).val(amt.toFixed(2));
        });
        //back button
        $('#btn-backbutton').click(function () {
            if ($('.acc-body[tab="' + tab.currentTabIndex + '"] form').data("changed")) {
                if (tab.validate(tab.currentTabIndex))
                    window.location = '/Summary';
            }
            else
                window.location = '/Summary';
        });
        // common handler
        $('.list a').live('click', function (e) {
            e.preventDefault();
            var parent = $(this).parents('.list');
            parent.find('.selected').removeClass('selected');
            $(this).addClass('selected');
            //
            parent.find('.liselected').removeClass('liselected');
            $(this).parents('li').addClass('liselected');
        });
        $('#group-limit').attr('readonly', 'readonly');
        $('#GroupTypeID').change(
        function () {
            var selected = $("#GroupTypeID option:selected").val();
            if (selected == '100000' || selected == '100001') {
                $('#group-limit').attr('readonly', 'readonly');
                $('#group-limit').val('1');
            }
            else
                $('#group-limit').removeAttr('readonly', '');
        }
        );
        $('#group-limit').keypress(editor.helper.validateNumber);
        //action button disable enable
        $('*[inputblock]').bind('keyup keydown paste', function (data) {
            var parentThis = $(this);
            setTimeout(function () {
                if ($.trim($('#txt-' + parentThis.attr('inputblock') + '-name').val()).length == 0 && $.trim($('#txt-' + parentThis.attr('inputblock') + '-desc').val()).length == 0) {
                    $('#btn-' + parentThis.attr('inputblock') + '-update').attr('disabled', 'disabled');
                }
                else {
                    $('#btn-' + parentThis.attr('inputblock') + '-update').removeAttr('disabled');
                }
            }, 100);
        });
        $('#btn-settings').click(handler.setting.open);
        $('#btn-setting-save').live('click', handler.setting.save);
    },
    get: function () {
        // get menu
        $('#drop-menu a').live('click', editor.controller.menu.get);

        // get section
        $('#drop-sec a').live('click', editor.controller.section.get);

        // get sub section
        $('#drop-subsec a').live('click', editor.controller.subsection.get);

        // get item
        $('#drop-item a').live('click', editor.controller.item.get);

        // get group
        $('#drop-group a').live('click', editor.controller.group.get);

        // get option
        $('#drop-option a').live('click', editor.controller.option.get);
    },
    add: function () {
        // add menu
        $('#btn-menu-add').click(editor.controller.menu.addnew);

        $("#btn-sec-add").click(editor.controller.section.addnew);

        $('#btn-subsec-add').click(editor.controller.subsection.addnew);

        $("#btn-item-add").click(editor.controller.item.addnew);

        $('#btn-group-add').click(editor.controller.group.addnew);

        $("#btn-option-add").click(editor.controller.option.addnew);
    },
    save: function () {
        //        $('#btn-menu-update').click(editor.controller.menu.save);

        //        $("#btn-sec-update").click(editor.controller.section.save);

        //        $('#btn-subsec-update').click(editor.controller.subsection.save);

        //        $("#btn-item-update").click(editor.controller.item.save);

        //        $('#btn-group-update').click(editor.controller.group.save);

        //        $("#btn-option-update").click(editor.controller.option.save);
    },
    callback: function () {
        $('#menu-form').ajaxForm(editor.controller.menu.postSave);

        $('#section-form').ajaxForm(editor.controller.section.postSave);

        $('#subsection-form').ajaxForm(editor.controller.subsection.postSave);

        $('#item-form').ajaxForm(editor.controller.item.postSave);

        $('#group-form').ajaxForm(editor.controller.group.postSave);

        $('#option-form').ajaxForm(editor.controller.option.postSave);
    },
    submit: function () {
    },
    change: function () {
        $('#drop-language').click(editor.lang.store);
        $('#drop-language').change(editor.lang.change);
        $('input[name="radLang"]').change(editor.lang.set);
        $("#auto-trans").change(function () {
            if ($('#auto-trans').is(':checked')) {
                $('input[name="IsAutoTrans"]').val('true');
            } else {
                $('input[name="IsAutoTrans"]').val('false');
            }
        });
        $('#showSecondLang').change(function () {
            if ($('#showSecondLang').is(':checked')) {
                $('*[langtype="secondary"]').show();
            } else {
                $('*[langtype="secondary"]').hide();
            }
        });
        $('#showDescription').change(function () {
            if ($('#showDescription').is(':checked')) {
                $('*[for="description"]').show();
            } else {
                $('*[for="description"]').hide();
            }
        });
    },
    del: function () {
        //        //delete menu
        //        $("#btn-menu-del").click(editor.controller.menu.del);
        //        //delete section
        //        $("#btn-sec-del").click(editor.controller.section.del);
        //        //delete subsection
        //        $("#btn-subsec-del").click(editor.controller.subsection.del);
        //        //delete item
        //        $("#btn-item-del").click(editor.controller.item.del);
        //        //delete group
        //        $("#btn-group-del").click(editor.controller.group.del);
        //        //delete option
        //        $("#btn-option-del").click(editor.controller.option.del);
        $('.del-icon').live('click', function () {
            // blockName sample = "drop-sec"
            var blockName = $(this).parents('ul').attr('id');
            var id = $(this).parents('li').find('a').attr('value');
            switch (blockName) {
                case 'drop-menu':
                    editor.controller.menu.del(id);
                    break;
                case 'drop-sec':
                    editor.controller.section.del(id);
                    break;
                case 'drop-subsec':
                    editor.controller.subsection.del(id);
                    break;
                case 'drop-item':
                    editor.controller.item.del(id);
                    break;
                case 'drop-group':
                    editor.controller.group.del(id);
                    break;
                case 'drop-option':
                    editor.controller.option.del(id);
                    break;
            }
        });
    },
    delicon: function () {
        //delete menu image icon
        $("#btn-menu-del-img, #btn-menu-del-icon").click(editor.controller.menu.delimgicon);
        //delete section icon
        $("#btn-sec-delicon").click(editor.controller.section.delicon);
        //delete sub section icon
        $("#btn-subsec-delicon").click(editor.controller.subsection.delicon);
        //delete sub section icon
        $("#btn-item-delicon").click(editor.controller.item.delimgicon);
        //delete sub section icon
        $("#btn-group-delicon").click(editor.controller.group.delicon);
        //delete sub section icon
        $("#btn-option-delicon").click(editor.controller.option.delicon);
    },
    ChangeDisplayOrder: function () {
        //        $("#btn-sec-up").click(editor.helper.ExecChange);
        //        $("#btn-sec-down").click(editor.helper.ExecChange);
        $('button[blocktype]').click(editor.helper.ExecChange);
    }
};

var editor = {
    // editor.helper
    helper: {
        // editor.helper.validateNumber    
        validateNumber: function (event) {
            var key = window.event ? event.keyCode : event.which;

            if (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39) {
                return true;
            }
            else if (key < 48 || key > 57) {
                return false;
            }
            else return true;
        },

        // editor.helper.isUndefined
        isUndefined: function (obj) {
            return (typeof obj == 'undefined');
        },
        findIndexByKeyValue: function (obj, key, value) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i][key] == value) {
                    return i;
                }
            }
            return null;
        },
        resetAutoTrans: function () {
            $('#auto-trans').attr('checked', false);
            $('input[name="IsAutoTrans"]').val('');
        },
        // editor.helper.gatherJson
        gatherJson: function (nameProp, descProp) {
            var contents = new Array();

            var nameOnScreen = $.trim($(nameProp.control).val());
            var descOnScreen = $.trim($(descProp.control).val());
            var currentLang = editor.lang.current();

            //if current != Primary
            if (currentLang.id != editor.lang.primary.get().id) {
                contents.push({ ID: currentLang.id, Name: nameOnScreen, Desc: descOnScreen, Shortname: currentLang.shortname });
            }
            //if current is Primary
            else {
                if (nameOnScreen.length > 0 || descOnScreen.length > 0) {
                    contents.push({ ID: currentLang.id, Name: nameOnScreen, Desc: descOnScreen, Shortname: currentLang.shortname });
                }
            }

            // get in storage
            var nameInStorage = editor.storage.store[nameProp.storage_key];
            var descInStorage = editor.storage.store[descProp.storage_key];
            var primaryLang = editor.lang.primary.get();

            var hasPrimary = currentLang.isPrimary;

            for (langid in nameInStorage) {
                if (langid == primaryLang.id) {
                    hasPrimary = true;
                }
                if (langid == currentLang.id) { continue; }
                var name = nameInStorage[langid];
                var desc = descInStorage[langid];

                if (name.length > 0 || desc.length > 0) {
                    contents.push({ ID: langid, Name: name, Desc: desc, Shortname: editor.lang.get(langid).shortname });
                }
            }

            if (!hasPrimary || !editor.helper.isUndefined(nameInStorage)) {

                contents.push({
                    ID: primaryLang.id,
                    Name: editor.content.fromGlobal(primaryLang.id, nameProp.contents()),
                    Desc: editor.content.fromGlobal(primaryLang.id, descProp.contents()),
                    Shortname: primaryLang.shortname
                });
            }
            return JSON.stringify(contents);
        },
        handleValidateIcon: function (event) {
            var forBlock = $(this).attr("for");
            switch (forBlock) {
                case 'menu-preview-icon':
                    return editor.validator.execute('Menu', editor.content.props.menu_name, editor.content.props.menu_desc);
                    break;
                case 'menu-preview-image':
                    return editor.validator.execute('Menu', editor.content.props.menu_name, editor.content.props.menu_desc);
                    break;
                case 'section-preview-icon':
                    return editor.validator.execute('Section', editor.content.props.section_name, editor.content.props.section_desc);
                    break;
                case 'subsection-preview-icon':
                    return editor.validator.execute('Sub Section', editor.content.props.subsection_name, editor.content.props.subsection_desc);
                    break;
                case 'item-preview-icon':
                    return editor.validator.execute('Item', editor.content.props.item_name, editor.content.props.item_name);
                    break;
                case 'group-preview-icon':
                    return editor.validator.execute('Group', editor.content.props.group_name, editor.content.props.group_desc);
                    break;
                case 'option-preview-icon':
                    return editor.validator.execute('Option', editor.content.props.option_name, editor.content.props.option_desc);
                    break;
            }
        },
        displayPreview: function (event) {
            var reader = new FileReader();
            reader.onload = editor.helper.onFileLoad;
            reader.readAsDataURL(this.files[0]);
            reader.previewid = $(this).attr("for");
            switch (reader.previewid) {
                case 'menu-preview-icon':
                    //                    $("#menu-preview-icon").show();
                    //                    $("#menu-preview-image").hide();
                    //                    $("input[name='imagegroup'][value='icon']").attr("checked", true);
                    //                    $("input[name='imagegroup'][value='image']").attr("checked", false);
                    //                    $('.preview-icon').show();
                    //                    $('.preview-image').hide();
                    break;
                case 'menu-preview-image':
                    //                    $('.preview-icon').hide();
                    //                    $('.preview-image').show();
                    //                    $("#menu-preview-image").show();
                    //                    $("#menu-preview-icon").hide();
                    //                    $("input[name='imagegroup'][value='image']").attr("checked", true);
                    //                    $("input[name='imagegroup'][value='icon']").attr("checked", false);
                    break;
            }
        },
        onFileLoad: function (e) {
            var image = new editor.image.create(e.target.result);

            $('#' + this.previewid).empty();
            $('#' + this.previewid).append(image);
        },
        imageGroupHandle: function () {
            var selected = $('#' + this.id + ' option:selected').val();
            if (selected == 'icon') {
                $(this).parents('.accordion').find('.preview-image').hide();
                $(this).parents('.accordion').find('.preview-icon').show();
            }
            else {
                $(this).parents('.accordion').find('.preview-image').show();
                $(this).parents('.accordion').find('.preview-icon').hide();
            }

        },
        ExecChange: function () {
            var BlockType = $(this).attr("blocktype");
            var OrderType = $(this).attr("ordertype");
            //validate....
            //
            var index;
            var FirstID;
            var SecondID;
            var temp;
            switch (BlockType) {
                case 'Section':
                    //validate
                    if ($("#drop-sec").find('.selected').length != 0) {
                        FirstID = $("#drop-sec").find('.selected').attr("value");
                        index = editor.helper.findIndexByKeyValue(editor.global.menu.Sections, 'SectionID', FirstID);
                        SecondID = OrderType == 'up' ? editor.global.menu.Sections[index - 1].SectionID : editor.global.menu.Sections[index + 1].SectionID;
                        break;
                    }
                    else {
                        MessageBox.show({
                            message: ['Please choose a Section to change display order!'],
                            buttons: { ok: null }
                        });
                        return;
                    }

                case 'SubSection':
                    if ($("#drop-subsec").find('.selected').length != 0) {
                        FirstID = $("#drop-subsec").find('.selected').attr("value");
                        index = editor.helper.findIndexByKeyValue(editor.global.section.SubSections, 'SectionID', FirstID);
                        SecondID = OrderType == 'up' ? editor.global.section.SubSections[index - 1].SectionID : editor.global.section.SubSections[index + 1].SectionID;
                        break;
                    }
                    else {
                        MessageBox.show({
                            message: ['Please choose a SubSection to change display order!'],
                            buttons: { ok: null }
                        });
                        return;
                    }
                case 'Item':
                    if ($("#drop-item").find('.selected').length != 0) {
                        FirstID = $("#drop-item").find('.selected').attr("value");
                        if ($("#drop-subsec").find('.selected').length == 0) {
                            index = editor.helper.findIndexByKeyValue(editor.global.section.Items, 'ItemID', FirstID);
                            SecondID = OrderType == 'up' ? editor.global.section.Items[index - 1].ItemID : editor.global.section.Items[index + 1].ItemID;
                        }
                        else {
                            index = editor.helper.findIndexByKeyValue(editor.global.subsection.Items, 'ItemID', FirstID);
                            SecondID = OrderType == 'up' ? editor.global.subsection.Items[index - 1].ItemID : editor.global.subsection.Items[index + 1].ItemID;
                        }

                        break;
                    }
                    else {
                        MessageBox.show({
                            message: ['Please choose a Menu Item to change display order!'],
                            buttons: { ok: null }
                        });
                        return;
                    }
                case 'Group':
                    if ($("#drop-group").find('.selected').length != 0) {
                        FirstID = $("#drop-group").find('.selected').attr("value");
                        index = editor.helper.findIndexByKeyValue(editor.global.item.Groups, 'GroupID', FirstID);
                        SecondID = OrderType == 'up' ? editor.global.item.Groups[index - 1].GroupID : editor.global.item.Groups[index + 1].GroupID;
                        break;
                    }
                    else {
                        MessageBox.show({
                            message: ['Please choose a Group to change display order!'],
                            buttons: { ok: null }
                        });
                        return;
                    }
                case 'Option':
                    if ($("#drop-option").find('.selected').length != 0) {
                        FirstID = $("#drop-option").find('.selected').attr("value");
                        index = editor.helper.findIndexByKeyValue(editor.global.group.Options, 'OptionID', FirstID);
                        SecondID = OrderType == 'up' ? editor.global.group.Options[index - 1].OptionID : editor.global.group.Options[index + 1].OptionID;
                        break;
                    }
                    else {
                        MessageBox.show({
                            message: ['Please choose a Option to change display order!'],
                            buttons: { ok: null }
                        });
                        return;
                    }
            }
            showProgressDialog('Changing display order');
            //request ajax
            $.ajax({
                url: "/Menu/ChangeDispayOrder",
                type: "POST",
                dataType: "json",
                data: {
                    FirstID: FirstID,
                    SecondID: SecondID,
                    Type: BlockType
                },
                complete: function () {
                    hideProgressDialog();
                },
                success: function (itemData) {
                    if (itemData.IsSucceed) {
                        // update client
                        //menu global
                        switch (BlockType) {
                            case 'Section':
                                temp = editor.global.menu.Sections[index];
                                editor.global.menu.Sections[index] = OrderType == 'up' ? editor.global.menu.Sections[index - 1] : editor.global.menu.Sections[index + 1];
                                editor.global.menu.Sections[index].DisplayOrder = temp.DisplayOrder;
                                if (OrderType == 'up') {
                                    tempOrder = editor.global.menu.Sections[index - 1].DisplayOrder;
                                    editor.global.menu.Sections[index - 1] = temp;
                                    editor.global.menu.Sections[index - 1].DisplayOrder = tempOrder;
                                    $("#drop-sec").find('.selected').parent().insertBefore($('#drop-sec').find('[value=' + SecondID + ']').parent());
                                }
                                else {
                                    tempOrder = editor.global.menu.Sections[index + 1].DisplayOrder;
                                    editor.global.menu.Sections[index + 1] = temp;
                                    editor.global.menu.Sections[index + 1].DisplayOrder = tempOrder;
                                    $("#drop-sec").find('.selected').parent().insertAfter($('#drop-sec').find('[value=' + SecondID + ']').parent());
                                }
                                break;
                            case 'SubSection':
                                temp = editor.global.section.SubSections[index];
                                editor.global.section.SubSections[index] = OrderType == 'up' ? editor.global.section.SubSections[index - 1] : editor.global.section.SubSections[index + 1];
                                editor.global.section.SubSections[index].DisplayOrder = temp.DisplayOrder;
                                if (OrderType == 'up') {
                                    tempOrder = editor.global.section.SubSections[index - 1].DisplayOrder;
                                    editor.global.section.SubSections[index - 1] = temp;
                                    editor.global.section.SubSections[index - 1].DisplayOrder = tempOrder;
                                    $("#drop-subsec").find('.selected').parent().insertBefore($('#drop-subsec').find('[value=' + SecondID + ']').parent());
                                }
                                else {
                                    tempOrder = editor.global.section.SubSections[index + 1].DisplayOrder;
                                    editor.global.section.SubSections[index + 1] = temp;
                                    editor.global.section.SubSections[index + 1].DisplayOrder = tempOrder;
                                    $("#drop-subsec").find('.selected').parent().insertAfter($('#drop-subsec').find('[value=' + SecondID + ']').parent());
                                }
                                break;
                            case 'Item':
                                if ($("#drop-subsec").find('.selected').length == 0) {
                                    temp = editor.global.section.Items[index];
                                    editor.global.section.Items[index] = OrderType == 'up' ? editor.global.section.Items[index - 1] : editor.global.section.Items[index + 1];
                                    editor.global.section.Items[index].DisplayOrder = temp.DisplayOrder;
                                    if (OrderType == 'up') {
                                        tempOrder = editor.global.section.Items[index - 1].DisplayOrder;
                                        editor.global.section.Items[index - 1] = temp;
                                        editor.global.section.Items[index - 1].DisplayOrder = tempOrder;
                                        $("#drop-item").find('.selected').parent().insertBefore($('#drop-item').find('[value=' + SecondID + ']').parent());
                                    }
                                    else {
                                        tempOrder = editor.global.section.Items[index + 1].DisplayOrder;
                                        editor.global.section.Items[index + 1] = temp;
                                        editor.global.section.Items[index + 1].DisplayOrder = tempOrder;
                                        $("#drop-item").find('.selected').parent().insertAfter($('#drop-item').find('[value=' + SecondID + ']').parent());
                                    }
                                    break;
                                }
                                else {
                                    temp = editor.global.subsection.Items[index];
                                    editor.global.subsection.Items[index] = OrderType == 'up' ? editor.global.subsection.Items[index - 1] : editor.global.subsection.Items[index + 1];
                                    editor.global.subsection.Items[index].DisplayOrder = temp.DisplayOrder;
                                    if (OrderType == 'up') {
                                        tempOrder = editor.global.subsection.Items[index - 1].DisplayOrder;
                                        editor.global.subsection.Items[index - 1] = temp;
                                        editor.global.subsection.Items[index - 1].DisplayOrder = tempOrder;
                                        $("#drop-item").find('.selected').parent().insertBefore($('#drop-item').find('[value=' + SecondID + ']').parent());
                                    }
                                    else {
                                        tempOrder = editor.global.subsection.Items[index + 1].DisplayOrder;
                                        editor.global.subsection.Items[index + 1] = temp;
                                        editor.global.subsection.Items[index + 1].DisplayOrder = tempOrder;
                                        $("#drop-item").find('.selected').parent().insertAfter($('#drop-item').find('[value=' + SecondID + ']').parent());
                                    }
                                    break;
                                }


                            case 'Group':
                                temp = editor.global.item.Groups[index];
                                editor.global.item.Groups[index] = OrderType == 'up' ? editor.global.item.Groups[index - 1] : editor.global.item.Groups[index + 1];
                                editor.global.item.Groups[index].DisplayOrder = temp.DisplayOrder;
                                if (OrderType == 'up') {
                                    tempOrder = editor.global.item.Groups[index - 1].DisplayOrder;
                                    editor.global.item.Groups[index - 1] = temp;
                                    editor.global.item.Groups[index - 1].DisplayOrder = tempOrder;
                                    $("#drop-group").find('.selected').parent().insertBefore($('#drop-group').find('[value=' + SecondID + ']').parent());
                                }
                                else {
                                    tempOrder = editor.global.item.Groups[index + 1].DisplayOrder;
                                    editor.global.item.Groups[index + 1] = temp;
                                    editor.global.item.Groups[index + 1].DisplayOrder = tempOrder;
                                    $("#drop-group").find('.selected').parent().insertAfter($('#drop-group').find('[value=' + SecondID + ']').parent());
                                }
                                break;
                            case 'Option':
                                temp = editor.global.group.Options[index];
                                editor.global.group.Options[index] = OrderType == 'up' ? editor.global.group.Options[index - 1] : editor.global.group.Options[index + 1];
                                editor.global.group.Options[index].DisplayOrder = temp.DisplayOrder;
                                if (OrderType == 'up') {
                                    tempOrder = editor.global.group.Options[index - 1].DisplayOrder;
                                    editor.global.group.Options[index - 1] = temp;
                                    editor.global.group.Options[index - 1].DisplayOrder = tempOrder;
                                    $("#drop-option").find('.selected').parent().insertBefore($('#drop-option').find('[value=' + SecondID + ']').parent());
                                }
                                else {
                                    tempOrder = editor.global.group.Options[index + 1].DisplayOrder;
                                    editor.global.group.Options[index + 1] = temp;
                                    editor.global.group.Options[index + 1].DisplayOrder = tempOrder;
                                    $("#drop-option").find('.selected').parent().insertAfter($('#drop-option').find('[value=' + SecondID + ']').parent());
                                }
                                break;
                        }
                        preview.generate();
                    }
                    else {
                        Utils.showError();
                    }
                }
            });
        }
    },
    // editor.image
    image: {
        // editor.image.create
        create: function (src) {
            var image = new Image();
            image.onload = editor.image.resize;
            image.src = src;
            return image;
        },
        // editor.image.resize
        resize: function () {
            var image = $(this);
            var limitW = $('.displayimg').width();
            var limitH = $('.displayimg').height();
            if (limitW > limitH) {
                image.css({ width: 'auto', height: '100%' });
            } else {
                image.css({ width: '100%', height: 'auto' });
            }
            //            var imgW = image.width();
            //            var imgH = image.height();
            //            var ratio = imgW / imgH;

            // compare height & width
            //            if (imgW > imgH) {
            //                // width > height
            //                if (imgW > limitW) {
            //                    imgW = limitW;
            //                    imgH = limitW / ratio;
            //                }
            //            } else {
            //                // width < height
            //                if (imgH > limitH) {
            //                    imgH = limitH;
            //                    imgW = limitH * ratio;
            //                }
            //            }
            //            image.width(imgW).height(imgH).css('margin-top', (limitH - imgH) / 2);
        }
    },
    // editor.storage
    storage: {
        // editor.storage.store
        store: {},
        // editor.storage.get
        get: function (langid, prop) {
            if (editor.helper.isUndefined(editor.storage.store[prop])) {
                return undefined;
            } else {
                return editor.storage.store[prop][langid];
            }
        },
        // editor.storage.set
        set: function (langid, prop, value) {
            if (editor.helper.isUndefined(editor.storage.store[prop])) {
                editor.storage.store[prop] = {};
            }

            editor.storage.store[prop][langid] = value;
        },
        // editor.storage.clear
        clear: {
            // editor.storage.clear.menu
            menu: function (clearChildren) {
                editor.storage.store[editor.content.props.menu_name.storage_key] = undefined;
                editor.storage.store[editor.content.props.menu_desc.storage_key] = undefined;

                if (clearChildren) {
                    editor.storage.clear.section(clearChildren);
                }
            },
            // editor.storage.clear.section
            section: function (clearChildren) {
                editor.storage.store[editor.content.props.section_name.storage_key] = undefined;
                editor.storage.store[editor.content.props.section_desc.storage_key] = undefined;

                if (clearChildren) {
                    editor.storage.clear.subsection(clearChildren);
                }
            },
            // editor.storage.clear.subsection
            subsection: function (clearChildren) {
                editor.storage.store[editor.content.props.subsection_name.storage_key] = undefined;
                editor.storage.store[editor.content.props.subsection_desc.storage_key] = undefined;

                if (clearChildren) {
                    editor.storage.clear.item(clearChildren);
                }
            },
            // editor.storage.clear.item
            item: function (clearChildren) {
                editor.storage.store[editor.content.props.item_name.storage_key] = undefined;
                editor.storage.store[editor.content.props.item_desc.storage_key] = undefined;

                if (clearChildren) {
                    editor.storage.clear.group(clearChildren);
                }
            },
            // editor.storage.clear.group
            group: function (clearChildren) {
                editor.storage.store[editor.content.props.group_name.storage_key] = undefined;
                editor.storage.store[editor.content.props.group_desc.storage_key] = undefined;

                if (clearChildren) {
                    editor.storage.clear.option();
                }
            },
            // editor.storage.clear.option
            option: function () {
                editor.storage.store[editor.content.props.option_name.storage_key] = undefined;
                editor.storage.store[editor.content.props.option_desc.storage_key] = undefined;
            }
        }
    },
    // editor.global
    global: {
        // editor.global.updateMenu
        updateMenu: function (contents, langid) {
            // update global menu
            editor.global.menu.loadedLangs.push(parseInt(langid));

            if (contents.NameDescMenusList.length > 0) {
                editor.global.updateContent(langid, contents.NameDescMenusList[0], editor.global.menu.Names, editor.global.menu.Descs);
            }

            editor.global.updateSections(contents, langid, editor.global.menu);
        },
        // editor.global.updateSetions
        updateSections: function (contents, langid, menu) {
            if (menu.Sections != null) {
                for (var index = 0; index < menu.Sections.length; index++) {
                    var section = menu.Sections[index];

                    // search content in list
                    var content = jLinq.from(contents.NameDescSectionsList).ignoreCase().startsWith('ID', section.SectionID).first();

                    editor.global.updateContent(langid, content, section.Names, section.Descs);

                    // update subsections
                    editor.global.updateSubsections(contents, langid, section);

                    // update items
                    editor.global.updateItems(contents, langid, section);
                }
            }
        },
        // editor.global.updateSubsections
        updateSubsections: function (contents, langid, section) {
            if (section.SubSections != null) {
                for (var index = 0; index < section.SubSections.length; index++) {
                    var subsection = section.SubSections[index];

                    var content = jLinq.from(contents.NameDescSubSectionsList).ignoreCase().startsWith('ID', subsection.SectionID).first();

                    editor.global.updateContent(langid, content, subsection.Names, subsection.Descs);

                    editor.global.updateItems(contents, langid, subsection);
                }
            }
        },
        // editor.global.updateItems
        updateItems: function (contents, langid, section) {
            if (section.Items != null) {
                for (var index = 0; index < section.Items.length; index++) {
                    var item = section.Items[index];

                    var content = jLinq.from(contents.NameDescItemsList).ignoreCase().startsWith('ID', item.ItemID).first();

                    editor.global.updateContent(langid, content, item.Names, item.Descs);

                    editor.global.updateGroups(contents, langid, item);
                }
            }
        },
        // editor.global.updateGroups
        updateGroups: function (contents, langid, item) {
            if (item.Groups != null) {
                for (var index = 0; index < item.Groups.length; index++) {
                    var group = item.Groups[index];

                    var content = jLinq.from(contents.NameDescGroupsList).ignoreCase().startsWith('ID', group.GroupID).first();

                    editor.global.updateContent(langid, content, group.Names, group.Descs);

                    editor.global.updateOptions(contents, langid, group);
                }
            }
        },
        // editor.global.updateOptions
        updateOptions: function (contents, langid, group) {
            if (group.Options != null) {
                for (var index = 0; index < group.Options.length; index++) {
                    var option = group.Options[index];

                    var content = jLinq.from(contents.NameDescOptionsList).ignoreCase().startsWith('ID', option.OptionID).first();

                    editor.global.updateContent(langid, content, option.Names, option.Descs);
                }
            }
        },
        // editor.global.updateContent
        updateContent: function (id, content, nameArr, descArr) {
            if (content != null) {
                var name = content.NameContent;
                var desc = content.DescContent;

                nameArr.push({ LangID: id, Content: name });
                descArr.push({ LangID: id, Content: desc });
            }
        },
        // editor.global.menu
        menu: null,
        // editor.global.section
        section: null,
        // editor.global.subsection
        subsection: null,
        // editor.global.item
        item: null,
        // editor.global.group
        group: null,
        // editor.global.option
        option: null
    },
    // editor.resetter
    resetter: {
        // editor.resetter.menu
        menu: function () {
            editor.storage.clear.menu(true);
            editor.global.menu = null;

            // reset form
            $('#menu-form').attr('action', '/Menu/AddMenu');

            $('#label-se').html('None');
            $('#menu-type-list input').attr('checked', false);
            $('#menu-active, #menu-image-display, #menu-icon-display').attr('checked', true);
            $('#menu-preview-icon, #menu-preview-image, #drop-sec').empty();
            $('#txt-menu-name, textarea#txt-menu-desc, #txt-menu-cssid, #txt-menu-currencyid, #txt-menu-selangid, #txt-menu-menuid').val('');

            // reset language
            //            var defaultLang = editor.lang.gatherData($('#drop-language option:first'));
            var defaultLang = editor.lang.gatherData($('#drop-language option:contains(English)'));
            $('#drop-language, #txt-menu-prilangid').val(defaultLang.id);
            $('#label-pri').html(defaultLang.displayname);
            $('#rad-primary').attr('checked', true);

            // reset stylesheet
            var styleId = $('#drop-cssid option:first').val();
            $('#drop-cssid, #txt-menu-cssid').val(styleId);
            preview.stylesheet.apply(null);

            //reset flag and form
            $('.flag').val('add');
            $('#menu-form').attr('action', '/Menu/AddMenu');
            $('#section-form').attr('action', '/Menu/AddSection');
            $('#subsection-form').attr('action', '/Menu/AddSection');
            $('#item-form').attr('action', '/Menu/AddItem');
            $('#group-form').attr('action', '/Menu/AddGroup');
            $('#option-form').attr('action', '/Menu/AddOption');
            //            $('#btn-menu-del').attr('disabled', 'disabled');
            //            $('#btn-menu-update').attr('disabled', 'disabled');
            // reset currency
            var currencyId = $('#drop-currencyid option:first').val();
            $('#drop-currencyid, #txt-menu-cssid').val(currencyId);
            preview.currency.apply(null);

            preview.clear();

            editor.resetter.section();

            editor.helper.resetAutoTrans();

            //resetter selected
            $('#selected-menu-name,#selected-section-name,#selected-subsection-name,#selected-item-name,#selected-group-name,#selected-option-name').html('');
            $('#selected-menu-name,#selected-section-name,#selected-subsection-name,#selected-item-name,#selected-group-name,#selected-option-name').attr('title', '');
            //            $('#btn-menu-add').attr('disabled', 'disabled');
            //reset form change
            $('.acc-body[tab="0"] form').data("changed", false);
            //reset flag click new
            editor.controller.menu.isClickNew = false;
            //reset selected
            //            $('#drop-menu .liselected').removeClass('liselected');
        },
        // editor.resetter.section
        section: function () {
            editor.storage.clear.section(true);
            editor.global.section = null;
            $('#section-form').attr('action', '/Menu/AddSection');
            $('#section-active, #section-display-icon').attr('checked', true);
            $('#section-preview-icon, #drop-subsec').empty();
            $('#txt-sec-name, textarea#txt-sec-desc').val('');
            $('input[for="section-preview-icon"]').val('');
            editor.resetter.subsection();
            editor.helper.resetAutoTrans();
            //reset flag and form
            $('#sec-flag,#subsec-flag,#item-flag,#group-flag,#option-flag').val('add');
            $('#section-form').attr('action', '/Menu/AddSection');
            $('#subsection-form').attr('action', '/Menu/AddSection');
            $('#item-form').attr('action', '/Menu/AddItem');
            $('#group-form').attr('action', '/Menu/AddGroup');
            $('#option-form').attr('action', '/Menu/AddOption');
            //            $('#btn-sec-del').attr('disabled', 'disabled');
            //            $('#btn-sec-update').attr('disabled', 'disabled');
            //reset ImageID
            $('#sec-imageid').val('');
            //reset selected
            $('#selected-section-name,#selected-subsection-name,#selected-item-name,#selected-group-name,#selected-option-name').html('');
            $('#selected-section-name,#selected-subsection-name,#selected-item-name,#selected-group-name,#selected-option-name').attr('title', '');
            //reset form chang
            $('.acc-body[tab="1"] form').data("changed", false);
            //reset flag click new
            editor.controller.section.isClickNew = false;

        },
        // editor.resetter.subsection
        subsection: function () {
            editor.storage.clear.subsection(true);
            editor.global.subsection = null;
            $('#subsection-active, #subsection-display-icon').attr('checked', true);
            $('#subsection-preview-icon, #drop-item').empty();
            $('#txt-subsec-name, textarea#txt-subsec-desc').val('');
            $('input[for="subsection-preview-icon"]').val('');
            editor.resetter.item();
            editor.helper.resetAutoTrans();
            //reset flag and form
            $('#subsec-flag,#item-flag,#group-flag,#option-flag').val('add');
            $('#subsection-form').attr('action', '/Menu/AddSection');
            $('#item-form').attr('action', '/Menu/AddItem');
            $('#group-form').attr('action', '/Menu/AddGroup');
            $('#option-form').attr('action', '/Menu/AddOption');
            //            $('#btn-subsec-del').attr('disabled', 'disabled');
            //            $('#btn-subsec-update').attr('disabled', 'disabled');
            //reset ImageID
            $('#subsec-imageid').val('');
            //resetter selected
            $('#selected-subsection-name,#selected-item-name,#selected-group-name,#selected-option-name').html('');
            $('#selected-subsection-name,#selected-item-name,#selected-group-name,#selected-option-name').attr('title', '');
            //reset form change
            $('.acc-body[tab="2"] form').data("changed", false);
            //reset flag click new
            editor.controller.subsection.isClickNew = false;

        },
        // editor.resetter.item
        item: function () {
            editor.storage.clear.item(true);
            editor.global.item = null;
            $('#chkItem-veg, #chkItem-gf').attr('checked', false);
            $('#item-active, #item-display-icon, #item-image-display').attr('checked', true);
            $('#item-preview-image, #item-preview-icon, #drop-group').empty();
            $('#item-spice-level').val(0);
            $('#txt-item-price, #txt-item-name, textarea#txt-item-desc').val('');
            $('input[for="item-preview-icon"]').val('');
            $('input[for="item-preview-image"]').val('');
            editor.resetter.group();
            editor.helper.resetAutoTrans();
            //reset flag and form
            $('#item-flag,#group-flag,#option-flag').val('add');
            $('#item-form').attr('action', '/Menu/AddItem');
            $('#group-form').attr('action', '/Menu/AddGroup');
            $('#option-form').attr('action', '/Menu/AddOption');
            //            $('#btn-item-del').attr('disabled', 'disabled');
            //            $('#btn-item-update').attr('disabled', 'disabled');
            //reset ImageID
            $('#item-iconid').val('');
            //resetter selected
            $('#selected-item-name,#selected-group-name,#selected-option-name').html('');
            $('#selected-item-name,#selected-group-name,#selected-option-name').attr('title', '');
            //reset form change
            $('.acc-body[tab="3"] form').data("changed", false);
            //reset flag click new
            editor.controller.item.isClickNew = false;

        },
        // editor.resetter.group
        group: function () {
            editor.storage.clear.group(true);
            editor.global.group = null;
            $('#chkGroup-veg, #chkGroup-gf').attr('checked', false);
            $('#group-active, #group-display-icon').attr('checked', true);
            $('#group-preview-icon, #drop-option').empty();
            $('#group-limit').val(1);
            $('#group-spice-level').val(0);
            $('#txt-group-price, #txt-group-name, textarea#txt-group-desc').val('');
            $('input[for="group-preview-icon"]').val('');
            var select = $('#GroupTypeID');
            select.val($('options:first', select).val());
            $('#GroupTypeID').change();
            editor.resetter.option();
            editor.helper.resetAutoTrans();
            //reset ImageID
            $('#group-imageid').val('');
            //reset flag and form
            $('#group-flag,#option-flag').val('add');
            $('#group-form').attr('action', '/Menu/AddGroup');
            $('#option-form').attr('action', '/Menu/AddOption');
            //            $('#btn-group-del').attr('disabled', 'disabled');
            //            $('#btn-group-update').attr('disabled', 'disabled');
            //reset selected
            $('#selected-group-name,#selected-option-name').html('');
            $('#selected-group-name,#selected-option-name').attr('title', '');
            //reset form change
            $('.acc-body[tab="4"] form').data("changed", false);
            //reset flag click new
            editor.controller.group.isClickNew = false;

        },
        // editor.resetter.option
        option: function () {
            editor.storage.clear.option();
            editor.global.option = null;
            $('#chkOption-veg, #chkOption-gf').attr('checked', false);
            $('#option-active, #option-display-icon').attr('checked', true);
            $('#option-preview-icon').empty();
            $('#option-spice-level').val(0);
            $('#txt-option-price, #txt-option-name, textarea#txt-option-desc').val('');
            $('input[for="option-preview-icon"]').val('');
            editor.helper.resetAutoTrans();
            //reset ImageID
            $('#option-imageid').val('');
            //reset flag and form
            $('option-flag').val('add');
            $('#option-form').attr('action', '/Menu/AddOption');
            //            $('#btn-option-del').attr('disabled', 'disabled');
            //            $('#btn-option-update').attr('disabled', 'disabled');
            //reset selected
            $('#selected-option-name').html('');
            $('#selected-option-name').attr('title', '');
            //reset form change
            $('.acc-body[tab="5"] form').data("changed", false);
            //reset flag click new
            editor.controller.option.isClickNew = false;

        }
    },
    // editor.lang
    lang: {
        // editor.lang.previous
        previous: null,
        // editor.lang.current
        current: function () {
            var selected = $('#drop-language option:selected');
            return editor.lang.gatherData(selected);
        },
        // editor.lang.gatherData
        gatherData: function (option) {
            if (option.length > 0) {
                var id = option.attr('value')
                return {
                    id: id,
                    shortname: option.attr('shortname'),
                    displayname: option.text(),
                    isPrimary: id == $('#txt-menu-prilangid').val(),
                    isSecondary: id == $('#txt-menu-selangid').val()
                };
            } else {
                return { id: -1 };
            }
        },
        // editor.lang.get
        get: function (id) {
            var selected = $('#drop-language option[value="' + id + '"]');
            return editor.lang.gatherData(selected);
        },
        // editor.lang.store
        store: function () {
            editor.lang.previous = editor.lang.current();
        },
        // editor.lang.change
        change: function () {
            var selectedLang = editor.lang.current();
            // re-check radio button if the selected language is primary/secondary language
            $('#rad-primary').attr('checked', selectedLang.isPrimary);
            $('#rad-secondary').attr('checked', selectedLang.isSecondary);

            var needLoad = false;

            if (editor.global.menu != null) {
                needLoad = $.inArray(parseInt(selectedLang.id), editor.global.menu.loadedLangs) == -1;
            }

            if (needLoad) {
                // - if not loaded, call api to load them
                $.ajax({
                    async: false,
                    type: 'post',
                    url: '/Menu/GetContent',
                    data: {
                        MenuID: editor.global.menu.MenuID,
                        LangID: selectedLang.id
                    },
                    success: function (response) {
                        if (response.IsSucceed) {
                            // update menu content
                            editor.global.updateMenu(response.Content, selectedLang.id);

                            // update preview
                            editor.content.update();
                        } else {
                            Utils.showError();
                        }
                    }
                });
            } else {
                editor.content.update();
            }
            preview.generate();
        },
        // editor.lang.primary
        primary: {
            // editor.lang.primary.get
            get: function () {
                return editor.lang.get($('#txt-menu-prilangid').val());
            },
            // editor.lang.primary.set
            set: function () {
                var tempPriLangID = $('#txt-menu-prilangid').val();
                var tempPriLangName = $('#drop-language option[value="' + tempPriLangID + '"]').html();
                // update id
                $('#txt-menu-prilangid').val(editor.lang.current().id);
                // update view
                $('#label-pri').html(editor.lang.current().displayname);
                if (editor.controller.menu.isUpdating()) {

                    //validate
                    if (editor.validator.execute('Menu', editor.content.props.menu_name, editor.content.props.menu_desc)) {
                        // update to database
                        if (editor.controller.menu.isUpdating()) {
                            editor.lang.requestUpdate(true, false);
                        }
                    }
                    else {
                        // restore id
                        $('#txt-menu-prilangid').val(tempPriLangID);
                        // restore view
                        $('#label-pri').html(tempPriLangName);
                        $('#rad-primary').attr('checked', false);
                    }
                }
            }
        },
        // editor.lang.secondary
        secondary: {
            // editor.lang.secondary.get
            get: function () {
                return editor.lang.get($('#txt-menu-selangid').val());
            },
            // editor.lang.secondary.set
            set: function () {
                // update id
                $('#txt-menu-selangid').val(editor.lang.current().id);

                // update view
                $('#label-se').html(editor.lang.current().displayname);

                // update to database
                if (editor.controller.menu.isUpdating()) {
                    editor.lang.requestUpdate(false, true);
                }
            }
        },
        // editor.lang.requestUpdate
        requestUpdate: function (isPrimary, isSecondary) {
            $.ajax({
                type: 'post',
                data: {
                    MenuID: editor.global.menu.MenuID,
                    LangID: editor.lang.current().id,
                    IsPrimary: isPrimary,
                    IsSecondary: isSecondary
                },
                url: '/Menu/UpdateLanguage',
                success: function () {
                    if (isPrimary) {
                        editor.global.menu.PrimaryLang.LangID = parseInt(editor.lang.current().id);
                    }
                    if (isSecondary) {
                        if (editor.global.menu.SecondLang == null) {
                            editor.global.menu.SecondLang = {};
                        }
                        editor.global.menu.SecondLang.LangID = parseInt(editor.lang.current().id);
                    }

                    // update preview
                    preview.generate();
                }
            });
        },
        // editor.lang.set
        set: function () {
            var type = $('input[name="radLang"]:checked').val();

            if (type.toLowerCase() == 'primary') {
                if (editor.lang.current().isPrimary) {
                    // do nothing
                } else if (editor.lang.current().isSecondary) {
                    MessageBox.show({
                        message: ['Do you want to change the primary language to ' + editor.lang.current().displayname + '?'],
                        buttons: {
                            yes: function () {
                                editor.lang.primary.set();
                                $('#txt-menu-selangid').val('');
                                $('#label-se').html('None');
                            },
                            no: function () {
                                $('#rad-primary').attr('checked', false);
                                $('#rad-secondary').attr('checked', true);
                            }
                        }
                    });
                } else {
                    MessageBox.show({
                        message: ['Do you want to change the primary language to ' + editor.lang.current().displayname + '?'],
                        buttons: {
                            yes: editor.lang.primary.set,
                            no: function () { $('#rad-primary').attr('checked', false); }
                        }
                    });
                }
            } else if (type.toLowerCase() == 'secondary') {
                if (editor.lang.current().isSecondary) {
                    // do nothing
                } else if (editor.lang.current().isPrimary) {
                    MessageBox.show({
                        message: ['Please set a primary language first!'],
                        buttons: { ok: function () { $('#rad-primary').attr('checked', true); } }
                    });
                } else {
                    MessageBox.show({
                        message: ['Do you want to change the secondary language to ' + editor.lang.current().displayname + '?'],
                        buttons: {
                            yes: editor.lang.secondary.set,
                            no: function () {
                                $('#rad-secondary').attr('checked', false);
                                $('#rad-primary').attr('checked', true);
                            }
                        }
                    });
                }
            }
        }
    },
    // editor.content
    content: {
        store: function (langid, prop) {
            var content = $.trim($(prop.control).val());

            editor.storage.set(langid, prop.storage_key, content);

            $(prop.control).val('');
        },
        // editor.content.display
        display: function (langid, prop) {
            // get from storage first
            var content = editor.content.fromStorage(langid, prop.storage_key);

            // then get from global variable
            if (editor.helper.isUndefined(content)) {
                content = editor.content.fromGlobal(langid, prop.contents());
            }

            $(prop.control).val(content);
        },
        // editor.content.fromStorage
        fromStorage: function (langid, prop) {
            if (langid == null) {
                langid = editor.lang.current().id;
            }

            return editor.storage.get(langid, prop);
        },
        // editor.content.fromGlobal
        fromGlobal: function (langid, contents) {
            if (editor.helper.isUndefined(contents)) {
                return undefined;
            }
            if (langid == null) {
                langid = editor.lang.current().id;
            }

            var query = jLinq.from(contents).ignoreCase().startsWith('LangID', langid).first();

            return query == null ? undefined : query.Content;
        },
        update: function () {
            for (key in editor.content.props) {
                // temporary storing
                editor.content.store(editor.lang.previous.id, editor.content.props[key]);

                // load content by new language
                editor.content.display(null, editor.content.props[key]);
            }

            editor.lang.previous = null;
        },
        // editor.content.props
        props: {
            // editor.content.props.menu_name
            menu_name: { storage_key: 0, control: '#txt-menu-name',
                contents: function () {
                    if (editor.global.menu != null) {
                        return editor.global.menu.Names;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.menu_desc
            menu_desc: { storage_key: 1, control: '#txt-menu-desc',
                contents: function () {
                    if (editor.global.menu != null) {
                        return editor.global.menu.Descs;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.section_name
            section_name: { storage_key: 2, control: '#txt-sec-name',
                contents: function () {
                    if (editor.global.section != null) {
                        return editor.global.section.Names;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.section_desc
            section_desc: { storage_key: 3, control: '#txt-sec-desc',
                contents: function () {
                    if (editor.global.section != null) {
                        return editor.global.section.Descs;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.subsection_name
            subsection_name: { storage_key: 4, control: '#txt-subsec-name',
                contents: function () {
                    if (editor.global.subsection != null) {
                        return editor.global.subsection.Names;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.subsection_desc
            subsection_desc: { storage_key: 5, control: '#txt-subsec-desc',
                contents: function () {
                    if (editor.global.subsection != null) {
                        return editor.global.subsection.Descs;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.item_name
            item_name: { storage_key: 6, control: '#txt-item-name',
                contents: function () {
                    if (editor.global.item != null) {
                        return editor.global.item.Names;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.item_desc
            item_desc: { storage_key: 7, control: '#txt-item-desc',
                contents: function () {
                    if (editor.global.item != null) {
                        return editor.global.item.Descs;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.group_name
            group_name: { storage_key: 8, control: '#txt-group-name',
                contents: function () {
                    if (editor.global.group != null) {
                        return editor.global.group.Names;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.group_desc
            group_desc: { storage_key: 9, control: '#txt-group-desc',
                contents: function () {
                    if (editor.global.group != null) {
                        return editor.global.group.Descs;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.option_name
            option_name: { storage_key: 10, control: '#txt-option-name',
                contents: function () {
                    if (editor.global.option != null) {
                        return editor.global.option.Names;
                    } else {
                        return undefined;
                    }
                }
            },
            // editor.content.props.option_desc
            option_desc: { storage_key: 11, control: '#txt-option-desc',
                contents: function () {
                    if (editor.global.option != null) {
                        return editor.global.option.Descs;
                    } else {
                        return undefined;
                    }
                }
            }
        }
    },
    // editor.controller
    controller: {
        // editor.controller.menu
        menu: {
            isClickNew: false,
            // editor.controller.menu.isUpdating
            isUpdating: function () {
                //return $('#menu-form').attr('action') == '/Menu/UpdateMenu';
                return editor.global.menu != null;
            },
            // editor.controller.menu.get
            get: function () {
                // change flag
                $('#sec-flag').val('add');
                var menuId = $(this).attr('value');

                showProgressDialog('Loading menu');

                $.ajax({
                    url: '/Menu/GetMenuDetail',
                    type: 'post',
                    data: {
                        LangID: editor.lang.current().id,
                        MenuID: menuId
                    },
                    complete: function () {
                        hideProgressDialog();
                    },
                    success: function (response) {
                        // reset view
                        editor.resetter.menu();

                        if (response.IsSucceed) {

                            //                            $('#selected-menu-name').html(response.Menu.);
                            // set global variable                            
                            //                            $('#btn-menu-add').removeAttr('disabled');
                            $('#menu-form').attr('action', '/Menu/UpdateMenu');
                            //                            $('#btn-menu-del').removeAttr('disabled');
                            //                            $('#btn-menu-update').removeAttr('disabled');
                            editor.global.menu = response.Menu;

                            // check null
                            if (editor.global.menu != null) {
                                // store loaded language
                                editor.global.menu.loadedLangs = new Array();

                                // bind data to view
                                // - bind primary language
                                $('#drop-language').val(editor.global.menu.PrimaryLang.LangID);
                                $('#txt-menu-prilangid').val(editor.global.menu.PrimaryLang.LangID);
                                $('#rad-primary').attr('checked', true);
                                $('#label-pri').html(editor.global.menu.PrimaryLang.Name);

                                // push into stored array
                                editor.global.menu.loadedLangs.push(editor.global.menu.PrimaryLang.LangID);

                                // - bind secondary language
                                if (editor.global.menu.SecondLang != null && editor.global.menu.SecondLang.LangID != 0) {
                                    $('#txt-menu-selangid').val(editor.global.menu.SecondLang.LangID);
                                    $('#label-se').html(editor.global.menu.SecondLang.Name);
                                    // push into stored array
                                    editor.global.menu.loadedLangs.push(editor.global.menu.SecondLang.LangID);
                                } else {
                                    $('#label-se').html('None');
                                }

                                // - bind menu name
                                editor.content.display(null, editor.content.props.menu_name);

                                // - bind menu description
                                editor.content.display(null, editor.content.props.menu_desc);

                                // - bind menu id
                                $('#txt-menu-menuid').val(editor.global.menu.MenuID);

                                // - bind type id
                                //$('#TypeID').val(editor.global.menu.TypeID)
                                if (editor.global.menu.TypeIDList != null) {
                                    for (var i = 0; i < editor.global.menu.TypeIDList.length; i++) {
                                        var typeId = editor.global.menu.TypeIDList[i];

                                        $('#menu-type-list input[value="' + typeId + '"]').attr('checked', true);
                                    }
                                }

                                // - bind menu active
                                $('#menu-active').attr('checked', editor.global.menu.IsActive ? true : false);

                                // - bind css id
                                $('#txt-menu-cssid').val(editor.global.menu.CSSID);

                                // - bind currency id
                                $('#txt-menu-currencyid').val(editor.global.menu.CurrencyID);

                                // - bind menu image
                                if (editor.global.menu.Image != null) {
                                    var image = editor.image.create(editor.global.menu.Image.ImagePath);
                                    $('#menu-preview-image').empty();
                                    $('#menu-preview-image').append(image);
                                    $("#menu-image-display").attr('checked', editor.global.menu.Image.IsDisplay ? true : false);
                                    $('#menu-image-imageid').val(editor.global.menu.Image.ImageID);
                                }

                                // - bind menu icon
                                if (editor.global.menu.Icon != null) {
                                    var icon = editor.image.create(editor.global.menu.Icon.ImagePath);
                                    $('#menu-preview-icon').empty();
                                    $('#menu-preview-icon').append(icon);
                                    $("#menu-icon-display").attr('checked', editor.global.menu.Icon.IsDisplay ? true : false);
                                    $('#menu-icon-imageid').val(editor.global.menu.Icon.ImageID);
                                }

                                //bind data for section
                                if (editor.global.menu.Sections != null) {
                                    var SortedSections = jLinq.from(editor.global.menu.Sections).orderBy("DisplayOrder").select();
                                    editor.global.menu.Sections = SortedSections;
                                    for (var i = 0; i < editor.global.menu.Sections.length; i++) {
                                        var section = editor.global.menu.Sections[i];
                                        var name = editor.content.fromGlobal(editor.lang.primary.get().id, section.Names);
                                        var displaySectionName = name.length > 0 ? name : '[Unnamed]';
                                        var innerHTML = '';
                                        innerHTML += '<li ><a class="clearfix" value="' + section.SectionID + '" href="#"><span>' + displaySectionName + '</span>';
                                        innerHTML += '</a><button title="Delete the selected menu" type="button" class="image-button del-icon" button=""></button></li>';
                                        $("#drop-sec").append(innerHTML);
                                    }
                                }
                                //set selected menu label
                                var selectedMenuName = editor.content.fromGlobal(editor.lang.primary.get().id, editor.global.menu.Names)
                                selectedMenuName = selectedMenuName.length == 0 ? '[Unnamed]' : selectedMenuName;
                                $('#selected-menu-name').html(selectedMenuName);
                                $('#selected-menu-name').attr('title', selectedMenuName);
                                // preview menu
                                preview.stylesheet.apply({ id: editor.global.menu.CSSID });
                                preview.currency.apply({ id: editor.global.menu.CurrencyID });
                                preview.generate();
                            }
                        } else {
                            Utils.showError();
                        }
                    }
                });
            },
            // editor.controller.menu.addnew
            addnew: function () {
                if (tab.isFormChanged(0)) {
                    if (editor.controller.menu.validate()) {
                        editor.controller.menu.isClickNew = true;
                        editor.controller.menu.save();
                    }
                }
                else
                    editor.controller.menu.add();
            },
            // editor.controller.menu.add
            add: function () {
                // change action
                $('#menu-form').attr('action', '/Menu/AddMenu');

                // clear selection
                $('#drop-menu .selected').removeClass('selected');

                //reset selected
                $('#drop-menu .liselected').removeClass('liselected');

                editor.resetter.menu();
            },
            // editor.controller.menu.save
            save: function () {
                if ($('#txt-menu-autotrans').val() == 'true') {
                    MessageBox.show({
                        message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
                        buttons: {
                            yes: function () {
                                editor.controller.menu.doSave();
                            },
                            no: function () { $('#auto-trans').focus(); }
                        }
                    });
                }
                else {
                    editor.controller.menu.doSave();
                }
            },
            // editor.controller.menu.doSave
            doSave: function () {
                if (editor.controller.menu.validate()) {
                    showProgressDialog('Saving the Menu');

                    // gather all multi-language content, stringify in JSON format
                    var json = editor.helper.gatherJson(editor.content.props.menu_name, editor.content.props.menu_desc);

                    $('#menu-content').val(json);

                    $('#menu-form').submit();
                }
            },
            // editor.controller.menu.postSave
            postSave: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.ActionType == 'add') {
                        editor.storage.clear.menu(true);
                        var displayMenuName = response.MenuName.length > 0 ? response.MenuName : '[Unnamed]';
                        // add new menu in list
                        var anchor = $('<a />')
                        .attr('value', response.MenuID)
                        .attr('href', '#')
                        .html('<span>' + displayMenuName + '</span>')


                        $('#drop-menu').append($('<li />').append(anchor).append('<button title="Delete this menu" type="button" class="image-button del-icon" button=""></button>'));

                        if (editor.controller.menu.isClickNew)
                            editor.resetter.menu();
                        else {
                            anchor.focus();
                            anchor.click();
                        }

                    } else {
                        editor.storage.clear.menu(false);
                        // update menu
                        editor.global.menu.MenuID = response.Menu.MenuID;
                        editor.global.menu.Icon = response.Menu.Icon;
                        editor.global.menu.Image = response.Menu.Image;
                        editor.global.menu.TypeIDList = response.Menu.TypeIDList;
                        // bind type
                        for (var i = 0; i < response.Menu.TypeIDList.length; i++) {
                            $('#menu-type-list input[value="' + response.Menu.TypeIDList[i] + '"]').attr('checked', true);
                        }

                        //editor.global.menu.IsActive = editor.global.menu.IsActive;
                        for (name in response.Menu.Names) {
                            var element = response.Menu.Names[name];
                            var index = editor.helper.findIndexByKeyValue(editor.global.menu.Names, 'LangID', element.LangID);
                            if (typeof editor.global.menu.Names[index] == 'undefined') {
                                editor.global.menu.Names.push(element);
                            }
                            else
                                editor.global.menu.Names[index].Content = element.Content;
                            if (element.IsPrimary == 1) {
                                var displayMenuName = element.Content.length > 0 ? element.Content : '[Unnamed]';
                                $("#drop-menu").find('.selected')
                                .html('<span>' + displayMenuName + '</span>')
                                .append('<button title="Delete this menu" type="button" class="image-button del-icon" button=""></button>');
                                //                                $("#drop-menu").find('.selected').html(displayMenuName);
                            }
                        }
                        for (desc in response.Menu.Descs) {
                            var element = response.Menu.Descs[desc];
                            var index = editor.helper.findIndexByKeyValue(editor.global.menu.Descs, 'LangID', element.LangID);
                            if (typeof editor.global.menu.Descs[index] == 'undefined') {
                                editor.global.menu.Descs.push(element);
                            }
                            else
                                editor.global.menu.Descs[index].Content = element.Content;
                        }
                        // update image

                        // update preview
                        preview.generate();
                    }
                    editor.helper.resetAutoTrans();
                } else {
                    Utils.showError();
                }
            },
            // editor.controller.menu.validate
            validate: function () {
                // check type
                if ($('#menu-type-list input:checked').length == 0) {
                    MessageBox.show({
                        message: ['Please set the type for this menu!'],
                        buttons: { ok: null }
                    });
                    return false;
                }

                return editor.validator.execute('Menu', editor.content.props.menu_name, editor.content.props.menu_desc);
            },
            // editor.controller.menu.del
            del: function (MenuID) {
                MessageBox.show({
                    message: ['Do you want to delete this Menu?'],
                    buttons: {
                        yes: function () {
                            //validate
                            showProgressDialog('Deleting menu');
                            $.ajax({
                                url: "/Menu/DeleteMenu",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    MenuID: MenuID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        $("#drop-menu").find('a[value="' + MenuID + '"]').parent().remove();
                                        editor.resetter.menu();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });
            },
            // editor.controller.menu.delimgicon
            delimgicon: function () {
                var selected = $("#menu-select-imageicon option:selected").val();
                var ImageID;
                if (selected == 'icon') {
                    ImageID = $('#menu-icon-imageid').val();
                }
                else {
                    ImageID = $('#menu-image-imageid').val();
                }
                //validate
                MessageBox.show({
                    message: ['Are you sure that you want to delete this ' + selected + '?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting the ' + selected);

                            $.ajax({
                                url: "/Menu/DeleteImageIcon",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ImageID: ImageID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        if (selected == 'icon') {
                                            $('[for="menu-preview-icon"]').val('');
                                            $('#menu-preview-icon').empty();
                                            editor.global.menu.Icon = null;
                                        }
                                        else {
                                            $('[for="menu-preview-image"]').val('');
                                            $('#menu-preview-image').empty();
                                            editor.global.menu.Image = null;
                                        }
                                        hideProgressDialog();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                            //

                        },
                        no: null
                    }
                });

            }
        },
        // editor.controller.section
        section: {
            //editor.controller.section.isUpdating
            isUpdating: function () {
                $("#drop-sec").find('.selected').length != 0 ? true : false;
            },
            isClickNew: false,
            // editor.controller.section.get
            get: function () {
                //clear child
                editor.resetter.section();

                // change flag
                var sectionid = $(this).attr('value')
                $('#txt-subsec-parentid').val(sectionid);
                $('#sec-flag').val('update');
                $('#subsec-flag').val('add');
                $('#subsection-form').attr('action', '/Menu/AddSection');
                $('#section-form').attr('action', '/Menu/UpdateSection');
                //                $('#btn-sec-del').removeAttr('disabled');
                //                $('#btn-sec-update').removeAttr('disabled');
                //bind data for subsection
                editor.global.section = jLinq.from(editor.global.menu.Sections).ignoreCase().startsWith('SectionID', sectionid).first();
                //set selected section label
                var selectedSectionName = editor.content.fromGlobal(editor.lang.primary.get().id, editor.global.section.Names)
                selectedSectionName = selectedSectionName.length == 0 ? '[Unnamed]' : selectedSectionName;
                $('#selected-section-name').html(selectedSectionName);
                $('#selected-section-name').attr('title', selectedSectionName);

                if (editor.global.section.SubSections != null) {
                    var SortedSubSections = jLinq.from(editor.global.section.SubSections).orderBy("DisplayOrder").select();
                    editor.global.section.SubSections = SortedSubSections;
                    for (var i = 0; i < editor.global.section.SubSections.length; i++) {
                        var subsection = editor.global.section.SubSections[i];
                        var name = editor.content.fromGlobal(editor.lang.primary.get().id, subsection.Names);
                        var displaySubSectionName = name.length > 0 ? name : '[Unnamed]';
                        var innerHTML = '';
                        innerHTML += '<li ><a class="clearfix" value="' + subsection.SectionID + '" href="#"><span>' + displaySubSectionName + '</span>';
                        innerHTML += '</a><button title="Delete this sub section" type="button" class="image-button del-icon" button=""></button></li>';
                        $("#drop-subsec").append(innerHTML);
                    }
                }
                //bind data for item
                if (editor.global.section.Items != null) {
                    var SortedItems = jLinq.from(editor.global.section.Items).orderBy("DisplayOrder").select();
                    editor.global.section.Items = SortedItems;
                    for (var i = 0; i < editor.global.section.Items.length; i++) {
                        var item = editor.global.section.Items[i];
                        var name = editor.content.fromGlobal(editor.lang.primary.get().id, item.Names);
                        var displayItemName = name.length > 0 ? name : '[Unnamed]';
                        var innerHTML = '';
                        innerHTML += '<li ><a class="clearfix" value="' + item.ItemID + '" href="#"><span>' + displayItemName + '</span>';
                        innerHTML += '</a><button title="Delete this menu item" type="button" class="image-button del-icon" button=""></button></li>';
                        $("#drop-item").append(innerHTML);
                    }
                }

                //bind section detail

                $('#section-id').val(sectionid);
                editor.content.display(null, editor.content.props.section_name);
                editor.content.display(null, editor.content.props.section_desc);
                $('#section-active').attr('checked', editor.global.section.IsActive ? true : false);

                //bind section icon image
                if (editor.global.section.Icon != null) {
                    var image = editor.image.create(editor.global.section.Icon.ImagePath);
                    $('#section-preview-icon').empty();
                    $('#section-preview-icon').append(image);
                    $('img[src="' + editor.global.section.Icon.ImagePath + '"]').attr('ImageID', editor.global.section.Icon.ImageID);
                    $('#sec-imageid').val(editor.global.section.Icon.ImageID);
                    $("#section-display-icon").attr('checked', editor.global.section.Icon.IsDisplay ? true : false);
                }
            },
            // editor.controller.section.addnew
            addnew: function () {
                if (tab.isFormChanged(1)) {
                    if (editor.controller.section.validate()) {
                        editor.controller.section.isClickNew = true;
                        editor.controller.section.save();
                    }
                }
                else
                    editor.controller.section.add();
            },
            // editor.controller.section.add
            add: function () {
                // change action
                $('#section-form').attr('action', '/Menu/AddSection');

                // clear selection
                $('#drop-sec .selected').removeClass('selected');

                //reset selected
                $('#drop-sec .liselected').removeClass('liselected');

                editor.resetter.section();
            },

            // editor.controller.section.save
            save: function (context) {

                if ($('#txt-sec-autotrans').val() == 'true') {
                    MessageBox.show({
                        message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
                        buttons: {
                            yes: function () {
                                editor.controller.section.doSave();
                            },
                            no: function () { $('#auto-trans').focus(); }
                        }
                    });
                }
                else {
                    editor.controller.section.doSave();
                }
            },
            // editor.controller.section.doSave
            doSave: function () {

                showProgressDialog('Saving the Section');

                var json = editor.helper.gatherJson(editor.content.props.section_name, editor.content.props.section_desc);
                $('#sec-contents').val(json);

                // bind data
                $('#sec-lang-id').val(editor.lang.current().id);
                $('#sec-pri-lang-id').val(editor.lang.primary.get().id);
                $('#sec-menu-id').val(editor.global.menu.MenuID);

                $('#section-form').submit();

            },
            // editor.controller.section.postSave
            postSave: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.ActionType == 'add') {
                        editor.storage.clear.section(true);
                        //push new Section to menu global
                        if (editor.global.menu.Sections == null) {
                            editor.global.menu.Sections = new Array();
                        }

                        editor.global.menu.Sections.push(response.Section);
                        editor.global.menu.Sections[editor.global.menu.Sections.length - 1].DisplayOrder = editor.global.menu.Sections.length;
                        var displaySectionName = response.SectionName.length > 0 ? response.SectionName : '[Unnamed]';
                        // add new section in list
                        var anchor = $('<a />')
                        .attr('value', response.Section.SectionID)
                        .attr('href', '#')
                        .html('<span>' + displaySectionName + '</span>')

                        $('#drop-sec').append($('<li />').append(anchor).append('<button title="Delete this section" type="button" class="image-button del-icon" button=""></button>'));
                        if (editor.controller.section.isClickNew)
                            editor.resetter.section();
                        else {
                            anchor.focus();
                            anchor.click();
                        }
                    } else {
                        editor.storage.clear.section(false);
                        var index = editor.helper.findIndexByKeyValue(editor.global.menu.Sections, 'SectionID', response.Section.SectionID);
                        //editor.global.menu.IsActive = editor.global.menu.IsActive;
                        for (name in response.Section.Names) {
                            var element = response.Section.Names[name];
                            var i = editor.helper.findIndexByKeyValue(editor.global.menu.Sections[index].Names, 'LangID', element.LangID);
                            if (typeof editor.global.menu.Sections[index].Names[i] == 'undefined') {
                                editor.global.menu.Sections[index].Names.push(element);
                            }
                            else
                                editor.global.menu.Sections[index].Names[i].Content = element.Content;
                            if (element.IsPrimary == 1) {
                                // update list
                                var displaySectionName = element.Content.length > 0 ? element.Content : '[Unnamed]';

                                //                                $("#drop-sec").find('.selected').html(displaySectionName);
                                $("#drop-sec").find('.selected')
                                .html('<span>' + displaySectionName + '</span>')
                                .append('<button title="Delete this section" type="button" class="image-button del-icon" button=""></button>');
                            }
                        }
                        for (desc in response.Section.Descs) {
                            var element = response.Section.Descs[desc];
                            var i = editor.helper.findIndexByKeyValue(editor.global.menu.Sections[index].Descs, 'LangID', element.LangID);
                            if (typeof editor.global.menu.Sections[index].Descs[i] == 'undefined') {
                                editor.global.menu.Sections[index].Descs.push(element);
                            }
                            else
                                editor.global.menu.Sections[index].Descs[i].Content = element.Content;
                        }
                        editor.global.menu.Sections[index].IsActive = response.Section.IsActive;
                        //empty
                        $('#section-preview-icon').empty();
                        if (response.Section.Icon != null) {
                            $('#sec-imageid').val(response.Section.Icon.ImageID);
                            if (editor.global.menu.Sections[index].Icon == null) {
                                editor.global.menu.Sections[index].Icon = new Array();
                            }
                            editor.global.menu.Sections[index].Icon.ImageID = response.Section.Icon.ImageID;
                            editor.global.menu.Sections[index].Icon.ImagePath = response.Section.Icon.ImagePath;
                            editor.global.menu.Sections[index].Icon.IsDisplay = response.Section.Icon.IsDisplay;
                            var icon = editor.image.create(editor.global.menu.Sections[index].Icon.ImagePath);

                            $('#section-preview-icon').append(icon);
                            $("#section-display-icon").attr('checked', editor.global.menu.Sections[index].Icon.IsDisplay ? true : false);
                        }
                    }

                    // update preview
                    preview.generate();
                    editor.helper.resetAutoTrans();
                } else {
                    Utils.showError();
                }
            },
            // editor.controller.section.validate
            validate: function () {
                var check = editor.validator.execute('Section', editor.content.props.section_name, editor.content.props.section_desc);
                if (!check) {
                    return false;
                }
                if ($("#drop-menu").find('.selected').length == 0) {
                    MessageBox.show({
                        message: ['Please choose a Menu!'],
                        buttons: {
                            ok: null
                        }
                    });
                    editor.resetter.section();
                    return false;
                }
                return true;
            },

            // editor.controller.section.del
            del: function (SectionID) {
                //validate

                MessageBox.show({
                    message: ['Do you want to delete this Section?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting section');
                            $.ajax({
                                url: "/Menu/DeleteSection",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    SectionID: SectionID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        var index = editor.helper.findIndexByKeyValue(editor.global.menu.Sections, 'SectionID', SectionID);
                                        editor.global.menu.Sections.splice(index, 1);
                                        $("#drop-sec").find('a[value="' + SectionID + '"]').parent().remove();
                                        editor.resetter.section();
                                        preview.generate();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });
            },
            // editor.controller.section.delicon
            delicon: function () {
                //validate
                MessageBox.show({
                    message: ['Are you sure that you want to delete this icon?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting the icon');
                            $.ajax({
                                url: "/Menu/DeleteImageIcon",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ImageID: $('#sec-imageid').val()
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        $('[for="section-preview-icon"]').val('');
                                        $('#section-preview-icon').empty();
                                        editor.global.section.Icon = null;
                                        preview.generate();
                                        $('#section-display-icon').attr('checked', false);
                                        hideProgressDialog();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                            //

                        },
                        no: null
                    }
                });

            }
        },
        // editor.controller.subsection
        subsection: {
            isClickNew: false,
            //editor.controller.section.isUpdating
            isUpdating: function () {
                $("#drop-subsec").find('.selected').length != 0 ? true : false;
            },
            // editor.controller.subsection.get
            get: function () {
                //clear child
                editor.resetter.subsection();
                // change flag
                var sectionid = $(this).attr('value');
                $('#subsec-flag').val('update');
                $('#subsection-form').attr('action', '/Menu/UpdateSection');
                //                $('#btn-subsec-del').removeAttr('disabled');
                //                $('#btn-subsec-update').removeAttr('disabled');
                $('#item-flag').val('add');
                $('#item-form').attr('action', '/Menu/AddItem');
                //
                $('#txt-subsec-sectionid').val($("#drop-subsec").find('.selected').attr("value"));
                $("#txt-item-sectionid").val($(this).attr('value'));
                //bind data for item
                editor.global.subsection = jLinq.from(editor.global.section.SubSections).ignoreCase().startsWith('SectionID', sectionid).first();
                //set subsection name label
                var selectedSubSectionName = editor.content.fromGlobal(editor.lang.primary.get().id, editor.global.subsection.Names);
                selectedSubSectionName = selectedSubSectionName.length == 0 ? '[Unnamed]' : selectedSubSectionName;
                $('#selected-subsection-name').html(selectedSubSectionName);
                $('#selected-subsection-name').attr('title', selectedSubSectionName);
                if (editor.global.subsection.Items != null) {
                    var SortedItems = jLinq.from(editor.global.subsection.Items).orderBy("DisplayOrder").select();
                    editor.global.subsection.Items = SortedItems;
                    for (var i = 0; i < editor.global.subsection.Items.length; i++) {
                        var item = editor.global.subsection.Items[i];
                        var name = editor.content.fromGlobal(editor.lang.primary.get().id, item.Names);
                        var displayItemName = name.length > 0 ? name : '[Unnamed]';
                        var innerHTML = '';
                        innerHTML += '<li ><a class="clearfix" value="' + item.ItemID + '" href="#"><span>' + displayItemName + '</span>';
                        innerHTML += '</a><button title="Delete this menu item" type="button" class="image-button del-icon" button=""></button></li>';
                        $("#drop-item").append(innerHTML);
                    }
                }

                //bind sub section detail
                $('#txt-subsec-sectionid').val($('#drop-subsec .selected').attr('value'));
                editor.content.display(null, editor.content.props.subsection_name);
                editor.content.display(null, editor.content.props.subsection_desc);
                $('#subsection-active').attr('checked', editor.global.subsection.IsActive ? true : false);

                //bind sub section icon image
                if (editor.global.subsection.Icon != null) {
                    var image = editor.image.create(editor.global.subsection.Icon.ImagePath);
                    $('#subsection-preview-icon').empty();
                    $('#subsection-preview-icon').append(image);
                    $('img[src="' + editor.global.subsection.Icon.ImagePath + '"]').attr('ImageID', editor.global.subsection.Icon.ImageID);
                    $('#subsec-imageid').val(editor.global.subsection.Icon.ImageID);
                    $("#subsection-display-icon").attr('checked', editor.global.subsection.Icon.IsDisplay ? true : false);
                }
            },
            // editor.controller.subsection.del
            del: function (SectionID) {
                //validate
                MessageBox.show({
                    message: ['Do you want to delete this Subsection?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting sub section');
                            $.ajax({
                                url: "/Menu/DeleteSection",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    SectionID: SectionID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        var index = editor.helper.findIndexByKeyValue(editor.global.section.SubSections, 'SectionID', SectionID);
                                        editor.global.section.SubSections.splice(index, 1);
                                        $("#drop-subsec").find('a[value="' + SectionID + '"]').parent().remove();
                                        editor.resetter.subsection();
                                        preview.generate();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });
            },
            // editor.controller.subsection.validate
            validate: function () {
                var check = editor.validator.execute('Sub Section', editor.content.props.subsection_name, editor.content.props.subsection_desc);
                if (!check) {
                    return false;
                }
                if ($("#drop-sec").find('.selected').length == 0) {
                    MessageBox.show({
                        message: ['Please choose a Section!'],
                        buttons: {
                            ok: null
                        }
                    });
                    editor.resetter.subsection();
                    return false;
                }
                return true;
            },
            // editor.controller.subsection.addnew
            addnew: function () {
                if (tab.isFormChanged(2)) {
                    if (editor.controller.subsection.validate()) {
                        editor.controller.subsection.isClickNew = true;
                        editor.controller.subsection.save();
                    }
                }
                else
                    editor.controller.subsection.add();
            },
            // editor.controller.subsection.add
            add: function () {
                // change action
                $('#subsection-form').attr('action', '/Menu/AddSection');

                // clear selection
                $('#drop-subsec .selected').removeClass('selected');

                //reset selected
                $('#drop-subsec .liselected').removeClass('liselected');

                editor.resetter.subsection();
            },
            // editor.controller.subsection.save
            save: function () {
                if ($('#txt-subsec-autotrans').val() == 'true') {
                    MessageBox.show({
                        message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
                        buttons: {
                            yes: function () {
                                editor.controller.subsection.doSave();
                            },
                            no: function () { $('#auto-trans').focus(); }
                        }
                    });
                }
                else {
                    editor.controller.subsection.doSave();
                }
            },
            // editor.controller.subsection.doSave
            doSave: function () {
                if (editor.controller.subsection.validate()) {
                    showProgressDialog('Saving the Subsection');

                    var json = editor.helper.gatherJson(editor.content.props.subsection_name, editor.content.props.subsection_desc);
                    $('#subsec-contents').val(json);

                    // bind data
                    $('#txt-subsec-parentid').val(editor.global.section.SectionID);
                    $('#subsec-pri-lang-id').val(editor.lang.primary.get().id);

                    $('#subsection-form').submit();
                }
            },
            // editor.controller.subsection.postSave
            postSave: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.ActionType == 'add') {
                        editor.storage.clear.subsection(true);
                        //push new Section to menu global
                        if (editor.global.section.SubSections == null) {
                            editor.global.section.SubSections = new Array();
                        }
                        editor.global.section.SubSections.push(response.Section);
                        editor.global.section.SubSections[editor.global.section.SubSections.length - 1].DisplayOrder = editor.global.section.SubSections.length;
                        var displaySubSectionName = response.SectionName.length > 0 ? response.SectionName : '[Unnamed]';
                        // add new section in list
                        var anchor = $('<a />')
                        .attr('value', response.Section.SectionID)
                        .attr('href', '#')
                        .html('<span>' + displaySubSectionName + '</span>')


                        $('#drop-subsec').append($('<li />').append(anchor).append('<button title="Delete this sub section" type="button" class="image-button del-icon" button=""></button>'));

                        if (editor.controller.subsection.isClickNew)
                            editor.resetter.subsection();
                        else {
                            anchor.focus();
                            anchor.click();
                        }
                    } else {
                        editor.storage.clear.subsection(false);
                        var index = editor.helper.findIndexByKeyValue(editor.global.section.SubSections, 'SectionID', response.Section.SectionID);
                        for (name in response.Section.Names) {
                            var element = response.Section.Names[name];
                            var i = editor.helper.findIndexByKeyValue(editor.global.section.SubSections[index].Names, 'LangID', element.LangID);
                            if (typeof editor.global.section.SubSections[index].Names[i] == 'undefined') {
                                editor.global.section.SubSections[index].Names.push(element);
                            }
                            else
                                editor.global.section.SubSections[index].Names[i].Content = element.Content;
                            if (element.IsPrimary == 1) {
                                //update list
                                var displaySubSectionName = element.Content.length > 0 ? element.Content : '[Unnamed]';
                                $("#drop-subsec").find('.selected').html(displaySubSectionName);
                            }
                        }
                        for (desc in response.Section.Descs) {
                            var element = response.Section.Descs[desc];
                            var i = editor.helper.findIndexByKeyValue(editor.global.section.SubSections[index].Descs, 'LangID', element.LangID);
                            if (typeof editor.global.section.SubSections[index].Descs[i] == 'undefined') {
                                editor.global.section.SubSections[index].Descs.push(element);
                            }
                            else
                                editor.global.section.SubSections[index].Descs[i].Content = element.Content;
                        }
                        editor.global.section.SubSections[index].IsActive = response.Section.IsActive;
                        $('#subsection-preview-icon').empty();
                        if (response.Section.Icon != null) {
                            $('#subsec-imageid').val(response.Section.Icon.ImageID);
                            if (editor.global.section.SubSections[index].Icon == null) {
                                editor.global.section.SubSections[index].Icon = new Array();
                            }
                            editor.global.section.SubSections[index].Icon.ImageID = response.Section.Icon.ImageID;
                            editor.global.section.SubSections[index].Icon.ImagePath = response.Section.Icon.ImagePath;
                            editor.global.section.SubSections[index].Icon.IsDisplay = response.Section.Icon.IsDisplay;
                            var icon = editor.image.create(editor.global.section.SubSections[index].Icon.ImagePath);

                            $('#subsection-preview-icon').append(icon);
                            $("#subsection-display-icon").attr('checked', editor.global.section.SubSections[index].Icon.IsDisplay ? true : false);
                        }
                    }

                    // update preview
                    preview.generate();
                    editor.helper.resetAutoTrans();
                } else {
                    Utils.showError();
                }
            },
            // editor.controller.subsection.delicon
            delicon: function () {
                //validate
                MessageBox.show({
                    message: ['Are you sure that you want to delete this icon?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting the icon');
                            $.ajax({
                                url: "/Menu/DeleteImageIcon",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ImageID: $('#subsec-imageid').val()
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        $('[for="subsection-preview-icon"]').val('');
                                        $('#subsection-preview-icon').empty();
                                        editor.global.subsection.Icon = null;
                                        preview.generate();
                                        $('#subsection-display-icon').attr('checked', false);
                                        hideProgressDialog();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });


                        },
                        no: null
                    }
                });
            }
        },
        // editor.controller.item
        item: {
            isClickNew: false,
            //editor.controller.section.isUpdating
            isUpdating: function () {
                $("#drop-item").find('.selected').length != 0 ? true : false;
            },
            // editor.controller.item.get
            get: function () {
                //clear child
                editor.resetter.item();
                // change flag
                var itemid = $(this).attr('value');
                $('#item-flag').val('update');
                $('#item-form').attr('action', '/Menu/UpdateItem');
                //                $('#btn-item-del').removeAttr('disabled');
                //                $('#btn-item-update').removeAttr('disabled');
                $('#group-flag').val('add');
                $('#group-form').attr('action', '/Menu/AddGroup');
                //
                $('#txt-item-itemid').val($("#drop-item").find('.selected').attr("value"));
                $("#txt-group-itemid").val($(this).attr('value'));

                //bind data for group
                //check items of sec or sub sec
                if ($("#drop-subsec").find('.selected').length == 0) {
                    editor.global.item = jLinq.from(editor.global.section.Items).ignoreCase().startsWith('ItemID', itemid).first();
                }
                else
                    editor.global.item = jLinq.from(editor.global.subsection.Items).ignoreCase().startsWith('ItemID', itemid).first();
                //set item name label
                var selectedItemName = editor.content.fromGlobal(editor.lang.primary.get().id, editor.global.item.Names)
                selectedItemName = selectedItemName.length == 0 ? '[Unnamed]' : selectedItemName;
                $('#selected-item-name').html(selectedItemName);
                $('#selected-item-name').attr('title', selectedItemName);
                if (editor.global.item.Groups != null) {
                    var SortedGroups = jLinq.from(editor.global.item.Groups).orderBy("DisplayOrder").select();
                    editor.global.item.Groups = SortedGroups;
                    for (var i = 0; i < editor.global.item.Groups.length; i++) {
                        var group = editor.global.item.Groups[i];
                        var name = editor.content.fromGlobal(editor.lang.primary.get().id, group.Names);
                        var displayGroupName = name.length > 0 ? name : '[Unnamed]';
                        var innerHTML = '';
                        innerHTML += '<li ><a class="clearfix" value="' + group.GroupID + '" href="#"><span>' + displayGroupName + '</span>';
                        innerHTML += '</a><button title="Delete this group" type="button" class="image-button del-icon" button=""></button></li>';
                        $("#drop-group").append(innerHTML);
                    }
                }

                //bind item detail
                $('#txt-item-itemid').val($('#drop-item .selected').attr('value'));
                editor.content.display(null, editor.content.props.item_name);
                editor.content.display(null, editor.content.props.item_desc);
                $('#item-active').attr('checked', editor.global.item.IsActive ? true : false);
                $("#chkItem-veg").attr('checked', editor.global.item.IsVeg ? true : false);
                $("#chkItem-gf").attr('checked', editor.global.item.IsGF ? true : false);
                $("#txt-item-price").val(editor.global.item.Price.toFixed(2));
                $('#item-spice-level option[value="' + editor.global.item.SpiceLevel + '"]').attr('selected', 'selected');
                //bind item icon
                if (editor.global.item.Icon != null) {
                    var image = editor.image.create(editor.global.item.Icon.ImagePath);
                    $('#item-preview-icon').empty();
                    $('#item-preview-icon').append(image);
                    $('img[src="' + editor.global.item.Icon.ImagePath + '"]').attr('ImageID', editor.global.item.Icon.ImageID);
                    $('#item-iconid').val(editor.global.item.Icon.ImageID);
                    $("#item-display-icon").attr('checked', editor.global.item.Icon.IsDisplay ? true : false);
                }
                //bind item image
                if (editor.global.item.Image != null) {
                    var image = editor.image.create(editor.global.item.Image.ImagePath);
                    $('#item-preview-image').empty();
                    $('#item-preview-image').append(image);
                    //                    $('img[src="' + editor.global.item.Image.ImagePath + '"]').attr('ImageID', editor.global.item.Image.ImageID);
                    $('#item-imageid').val(editor.global.item.Image.ImageID);
                    $("#item-display-image").attr('checked', editor.global.item.Image.IsDisplay ? true : false);
                }
            },
            // editor.controller.item.del
            del: function (ItemID) {
                //validate
                MessageBox.show({
                    message: ['Do you want to delete this Menu item?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting item');
                            $.ajax({
                                url: "/Menu/DeleteItem",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ItemID: ItemID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        var index;
                                        if ($("#drop-subsec").find('.selected').length != 0) {
                                            index = editor.helper.findIndexByKeyValue(editor.global.subsection.Items, 'ItemID', ItemID);
                                            editor.global.subsection.Items.splice(index, 1);
                                        }
                                        else {
                                            index = editor.helper.findIndexByKeyValue(editor.global.section.Items, 'ItemID', ItemID);
                                            editor.global.section.Items.splice(index, 1);
                                        }

                                        $("#drop-menu").find('a[value="' + ItemID + '"]').parent().remove();
                                        editor.resetter.item();
                                        preview.generate();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });
            },
            // editor.controller.item.validate
            validate: function () {
                var check = editor.validator.execute('Item', editor.content.props.item_name, editor.content.props.item_desc);
                if (!check) {
                    return false;
                }
                if ($("#drop-subsec").find('.selected').length == 0 && $("#drop-sec").find('.selected').length == 0) {
                    MessageBox.show({
                        message: ['Please choose a Section or Sub Section!'],
                        buttons: {
                            ok: null
                        }
                    });
                    editor.resetter.item();
                    return false;
                }
                if (isNaN($.trim($("#txt-item-price").val()))) {
                    MessageBox.show({
                        message: ['Please enter in the cost!'],
                        buttons: {
                            ok: null
                        }
                    });
                    return false;
                }
                return true;
            },
            // editor.controller.item.addnew
            addnew: function () {
                if (tab.isFormChanged(3)) {
                    if (editor.controller.item.validate()) {
                        editor.controller.item.isClickNew = true;
                        editor.controller.item.save();
                    }
                }
                else
                    editor.controller.item.add();
            },
            // editor.controller.item.add
            add: function () {
                // change action
                $('#item-form').attr('action', '/Menu/AddItem');

                // clear selection
                $('#drop-item .selected').removeClass('selected');

                //reset selected
                $('#drop-item .liselected').removeClass('liselected');

                editor.resetter.item();
            },
            // editor.controller.item.save
            save: function () {
                if ($('#txt-item-autotrans').val() == 'true') {
                    MessageBox.show({
                        message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
                        buttons: {
                            yes: function () {
                                editor.controller.item.doSave();
                            },
                            no: function () { $('#auto-trans').focus(); }
                        }
                    });
                }
                else {
                    editor.controller.item.doSave();
                }
            },
            // editor.controller.item.doSave
            doSave: function () {
                if (editor.controller.item.validate()) {
                    showProgressDialog('Saving the Menu item');

                    var json = editor.helper.gatherJson(editor.content.props.item_name, editor.content.props.item_desc);
                    $('#item-contents').val(json);

                    // bind data
                    if ($("#drop-subsec").find('.selected').length == 0) {
                        $('#txt-item-sectionid').val(editor.global.section.SectionID);
                        $('#txt-item-to').val('section');
                    }
                    else {
                        $('#txt-item-sectionid').val(editor.global.subsection.SectionID);
                        $('#txt-item-to').val('subsection');
                    }


                    $('#txt-item-prilangid').val(editor.lang.primary.get().id);

                    $('#item-form').submit();
                }
            },
            // editor.controller.item.postSave
            postSave: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.ActionType == 'add') {
                        editor.storage.clear.item(true);
                        if (response.To == 'section') {
                            //push new item to section global
                            if (editor.global.section.Items == null) {
                                editor.global.section.Items = new Array();
                            }
                            editor.global.section.Items.push(response.Item);
                            editor.global.section.Items[editor.global.section.Items.length - 1].DisplayOrder = editor.global.section.Items.length;
                        }
                        else {
                            //push new item to subsection global
                            if (editor.global.subsection.Items == null) {
                                editor.global.subsection.Items = new Array();
                            }
                            editor.global.subsection.Items.push(response.Item);
                            editor.global.subsection.Items[editor.global.subsection.Items.length - 1].DisplayOrder = editor.global.subsection.Items.length;
                        }
                        var displayItemName = response.ItemName.length > 0 ? response.ItemName : '[Unnamed]';
                        // add new item in list
                        var anchor = $('<a />')
                        .attr('value', response.Item.ItemID)
                        .attr('href', '#')
                        .html('<span>' + displayItemName + '</span>')


                        $('#drop-item').append($('<li />').append(anchor).append('<button title="Delete this menu item" type="button" class="image-button del-icon" button=""></button>'));

                        if (editor.controller.item.isClickNew)
                            editor.resetter.item();
                        else {
                            anchor.focus();
                            anchor.click();
                        }
                    } else {
                        editor.storage.clear.item(false);
                        var ItemTemp;
                        var index;
                        if (response.To == 'subsection') {
                            index = editor.helper.findIndexByKeyValue(editor.global.subsection.Items, 'ItemID', response.Item.ItemID);
                            ItemTemp = editor.global.subsection.Items[index];
                        }
                        else {
                            index = editor.helper.findIndexByKeyValue(editor.global.section.Items, 'ItemID', response.Item.ItemID);
                            ItemTemp = editor.global.section.Items[index];
                        }
                        for (name in response.Item.Names) {
                            var element = response.Item.Names[name];
                            var i = editor.helper.findIndexByKeyValue(ItemTemp.Names, 'LangID', element.LangID);
                            if (typeof ItemTemp.Names[i] == 'undefined') {
                                ItemTemp.Names.push(element);
                            }
                            else
                                ItemTemp.Names[i].Content = element.Content;
                            if (element.IsPrimary == 1) {
                                //update list
                                var displayItemName = element.Content.length > 0 ? element.Content : '[Unnamed]';
                                $("#drop-item").find('.selected').html(displayItemName);
                            }
                        }
                        for (desc in response.Item.Descs) {
                            var element = response.Item.Descs[desc];
                            var i = editor.helper.findIndexByKeyValue(ItemTemp.Descs, 'LangID', element.LangID);
                            if (typeof ItemTemp.Descs[i] == 'undefined') {
                                ItemTemp.Descs.push(element);
                            }
                            else
                                ItemTemp.Descs[i].Content = element.Content;
                        }
                        ItemTemp.IsActive = response.Item.IsActive;
                        ItemTemp.IsVeg = response.Item.IsVeg;
                        ItemTemp.IsGF = response.Item.IsGF;
                        ItemTemp.Price = response.Item.Price;
                        ItemTemp.SpiceLevel = response.Item.SpiceLevel;
                        $('#item-preview-icon').empty();
                        if (response.Item.Icon != null) {
                            $('#item-iconid').val(response.Item.Icon.ImageID);
                            if (ItemTemp.Icon == null) {
                                ItemTemp.Icon = new Array();
                            }
                            ItemTemp.Icon.ImageID = response.Item.Icon.ImageID;
                            ItemTemp.Icon.ImagePath = response.Item.Icon.ImagePath;
                            ItemTemp.Icon.IsDisplay = response.Item.Icon.IsDisplay;
                            var icon = editor.image.create(ItemTemp.Icon.ImagePath);

                            $('#item-preview-icon').append(icon);
                            $("#item-display-icon").attr('checked', ItemTemp.Icon.IsDisplay ? true : false);
                        }
                    }

                    // update preview
                    preview.generate();
                    editor.helper.resetAutoTrans();
                } else {
                    Utils.showError();
                }
            },
            // editor.controller.item.delimgicon
            delimgicon: function () {
                var selected = $("#item-select-imageicon option:selected").val();
                var ImageID;
                if (selected == 'icon') {
                    ImageID = $('#item-imageid').val();
                }
                else {
                    ImageID = $('#item-iconid').val();
                }
                //validate
                MessageBox.show({
                    message: ['Are you sure that you want to delete this icon?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting the icon');
                            $.ajax({
                                url: "/Menu/DeleteImageIcon",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ImageID: ImageID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        if (selected == 'icon') {
                                            $('[for="item-preview-icon"]').val('');
                                            $('#item-preview-icon').empty();
                                            editor.global.item.Icon = null;
                                            preview.generate();
                                            $('#item-display-icon').attr('checked', false);
                                        }
                                        else {
                                            $('[for="item-preview-image"]').val('');
                                            $('#item-preview-image').empty();
                                            editor.global.item.Image = null;
                                            preview.generate();
                                            $('#item-display-image').attr('checked', false);
                                        }
                                        hideProgressDialog();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });

            }
        },
        // editor.controller.group
        group: {
            isClickNew: false,
            //editor.controller.section.isUpdating
            isUpdating: function () {
                $("#drop-group").find('.selected').length != 0 ? true : false;
            },
            // editor.controller.group.get
            get: function () {
                //clear child
                editor.resetter.group();
                // change flag
                var groupid = $(this).attr('value');
                $('#group-flag').val('update');
                $('#group-form').attr('action', '/Menu/UpdateGroup');
                //                $('#btn-group-del').removeAttr('disabled');
                //                $('#btn-group-update').removeAttr('disabled');
                $('#option-flag').val('add');
                $('#option-form').attr('action', '/Menu/AddOption');
                //
                $('#txt-group-groupid').val($("#drop-group").find('.selected').attr("value"));
                $("#txt-option-groupid").val($(this).attr('value'));

                //bind data for option
                editor.global.group = jLinq.from(editor.global.item.Groups).ignoreCase().startsWith('GroupID', groupid).first();
                //set group name label
                var selectedGroupName = editor.content.fromGlobal(editor.lang.primary.get().id, editor.global.group.Names);
                selectedGroupName = selectedGroupName.length == 0 ? '[Unnamed]' : selectedGroupName;
                $('#selected-group-name').html(selectedGroupName);
                $('#selected-group-name').attr('title', selectedGroupName);

                if (editor.global.group.Options != null) {
                    var SortedOptions = jLinq.from(editor.global.group.Options).orderBy("DisplayOrder").select();
                    editor.global.group.Options = SortedOptions;
                    for (var i = 0; i < editor.global.group.Options.length; i++) {
                        var option = editor.global.group.Options[i];
                        var name = editor.content.fromGlobal(editor.lang.primary.get().id, option.Names);
                        var displayOptionName = name.length > 0 ? name : '[Unnamed]';
                        var innerHTML = '';
                        innerHTML += '<li ><a class="clearfix" value="' + option.OptionID + '" href="#"><span>' + displayOptionName + '</span>';
                        innerHTML += '</a><button title="Delete this option" type="button" class="image-button del-icon" button=""></button></li>';
                        $("#drop-option").append(innerHTML);
                    }
                }

                //bind group detail
                $('#txt-group-groupid').val($('#drop-group .selected').attr('value'));
                editor.content.display(null, editor.content.props.group_name);
                editor.content.display(null, editor.content.props.group_desc);
                $('#group-active').attr('checked', editor.global.group.IsActive ? true : false);
                $("#chkGroup-veg").attr('checked', editor.global.group.IsVeg ? true : false);
                $("#chkGroup-gf").attr('checked', editor.global.group.IsGF ? true : false);
                $("#txt-group-price").val(editor.global.group.Price.toFixed(2));
                $('#group-spice-level option[value="' + editor.global.group.SpiceLevel + '"]').attr('selected', 'selected');
                $('#group-limit option[value="' + editor.global.group.Limit + '"]').attr('selected', 'selected');
                $('#GroupTypeID option[value="' + editor.global.group.TypeID + '"]').attr('selected', 'selected');
                $('#GroupTypeID').change();
                //bind group icon image
                if (editor.global.group.Icon != null) {
                    var image = editor.image.create(editor.global.group.Icon.ImagePath);
                    $('#group-preview-icon').empty();
                    $('#group-preview-icon').append(image);
                    $('img[src="' + editor.global.group.Icon.ImagePath + '"]').attr('ImageID', editor.global.group.Icon.ImageID);
                    $('#group-imageid').val(editor.global.group.Icon.ImageID);
                    $("#group-display-icon").attr('checked', editor.global.group.Icon.IsDisplay ? true : false);
                }
            },
            // editor.controller.group.del
            del: function (GroupID) {
                //validate
                MessageBox.show({
                    message: ['Do you want to delete this Group?'],
                    buttons: {
                        yes: function () {
                            var GroupID = $("#drop-group").find('.selected').attr("value");
                            showProgressDialog('Deleting group');
                            $.ajax({
                                url: "/Menu/DeleteGroup",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    GroupID: GroupID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        var index = editor.helper.findIndexByKeyValue(editor.global.item.Groups, 'GroupID', GroupID);
                                        editor.global.item.Groups.splice(index, 1);
                                        $("#drop-group").find('a[value="' + GroupID + '"]').parent().remove();
                                        editor.resetter.group();
                                        preview.generate();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });
            },
            // editor.controller.group.validate
            validate: function () {
                var check = editor.validator.execute('Group', editor.content.props.group_name, editor.content.props.group_desc);
                if (!check) {
                    return false;
                }
                if ($("#drop-item").find('.selected').length == 0) {
                    MessageBox.show({
                        message: ['Please choose an Item!'],
                        buttons: {
                            ok: null
                        }
                    });
                    editor.resetter.group();
                    return false;
                }
                if (isNaN($.trim($("#txt-group-price").val()))) {
                    MessageBox.show({
                        message: ['Please enter in the cost!'],
                        buttons: {
                            ok: null
                        }
                    });
                    return false;
                }
                return true;
            },
            // editor.controller.group.addnew
            addnew: function () {
                if (tab.isFormChanged(4)) {
                    if (editor.controller.group.validate()) {
                        editor.controller.group.isClickNew = true;
                        editor.controller.group.save();
                    }
                }
                else
                    editor.controller.group.add();
            },
            // editor.controller.group.add
            add: function () {
                // change action
                $('#group-form').attr('action', '/Menu/AddGroup');

                // clear selection
                $('#drop-group .selected').removeClass('selected');

                //reset selected
                $('#drop-group .liselected').removeClass('liselected');

                editor.resetter.group();

            },
            // editor.controller.group.save
            save: function () {
                if ($('#txt-group-autotrans').val() == 'true') {
                    MessageBox.show({
                        message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
                        buttons: {
                            yes: function () {
                                editor.controller.group.doSave();
                            },
                            no: function () { $('#auto-trans').focus(); }
                        }
                    });
                }
                else {
                    editor.controller.group.doSave();
                }
            },
            // editor.controller.group.doSave
            doSave: function () {
                if (editor.controller.group.validate()) {
                    showProgressDialog('Saving the Group');

                    var json = editor.helper.gatherJson(editor.content.props.group_name, editor.content.props.group_desc);
                    $('#group-contents').val(json);

                    // bind data

                    $('#txt-group-itemid').val(editor.global.item.ItemID);
                    $('#txt-group-prilangid').val(editor.lang.primary.get().id);

                    $('#group-form').submit();
                }
            },
            // editor.controller.group.postSave
            postSave: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.ActionType == 'add') {
                        editor.storage.clear.group(true);
                        //push new item to global
                        if (editor.global.item.Groups == null) {
                            editor.global.item.Groups = new Array();
                        }
                        editor.global.item.Groups.push(response.Group);
                        editor.global.item.Groups[editor.global.item.Groups.length - 1].DisplayOrder = editor.global.item.Groups.length;
                        var displayGroupName = response.GroupName.length > 0 ? response.GroupName : '[Unnamed]';
                        // add new item in list
                        var anchor = $('<a />')
                        .attr('value', response.Group.GroupID)
                        .attr('href', '#')
                        .html('<span>' + displayGroupName + '</span>')


                        $('#drop-group').append($('<li />').append(anchor).append('<button title="Delete this group" type="button" class="image-button del-icon" button=""></button>'));

                        if (editor.controller.group.isClickNew)
                            editor.resetter.group();
                        else {
                            anchor.focus();
                            anchor.click();
                        }
                    } else {
                        editor.storage.clear.group(false);
                        var index = editor.helper.findIndexByKeyValue(editor.global.item.Groups, 'GroupID', response.Group.GroupID);
                        for (name in response.Group.Names) {
                            var element = response.Group.Names[name];
                            var i = editor.helper.findIndexByKeyValue(editor.global.item.Groups[index].Names, 'LangID', element.LangID);
                            if (typeof editor.global.item.Groups[index].Names[i] == 'undefined') {
                                editor.global.item.Groups[index].Names[i].push(element);
                            }
                            else
                                editor.global.item.Groups[index].Names[i].Content = element.Content;
                            if (element.IsPrimary == 1) {
                                //update list
                                var displayGroupName = element.Content.length > 0 ? element.Content : '[Unnamed]';
                                $("#drop-group").find('.selected').html(displayGroupName);
                            }
                        }
                        for (desc in response.Group.Descs) {
                            var element = response.Group.Descs[desc];
                            var i = editor.helper.findIndexByKeyValue(editor.global.item.Groups[index].Descs, 'LangID', element.LangID);
                            if (typeof editor.global.item.Groups[index].Descs[i] == 'undefined') {
                                editor.global.item.Groups[index].Descs[i].push(element);
                            }
                            else
                                editor.global.item.Groups[index].Descs[i].Content = element.Content;
                        }
                        editor.global.item.Groups[index].IsActive = response.Group.IsActive;
                        editor.global.item.Groups[index].IsVeg = response.Group.IsVeg;
                        editor.global.item.Groups[index].IsGF = response.Group.IsGF;
                        editor.global.item.Groups[index].Price = response.Group.Price;
                        editor.global.item.Groups[index].SpiceLevel = response.Group.SpiceLevel;
                        editor.global.item.Groups[index].Limit = response.Group.Limit;
                        editor.global.item.Groups[index].TypeID = response.Group.TypeID;

                        //empty
                        $('#group-preview-icon').empty();
                        if (response.Group.Icon != null) {
                            $('#group-imageid').val(response.Group.Icon.ImageID);
                            if (editor.global.item.Groups[index].Icon == null) {
                                editor.global.item.Groups[index].Icon = new Array();
                            }
                            editor.global.item.Groups[index].Icon.ImageID = response.Group.Icon.ImageID;
                            editor.global.item.Groups[index].Icon.ImagePath = response.Group.Icon.ImagePath;
                            editor.global.item.Groups[index].Icon.IsDisplay = response.Group.Icon.IsDisplay;
                            var icon = editor.image.create(editor.global.item.Groups[index].Icon.ImagePath);

                            $('#group-preview-icon').append(icon);
                            $("#group-display-icon").attr('checked', editor.global.item.Groups[index].Icon.IsDisplay ? true : false);
                        }
                    }

                    // update preview
                    preview.generate();
                    editor.helper.resetAutoTrans();
                } else {
                    Utils.showError();
                }
            },
            // editor.controller.group.delicon
            delicon: function () {
                //validate
                MessageBox.show({
                    message: ['Are you sure that you want to delete this icon?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting the icon');
                            $.ajax({
                                url: "/Menu/DeleteImageIcon",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ImageID: $('#group-imageid').val()
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        $('[for="group-preview-icon"]').val('');
                                        $('#group-preview-icon').empty();
                                        editor.global.group.Icon = null;
                                        preview.generate();
                                        $('#group-display-icon').attr('checked', false);
                                        hideProgressDialog();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });

            }
        },
        // editor.controller.option
        option: {
            isClickNew: false,
            //editor.controller.section.isUpdating
            isUpdating: function () {
                $("#drop-option").find('.selected').length != 0 ? true : false;
            },
            // editor.controller.option.get
            get: function () {
                //clear child
                editor.resetter.option();
                // change flag
                var optionid = $(this).attr('value');
                $('#group-flag').val('update');
                $('#option-form').attr('action', '/Menu/UpdateOption');
                //                $('#btn-option-del').removeAttr('disabled');
                //                $('#btn-option-update').removeAttr('disabled');
                $('#txt-option-optionid').val(optionid);
                //bind data for option detail
                editor.global.option = jLinq.from(editor.global.group.Options).ignoreCase().startsWith('OptionID', optionid).first();
                //set selected Optioin name
                var selectedOptionName = editor.content.fromGlobal(editor.lang.primary.get().id, editor.global.option.Names);
                selectedOptionName = selectedOptionName.length == 0 ? '[Unnamed]' : selectedOptionName;
                $('#selected-option-name').html(selectedOptionName);
                $('#selected-option-name').attr('title', selectedOptionName);
                //bind option detail
                $('#txt-option-optionid').val($('#drop-option .selected').attr('value'));
                editor.content.display(null, editor.content.props.option_name);
                editor.content.display(null, editor.content.props.option_desc);
                $('#option-active').attr('checked', editor.global.option.IsActive ? true : false);
                $("#chkOption-veg").attr('checked', editor.global.option.IsVeg ? true : false);
                $("#chkOption-gf").attr('checked', editor.global.option.IsGF ? true : false);
                $("#txt-option-price").val(editor.global.option.Price.toFixed(2));
                $('#option-spice-level option[value="' + editor.global.option.SpiceLevel + '"]').attr('selected', 'selected');

                //bind group icon image
                if (editor.global.option.Icon != null) {
                    var image = editor.image.create(editor.global.option.Icon.ImagePath);
                    $('#option-preview-icon').empty();
                    $('#option-preview-icon').append(image);
                    $('img[src="' + editor.global.option.Icon.ImagePath + '"]').attr('ImageID', editor.global.option.Icon.ImageID);
                    $('#option-imageid').val(editor.global.option.Icon.ImageID);
                    $("#option-display-icon").attr('checked', editor.global.option.Icon.IsDisplay ? true : false);
                }
            },
            // editor.controller.option.del
            del: function (OptionID) {
                //validate
                MessageBox.show({
                    message: ['Do you want to delete this Option?'],
                    buttons: {
                        yes: function () {
                            var OptionID = $("#drop-option").find('.selected').attr("value");
                            showProgressDialog('Deleting option');
                            $.ajax({
                                url: "/Menu/DeleteOption",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    OptionID: OptionID
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        var index = editor.helper.findIndexByKeyValue(editor.global.group.Options, 'OptionID', OptionID);
                                        editor.global.group.Options.splice(index, 1);
                                        $("#drop-option").find('a[value="' + MenuID + '"]').parent().remove();
                                        editor.resetter.option();
                                        preview.generate();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });
                        },
                        no: null
                    }
                });
            },
            // editor.controller.option.validate
            validate: function () {
                var check = editor.validator.execute('Option', editor.content.props.option_name, editor.content.props.option_desc);
                if (!check) {
                    return false;
                }
                if ($("#drop-group").find('.selected').length == 0) {
                    MessageBox.show({
                        message: ['Please choose a Group!'],
                        buttons: {
                            ok: null
                        }
                    });
                    editor.resetter.option();
                    return false;
                }
                if (isNaN($.trim($("#txt-option-price").val()))) {
                    MessageBox.show({
                        message: ['Please enter in the cost!'],
                        buttons: {
                            ok: null
                        }
                    });
                    return false;
                }
                return true;
            },
            // editor.controller.option.addnew
            addnew: function () {
                if (tab.isFormChanged(5)) {
                    if (editor.controller.option.validate()) {
                        editor.controller.option.isClickNew = true;
                        editor.controller.option.save();
                    }
                }
                else
                    editor.controller.option.add();
            },
            // editor.controller.option.add
            add: function () {
                // change action
                $('#option-form').attr('action', '/Menu/AddOption');

                // clear selection
                $('#drop-option .selected').removeClass('selected');

                //reset selected
                $('#drop-option .liselected').removeClass('liselected');

                editor.resetter.option();
            },
            // editor.controller.option.save
            save: function () {
                if ($('#txt-option-autotrans').val() == 'true') {
                    MessageBox.show({
                        message: ['Automatic translation will automatically translate all names & descriptions from primary language to other languages. Do you want to continue this?'],
                        buttons: {
                            yes: function () {
                                editor.controller.option.doSave();
                            },
                            no: function () { $('#auto-trans').focus(); }
                        }
                    });
                }
                else {
                    editor.controller.option.doSave();
                }
            },
            // editor.controller.option.doSave
            doSave: function () {
                if (editor.controller.option.validate()) {
                    showProgressDialog('Saving the Option');

                    var json = editor.helper.gatherJson(editor.content.props.option_name, editor.content.props.option_desc);
                    $('#option-contents').val(json);

                    // bind data

                    $('#txt-option-groupid').val(editor.global.group.GroupID);
                    $('#txt-option-prilangid').val(editor.lang.primary.get().id);

                    $('#option-form').submit();
                }
            },
            // editor.controller.option.postSave
            postSave: function (response) {
                hideProgressDialog();
                if (response.IsSucceed) {
                    if (response.ActionType == 'add') {
                        editor.storage.clear.option(true);
                        //push new option to global
                        if (editor.global.group.Options == null) {
                            editor.global.group.Options = new Array();
                        }
                        editor.global.group.Options.push(response.Option);
                        editor.global.group.Options[editor.global.group.Options.length - 1].DisplayOrder = editor.global.group.Options.length;
                        var displayOptionName = response.OptionName.length > 0 ? response.OptionName : '[Unnamed]';
                        // add new option in list
                        var anchor = $('<a />')
                        .attr('value', response.Option.OptionID)
                        .attr('href', '#')
                        .html('<span>' + displayOptionName + '</span>')


                        $('#drop-option').append($('<li />').append(anchor).append('<button title="Delete this option" type="button" class="image-button del-icon" button=""></button>'));

                        if (editor.controller.option.isClickNew)
                            editor.resetter.option();
                        else {
                            anchor.focus();
                            anchor.click();
                        }
                    } else {
                        editor.storage.clear.group(false);
                        var index = editor.helper.findIndexByKeyValue(editor.global.group.Options, 'OptionID', response.Option.OptionID);
                        for (name in response.Option.Names) {
                            var element = response.Option.Names[name];
                            var i = editor.helper.findIndexByKeyValue(editor.global.group.Options[index].Names, 'LangID', element.LangID);
                            if (typeof editor.global.group.Options[index].Names[i] == 'undefined') {
                                editor.global.group.Options[index].Names[i].push(element);
                            }
                            else
                                editor.global.group.Options[index].Names[i].Content = element.Content;
                            if (element.IsPrimary == 1) {
                                //update list
                                var displayOptionName = element.Content.length > 0 ? element.Content : '[Unnamed]';
                                $("#drop-option").find('.selected').html(displayOptionName);
                            }
                        }
                        for (desc in response.Option.Descs) {
                            var element = response.Option.Descs[desc];
                            var i = editor.helper.findIndexByKeyValue(editor.global.group.Options[index].Descs, 'LangID', element.LangID);
                            if (typeof editor.global.group.Options[index].Descs[i] == 'undefined') {
                                editor.global.group.Options[index].Descs[i].push(element);
                            }
                            else
                                editor.global.group.Options[index].Descs[i].Content = element.Content;
                        }
                        editor.global.group.Options[index].IsActive = response.Option.IsActive;
                        editor.global.group.Options[index].IsVeg = response.Option.IsVeg;
                        editor.global.group.Options[index].IsGF = response.Option.IsGF;
                        editor.global.group.Options[index].Price = response.Option.Price;
                        editor.global.group.Options[index].SpiceLevel = response.Option.SpiceLevel;

                        if (response.Option.Icon != null) {
                            editor.global.group.Options[index].Icon.ImagePath = response.Option.Icon.ImagePath;
                            editor.global.group.Options[index].Icon.IsDisplay = response.Option.Icon.IsDisplay;
                        }
                        //empty
                        $('#option-preview-icon').empty();
                        if (response.Option.Icon != null) {
                            $('#option-imageid').val(response.Option.Icon.ImageID);
                            if (editor.global.group.Options[index].Icon == null) {
                                editor.global.group.Options[index].Icon = new Array();
                            }
                            editor.global.group.Options[index].Icon.ImageID = response.Option.Icon.ImageID;
                            editor.global.group.Options[index].Icon.ImagePath = response.Option.Icon.ImagePath;
                            editor.global.group.Options[index].Icon.IsDisplay = response.Option.Icon.IsDisplay;
                            var icon = editor.image.create(editor.global.group.Options[index].Icon.ImagePath);

                            $('#option-preview-icon').append(icon);
                            $("#option-display-icon").attr('checked', editor.global.group.Options[index].Icon.IsDisplay ? true : false);
                        }


                    }

                    // update preview
                    preview.generate();
                    editor.helper.resetAutoTrans();
                } else {
                    Utils.showError();
                }
            },
            // editor.controller.option.delicon
            delicon: function () {
                //validate
                MessageBox.show({
                    message: ['Are you sure that you want to delete this icon?'],
                    buttons: {
                        yes: function () {
                            showProgressDialog('Deleting the icon');
                            $.ajax({
                                url: "/Menu/DeleteImageIcon",
                                type: "POST",
                                dataType: "json",
                                data: {
                                    ImageID: $('#option-imageid').val()
                                },
                                complete: function () {
                                    hideProgressDialog();
                                },
                                success: function (itemData) {
                                    if (itemData.IsSucceed) {
                                        $('[for="option-preview-icon"]').val('');
                                        $('#option-preview-icon').empty();
                                        editor.global.option.Icon = null;
                                        preview.generate();
                                        $('#option-display-icon').attr('checked', false);
                                        hideProgressDialog();
                                    }
                                    else {
                                        Utils.showError();
                                    }
                                }
                            });

                        },
                        no: null
                    }
                });

            }
        }
    },
    // editor.validator
    validator: {
        // editor.validator.execute
        execute: function (field, nameProp, descProp) {
            var nameOnScreen = $.trim($(nameProp.control).val());
            var descOnScreen = $.trim($(descProp.control).val());

            if (nameOnScreen.length == 0 && descOnScreen.length == 0) {
                if (!editor.lang.current().isPrimary && nameOnScreen.length == 0 && descOnScreen.length == 0) {
                    // skip, don't need to input name & desc in language in language that is not primary
                    // show message
                    //                    MessageBox.show({
                    //                        message: ['Please enter in a ' + field + ' name OR a Description in ' + editor.lang.current().displayname],
                    //                        buttons: { ok: null }
                    //                    });
                    //                    return false;
                } else {
                    // show message
                    MessageBox.show({
                        message: ['Please enter in a ' + field + ' name OR a Description in ' + editor.lang.current().displayname],
                        buttons: { ok: null }
                    });

                    return false;
                }
            }

            // check from storage
            var storageCheckResult = true;
            var missLangId = 0;

            var nameInStorage = editor.storage.store[nameProp.storage_key];
            var descInStorage = editor.storage.store[descProp.storage_key];
            for (langid in nameInStorage) {
                if (langid == editor.lang.current().id) {
                    // skip, because of checking on screen is more accurated
                    continue;
                }
                var nameContent = nameInStorage[langid];
                var descContent = descInStorage[langid];

                var emptyName = (editor.helper.isUndefined(nameContent) || $.trim(nameContent).length == 0);
                var emptyDesc = (editor.helper.isUndefined(descContent) || $.trim(descContent).length == 0)

                if (emptyName && emptyDesc) {
                    // both are not inputted, do nothing
                    if (langid == editor.lang.primary.get().id) {
                        storageCheckResult = false;
                        missLangId = langid;
                        break;
                    }
                } else if (emptyName) {
                    if ($.trim(descContent).length > 0) {
                        //                        storageCheckResult = false;
                        //                        missLangId = langid;
                        //                        break;
                    }
                } else if (emptyDesc) {
                    if ($.trim(nameContent).length > 0) {
                        //                        storageCheckResult = false;
                        //                        missLangId = langid;
                        //                        break;
                    }
                }
            }

            // show message if there is any missing content in the storage
            if (!storageCheckResult) {
                //                var langName;
                //                if (editor.lang.get(missLangId).isPrimary) {
                //                    langName = 'primary language';
                //                }
                //                else if (editor.lang.get(missLangId).isSecondary) {
                //                    langName = 'secondary language';
                //                }
                //                else {
                //                    langName = editor.lang.get(missLangId).displayname;
                //                }
                MessageBox.show({
                    message: ['Please enter in a ' + field + ' name OR a Description in ' + editor.lang.get(missLangId).displayname],
                    buttons: { ok: null }
                });
            }
            return storageCheckResult;
        }
    }
};
(function (a) { jQuery.browser.mobile = /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera);