(function ($) {
    $('a[data-validate="true"]').click(function () {
        validateFields(this);
    });

    $(window).keydown(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        var sub = $('a[data-validate="true"]');

        if (code == 13 && sub.is(":visible")) {
            validateFields(sub[0]);
        }
    })

    function validateFields(el) {
        var form = $(el).closest("[data-validate-form='true']");
        var inputs = form.find("input[data-validate-field='true']");
        var success = [];

        var usernames = ["admin", "user"];
        var passwords = ["admin", "user"]
        var emails = ["admin@admin.com", "user@user.com"];

        inputs.each(function (i, f) {
            var f = $(f);
            var message = "";
            if (f.attr("data-validate-newpass") == "true") {
                if (f.val() == "") {
                    message = "Please enter your new password";
                }
            } else if (f.attr("data-validate-confirmnewpass") == "true") {
                if (f.val() != form.find("[data-validate-newpass='true']").val()) {
                    message = "Passwords don't match.";
                }
            } else if (f.attr("data-validate-username") == "true") {
                if (f.val() == "") {
                    message = "Please enter your username";
                } else if ($.inArray(f.val(), usernames) == -1) {
                    message = "Username already taken.";
                }
            } else if (f.attr("data-validate-email") == "true") {
                if (f.val() == "") {
                    message = "Please enter your email";
                } else if (!validateEmail(f.val())) {
                    message = "Please enter valid email";
                } else if ($.inArray(f.val(), emails) == -1) {
                    message = "Email already in use.";
                }
            } else if (f.attr("data-validate-loginusername") == "true") {
                if (f.val() == "") {
                    message = "Please enter your username";
                } else if ($.inArray(f.val(), usernames) == -1) {
                    message = "Username is incorrect.";
                }
            } else if (f.attr("data-validate-loginpass") == "true") {
                if (f.val() == "") {
                    message = "Please enter your password";
                } else if ($.inArray(f.val(), passwords) == -1 ||
                    $.inArray(f.val(), passwords) != $.inArray(form.find("[data-validate-loginusername='true']").val(), usernames)) {
                    message = "Incorrect password.";
                }
            }

            f.parent().addClass("has-danger")
            f.next('label.small').text(message).show();

            if (message == "") {
                f.parent().removeClass("has-danger")
                f.next("label.small").hide();
                success.push(true);
            }
        });

        if (success.length == inputs.length) {
            if(window.location.href.split('/').pop() == "login.html") window.location.href= 'series.html';
            else form.find("[data-form-success='true']").show();
        }  
        else form.find("[data-form-success='true']").hide();
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

})(jQuery)