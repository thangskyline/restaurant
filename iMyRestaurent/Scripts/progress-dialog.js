function prepareDialog(text) {
    $("#progress-dialog-text").text(text);

    //$("#dialog-mask").height(Utils.pageH());
    //$("#dialog-mask").width(Utils.pageW());

    // centering dialog
    //$("#progress-dialog").css("margin-top", (Utils.pageH() - $("#progress-dialog").height()) / 2);
    $("#progress-dialog").css("margin-top", ($(window).height() - $("#progress-dialog").height()) / 2 + $(window).scrollTop());
}

function showProgressDialog(text) {
    prepareDialog(text);
    $("#dialog-mask").show();
}

function hideProgressDialog() {
    $("#dialog-mask").hide();
}

function showAndHideProgressDialog(text) {
    prepareDialog(text);
    $("#dialog-mask").show();

    setTimeout(function () {
        $("#dialog-mask").hide();
    }, 1000);
}