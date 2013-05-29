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

$(document).ready(function () {
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

    //$("#btn-sec-add").click(MenuCtrl.addSec);
    //$("#btn-sec-update").click(MenuCtrl.updateSection);
    $("#btn-sec-delimg").click(MenuCtrl.deleteImgSection);
    
    
    $("#btn-item-add").click(MenuCtrl.addItem);
    $("#btn-item-update").click(MenuCtrl.updateItem);
    $("#btn-group-add").click(MenuCtrl.addGroup);
    $("#btn-group-update").click(MenuCtrl.updateGroup);
    $("#btn-option-add").click(MenuCtrl.addOption);
    $("#btn-option-update").click(MenuCtrl.updateOption);
    $("#btn-option-del").click(MenuCtrl.deleteOption);

    //for auto translation
    $("#auto-trans").change(autoTransHandle);
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
    var image = new editor.image.create(e.target.result);

    $('#' + this.previewid).empty();
    $('#' + this.previewid).append(image);
}

var MenuCtrl = {
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
    }
};
