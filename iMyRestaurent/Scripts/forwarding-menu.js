var SummaryMenu = {
    show: function () {
        // make sure the menu is not displaying
        this.hide();

        var html = '';
        html += '<div id="float-menu" class="popup-dialog lv-max">';
        html += '   <ul>';
        // inject iMyMenu v2 - begin - uncomment to inject
        html += '       <li>';
        html += '           <a href="/Menu/OldEditor1" class="image-button i-my-menu-2-button"></a>';
        html += '       </li>';
        // inject iMyMenu v2 - end
        html += '       <li>';
        html += '           <button type="button" class="image-button button-edit-profile"></button>';
        html += '       </li>';
        html += '       <li>'
        html += '           <button type="button" class="image-button button-create-location"></button>';
        html += '       </li>';
        html += '       <li>';
        html += '           <button type="button" class="image-button button-edit-location"></button>';
        html += '       </li>';
        html += '       <li>';
        html += '           <button type="button" class="image-button button-edit-floor-layout"></button>';
        html += '       </li>';
        html += '       <li>';
        html += '           <button type="button" class="image-button button-edit-business-hour"></button>';
        html += '       </li>';
        html += '       <li>';
        html += '           <button type="button" class="image-button button-edit-availability"></button>';
        html += '       </li>';
        html += '       <li>';
        html += '           <button type="button" class="button-change-password-summary image-button"></button>';
        html += '       </li>';
        html += '       <li>';
        html += '           <a href="/TermsAndConditions" class="button-terms image-button"></a>';
        html += '       </li>';
        html += '       <li>';
        html += '           <a href="/About" class="button-about image-button"></a>';
        html += '       </li>';
        html += '   </ul>';
        html += '</div>';

        $('body').append(html);
        $('body').append($('<div class="overlay lv-max black" for="float-menu" onclick="SummaryMenu.hide();" />'));

        summary.refresher.stop();
        this.dock();
        $('.button-options').addClass('button-options-active');
    },
    hide: function () {
        summary.refresher.start();
        $('#float-menu').remove();
        $('.overlay[for="float-menu"]').remove();
        $('.button-options').removeClass('button-options-active');
    },
    dock: function () {
        var menu = $('#float-menu');

        // reset position
        menu.css({ top: 0, left: 0 });

        // force layout adapt with new viewport size
        FlexibleLayout.adapt();

        var dockPos = $('.button-options').position();

        // set new position & size
        menu.css({
            left: dockPos.left - menu.width() + ($('.button-options').width() / 2),
            top: dockPos.top - menu.height() - 15
        });
    }
};

$(function () {
    $(".button-edit-profile").live('click', function () {
        $("input#flow-mode").attr("value", 5);
        $("#forwarding-form").attr("action", "/Profile/Edit");
        $("#forwarding-form").submit();
    });

    $(".button-create-reservation").live('click', function () {
        /*$('input[name="SummaryDate"]').val(summary.inputs.date.val());*/
        $("input#flow-mode").attr("value", "0");
        $("#forwarding-form").attr("action", "/Location/CreateReservation");
        $("#forwarding-form").submit();
    });

    $(".button-edit-location").live('click', function () {
        $("input#flow-mode").attr("value", "3");
        $("#forwarding-form").attr("action", "/Location/EditLocation");
        $("#forwarding-form").submit();
    });

    $(".button-edit-floor-layout").live('click', function () {
        $("input#flow-mode").attr("value", "4");
        $("#forwarding-form").attr("action", "/Location/EditLayout");
        $("#forwarding-form").submit();
    });

    $(".button-edit-availability").live('click', function () {
        $("input#flow-mode").attr("value", "2");
        $("#forwarding-form").attr("action", "/Location/EditAvailability");
        $("#forwarding-form").submit();
    });

    $(".button-create-location").live('click', function () {
        $("input#flow-mode").attr("value", "0");
        $("#forwarding-form").attr("action", "/Location/Create");
        $("#forwarding-form").submit();
    });

    $(".button-edit-business-hour").live('click', function () {
        $("input#flow-mode").attr("value", "7");
        $("#forwarding-form").attr("action", "/Location/EditBusinessHours");
        $("#forwarding-form").submit();
    });

    $(".button-change-password-summary").live('click', function () {
        $("input#flow-mode").attr("value", "5");
        $("#forwarding-form").attr("action", "/Account/ChangePassword");
        $("#forwarding-form").submit();
    });
});