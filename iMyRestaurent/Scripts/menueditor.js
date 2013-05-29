//global data
var menuGlobal;
var sectionGlobal;
var subSectionGlobal;
var itemGlobal;
var groupGlobal;
var optionGlobal;
var nameDescMenu = new Array();
var nameDescSection = new Array();
var nameDescSubSection = new Array();
var nameDescItem = new Array();
var nameDescGroup = new Array();
var nameDescOption = new Array();
var previousLang;
//Global.push({ LangID: 'a', Name: 'b',Desc:'c' });
//end
/*
function findIndexByKeyValue: finds "key" key inside "ob" object that equals "value" value
example: findIndexByKeyValue(students, 'name', "Jim");
object: students = [
{name: 'John', age: 100, profession: 'Programmer'},
{name: 'Jim', age: 50, profession: 'Carpenter'}
];
would find the index of "Jim" and return 1
*/
function findIndexByKeyValue(obj, key, value) {
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return null;
}
function clearSubSection() {
    $("#subsection-active").attr('checked', false);
    $("#subsection-display-icon").attr('checked', false);
    $("#subsection-preview-icon").empty();
    $('#txt-subsec-name').val('');
    $("textarea#txt-subsec-desc").val('');
};
function clearMenu() {

    $("#menu-active").attr('checked', false);
    $("#menu-display").attr('checked', false);
    $("#menu-preview-icon").empty();
    $("#menu-preview-image").empty();
    $('#txt-menu-name').val('');
    $("textarea#txt-menu-desc").val('');
    $('#drop-sec').empty();
};
function clearSection() {

    $("#section-active").attr('checked', false);
    $("#section-display-icon").attr('checked', false);
    $("#section-preview-icon").empty();
    $('#txt-sec-name').val('');
    $("textarea#txt-sec-desc").val('');
    $('#drop-subsec').empty();
};
function clearSubSection() {

    $("#subsection-active").attr('checked', false);
    $("#subsection-display-icon").attr('checked', false);
    $("#subsection-preview-icon").empty();
    $('#txt-subsec-name').val('');
    $("textarea#txt-subsec-desc").val('');
    $('#drop-item').empty();
};
function clearItem() {

    $("#item-active").attr('checked', false);
    $("#item-display-icon").attr('checked', false);
    $("#item-preview-icon").empty();
    $('#chkItem-veg').attr('checked', false);
    $('#chkItem-gf').attr('checked', false);
    $('#item-spice-level option[value="1"]').attr('selected', 'selected');
    $('#txt-item-price').val('');
    $('#txt-item-name').val('');
    $("textarea#txt-item-desc").val('');
    $('#drop-group').empty();
};
function clearGroup() {

    $("#group-active").attr('checked', false);
    $("#group-display-icon").attr('checked', false);
    $("#group-preview-icon").empty();
    $('#chkGroup-veg').attr('checked', false);
    $('#chkGroup-gf').attr('checked', false);
    $('#group-spice-level option[value="1"]').attr('selected', 'selected');
    $('#group-limit option[value="1"]').attr('selected', 'selected');
    $('#txt-group-price').val('');
    $('#txt-group-name').val('');
    $("textarea#txt-group-desc").val('');
    $('#drop-option').empty();
};
function clearOption() {

    $("#option-active").attr('checked', false);
    $("#option-display-icon").attr('checked', false);
    $("#option-preview-icon").empty();
    $('#chkOption-veg').attr('checked', false);
    $('#chkOption-gf').attr('checked', false);
    $('#option-spice-level option[value="1"]').attr('selected', 'selected');
    $('#txt-option-price').val('');
    $('#txt-option-name').val('');
    $("textarea#txt-option-desc").val('');
};
$(document).ready(function () {
    $('.list a').live('click', function (e) {
        e.preventDefault();
        var parent = $(this).parents('.list');
        parent.find('.selected').removeClass('selected');
        $(this).addClass('selected');
    });
    //menu click
    $('#drop-menu a').live('click', function (e) {
        $('#menu-flag').val('update');
        $("#txt-sec-menuid").val($(this).attr('value'));
        //bind data for Menu Detail

        showProgressDialog('Loading menu');

        $.ajax({
            url: "/Menu/GetMenuDetail",
            type: "POST",
            dataType: "json",
            data: {
                LangID: $('#drop-language').val(),
                MenuID: $("#txt-sec-menuid").val()
            },
            complete: function () {
                hideProgressDialog();
            },
            success: function (response) {
                // clear all display fields
                $('input[type="text"], textarea').val('');
                $('.list ul:not(#drop-menu)').empty();
                $('xml-containment').html('');
                $('.displayimg img').remove();
                $('input[type="checkbox"]').removeAttr('checked');
                clearItem();
                clearGroup();
                clearOption();
                if (response.IsSucceed) {
                    menuGlobal = response.Menu;
                    if (menuGlobal != null) {
                        //menu detail
                        $("#txt-menu-name").val(menuGlobal.Names[0].Content);
                        $("textarea#txt-menu-desc").val(menuGlobal.Descs[0].Content);
                        $("#txt-menu-menuid").val(menuGlobal.MenuID);
                        $('#TypeID option[value="' + menuGlobal.TypeID + '"]').attr('selected', 'selected');
                        $("#menu-active").attr('checked', menuGlobal.IsActive ? true : false);
                        //bind menu image
                        var image = new Image();
                        var icon = new Image();
                        image.onload = resize;
                        icon.onLoad = resize;
                        if (menuGlobal.Image != null) {
                            image.src = menuGlobal.Image.ImagePath;
                            $('#menu-preview-image').empty();
                            $('#menu-preview-image').append(image);
                            $("#menu-display").attr('checked', menuGlobal.Image.IsDisplay ? true : false);
                        }
                        if (menuGlobal.Icon != null) {
                            icon.src = menuGlobal.Icon.ImagePath;
                            $('#menu-preview-icon').empty();
                            $('#menu-preview-icon').append(icon);
                            $("#menu-display").attr('checked', menuGlobal.Icon.IsDisplay ? true : false);
                        }
                        //bind data for section
                        if (menuGlobal.Sections != null) {
                            for (var i = 0; i < menuGlobal.Sections.length; i++) {
                                var item = menuGlobal.Sections[i];
                                $("#drop-sec").append('<li ><a value="' + item.SectionID + '" href="#">' + item.Names[0].Content + '</a></li>');
                            }
                        }
                        // bind xml to preview panel
                        preview.stylesheet.apply({ id: menuGlobal.CSSID });
                        preview.currency.apply({ id: menuGlobal.CurrencyID });
                        preview.generate();
                        //$('xml-containment').html(response.Xml);
                    }
                } else {
                    menuGlobal = null;
                    Utils.showError();
                }
            }
        });
    });
    //section click
    $('#drop-sec a').live('click', function (e) {
        $("#txt-subsec-parentid").val($(this).attr('value'));
        $('#sec-flag').val('update');
        //bind data for subsection
        $("#drop-subsec").empty();
        var Section = jLinq.from(menuGlobal.Sections)
            .ignoreCase()
            .startsWith("SectionID", $("#txt-subsec-parentid").val())
            .orderBy("SectionID")
            .select();
        sectionGlobal = Section[0];
        if (sectionGlobal.SubSections != null) {
            for (var i = 0; i < Section[0].SubSections.length; i++) {
                var item = Section[0].SubSections[i];
                $("#drop-subsec").append('<li ><a value="' + item.SectionID + '" href="#">' + item.Names[0].Content + '</a></li>');
            }
        }
        //clear child
        clearSubSection();
        clearItem();
        clearGroup();
        clearOption();
        $('#drop-item').empty();
        $('#drop-group').empty();
        $('#drop-option').empty();
        //bind section detail
        $('#txt-sec-sectionid').val($("#drop-sec").find('.selected').attr("value"));
        $('#txt-sec-name').val(sectionGlobal.Names[0].Content);
        $("textarea#txt-sec-desc").val(sectionGlobal.Desc);
        $("#section-active").attr('checked', sectionGlobal.IsActive ? true : false);

        //bind section icon image
        var image = new Image();
        image.onload = resize;
        if (sectionGlobal.Icon != null) {
            image.src = sectionGlobal.Icon.ImagePath;
            $('#section-preview-icon').empty();
            $('#section-preview-icon').append(image);
            $("#section-display-icon").attr('checked', sectionGlobal.Icon.IsDisplay ? true : false);
        }

    });
    //sub section click
    $('#drop-subsec a').live('click', function (e) {
        $('#subsec-flag').val('update');
        $('#txt-subsec-sectionid').val($("#drop-subsec").find('.selected').attr("value"));
        $("#txt-item-sectionid").val($(this).attr('value'));
        //bind data for item
        $("#drop-item").empty();
        var SubSection = jLinq.from(sectionGlobal.SubSections)
                    .ignoreCase()
                    .startsWith("SectionID", $("#txt-item-sectionid").val())
                    .select();
        subSectionGlobal = SubSection[0];
        if (subSectionGlobal.Items != null) {
            for (var i = 0; i < subSectionGlobal.Items.length; i++) {
                var item = subSectionGlobal.Items[i];
                $("#drop-item").append('<li ><a value="' + item.ItemID + '" href="#">' + item.Names[0].Content + '</a></li>');
            }
        }
        //clear child
        clearItem();
        clearGroup();
        clearOption();
        $('#drop-group').empty();
        $('#drop-option').empty();
        //sub section detail
        //        $('#txt-sec-sectionid').val($("#drop-sec").find('.selected').attr("value"));
        $('#txt-subsec-name').val(subSectionGlobal.Names[0].Content);
        $("textarea#txt-subsec-desc").val(subSectionGlobal.Desc);
        $("#subsection-active").attr('checked', subSectionGlobal.IsActive ? true : false);

        //bind sub section icon image
        var image = new Image();
        image.onload = resize;
        if (subSectionGlobal.Icon != null) {
            image.src = subSectionGlobal.Icon.ImagePath;
            $('#subsection-preview-icon').empty();
            $('#subsection-preview-icon').append(image);
            $("#subsection-display-icon").attr('checked', subSectionGlobal.Icon.IsDisplay ? true : false);
        }
    });
    //item click
    $('#drop-item a').live('click', function (e) {
        $('#item-flag').val('update');
        $("#txt-group-itemid").val($(this).attr('value'));
        $('#txt-item-itemid').val($("#drop-item").find('.selected').attr("value"));
        //bind data for group
        $("#drop-group").empty();
        var Item = jLinq.from(subSectionGlobal.Items)
            .ignoreCase()
            .startsWith("ItemID", $("#txt-group-itemid").val())
            .select();
        itemGlobal = Item[0];
        if (itemGlobal.Groups != null) {
            for (var i = 0; i < itemGlobal.Groups.length; i++) {
                var item = itemGlobal.Groups[i];
                $("#drop-group").append('<li ><a value="' + item.GroupID + '" href="#">' + item.Names[0].Content + '</a></li>');
            }
        }
        //clear child
        clearGroup();
        clearOption();
        $('#drop-option').empty();
        //item detail
        $('#txt-item-name').val(itemGlobal.Names[0].Content);
        $("textarea#txt-item-desc").val(itemGlobal.Desc);
        $("#item-active").attr('checked', itemGlobal.IsActive ? true : false);
        $("#chkItem-veg").attr('checked', itemGlobal.IsVeg ? true : false);
        $("#chkItem-gf").attr('checked', itemGlobal.IsGF ? true : false);
        $("#txt-item-price").val(itemGlobal.Price);
        $('#item-spice-level option[value="' + itemGlobal.SpiceLevel + '"]').attr('selected', 'selected');
        //bind item icon image
        var image = new Image();
        image.onload = resize;
        if (itemGlobal.Icon != null) {
            image.src = itemGlobal.Icon.ImagePath;
            $('#item-preview-icon').empty();
            $('#item-preview-icon').append(image);
            $("#item-display-icon").attr('checked', itemGlobal.Icon.IsDisplay ? true : false);
        }
    });
    //group click
    $('#drop-group a').live('click', function (e) {
        $('#group-flag').val('update');
        $("#txt-option-groupid").val($(this).attr('value'));
        $('#txt-group-groupid').val($("#drop-group").find('.selected').attr("value"));
        //bind data for subsection
        $("#drop-option").empty();
        var Group = jLinq.from(itemGlobal.Groups)
                    .ignoreCase()
                    .startsWith("GroupID", $("#txt-option-groupid").val())
                    .select();
        groupGlobal = Group[0];
        if (groupGlobal.Options != null) {
            for (var i = 0; i < groupGlobal.Options.length; i++) {
                var item = groupGlobal.Options[i];
                $("#drop-option").append('<li ><a value="' + item.OptionID + '" href="#">' + item.Names[0].Content + '</a></li>');
            }
        }
        //clear child
        clearOption();
        //group detail
        $('#txt-group-name').val(groupGlobal.Names[0].Content);
        $("textarea#txt-group-desc").val(groupGlobal.Desc);
        $("#group-active").attr('checked', groupGlobal.IsActive ? true : false);
        $("#chkGroup-veg").attr('checked', groupGlobal.IsVeg ? true : false);
        $("#chkGroup-gf").attr('checked', groupGlobal.IsGF ? true : false);
        $("#txt-group-price").val(groupGlobal.Price);
        $('#group-spice-level option[value="' + groupGlobal.SpiceLevel + '"]').attr('selected', 'selected');
        $('#group-limit option[value="' + groupGlobal.Limit + '"]').attr('selected', 'selected');
        $('#GroupTypeID option[value="' + groupGlobal.TypeID + '"]').attr('selected', 'selected');
        //bind group icon image
        var image = new Image();
        image.onload = resize;
        if (groupGlobal.Icon != null) {
            image.src = groupGlobal.Icon.ImagePath;
            $('#group-preview-icon').empty();
            $('#group-preview-icon').append(image);
            $("#group-display-icon").attr('checked', groupGlobal.Icon.IsDisplay ? true : false);
        }
    });
    //option click
    $('#drop-option a').live('click', function (e) {
        $('#option-flag').val('update');
        var optionid = $("#drop-option").find('.selected').attr("value");
        $('#txt-option-optionid').val(optionid);
        //bind data for subsection
        var Option = jLinq.from(groupGlobal.Options)
                    .ignoreCase()
                    .startsWith("OptionID", optionid)
                    .select();
        optionGlobal = Option[0];
        //group detail
        $('#txt-option-name').val(optionGlobal.Names[0].Content);
        $("textarea#txt-option-desc").val(optionGlobal.Desc);
        $("#option-active").attr('checked', optionGlobal.IsActive ? true : false);
        $("#chkOption-veg").attr('checked', optionGlobal.IsVeg ? true : false);
        $("#chkOption-gf").attr('checked', optionGlobal.IsGF ? true : false);
        $("#txt-option-price").val(optionGlobal.Price);
        $('#option-spice-level option[value="' + optionGlobal.SpiceLevel + '"]').attr('selected', 'selected');
        //bind option icon image
        var image = new Image();
        image.onload = resize;
        if (optionGlobal.Icon != null) {
            image.src = optionGlobal.Icon.ImagePath;
            $('#option-preview-icon').empty();
            $('#option-preview-icon').append(image);
            $("#option-display-icon").attr('checked', optionGlobal.Icon.IsDisplay ? true : false);
        }
    });
    //menu form
    $("#menu-form").ajaxForm(function (response) {
        if (response.ActionType == 'Add') {
            hideProgressDialog();
            //for left panel
            var anchor = $('<a />')
                .attr('value', response.MenuID)
                .attr('href', '#')
                .html($('#txt-menu-name').val());
            $('#drop-menu').append($('<li />').append(anchor));

            //clear textfield
            //            $("#txt-menu-name").val('');
            //            $("textarea#txt-menu-desc").val('');
            //            anchor.click();
        }
        else if (response.ActionType == 'Update') {
            hideProgressDialog();
            $("#drop-menu").find('.selected').empty();
            $("#drop-menu").find('.selected').append($('#txt-menu-name').val());
        }
    })
    // section form
    $('#section-form').ajaxForm(function (response) {
        if (response.ActionType == 'Add') {
            hideProgressDialog();
            //for left panel
            var anchor = $('<a />').attr('href', '#').attr('value', response.Section.SectionID).html($('#txt-sec-name').val());
            $('#drop-sec').append($('<li />').append(anchor));
            //            anchor.click();
            //update menuGlobal
            var rsSection = response.Section;
            if (menuGlobal.Sections == null)
                menuGlobal.Sections = new Array();
            menuGlobal.Sections.push(rsSection);
        }
        else if (response.ActionType == 'Update') {
            hideProgressDialog();
            //update menuGlobal
            var rsSection = response.Section;
            var index = findIndexByKeyValue(menuGlobal.Sections, 'SectionID', rsSection.SectionID);
            var indexOfNames = findIndexByKeyValue(menuGlobal.Sections[index].Names, 'LangID', rsSection.Names[0].LangID);
            menuGlobal.Sections[index].Names[indexOfNames].Content = rsSection.Names[0].Content;
            menuGlobal.Sections[index].Desc = rsSection.Desc;
            menuGlobal.Sections[index].IsActive = rsSection.IsActive;
            if (rsSection.Icon != null) {
                menuGlobal.Sections[index].Icon.ImagePath = rsSection.Icon.ImagePath;
                menuGlobal.Sections[index].Icon.IsDisplay = rsSection.Icon.IsDisplay;
            }
            $("#drop-sec").find('.selected').empty();
            $("#drop-sec").find('.selected').append(rsSection.Names[0].Content);
        }

        preview.generate();
    })
    // sub section form
    $("#subsection-form").ajaxForm(function (response) {
        if (response.ActionType == 'Add') {
            hideProgressDialog();
            //for left panel
            var anchor = $('<a />')
                .attr('value', response.Section.SectionID)
                .attr('href', '#')
                .html($('#txt-subsec-name').val());
            $('#drop-subsec').append($('<li />').append(anchor));
            //            anchor.click();
            //update menuGlobal
            var rsSubSection = response.Section;
            if (sectionGlobal.SubSections == null)
                sectionGlobal.SubSections = new Array();
            sectionGlobal.SubSections.push(rsSubSection);
        }
        else if (response.ActionType == 'Update') {
            hideProgressDialog();
            //update menuGlobal
            var rsSubSection = response.Section;
            var index = findIndexByKeyValue(sectionGlobal.SubSections, 'SectionID', rsSubSection.SectionID);
            var indexofNames = findIndexByKeyValue(sectionGlobal.SubSections[index].Names, 'LangID', rsSubSection.Names[0].LangID);
            sectionGlobal.SubSections[index].Names[indexofNames].Content = rsSubSection.Names[0].Content;
            sectionGlobal.SubSections[index].Desc = rsSubSection.Desc;
            sectionGlobal.SubSections[index].IsActive = rsSubSection.IsActive;
            if (rsSubSection.Icon != null) {
                sectionGlobal.SubSections[index].Icon.ImagePath = rsSubSection.Icon.ImagePath;
                sectionGlobal.SubSections[index].Icon.IsDisplay = rsSubSection.Icon.IsDisplay;
            }
            $("#drop-subsec").find('.selected').empty();
            $("#drop-subsec").find('.selected').append(rsSubSection.Names[0].Content);
        }

        preview.generate();
    })
    // item form
    $("#item-form").ajaxForm(function (response) {
        if (response.ActionType == 'Add') {
            hideProgressDialog();
            var strBoolIsVeg = $('#chkItem-veg').is(':checked');
            var strBoolIsGF = $('#chkItem-gf').is(':checked');
            var price = ($("#txt-item-price").val() == '') ? 0 : parseFloat($('#txt-item-price').val());
            //for left panel
            var anchor = $('<a />')
                .attr('value', response.Item.ItemID)
                .attr('href', '#')
                .html($('#txt-item-name').val());
            $('#drop-item').append($('<li />').append(anchor));
            //            anchor.click();
            //update menuGlobal
            var rsItem = response.Item;
            if (subSectionGlobal.Items == null)
                subSectionGlobal.Items = new Array();
            subSectionGlobal.Items.push(rsItem);
        }
        else if (response.ActionType == 'Update') {
            hideProgressDialog();
            //update menuGlobal
            var rsItem = response.Item;
            var index = findIndexByKeyValue(subSectionGlobal.Items, 'ItemID', rsItem.ItemID);
            var indexofNames = findIndexByKeyValue(subSectionGlobal.Items[index].Names, 'LangID', rsItem.Names[0].LangID);
            subSectionGlobal.Items[index].Names[indexofNames].Content = rsItem.Names[0].Content;
            subSectionGlobal.Items[index].Desc = rsItem.Desc;
            subSectionGlobal.Items[index].IsActive = rsItem.IsActive;
            if (rsItem.Icon != null) {
                subSectionGlobal.Items[index].Icon.ImagePath = rsItem.Icon.ImagePath;
                subSectionGlobal.Items[index].Icon.IsDisplay = rsItem.Icon.IsDisplay;
            }
            subSectionGlobal.Items[index].IsVeg = rsItem.IsVeg;
            subSectionGlobal.Items[index].IsGF = rsItem.IsGF;
            subSectionGlobal.Items[index].SpiceLevel = rsItem.SpiceLevel;
            subSectionGlobal.Items[index].Price = rsItem.Price;
            $("#drop-item").find('.selected').empty();
            $("#drop-item").find('.selected').append(rsItem.Names[0].Content);
        }

        preview.generate();
    })
    // group form
    $("#group-form").ajaxForm(function (response) {
        if (response.ActionType == 'Add') {
            hideProgressDialog();
            var strBoolIsVeg = $('#chkGroup-veg').is(':checked');
            var strBoolIsGF = $('#chkGroup-gf').is(':checked');
            //for left panel                   
            $("#drop-group").append('<li ><a grouptype="' + $("#drop-group-type option:selected").val() + '" value="' + response.Group.GroupID + '" href="#">' + $("#txt-group-name").val() + '</a></li>');
            //clear textfield
            $("#txt-group-name").val('');
            //update menuGlobal
            var rsGroup = response.Group;
            if (itemGlobal.Groups == null)
                itemGlobal.Groups = new Array();
            itemGlobal.Groups.push(rsGroup);
        }
        else if (response.ActionType == 'Update') {
            hideProgressDialog();
            //update menuGlobal
            var rsGroup = response.Group;
            var index = findIndexByKeyValue(itemGlobal.Groups, 'GroupID', rsGroup.GroupID);
            var indexofNames = findIndexByKeyValue(itemGlobal.Groups[index].Names, 'LangID', rsGroup.Names[0].LangID);
            itemGlobal.Groups[index].Names[indexofNames].Content = rsGroup.Names[0].Content;
            itemGlobal.Groups[index].Desc = rsGroup.Desc;
            itemGlobal.Groups[index].IsActive = rsGroup.IsActive;
            if (rsGroup.Icon != null) {
                itemGlobal.Groups[index].Icon.ImagePath = rsGroup.Icon.ImagePath;
                itemGlobal.Groups[index].Icon.IsDisplay = rsGroup.Icon.IsDisplay;
            }
            itemGlobal.Groups[index].IsVeg = rsGroup.IsVeg;
            itemGlobal.Groups[index].IsGF = rsGroup.IsGF;
            itemGlobal.Groups[index].SpiceLevel = rsGroup.SpiceLevel;
            itemGlobal.Groups[index].Price = rsGroup.Price;
            $("#drop-group").find('.selected').empty();
            $("#drop-group").find('.selected').append(rsGroup.Names[0].Content);
        }
        preview.generate();
    })
    // option form
    $("#option-form").ajaxForm(function (response) {
        if (response.ActionType == 'Add') {
            hideProgressDialog();
            var strBoolIsVeg = $('#chkOption-veg').is(':checked');
            var strBoolIsGF = $('#chkOption-gf').is(':checked');
            //for left panel                   
            $("#drop-option").append('<li ><a value="' + response.Option.OptionID + '" href="#">' + $('#txt-option-name').val() + '</a></li>');
            //clear textfield
            $("#txt-option-name").val('');
            //update menuGlobal
            var rsOption = response.Option;
            if (groupGlobal.Options == null)
                groupGlobal.Options = new Array();
            groupGlobal.Options.push(rsOption);

        }
        else if (response.ActionType == 'Update') {
            hideProgressDialog();
            //update menuGlobal
            var rsOption = response.Option;
            var index = findIndexByKeyValue(groupGlobal.Options, 'OptionID', rsOption.OptionID);
            var indexofNames = findIndexByKeyValue(groupGlobal.Options[index].Names, 'LangID', rsOption.Names[0].LangID);
            groupGlobal.Options[index].Names[indexofNames].Content = rsOption.Names[0].Content;
            groupGlobal.Options[index].Desc = rsOption.Desc;
            groupGlobal.Options[index].IsActive = rsOption.IsActive;
            if (rsOption.Icon != null) {
                groupGlobal.Options[index].Icon.ImagePath = rsOption.Icon.ImagePath;
                groupGlobal.Options[index].Icon.IsDisplay = rsOption.Icon.IsDisplay;
            }
            groupGlobal.Options[index].IsVeg = rsOption.IsVeg;
            groupGlobal.Options[index].IsGF = rsOption.IsGF;
            groupGlobal.Options[index].SpiceLevel = rsOption.SpiceLevel;
            groupGlobal.Options[index].Price = rsOption.Price;
            $("#drop-option").find('.selected').empty();
            $("#drop-option").find('.selected').append(rsOption.Names[0].Content);
        }
        preview.generate();
    })
    // suggestion box
    $('#txt-sec-name').autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/Menu/GetSections",
                type: "POST",
                dataType: "json",
                data: {
                    limit: 12,
                    q: request.term
                },
                success: function (data) {
                    response($.map(data, function (item) {
                        return {
                            label: item
                        }
                    }));
                }
            });
        }
    });
    //for upload image
    $(".menu-input-file").change(displayPreview);
    $("#menu-select-imageicon").change(imageGroupHandle);
    $("#menu-preview-icon").hide();
    $("#menu-inputfile-icon").hide();
    //for add buttons
    $("#btn-menu-add").click(MenuCtrl.addMenu);
    $("#btn-menu-update").click(MenuCtrl.updateMenu);
    $("#btn-menu-del").click(MenuCtrl.deleteMenu);
    $("#btn-sec-add").click(MenuCtrl.addSec);
    $("#btn-sec-update").click(MenuCtrl.updateSection);
    $("#btn-sec-del").click(MenuCtrl.deleteSection);
    $("#btn-sec-delimg").click(MenuCtrl.deleteImgSection);
    $("#btn-subsec-add").click(MenuCtrl.addSubSec);
    $("#btn-subsec-update").click(MenuCtrl.updateSubSec);
    $("#btn-subsec-del").click(MenuCtrl.deleteSubSec);
    $("#btn-item-add").click(MenuCtrl.addItem);
    $("#btn-item-update").click(MenuCtrl.updateItem);
    $("#btn-item-del").click(MenuCtrl.deleteItem);
    $("#btn-group-add").click(MenuCtrl.addGroup);
    $("#btn-group-update").click(MenuCtrl.updateGroup);
    $("#btn-group-del").click(MenuCtrl.deleteGroup);
    $("#btn-option-add").click(MenuCtrl.addOption);
    $("#btn-option-update").click(MenuCtrl.updateOption);
    $("#btn-option-del").click(MenuCtrl.deleteOption);
    //for style sheet
    $("#drop-cssid").change(stylesheetHandle);
    //for auto translation
    $("#auto-trans").change(autoTransHandle);
    //for language
    $("#drop-language").change(languageHandle);
    $("#drop-language").focus(function () {
        // Store the current value on focus, before it changes
        previousLang = { LangID: this.value, ShortName: $(this).find('option:selected').attr('shortname') };
    });
    $("input[name='radLang']").change(radLangHandle);
    //$("#CSSID").click(MenuCtrl.addOption);
});
function autoTransHandle() {
    if ($('#auto-trans').is(':checked')) {
        $('input[name="IsAutoTrans"]').val('true');
    } else {
        $('input[name="IsAutoTrans"]').val('false');
    }
}
function imageGroupHandle() {
    var selected = $("#menu-select-imageicon option:selected").val();
    if (selected == 'icon') {
        $("#menu-preview-icon").show();
        $("#menu-inputfile-icon").show();
        $("#menu-preview-image").hide();
        $("#menu-inputfile-image").hide();

    }
    else {
        $("#menu-preview-icon").hide();
        $("#menu-inputfile-icon").hide();
        $("#menu-preview-image").show();
        $("#menu-inputfile-image").show();
    }

}
function stylesheetHandle() {
    $('main-menu').attr("class", $("#CSSID option:selected").val());
}

