var MessageBox = {
    show: function (data) {
        //$(".info-box").hide();
        $(".info-box-mask").hide();

        if (typeof data.title == 'undefined' || data.title == null) {
            $(".info-box .info-title").text("Info Message");
        } else {
            $(".info-box .info-title").text(data.title);
        }

        // display text
        $(".info-box > .info-message").empty();
        var html = '';
        for (var i = 0; i < data.message.length; i++) {
            html += data.message[i] + '<br />';
        }
        $(".info-box > .info-message").append(html);

        // display buttons & assign handler
        $(".info-box > .info-buttons button").hide();

        for (key in data.buttons) {
            var button = $(".info-box > .info-buttons > ." + key);

            button.show();
            button.unbind();

            button.bind("click", function () {
                //$(".info-box").hide();
                $(".info-box-mask").hide();
                $(document).unbind("keydown");
                $("body *").not(".info-box *").removeAttr("onkeydown");
                return false;
            });
            button.bind("click", data.buttons[key]);
        }

        $(".info-box-mask").show();

        $('.info-box').css('margin-top', ($('.info-box-mask').height() - $('.info-box').outerHeight()) / 2);

        $("body *").not(".info-box-mask, .info-box, .info-box *").attr("onkeydown", "return false;");

        $(document).bind("keydown", keydownHandler);
    }
};

function keydownHandler(e) {
    var code = (e.keyCode ? e.keyCode : e.which);

    if (code == 13) {
        //Enter keycode
        //Do something
        if ($(".info-box > .info-buttons > .ok").css("display") != 'none') {
            $(".info-box > .info-buttons > .ok").click();
        }

        if ($(".info-box > .info-buttons > .yes").css("display") != 'none') {
            $(".info-box > .info-buttons > .yes").click();
        }

        if ($(".info-box > .info-buttons > .done").css("display") != 'none') {
            $(".info-box > .info-buttons > .done").click();
        }
    } else if (code == 27) {
        if ($(".info-box > .info-buttons > .no").css("display") != 'none') {
            $(".info-box > .info-buttons > .no").click();
        }

        if ($(".info-box > .info-buttons > .cancel").css("display") != 'none') {
            $(".info-box > .info-buttons > .cancel").click();
        }
    }
}