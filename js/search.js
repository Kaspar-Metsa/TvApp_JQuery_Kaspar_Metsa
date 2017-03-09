(function ($) {

    $(".searchOpen").click(function () {
        $(this).parent().parent().hide();
        $("html").addClass("search");
        $("header .collapse").show();
        $("#searchOptions").show(0);
        $("#searchShows").focus();
        showSearchOptions();
        $("main, #backdrop").hide(0);
    })
    $(".searchClose").click(function () {
        $(this).parent().hide();
        $("html").removeClass("search");
        $(".searchOpen").parent().parent().show();
        $("#searchOptions").hide(0);
        $("main, #backdrop").show(0);
    })

    $('form[role="search"]').submit(function (e) {
        e.preventDefault();
        var s = $(this).find("input").val();
        window.localStorage.setItem("searchQuery", s);
        window.location.href = "search.html";
    })

    function showSearchOptions() {
        var searchResults = $.parseJSON(localStorage.getItem("searchResults"));
        searchResults = searchResults === null ? { "results": [] } : searchResults;

        $("#searchOptions > div").empty();
        $.each(searchResults.results, function (i, v) {
            var c = $('<div class="col-xs-12 search-option"></div>').appendTo("#searchOptions > div");
            $('<a href="search.html">' + v.query + '</a>').appendTo(c)
                .click(function () {
                    window.localStorage.setItem("searchQuery", v.query);
                })
        })
    }
})(jQuery)
