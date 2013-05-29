$(function () {
    Utils.touchScroll('#layout-containment');

    ZoomControl.setup('#layout', $('input[name="LayoutZoomScale"]').val());

    $(".button-zoom-out").click(function () {
        ZoomControl.zoomout('input[name="LayoutZoomScale"]');
    });

    $(".button-zoom-in").click(function () {
        ZoomControl.zoomin('input[name="LayoutZoomScale"]');
    });

    $(".table").click(function () {
        var statusIcon = $(this).find("#avail-status");
        statusIcon.toggleClass("avail-icon");
        statusIcon.toggleClass("unavail-icon");
    });

    $(".button-cancel").click(function () {
        $.each($(".table"), function (key, value) {
            var icon = $(value).find("#avail-status");

            var originStatus = $(value).find("#origin-status").text();

            if (originStatus == 1) {
                icon.removeClass("unavail-icon");
                icon.addClass("avail-icon");
            } else {
                icon.addClass("unavail-icon");
                icon.removeClass("avail-icon");
            }
        });

    });

    $(".button-save").click(function () {
        showProgressDialog("Saving");

        var tableStr = "";
        var statusStr = "";

        $.each($(".table"), function (key, value) {
            var newStatus = $(value).find("#avail-status").hasClass("avail-icon") ? "1" : "0";

            if (newStatus != $(value).find("#origin-status").text()) {
                tableStr = tableStr + $(value).attr("id") + ",";
                statusStr = statusStr + newStatus + ",";
            }
        });

        $.ajax({
            type: "post",
            data: {
                Tables: tableStr,
                Statuses: statusStr,
                LocationID: $('input[name="LocationID"]').attr("value")
            },
            url: '/Availability/Save',
            success: function (data) {
                if (data.IsSucceed) {
                    $("form#next").submit();
                } else {
                    hideProgressDialog();

                    MessageBox.show({
                        message: ["We have encountered a server connection error. Please try again later!"],
                        buttons: {
                            ok: null
                        }
                    });
                }
            }
        });
    });

    $(".button-back").click(function () {
        $("form#back").submit();
    });
});