function radLangHandle() {
    var selected = $("input[name='radLang']:checked").val();
    if (selected == 'Primary') {
        if ($('#drop-language').val() != $('#txt-menu-selangid').val()) {
            if ($('#txt-menu-prilangid').val() == '') {
                $('#txt-menu-prilangid').val($('#drop-language').val());
                $('#label-pri').empty();
                $('#label-pri').append($('#drop-language option:selected').text());
            }
            else {
                //Confirm
                MessageBox.show({
                    message: ['Do you want to change Primary Language?'],
                    buttons: {
                        yes: function () {
                            $('#txt-menu-prilangid').val($('#drop-language').val());
                            $('#label-pri').empty();
                            $('#label-pri').append($('#drop-language option:selected').text());
                        },
                        no: function () {
                            $("input:radio[name='radLang']").attr("checked", false);
                        }
                    }
                });
            }
        }
        else {
            MessageBox.show({
                message: ['Please change secondary language to another'],
                buttons: {
                    ok: null
                }
            });
            $('#rad-secondary').attr("checked", true);
            $('#rad-primary').attr("checked", false);
        }

    }
    else if (selected == 'Secondary') {
        if ($('#drop-language').val() != $('#txt-menu-prilangid').val()) {
            if ($('#txt-menu-selangid').val() == '') {
                $('#txt-menu-selangid').val($('#drop-language').val());
                $('#label-se').empty();
                $('#label-se').append($('#drop-language option:selected').text());
            }
            else {
                //Confirm
                MessageBox.show({
                    message: ['Do you want to change Secondary Language?'],
                    buttons: {
                        yes: function () {
                            $('#txt-menu-selangid').val($('#drop-language').val());
                            $('#label-se').empty();
                            $('#label-se').append($('#drop-language option:selected').text());
                        },
                        no: function () {
                            $("input:radio[name='radLang']").attr("checked", false);
                        }
                    }
                });
            }
        }
        else {
            MessageBox.show({
                message: ['Please change primary language to another'],
                buttons: {
                    ok: null
                }
            });
            $('#rad-secondary').attr("checked", false);
            $('#rad-primary').attr("checked", true);
        }

    }
}
function languageHandle() {

    //nameDescMenu.push
    var LangID = previousLang.LangID;
    var Name = $('#txt-menu-name').val();
    var Desc = $('textarea#txt-menu-desc').val();
    nameDescMenu.push({ LangID: LangID, ShortName: previousLang.ShortName, Name: Name, Desc: Desc });
    if ($('#txt-sec-name').val().length > 0) {
        var SecName = $('#txt-sec-name').val();
        var SecDesc = $('textarea#txt-sec-desc').val();
        nameDescSection.push({ LangID: LangID, ShortName: previousLang.ShortName, Name: SecName, Desc: SecDesc });
    }
    $("input:radio[name='radLang']").attr("checked", false);
    $('#txt-menu-name').val('');
    $('textarea#txt-menu-desc').val('');
    if ($('#drop-language').val() == $('#txt-menu-prilangid').val()) {
        $('#rad-primary').attr("checked", true);
    }
    if ($('#drop-language').val() == $('#txt-menu-selangid').val()) {
        $('#rad-secondary').attr("checked", true);
    }
}
function displayPreview(event) {
    var reader = new FileReader();
    reader.onload = onFileLoad;
    reader.readAsDataURL(this.files[0]);
    reader.previewid = $(this).attr("for");
    if (reader.previewid == 'menu-preview-icon') {
        $("#menu-preview-icon").show();
        $("#menu-preview-image").hide();
        $("input[name='imagegroup'][value='icon']").attr("checked", true);
        $("input[name='imagegroup'][value='image']").attr("checked", false);
    }
    else if (reader.previewid == 'menu-preview-image') {
        $("#menu-preview-image").show();
        $("#menu-preview-icon").hide();
        $("input[name='imagegroup'][value='image']").attr("checked", true);
        $("input[name='imagegroup'][value='icon']").attr("checked", false);
    }
}

