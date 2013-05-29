$(document).ready(function () {
    tab.show(0);
    $('.accordion-name').click(function () {
        //validate current tab if true then save
        if ($(this).attr('tabindex') != tab.currentTabIndex) {
            
            if ($('.acc-body[tab="' + tab.currentTabIndex + '"] form').data("changed")) {
                if (tab.validate(tab.currentTabIndex)) {
                    tab.show($(this).attr('tabindex'));
                    tab.currentTabIndex = $(this).attr('tabindex');
                }
            }
            else {
                tab.show($(this).attr('tabindex'));
                tab.currentTabIndex = $(this).attr('tabindex');
            }
        }
    });
    $('button:contains("Next")').click(tab.next);

});
var tab = {
    isFormChanged: function (tabIndex) {
        return $('.acc-body[tab="' + tab.currentTabIndex + '"] form').data("changed");
    },
    currentTabIndex: 0,
    show: function (tabIndex) {
        $('.accordion-name').removeClass('selected');
        $('.accordion-name[tabindex="' + tabIndex + '"]').addClass('selected');
        $('.acc-body').hide();
        $('.acc-body[tab="' + tabIndex + '"]').show();
        //track changes
        $('.acc-body[tab="' + tabIndex + '"] form').data("changed", false);
        $('.acc-body[tab="' + tabIndex + '"] form').find('input[type!="hidden"],textarea,select').change(function () {
            $('.acc-body[tab="' + tabIndex + '"] form').data("changed", true);
        })
    },
    next: function () {
        var toTabIndex = parseInt($(this).parents('.acc-body').attr('tab')) + 1;
        if (toTabIndex < 6) {
            if ($('.acc-body[tab="' + tab.currentTabIndex + '"] form').data("changed")) {
                if (tab.validate(tab.currentTabIndex)) {
                    tab.show(toTabIndex);
                    tab.currentTabIndex = toTabIndex;
                }
            }
            else {
                tab.show(toTabIndex);
                tab.currentTabIndex = toTabIndex;
            }
        }
    },
    validate: function (tabIndex) {
        switch (tabIndex) {
            case 0:
                //validate & save
                if (editor.controller.menu.validate()) {
                    //do save
                    editor.controller.menu.save();
                    return true;
                }
                else
                    return false;
                break;
            case 1:
                //validate & save in case UPDATE                
                if (editor.controller.section.validate()) {
                    //do save
                    editor.controller.section.save();
                    return true;
                }
                else
                    return false;

                break;
            case 2:
                //validate & save in case UPDATE
                if (editor.controller.subsection.validate()) {
                    //do save
                    editor.controller.subsection.save();
                    return true;
                }
                else
                    return false;
                break;
            case 3:
                //validate & save in case UPDATE
                if (editor.controller.item.validate()) {
                    //do save
                    editor.controller.item.save();
                    return true;
                }
                else
                    return false;

                break;
            case 4:
                //validate & save in case UPDATE
                if (editor.controller.group.validate()) {
                    //do save
                    editor.controller.group.save();
                    return true;
                }
                else
                    return false;
                break;
            case 5:
                //validate & save in case UPDATE
                if (editor.controller.option.validate()) {
                    //do save
                    editor.controller.option.save();
                    return true;
                }
                else
                    return false;
                break;
        }
    }
}
