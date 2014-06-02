$(function() {
    $(".contact-icon").hover(function(event) {
        var atual = $(this).attr("data-status");
        if (atual == 1) {
            $("#label-contact").html("Follow me on Twitter!");
        } else if (atual == 2) {
            $("#label-contact").html("Add me on Linkedin!");
        } else if (atual == 3) {
            $("#label-contact").html("Follow me on Instagram!");
        } else if (atual == 4) {
            $("#label-contact").html("Follow me on GitHub!");
        } else {
            $("#label-contact").html("Follow me on Google+!");
        }
    }, function() {
        $("#label-contact").html("")
    })
})
