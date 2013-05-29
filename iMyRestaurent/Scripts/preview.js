$(document).ready(function () {

});

// preview
var preview = {
    displayBlockDescription: '',
    displayBlockSeLang: '',
    //preview.genSpiceGFVeg
    genSpiceGFVeg: function (name, spice, gf, veg) {
        var spiceLevel;
        switch (spice) {
            case 1:
                spiceLevel = 'Low Hot';
                break;
            case 2:
                spiceLevel = 'Medium Hot';
                break;
            case 3:
                spiceLevel = 'Hot';
                break;
            default:
                spiceLevel = '';
        }
        //var spiceLevel = spice > 0 ? 'Spice Level ' + spice : '';
        var GF = gf == 1 ? 'GF' : '';
        var Veg = veg == 1 ? 'Veg' : '';
        var myGroup = new Array();
        if (spiceLevel != '')
            myGroup.push(spiceLevel);
        if (GF != '')
            myGroup.push(GF);
        if (Veg != '') {
            myGroup.push(Veg)
        }
        var strGroup = name;
        if (myGroup.length > 0) {
            strGroup += ' - ';
            var i;
            for (i = 0; i < myGroup.length; i++) {
                if (i != myGroup.length - 1)
                    strGroup += myGroup[i] + ', ';
                else
                    strGroup += myGroup[i];
            }
        }
        return strGroup;
    },
    // preview.source
    source: function () {
        return editor.global.menu;
    },
    // preview.containment
    containment: $('xml-containment'),
    // preview.generate
    generate: function () {
        var html = '';
        preview.displayBlockSeLang = $('#showSecondLang').is(':checked') ? 'style="display:block; "' : 'style="display:none; "';
        preview.displayBlockDescription = $('#showDescription').is(':checked') ? 'style="display:block; "' : 'style="display:none; "';
        if (preview.source() != null) {
            var name = preview.content.get(preview.source().Names, true),
                desc = preview.content.get(preview.source().Descs, false);
            html += '<d-menu menu-id="' + preview.source().MenuID + '">';
            html += '   <d-menu-header>';
            html += '       <d-restaurant-name>' + preview.source().RestaurantName + '</d-restaurant-name>';
            html += '       <d-menu-type>' + preview.source().MenuTypeName + '</d-menu-type>';
            html += '   </d-menu-header>';
            html += '   <d-menu-title>';
            html += '       <d-menu-name>';
            html += '           <d-primary-menu-name>';
            html += '               <d-line><span>' + name.primary + '</span></d-line>';
            html += '           </d-primary-menu-name>';
            html += '           <d-secondary-menu-name langtype="secondary" ' + preview.displayBlockSeLang + '>' + name.secondary + '</d-secondary-menu-name>';
            html += '       </d-menu-name>';
            html += '       <d-menu-description for="description" ' + preview.displayBlockDescription + '>';
            html += '           <d-primary-menu-description  >' + desc.primary + '</d-primary-menu-description>';
            html += '           <d-secondary-menu-description langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-menu-description>';
            html += '       </d-menu-description>';
            html += '   </d-menu-title>';
            // generate sections
            html += preview.section.list(preview.source().Sections);
            html += '   <d-restaurant-address>' + preview.source().RestaurantAddress + '</d-restaurant-address>';
            html += '</d-menu>';
        }

        preview.containment.html(html);
        $('xml-containment').html(html);

        preview.behavior.refinePrices();
    },
    behavior: {
        refinePrices: function () {
            $.each($('d-item-price, d-group-price, d-option-price, d-ddl-option-price'), function (key, value) {
                var price = parseFloat($(value).text());
                if (isNaN(price) || price <= 0) {
                    $(value).css('display', 'none');
                } else {
                    $(value).text(price.toFixed(2));
                }
            });
        }
    },
    // preview.food
    food: {
        // preview.food.get
        get: function () {
            return $('#TypeID option[value="' + preview.source().TypeID + '"]').text();
        }
    },
    // preview.content
    content: {
        // preview.content.get
        get: function (contents, isName) {
            var selected = null, secondary = null;
            //Name or Desc selected language
            selected = jLinq.from(contents).ignoreCase().startsWith('LangID', editor.lang.current().id).first();
            //Name or Desc primary language
            primary = jLinq.from(contents).ignoreCase().startsWith('IsPrimary', 1).first();
            if (preview.source().SecondLang != null) {
                secondary = jLinq.from(contents).ignoreCase().startsWith('LangID', preview.source().SecondLang.LangID).first();
            }

            var returnPrimary = selected == null ? (isName ? '[Unnamed]' : '') : selected.Content.length == 0 ? (primary.Content.length == 0 ? (isName ? '[Unnamed]' : '') : primary.Content) : selected.Content;
            var returnSecondary = secondary == null ? '' : secondary.Content;
            if (selected == primary) {
                if (selected != null) {
                    if (selected.Content.length == 0) {
                        returnPrimary = isName ? '[Unnamed]' : '';
                    }
                }
            }
            return {
                primary: returnPrimary,
                secondary: returnSecondary
            };
            //            var secondary = jLinq.from(contents).ignoreCase().startsWith('IsSecondary', 1).first();

            //            return {
            //                primary: primary == null ? (isName ? '[Unnamed]' : '[Unnamed]') : primary.Content.length == 0 ? primaryNameDesc.Content : primary.Content,
            //                secondary: secondary == null ? '' : secondary.Content
            //            };
        }
    },
    // preview.section
    section: {
        // preview.section.list
        list: function (list) {
            var html = '';
            if (list != null && list.length > 0) {
                list = jLinq.from(list).orderBy('DisplayOrder').select();
                html += '<d-section-list>';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].IsActive == 1) {
                        html += preview.section.create(list[i]);
                    }
                }

                html += '</d-section-list>';
            }

            return html;
        },
        // preview.section.create
        create: function (section) {
            var html = '';

            // get name
            var name = preview.content.get(section.Names, true);
            var desc = preview.content.get(section.Descs, false);

            html += '<d-section section-id="' + section.SectionID + '">';
            html += '   <d-primary-section-name>';
            html += '       <d-line>';
            html += '           <span>' + name.primary + '</span>';
            if (section.Icon != null) {
                html += '       <d-icon>';
                html += '           <img src="' + section.Icon.ImagePath + '" />';
                html += '       </d-icon>';
            }
            html += '       </d-line>';
            html += '   </d-primary-section-name>';
            html += '   <d-secondary-section-name langtype="secondary" ' + preview.displayBlockSeLang + ' >' + name.secondary + '</d-secondary-section-name>';
            html += '   <d-section-description ' + preview.displayBlockDescription + ' for="description" >';
            html += '       <d-primary-section-description  >' + desc.primary + '</d-primary-section-description>';
            html += '       <d-secondary-section-description langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-section-description>';
            html += '   </d-section-description>';
            // generate items
            html += preview.item.list(section.Items);
            // generate sub-sections
            html += preview.subsection.list(section.SubSections);
            html += '</d-section>';

            return html;
        }
    },
    // preview.subsection
    subsection: {
        // preview.subsection.list
        list: function (list) {
            var html = '';

            if (list != null && list.length > 0) {
                list = jLinq.from(list).orderBy('DisplayOrder').select();
                html += '<d-subsection-list>';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].IsActive == 1) {
                        html += preview.subsection.create(list[i]);
                    }
                }
                html += '</d-subsection-list>';
            }

            return html;
        },
        // preview.subsection.create
        create: function (subsection) {
            var html = '';

            var name = preview.content.get(subsection.Names, true);
            var desc = preview.content.get(subsection.Descs, false);
            html += '<d-subsection section-id="' + subsection.SectionID + '">';
            html += '   <d-primary-subsection-name>';
            html += '       <d-line>';
            html += '           <span>' + name.primary + '</span>';
            if (subsection.Icon != null) {
                html += '       <d-icon>';
                html += '           <img src="' + subsection.Icon.ImagePath + '" />';
                html += '       </d-icon>';
            }
            html += '       </d-line>';
            html += '   </d-primary-subsection-name>';
            html += '   <d-secondary-subsection-name langtype="secondary" ' + preview.displayBlockSeLang + ' ><text>' + name.secondary + '</text></d-secondary-subsection-name>';
            html += '   <d-subsection-description for="description"  ' + preview.displayBlockDescription + ' >';
            html += '       <d-primary-subsection-description>' + desc.primary + '</d-primary-subsection-description>';
            html += '       <d-secondary-subsection-description langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-subsection-description>';
            html += '   </d-subsection-description>';
            // generate items
            html += preview.item.list(subsection.Items);
            html += '</d-subsection>';

            return html;
        }
    },
    // preview.item
    item: {
        // preview.item.list
        list: function (list) {
            var html = '';

            if (list != null && list.length > 0) {
                list = jLinq.from(list).orderBy('DisplayOrder').select();
                html += '<d-item-list>';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].IsActive == 1) {
                        html += preview.item.create(list[i]);
                    }
                }
                html += '</d-item>';
            }

            return html;
        },
        // preview.item.create
        create: function (item) {
            var html = '';
            var name = preview.content.get(item.Names, true);
            var desc = preview.content.get(item.Descs, false);
            html += '<d-item item-id="' + item.ItemID + '">';
            html += '   <d-item-price>' + item.Price + '</d-item-price>';
            html += '   <d-primary-item-name>';
            html += '       <d-line>';
            html += '           <span>' + preview.genSpiceGFVeg(name.primary, item.SpiceLevel, item.IsGF, item.IsVeg) + '</span>';
            if (item.Icon != null) {
                html += '       <d-icon>';
                html += '           <img src="' + item.Icon.ImagePath + '" />';
                html += '       </d-icon>';
            }
            html += '       </d-line>';
            html += '   </d-primary-item-name>';
            html += '   <d-secondary-item-name langtype="secondary" ' + preview.displayBlockSeLang + ' >' + name.secondary + '</d-secondary-item-name>';
            html += '   <d-item-description for="description" ' + preview.displayBlockDescription + ' >';
            html += '       <d-primary-item-description>' + desc.primary + '</d-primary-item-description>';
            html += '       <d-secondary-item-description  langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-item-description>';
            html += '   </d-item-description>';
            html += preview.group.list(item.Groups);
            html += '</d-item>';

            return html;
        }
    },
    // preview.group
    group: {
        // preview.group.list
        list: function (list) {
            var html = '';

            if (list != null && list.length > 0) {
                list = jLinq.from(list).orderBy('DisplayOrder').select();
                html += '<d-group-list>';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].IsActive == 1) {
                        html += preview.group.create(list[i]);
                    }
                }
                html += '</d-group-list>';
            }

            return html;
        },
        // preview.group.create
        create: function (group) {
            var html = '';
            var name = preview.content.get(group.Names, true);
            var desc = preview.content.get(group.Descs, false);
            html += '<d-group group-item="' + group.GroupID + '">';
            html += '   <d-group-price>' + group.Price + '</d-group-price>';
            html += '   <d-primary-group-name>';
            html += '       <d-line>';
            html += '           <span>' + preview.genSpiceGFVeg(name.primary, group.SpiceLevel, group.IsGF, group.IsVeg) + '</span>';
            if (group.Icon != null) {
                html += '       <d-icon>';
                html += '           <img src="' + group.Icon.ImagePath + '" />';
                html += '       </d-icon>';
            }
            html += '       </d-line>';
            html += '   </d-primary-group-name>';
            html += '   <d-secondary-group-name langtype="secondary" ' + preview.displayBlockSeLang + ' >' + name.secondary + '</d-secondary-group-name>';
            html += '   <d-group-description for="description" ' + preview.displayBlockDescription + ' >';
            html += '       <d-primary-group-description >' + desc.primary + '</d-primary-group-description>';
            html += '       <d-secondary-group-description  langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-group-description>';
            html += '   </d-group-description>';
            html += preview.option.list(group.Options);
            html += '</d-group>';

            return html;
        }
    },
    // preview.option
    option: {
        // preview.option.list
        list: function (list) {
            var html = '';

            if (list != null && list.length > 0) {
                list = jLinq.from(list).orderBy('DisplayOrder').select();
                html += '<d-option-list>';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].IsActive == 1) {
                        html += preview.option.create(list[i]);
                    }
                }
                html += '</d-option-list>';
            }

            return html;
        },
        // preview.option.create
        create: function (option) {
            var html = '';
            var name = preview.content.get(option.Names, true);
            var desc = preview.content.get(option.Descs, false);
            html += '<d-option option-item="' + option.OptionID + '">';
            html += '   <d-primary-option-name>';
            html += '       <d-line>';
            html += '           <span>' + preview.genSpiceGFVeg(name.primary, option.SpiceLevel, option.IsGF, option.IsVeg) + '</span>';
            if (option.Icon != null) {
                html += '       <d-icon>';
                html += '           <img src="' + option.Icon.ImagePath + '" />';
                html += '       </d-icon>';
            }
            html += '               <d-option-price>' + option.Price + '</d-option-price>';
            html += '       </d-line>';
            html += '   </d-primary-option-name>';
            html += '       <d-secondary-option-name langtype="secondary" ' + preview.displayBlockSeLang + ' >' + name.secondary + '</d-secondary-option-name>';
            html += '   <d-option-description for="description" ' + preview.displayBlockDescription + ' >';
            html += '       <d-primary-option-description >' + desc.primary + '</d-primary-option-description>';
            html += '       <d-secondary-option-description  langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-option-description>';
            html += '   </d-option-description>';
            html += '</d-option>';
            return html;
        }
    },
    // preview.stylesheet
    stylesheet: {
        // preview.stylesheet.apply
        apply: function (style) {
            if (style == null) {
                preview.stylesheet.apply(preview.stylesheet.current());
            } else {
                $('#drop-cssid').val(style.id);
                preview.containment.attr('style-id', style.id);
                $('#txt-menu-cssid').val(style.id);
            }
        },
        // preview.stylesheet.current
        current: function () {
            var selectedStyle = $('#drop-cssid option:selected');
            return { id: selectedStyle.attr('value'), value: selectedStyle.text() };
        }
    },
    // preview.currency
    currency: {
        // preview.currency.apply
        apply: function (currency) {
            if (currency == null) {
                preview.currency.apply(preview.currency.current());
            } else {
                $('#drop-currencyid').val(currency.id);
                preview.containment.attr('currency', currency.id);
                $('#txt-menu-currencyid').val(currency.id);
            }
        },
        // preview.currency.current
        current: function () {
            var selectedCurrency = $('#drop-currencyid option:selected');
            return { id: selectedCurrency.attr('value'), value: selectedCurrency.text() };
        }
    }
};
var editor = {
    // editor.lang
    lang: {
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
                    displayname: option.text()
                    //,                    isPrimary: id == $('#txt-menu-prilangid').val(),
                    //                    isSecondary: id == $('#txt-menu-selangid').val()
                };
            } else {
                return { id: -1 };
            }
        },
        // editor.lang.change
        change: function () {
            var selectedLang = editor.lang.current();

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
                        RestaurantID: $('#restaurant-id').val(),
                        MenuID: editor.global.menu.MenuID,
                        LangID: selectedLang.id
                    },
                    success: function (response) {
                        if (response.IsSucceed) {
                            // update menu content
                            editor.global.updateMenu(response.Content, selectedLang.id);

                            // update preview
                            //                            editor.content.update();
                        } else {
                            Utils.showError();
                        }
                    }
                });
            }
            //            else {
            //                editor.content.update();
            //            }
            preview.generate();
        }
    },
    // editor.global
    global: {
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
        option: null,
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
        }
    }
}