function onFileLoad(e) {
    var image = new Image();
    image.onload = resize;
    image.src = e.target.result;


    $('#' + this.previewid).empty();
    $('#' + this.previewid).append(image);
}

function resize() {
    var limit = 100;
    var imgW = $(this).width();
    var imgH = $(this).height();
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
    $(this).width(imgW);
    $(this).height(imgH);
    //var marginT = (element.height() - imgH) / 2;
    //img.parent().css("padding-top", marginT);	
}

var MenuCtrl = {
    addMenu: function () {
        // change flag to add action
        var nameDescMenu = new Array();
        $('#menu-flag').val('add');
        $("#drop-menu").find('.selected').removeClass('selected');
        clearMenu();
        clearSection();
        clearSubSection();
        clearItem();
        clearGroup();
        clearOption();

    },
    updateMenu: function () {
        //validate
        if ($.trim($("#txt-menu-name").val()).length == 0 || $.trim($("#txt-menu-desc").val()).length == 0) {
            MessageBox.show({
                message: ['Menu name or description name is empty!'],
                buttons: {
                    ok: null
                }
            });
        }
        else {
            if ($('#menu-flag').val() == 'add') {
                $('#menu-form').attr('action', '/Menu/AddMenu');
                var LangID = $('#drop-language').val();
                var Name = $('#txt-menu-name').val();
                var Desc = $('textarea#txt-menu-desc').val();
                var ShortName = $('#drop-language').find('option:selected').attr('shortname')
                nameDescMenu.push({ LangID: LangID, ShortName: ShortName, Name: Name, Desc: Desc });
                var jsonString = JSON.stringify(nameDescMenu);
                $('#txt-menu-xml').val(jsonString);
                showProgressDialog('Submiting new menu');
            }
            else if ($('#menu-flag').val() == 'update') {
                $('#menu-form').attr('action', '/Menu/UpdateMenu');
                showProgressDialog('Updating menu');
            }
            $('#txt-menu-cssid').val($('#drop-cssid').val());
            $('#txt-menu-currencyid').val($('#drop-currencyid').val());
            $("#menu-form").submit();
            //clear nameDescMenu
            nameDescMenu = new Array();
        }
    },
    deleteMenu: function () {
        //validate
        var MenuID = $("#drop-menu").find('.selected').attr("value");
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
                $("#drop-menu").find('.selected').parent().remove();
            }
        });
    },
    addSec: function () {
        // change flag to add action
        $('#sec-flag').val('add');
        $("#drop-sec").find('.selected').removeClass('selected');
        clearSection();
        clearSubSection();
        clearItem();
        clearGroup();
        clearOption();
    },
    updateSection: function () {
        //validate
        if ($.trim($("#txt-sec-name").val()).length == 0 || $.trim($("#txt-sec-desc").val()).length == 0) {
            MessageBox.show({
                message: ['Section name or description name is empty!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($("#drop-menu").find('.selected').length == 0) {
            MessageBox.show({
                message: ['Please choose a Menu!'],
                buttons: {
                    ok: null
                }
            });
        }
        else {
            if ($('#sec-flag').val() == 'add') {
                $('#section-form').attr('action', '/Menu/AddSection');
                var LangID = $('#drop-language').val();
                var Name = $('#txt-sec-name').val();
                var Desc = $('textarea#txt-sec-desc').val();
                var ShortName = $('#drop-language').find('option:selected').attr('shortname');
                nameDescSection.push({ LangID: LangID, ShortName: ShortName, Name: Name, Desc: Desc });
                var jsonString = JSON.stringify(nameDescSection);
                $('#txt-sec-xml').val(jsonString);
                showProgressDialog('Submiting new section');
            }
            else if ($('#sec-flag').val() == 'update') {
                //validate
                $('#section-form').attr('action', '/Menu/UpdateSection');
                showProgressDialog('Updating section');
            }
            $('#txt-sec-langid').val($('#drop-language').val());
            $("#section-form").submit();
            //clear nameDescMenu
            nameDescSection = new Array();
        }
    },
    deleteSection: function () {
        //validate
        var SectionID = $("#drop-sec").find('.selected').attr("value");
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
                var index = findIndexByKeyValue(menuGlobal.Sections, 'SectionID', SectionID);
                menuGlobal.Sections.splice(index, 1);
                $("#drop-sec").find('.selected').parent().remove();

                preview.generate();
            }
        });
    },
    deleteImgSection: function () {
        $('[for="section-preview-icon"]').val('');
        $('#section-preview-icon').empty();
    },
    addSubSec: function () {
        // change flag to add action
        $('#subsec-flag').val('add');
        $("#drop-subsec").find('.selected').removeClass('selected');
        clearSubSection();
        clearItem();
        clearGroup();
        clearOption();
    },
    updateSubSec: function () {
        //validate
        if ($.trim($("#txt-subsec-name").val()).length == 0 || $.trim($("#txt-subsec-desc").val()).length == 0) {
            MessageBox.show({
                message: ['Sub Section name or description name is empty!'],
                buttons: {
                    ok: null
                }
            });
        } else if ($("#drop-sec").find('.selected').length == 0) {
            MessageBox.show({
                message: ['Please choose a Section!'],
                buttons: {
                    ok: null
                }
            });
        }
        else {
            if ($('#subsec-flag').val() == 'add') {
                $('#subsection-form').attr('action', '/Menu/AddSection');
                showProgressDialog('Submiting new sub section');
            }
            else if ($('#subsec-flag').val() == 'update') {
                //validate
                $('#subsection-form').attr('action', '/Menu/UpdateSection');
                showProgressDialog('Updating sub section');
            }
            $('#txt-subsec-langid').val($('#drop-language').val());
            $("#subsection-form").submit();
        }
    },
    deleteSubSec: function () {
        //validate
        var SectionID = $("#drop-subsec").find('.selected').attr("value");
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
                var index = findIndexByKeyValue(sectionGlobal.SubSections, 'SectionID', SectionID);
                sectionGlobal.SubSections.splice(index, 1);
                $("#drop-subsec").find('.selected').parent().remove();
                preview.generate();
            }
        });
    },
    addItem: function () {
        // change flag to add action
        $('#item-flag').val('add');
        $("#drop-item").find('.selected').removeClass('selected');
        clearItem();
        clearGroup();
        clearOption();
    },
    updateItem: function () {
        if ($("#drop-subsec").find('.selected').length == 0) {
            MessageBox.show({
                message: ['Please choose a Sub Section!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($.trim($("#txt-item-name").val()).length == 0 || $.trim($("#txt-item-desc").val()).length == 0) {
            MessageBox.show({
                message: ['Menu Item name or description name is empty!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($.trim($("#txt-item-price").val()).length == 0 || isNaN($.trim($("#txt-item-price").val()))) {
            MessageBox.show({
                message: ['Item Price is not a number!'],
                buttons: {
                    ok: null
                }
            });
        }

        else {
            if ($('#item-flag').val() == 'add') {
                $('#item-form').attr('action', '/Menu/AddItem');
                showProgressDialog('Submiting new item');
            }
            else if ($('#item-flag').val() == 'update') {
                $('#item-form').attr('action', '/Menu/UpdateItem');
                showProgressDialog('Updating item');
            }
            $('#txt-item-langid').val($('#drop-language').val());
            $("#item-form").submit();
        }
    },
    deleteItem: function () {
        //validate
        var ItemID = $("#drop-item").find('.selected').attr("value");
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
                var index = findIndexByKeyValue(subSectionGlobal.Items, 'ItemID', ItemID);
                subSectionGlobal.Items.splice(index, 1);
                $("#drop-item").find('.selected').parent().remove();
                preview.generate();
            }
        });
    },
    addGroup: function () {
        // change flag to add action
        $('#group-flag').val('add');
        $("#drop-group").find('.selected').removeClass('selected');
        clearGroup();
        clearOption();

    },
    updateGroup: function () {
        if ($("#drop-item").find('.selected').length == 0) {
            MessageBox.show({
                message: ['Please choose a Item!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($.trim($("#txt-group-name").val()).length == 0 || $.trim($("#txt-group-desc").val()).length == 0) {
            MessageBox.show({
                message: ['Group name or description name is empty!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($.trim($("#txt-group-price").val()).length == 0 || isNaN($.trim($("#txt-group-price").val()))) {
            MessageBox.show({
                message: ['Group Price is not a number!'],
                buttons: {
                    ok: null
                }
            });
        }
        else {
            if ($('#group-flag').val() == 'add') {
                $('#group-form').attr('action', '/Menu/AddGroup');
                showProgressDialog('Submiting new group');
            }
            else if ($('#group-flag').val() == 'update') {
                $('#group-form').attr('action', '/Menu/UpdateGroup');
                showProgressDialog('Updating group');
            }
            $('#txt-group-langid').val($('#drop-language').val());
            $("#group-form").submit();
        }
    },
    deleteGroup: function () {
        //validate
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
                var index = findIndexByKeyValue(itemGlobal.Groups, 'GroupID', GroupID);
                itemGlobal.Groups.splice(index, 1);
                $("#drop-group").find('.selected').parent().remove();
            }
        });
    },
    addOption: function () {
        // change flag to add action
        $('#option-flag').val('add');
        $("#drop-option").find('.selected').removeClass('selected');
        clearOption();

    },
    updateOption: function () {
        if ($("#drop-group").find('.selected').length == 0) {
            MessageBox.show({
                message: ['Please choose a Item!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($.trim($("#txt-option-name").val()).length == 0 || $.trim($("#txt-option-desc").val()).length == 0) {
            MessageBox.show({
                message: ['Option name or description name is empty!'],
                buttons: {
                    ok: null
                }
            });
        }
        else if ($.trim($("#txt-option-price").val()).length == 0 || isNaN($.trim($("#txt-option-price").val()))) {
            MessageBox.show({
                message: ['Option Price is not a number!'],
                buttons: {
                    ok: null
                }
            });
        }
        else {
            if ($('#option-flag').val() == 'add') {
                showProgressDialog('Submiting new option');
            }
            else if ($('#option-flag').val() == 'update') {
                $('#option-form').attr('action', '/Menu/UpdateOption');
                showProgressDialog('Updating option');
            }
            $('#txt-option-langid').val($('#drop-language').val());
            $("#option-form").submit();

        }
    },
    deleteOption: function () {
        //validate
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
                var index = findIndexByKeyValue(groupGlobal.Options, 'OptionID', OptionID);
                groupGlobal.Options.splice(index, 1);
                $("#drop-option").find('.selected').parent().remove();
            }
        });
    }
};
