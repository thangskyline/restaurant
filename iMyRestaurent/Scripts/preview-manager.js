$(document).ready(function () {
    // handler dropdownlists change
    $('#drop-cssid').change(function () {
        preview.stylesheet.apply(null);
    });
    $('#drop-currencyid').change(function () {
        preview.currency.apply(null);
    });
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

    // preview.clear
    clear: function () {
        preview.containment.empty();
    },
    // preview.source
    source: function () {
        return editor.global.menu;
    },
    // preview.containment
    containment: $('xml-containment'),
    // preview.generate
    generate: function () {
        //reset show hide secondary language , description
        //        $('#showSecondLang,#showDescription').attr('checked', true);
        //        var langtype = $('#showSecondLang').is(':checked') ? 'langtype = "secondary"' : '';
        //        var description = $('#showDescription').is(':checked') ? 'for="description"' : '';
        preview.displayBlockSeLang = $('#showSecondLang').is(':checked') ? 'style="display:block; "' : 'style="display:none; "';
        preview.displayBlockDescription = $('#showDescription').is(':checked') ? 'style="display:block; "' : 'style="display:none; "';

        var html = '';

        if (preview.source() != null) {
            var name = preview.content.get(preview.source().Names, true),
                desc = preview.content.get(preview.source().Descs, false);
            html += '<d-menu menu-id="' + preview.source().MenuID + '">';
            html += '   <d-menu-header>';
            html += '       <d-restaurant-name>' + preview.source().RestaurantName + '</d-restaurant-name>';
            html += '       <d-menu-type>' + preview.food.get() + '</d-menu-type>';
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

        preview.behavior.handleOptionChanges();
        preview.behavior.refinePrices();
    },
    behavior: {
        handleOptionChanges: function () {
            $('d-ddl-select select').change(function () {
                var selectedOption = $('d-ddl-select select option:selected');
                var price = selectedOption.attr('price');
                var icon = selectedOption.attr('icon');
                var secondaryContent = selectedOption.attr('secondary-content');

                var optionList = selectedOption.parents('d-option-list');

                // update preview
                optionList.find('d-ddl-option-price').html(price).css('display', parseFloat(price) > 0 ? 'block' : 'none');
                optionList.find('d-ddl-secondary-option-name span').html(secondaryContent == null ? '' : secondaryContent);

                if ($('#showSecondLang').is(':checked'))
                    $('d-ddl-secondary-option-name').attr('style', 'display:block;');
                else
                    $('d-ddl-secondary-option-name').attr('style', 'display:none;');

                if (icon != null && icon.length > 0) {
                    optionList.find('d-ddl-secondary-option-name d-icon').empty().append('<img src="' + icon + '" />');
                } else {
                    optionList.find('d-ddl-secondary-option-name d-icon').empty();
                }
            });

            $('d-ddl-select select').change();
        },
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
            var text = '';

            if (preview.source().TypeIDList != null) {
                for (var i = 0; i < preview.source().TypeIDList.length; i++) {
                    var input = $('#menu-type-list input[value="' + preview.source().TypeIDList[i] + '"]');

                    var name = input.parents('.line').find('.menu-type-name span').text();

                    text += name;
                    if (i < preview.source().TypeIDList.length - 1) {
                        text += ', ';
                    }
                }
            }

            return text;

            //return $('#TypeID option[value="' + preview.source().TypeID + '"]').text();
        }
    },
    // preview.type
    type: {
        // preview.type.DropDownList
        DropDownList: 100000,
        // preview.type.RadioButton
        RadioButton: 100001,
        // preview.type.CheckBox
        CheckBox: 100002
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
            var displayBlockSeLang = $('#showSecondLang').is(':checked') ? 'style="display:block; "' : 'style="display:none; "';
            var displayBlockDescription = $('#showDescription').is(':checked') ? 'style="display:block; "' : 'style="display:none; "';
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
            html += '   <d-secondary-section-name langtype="secondary" ' + displayBlockSeLang + ' >' + name.secondary + '</d-secondary-section-name>';
            html += '   <d-section-description ' + displayBlockDescription + ' for="description" >';
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
                html += '<d-subsection-list>';
                for (var i = 0; i < list.length; i++) {
                    list = jLinq.from(list).orderBy('DisplayOrder').select();
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
            var name = preview.content.get(item.Names, true)
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
            html += '       <d-secondary-item-description   langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-item-description>';
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
            html += preview.option.list(group.Options, group.TypeID);
            html += '</d-group>';

            return html;
        }
    },
    // preview.option
    option: {
        // preview.option.list
        list: function (list, type) {
            var html = '';

            if (list != null && list.length > 0) {
                list = jLinq.from(list).orderBy('DisplayOrder').select();
                html += '<d-option-list type="' + type + '">';
                if (preview.type.DropDownList == type) {
                    html += '   <d-ddl-option-price></d-ddl-option-price>';
                    html += '   <d-ddl-select>';
                    html += '       <select>';
                }

                for (var i = 0; i < list.length; i++) {
                    if (list[i].IsActive == 1) {
                        html += preview.option.create(list[i], type);
                    }
                }

                if (preview.type.DropDownList == type) {
                    html += '       </select>';
                    html += '   </d-ddl-select>';
                    html += '   <d-ddl-secondary-option-name langtype="secondary"  >';
                    html += '       <d-icon></d-icon><span></span>';
                    html += '   </d-ddl-secondary-option-name>';
                }

                html += '</d-option-list>';
            }

            return html;
        },
        // preview.option.create
        create: function (option, type) {
            var html = '';
            var name = preview.content.get(option.Names, true);
            var desc = preview.content.get(option.Descs, false);

            if (preview.type.DropDownList == type) {
                html += '<option price="' + option.Price + '" icon="' + (option.Icon != null ? option.Icon.ImagePath : '') + '" secondary-content="' + name.secondary + '">';
                html += preview.genSpiceGFVeg(name.primary, option.SpiceLevel, option.IsGF, option.IsVeg);
                html += '</option>';
            } else {

                html += '<d-option option-item="' + option.OptionID + '">';
                //            html += '   <d-option-price>' + option.Price + '</d-option-price>';
                html += '   <d-input>';
                if (preview.type.CheckBox == type) {
                    html += '   <input type="checkbox" disabled="disabled" />';
                } else if (preview.type.RadioButton == type) {
                    html += '   <input type="radio" disabled="disabled" />';
                }
                html += '   </d-input>';
                html += '   <d-input-desc>';
                html += '       <d-primary-option-name>';
                html += '           <d-line>';
                html += '               <span>' + preview.genSpiceGFVeg(name.primary, option.SpiceLevel, option.IsGF, option.IsVeg) + '</span>';
                if (option.Icon != null) {
                    html += '           <d-icon>';
                    html += '               <img src="' + option.Icon.ImagePath + '" />';
                    html += '           </d-icon>';
                }
                html += '               <d-option-price>' + option.Price + '</d-option-price>';
                html += '           </d-line>';
                html += '       </d-primary-option-name>';
                html += '       <d-secondary-option-name langtype="secondary" ' + preview.displayBlockSeLang + ' >' + name.secondary + '</d-secondary-option-name>';
                html += '   <d-option-description for="description" ' + preview.displayBlockDescription + ' >';
                html += '       <d-primary-option-description >' + desc.primary + '</d-primary-option-description>';
                html += '       <d-secondary-option-description  langtype="secondary" ' + preview.displayBlockSeLang + ' >' + desc.secondary + '</d-secondary-option-description>';
                html += '   </d-option-description>';
                html += '   </d-input-desc>';
                html += '</d-option>';
            }
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
                $('.currency-unit').html(currency.value);
            }
        },
        // preview.currency.current
        current: function () {
            var selectedCurrency = $('#drop-currencyid option:selected');
            return { id: selectedCurrency.attr('value'), value: selectedCurrency.text() };
        }
    }
};
