(function ($) {
    var api_key = "a46dce6498392d02e44b9bf2f98cdcca";

    loadConfiguration(function (config) {
        if ($("#popularTvShowsList").length) {
            var next_page = 1;
            showPopularShows(next_page++, config);
            $("#loadMoreShows").click(function () {
                $("#loadMoreShows").addClass("disabled");
                showPopularShows(next_page++, config);
            });
        } else if ($("#singleShowContainer").length) {
            showSingleShow(config);
        } else if ($("#searchResults").length) {
            searchShow(config);
        } else if ($("#showWatchList").length) {
            showWatchlist(config);
        } else if ($("#episodesShower").length) {
            showEpisodes(config);
        }
    }, function () {
        if ($("#popularTvShowsList").length) {
            showPopularShows(1, null);
        } else if ($("#singleShowContainer").length) {
            showSingleShow(null);
        } else if ($("#searchResults").length) {
            searchShow(null);
        } else if ($("#showWatchList").length) {
            showWatchlist(null);
        } else if ($("#episodesShower").length) {
            showEpisodes(null);
        }
    })

    /* Loader functions */

    function loadConfiguration(success, failiure) {
        var request_url = "http://api.themoviedb.org/3/configuration" +
            "?api_key=" + api_key;

        $.getJSON(request_url).done(function (data) {
            success(data);
        }).fail(function () {
            failiure();
        })
    }

    function showPopularShows(p_no, config) {
        var request_url = "http://api.themoviedb.org/3/tv/popular" +
            "?api_key=" + api_key +
            "&page=" + p_no;

        if (config !== null) {
            $.getJSON(request_url).done(function (data) {
                $("#loadMoreShows").removeClass("disabled");

                if (p_no == 1) window.localStorage.setItem("popularTvShows", JSON.stringify(data))

                $.each(data.results, function (index, value) {
                    $.getJSON("http://api.themoviedb.org/3/tv/" + value.id + "?api_key=" + api_key).done(function (data) {
                        if (value.backdrop_path === null)
                            var poster = "img/w300-notfound.png";
                        else
                            var poster = config.images.base_url + config.images.backdrop_sizes[1] + value.backdrop_path;
                        var s = $('<div id="show_' + value.id + '" class="container singleShow col-lg-4 col-md-6">' +
                                    '<div class="head" style="background-image: url(' + poster + ')"><p><strong>' + value.original_name + '</strong>&nbsp;<small>' + (new Date(data.first_air_date)).getFullYear() + '</small></p></div>' +
                                    '<div class="foot">' + 
                                        '<span class="text-muted small m-b-0">Rating: ' + Math.round(value.vote_average * 10) / 10 + '/10 (' + value.vote_count + ' votes)</span>' +
                                        '<a class="small pull-xs-right btn btn-sm btn-info-outline addRemoveWatch"></a>' +
                                    '</div>' +
                           '</div>').appendTo("#popularTvShowsList").click(function () {
                               window.location.href = "single-show.html?id=" + value.id;
                           });

                        var singleLocals = $.parseJSON(localStorage.getItem("singleShows"));
                        singleLocals = singleLocals === null ? {} : singleLocals;
                        singleLocals[value.id] = data;
                        window.localStorage.setItem("singleShows", JSON.stringify(singleLocals));

                        addRemoveWatchList(value.id, data, s.find(".addRemoveWatch"));
                    });
                });
                $(".loadingPage").fadeOut(0);
            }).fail(function () {
                showPopularShows(p_no, null);
            });
        } else if (p_no == 1) {
            var localData = $.parseJSON(localStorage.getItem("popularTvShows"));
            var singleLocals = $.parseJSON(localStorage.getItem("singleShows"));
            singleLocals = singleLocals === null ? {} : singleLocals;

            if (localData !== null && localData.results.length) {
                $.each(localData.results, function (index, value) {

                    var data = singleLocals[value.id];

                    var poster = "img/w300-notfound.png";

                    var s = $('<div id="show_' + value.id + '" class="container singleShow col-lg-4 col-md-6">' +
                                    '<div class="head" style="background-image: url(' + poster + ')"><p><strong>' + value.original_name + '</strong>&nbsp;<small>' + (new Date(data.first_air_date)).getFullYear() + '</small></p></div>' +
                                    '<div class="foot">' +
                                        '<span class="text-muted small m-b-0">Rating: ' + Math.round(value.vote_average * 10) / 10 + '/10 (' + value.vote_count + ' votes)</span>' +
                                        '<a class="small pull-xs-right btn btn-sm btn-info-outline addRemoveWatch"></a>' +
                                    '</div>' +
                           '</div>').appendTo("#popularTvShowsList").click(function () {
                               window.location.href = "single-show.html?id=" + value.id;
                           });

                    addRemoveWatchList(value.id, data, s.find(".addRemoveWatch"));
                })
            } else {
                $(".noInternet").show(0);
            }
            $(".loadingPage").hide(0);
        }
    }

    function showSingleShow(config) {
        var id = getUrlVars()["id"];

        if (config !== null) {
            $.getJSON("http://api.themoviedb.org/3/tv/" + id + "?api_key=" + api_key).done(function (data) {

                var singleLocals = $.parseJSON(localStorage.getItem("singleShows"));
                singleLocals = singleLocals === null ? {} : singleLocals;
                singleLocals[id] = data;
                window.localStorage.setItem("singleShows", JSON.stringify(singleLocals));

                addRemoveWatchList(id, data);

                if (data.poster_path === null || data.backdrop_path === null) {
                    var poster = "img/w165-notfound.png";
                    var backd = "img/w300-notfound.png"
                }
                else {
                    var poster = config.images.base_url + config.images.poster_sizes[1] + data.poster_path;
                    var backd = config.images.base_url + config.images.backdrop_sizes[3] + data.backdrop_path;
                }

                $("#backdrop").css({ "background-image": "url(" + backd + ")" });

                $('<img class="p-a-0" src="' + poster + '" />')
                    .appendTo("#showPoster");
                $("#showTitle").html('<strong>' + data.name + '</strong>');
                $("#showRating").text('' + Math.round(data.vote_average * 10) / 10 + '/10 (' + data.vote_count + ' votes)');
                $.each(data.genres, function (index, value) {
                    var genre = (index != 0 ? ", " : "") + value.name;
                    $("#showGenre").append(genre);
                })
                $("#showRelease").text(formatDate(data.first_air_date));
                $("#showOverview").text(data.overview);

                $.each(data.seasons.reverse(), function (index, value) {
                    if (value.poster_path === null || config === null)
                        var poster = "img/w165-notfound.png";
                    else
                        var poster = config.images.base_url + config.images.poster_sizes[2] + value.poster_path;
                    $('<div id="season_' + value.id + '" class="col-lg-2 col-md-3 col-sm-4 col-xs-6 m-b-1">' +
                            '<img class="col-xs-12 p-a-0" src="' + poster + '" />' +
                            '<div class="col-xs-12 text-xs-center m-t-0-7 p-x-0">' +
                                '<p class="h6"><strong>Season ' + value.season_number + '</strong></p>' +
                                '<p class="small">' + value.episode_count + ' episode(s)</p>' +
                            '</div>' +
                       '</div>').appendTo("#season-list").click(function () {
                           window.location.href = "watch-episodes.html?id=" + id + "&season=" + value.season_number;
                       });
                });

                $(".loadingPage").hide(0);
            }).fail(function () {
                showSingleShow(null);
                return false;
            });

            $.getJSON("http://api.themoviedb.org/3/tv/" + id + "/credits?api_key=" + api_key).done(function (c) {

                var singleLocalCast = $.parseJSON(localStorage.getItem("singleShowsCast"));
                singleLocalCast = singleLocalCast === null ? {} : singleLocalCast;
                singleLocalCast[id] = c.cast;
                window.localStorage.setItem("singleShowsCast", JSON.stringify(singleLocalCast));

                if (c.cast.length) $("#cast-list").empty();

                $.each(c.cast, function (index, value) {
                    if (value.profile_path == null)
                        var profile = "img/w185-notfound.png";
                    else
                        var profile = config.images.base_url + config.images.profile_sizes[1] + value.profile_path;
                    $('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 m-b-1">' +
                        '<div>' +
                                '<img class="col-xs-12 p-a-0" src="' + profile + '" />' +
                                '<div class="col-xs-12 text-xs-center m-t-0-7">' +
                                    '<p class="small m-b-0"><strong>' + value.name + '</strong></p>' +
                                    '<p class="small text-muted">' + value.character + '</p>' +
                                '</div>' +
                                '</div>' +
                            '</div>').appendTo("#cast-list");
                })
            });

            $.getJSON("http://api.themoviedb.org/3/tv/" + id + "/videos?api_key=" + api_key).done(function (data) {
                $.each(data.results, function (i, value) {
                    if (value.type == "Trailer" && value.site == "YouTube") {
                        $("#seeTrailer > a").text("Watch " + value.name).removeClass("disabled");
                        $("#seeTrailer").find("iframe").attr("src", "http://www.youtube.com/embed/" + value.key + "?enablejsapi=1");
                        $("#seeTrailer > div").fitVids();
                        return false;
                    }
                });
                $("#seeTrailer > a").click(function () {
                    $("#seeTrailer > div").slideToggle(function () {
                        var el = $(this);
                        var elOffset = el.offset().top;
                        var elHeight = el.height();
                        var windowHeight = $(window).height();
                        var offset;

                        if (elHeight < windowHeight) offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
                        else offset = elOffset;

                        if (el.is(':visible')) $("html, body").animate({ scrollTop: offset }, '400');
                        
                        var func = el.is(':visible') ? 'playVideo' : 'pauseVideo';
                        $("#seeTrailer").find("iframe")[0].contentWindow.postMessage('{"event":"command","func":"' + func + '","args":""}', '*');
                    });
                });
            });

        } else {
            var data = $.parseJSON(localStorage.getItem("singleShows"))
            data = (data === null) ? data : data[id];
            var cast = $.parseJSON(localStorage.getItem("singleShowsCast"));
            cast = (cast === null) ? cast : cast[id];

            if (cast !== null && data != null) {
                $('<img class="p-a-0" src="img/w185-notfound.png" />')
                    .appendTo("#showPoster");
                $("#showTitle").html('<strong>' + data.name + '</strong>');
                $("#showRating").text('Rating: ' + Math.round(data.vote_average * 10) / 10 + '/10 (' + data.vote_count + ' votes)');
                $.each(data.genres, function (index, value) {
                    var genre = (index != 0 ? ", " : "") + value.name;
                    $("#showGenre").append(genre);
                });

                addRemoveWatchList(id, data);

                $("#showRelease").text(formatDate(data.first_air_date));
                $("#showOverview").text(data.overview);

                $.each(cast, function (index, value) {
                    $('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 m-b-1">' +
                        '<div>' +
                                '<img class="col-xs-12 p-a-0" src="img/w185-notfound.png" />' +
                                '<div class="col-xs-12 text-xs-center m-t-0-7">' +
                                    '<p class="small m-b-0"><strong>' + value.name + '</strong></p>' +
                                    '<p class="small text-muted">' + value.character + '</p>' +
                                '</div>' +
                                '</div>' +
                            '</div>').appendTo("#cast-list");
                });

                $.each(data.seasons.reverse(), function (index, value) {
                    if (value.poster_path === null || config === null)
                        var poster = "img/w165-notfound.png";
                    else
                        var poster = config.images.base_url + config.images.poster_sizes[2] + value.poster_path;
                    $('<div id="season_' + value.id + '" class="col-lg-2 col-md-3 col-sm-4 col-xs-6 m-b-1">' +
                            '<img class="col-xs-12 p-a-0" src="' + poster + '" />' +
                            '<div class="col-xs-12 text-xs-center m-t-0-7 p-x-0">' +
                                '<p class="h6"><strong>Season ' + value.season_number + '</strong></p>' +
                                '<p class="small">' + value.episode_count + ' episode(s)</p>' +
                            '</div>' +
                       '</div>').appendTo("#season-list").click(function () {
                           window.location.href = "watch-episodes.html?id=" + id + "&season=" + value.season_number;
                       });
                });
            } else {
                $(".noInternet").show(0);
            }
            $(".loadingPage").hide(0);
        }
    }

    function searchShow(config) {
        var query = localStorage.getItem("searchQuery");
        if (query === null || query == "null") {
            $(".loadingPage").hide(0);
            return;
        }
        window.localStorage.setItem("searchQuery", null);

        $("#searchQuery").text(query);

        $.getJSON("http://api.themoviedb.org/3/search/tv?api_key=" + api_key + "&query=" + query).done(function (data) {

            var searchResults = $.parseJSON(localStorage.getItem("searchResults"));
            searchResults = searchResults === null ? { "results": [] } : searchResults;
            if (!alreadyExists(searchResults["results"], query)) searchResults["results"].unshift({ query: query, data: data })
            if (searchResults["results"].length > 10) searchResults["results"].pop();
            window.localStorage.setItem("searchResults", JSON.stringify(searchResults));

            if (data.results.length) $("#searchResults").html("");
            $.each(data.results, function (index, value) {
                $.getJSON("http://api.themoviedb.org/3/tv/" + value.id + "?api_key=" + api_key).done(function (data) {
                    if (value.backdrop_path === null)
                        var poster = "img/w300-notfound.png";
                    else
                        var poster = config.images.base_url + config.images.backdrop_sizes[1] + value.backdrop_path;

                    var s = $('<div id="show_' + value.id + '" class="container singleShow col-lg-4 col-md-6">' +
                                    '<div class="head" style="background-image: url(' + poster + ')"><p><strong>' + value.original_name + '</strong>&nbsp;<small>' + (new Date(data.first_air_date)).getFullYear() + '</small></p></div>' +
                                    '<div class="foot">' +
                                        '<span class="text-muted small m-b-0">Rating: ' + Math.round(value.vote_average * 10) / 10 + '/10 (' + value.vote_count + ' votes)</span>' +
                                        '<a class="small pull-xs-right btn btn-sm btn-info-outline addRemoveWatch"></a>' +
                                    '</div>' +
                           '</div>').appendTo("#searchResults").click(function () {
                               window.location.href = "single-show.html?id=" + value.id;
                           });

                    var singleLocals = $.parseJSON(localStorage.getItem("singleShows"));
                    singleLocals = singleLocals === null ? {} : singleLocals;
                    singleLocals[value.id] = data;
                    window.localStorage.setItem("singleShows", JSON.stringify(singleLocals));

                    addRemoveWatchList(value.id, data, s.find(".addRemoveWatch"));
                });
            });
            $(".loadingPage").hide(0);
        }).fail(function () {
            var data = $.parseJSON(localStorage.getItem("searchResults"));
            data = data === null || getSearchdata(data["results"], query) === undefined ? { "results": [] } : getSearchdata(data["results"], query);
            var singleLocals = $.parseJSON(localStorage.getItem("singleShows"));
            singleLocals = singleLocals === null ? {} : singleLocals;


            if (data.results.length) {
                $("#searchResults").html("");

                var searchResults = $.parseJSON(localStorage.getItem("searchResults"));
                if (!alreadyExists(searchResults["results"], query)) searchResults["results"].unshift({ query: query, data: data })
                if (searchResults["results"].length > 10) searchResults["results"].pop();
                window.localStorage.setItem("searchResults", JSON.stringify(searchResults));
            }
            $.each(data.results, function (index, value) {

                var data = singleLocals[value.id];

                var poster = "img/w300-notfound.png";

                var s = $('<div id="show_' + value.id + '" class="container singleShow col-lg-4 col-md-6">' +
                                    '<div class="head" style="background-image: url(' + poster + ')"><p><strong>' + value.original_name + '</strong>&nbsp;<small>' + (new Date(data.first_air_date)).getFullYear() + '</small></p></div>' +
                                    '<div class="foot">' +
                                        '<span class="text-muted small m-b-0">Rating: ' + Math.round(value.vote_average * 10) / 10 + '/10 (' + value.vote_count + ' votes)</span>' +
                                        '<a class="small pull-xs-right btn btn-sm btn-info-outline addRemoveWatch"></a>' +
                                    '</div>' +
                           '</div>').appendTo("#searchResults").click(function () {
                               window.location.href = "single-show.html?id=" + value.id;
                           });

                addRemoveWatchList(value.id, data, s.find(".addRemoveWatch"));
            })
            $(".loadingPage").hide(0);
        });
    }

    function showWatchlist(config) {
        var watchlist = $.parseJSON(localStorage.getItem("watchlist"));
        var seenEpisodes = $.parseJSON(localStorage.getItem("seenEpisodes"));
        seenEpisodes = seenEpisodes === null ? {} : seenEpisodes;

        if (!$.isEmptyObject(watchlist)) {
            $.each(watchlist, function (index, value) {
                $.getJSON("http://api.themoviedb.org/3/tv/" + value.id + "/season/" + findLastSeason(value.seasons) + "?api_key=" + api_key).done(function (e) {
                    if (value.backdrop_path === null)
                        var poster = "img/w300-notfound.png";
                    else
                        var poster = config.images.base_url + config.images.backdrop_sizes[1] + value.backdrop_path;

                    var unairedEpisodes = findUnairedEpisodes(e);
                    var airedEpisodes = episodesCounter(value.id) - unairedEpisodes;
                    var watchedEpisodes = $.isArray(seenEpisodes[value.id]) ? seenEpisodes[value.id].length : 0;
                    var nextEpisodeDate = nextEpisodeAiring(e);

                    var watchText = (watchedEpisodes == airedEpisodes) ? "All episodes watched" : (airedEpisodes - watchedEpisodes) + " episode(s) not watched";
                    var unairedText = (unairedEpisodes > 0) ? ' (+' + unairedEpisodes + ' not aired yet, next episode airs ' + nextEpisodeDate + ')' : "";

                    $('<div id="show_' + value.id + '" class="container singleShow col-lg-4 col-md-6">' +
                                    '<div class="head" style="background-image: url(' + poster + ')"><p><strong>' + value.name + '</strong></p></div>' +
                                    '<div class="foot">' +
                                        '<span class="small m-b-0"><strong>' + watchText + '</strong></span>' +
                                        '<div class="text-muted small m-b-0">' + unairedText + '</div>' +
                                    '</div>' +
                           '</div>').appendTo("#showWatchList").click(function () {
                               window.location.href = "single-show.html?id=" + value.id;
                           });

                    var aired = $.parseJSON(localStorage.getItem("airedEpisodes"));
                    aired = aired === null ? {} : aired;
                    aired[value.id] = airedEpisodes;
                    window.localStorage.setItem("airedEpisodes", JSON.stringify(aired));

                    $(".empty-alert").hide(0);
                    $(".loadingPage").hide(0);

                }).fail(function () {
                    var poster = "img/w300-notfound.png";
                    var aired = $.parseJSON(localStorage.getItem("airedEpisodes"));
                    aired = aired === null || aired[value.id] === undefined ? episodesCounter(value.id) : aired[value.id];
                    var watchedEpisodes = $.isArray(seenEpisodes[value.id]) ? seenEpisodes[value.id].length : 0;
                    var unairedEpisodes = episodesCounter(value.id) - aired;

                    var watchText = (watchedEpisodes == aired) ? "All episodes watched" : (aired - watchedEpisodes) + " episode(s) not watched";
                    var unairedText = (unairedEpisodes > 0) ? ' (+' + unairedEpisodes + ' not aired yet)' : "";

                    $('<div id="show_' + value.id + '" class="container singleShow col-lg-4 col-md-6">' +
                                    '<div class="head" style="background-image: url(' + poster + ')"><p><strong>' + value.name + '</strong></p></div>' +
                                    '<div class="foot">' +
                                        '<span class="small m-b-0"><strong>' + watchText + '</strong></span>' +
                                        '<div class="text-muted small m-b-0">' + unairedText + '</div>' +
                                    '</div>' +
                           '</div>').appendTo("#showWatchList").click(function () {
                               window.location.href = "single-show.html?id=" + value.id;
                           });

                    $(".empty-alert").hide(0);
                    $(".loadingPage").hide(0);
                });
            });
        } else {
            $(".loadingPage").hide(0);
        }
    }

    function showEpisodes(config) {
        var id = getUrlVars()["id"];
        var season = getUrlVars()["season"];

        var seenEpisodes = $.parseJSON(localStorage.getItem("seenEpisodes"));
        seenEpisodes = seenEpisodes === null ? {} : seenEpisodes;

        var c_over = $.parseJSON(localStorage.getItem("customDescriptions"));
        c_over = c_over === null ? {} : c_over;

        var showEpisodes = $.parseJSON(localStorage.getItem("showEpisodes"));
        showEpisodes = showEpisodes === null ? {} : showEpisodes;

        $.getJSON("http://api.themoviedb.org/3/tv/" + id + "/season/" + season + "?api_key=" + api_key).done(function (data) {

            if (showEpisodes[id] == undefined)
                showEpisodes[id] = {};
            showEpisodes[id][season] = data;
            window.localStorage.setItem("showEpisodes", JSON.stringify(showEpisodes));

            $.each(data.episodes, function (index, value) {

                var seen_status = ($.isEmptyObject(seenEpisodes) || $.inArray(value.id, seenEpisodes[id]) == -1) ? 0 : 1;
                var seen_text = seen_status == 0 ? "Set as watched" : "Watched";

                if (!$.isEmptyObject(c_over) && c_over[id + "_" + value.id]) {
                    var overview = c_over[id + "_" + value.id];
                    var user_comment = 1;
                } else {
                    var overview = value.overview;
                    var user_comment = 0;
                }
                
                if (value.still_path === null || config === null)
                    var poster = "img/w300-notfound.png";
                else
                    var poster = config.images.base_url + config.images.still_sizes[2] + value.still_path;

                var ep = $('<div id="episode_' + value.id + '" class="container singleEpisode">' +
                        '<img class="col-md-4 col-xs-12 p-x-0" src="' + poster + '" />' +
                        '<div class="col-md-8 col-xs-12">' +
                            '<p class="h6"><strong>' + season + "x" + (value.episode_number.toString().length == 1 ? "0" + value.episode_number + " - " : value.episode_number + " - ") + (value.name.length ? value.name : '<em>TBA</em>') + '</strong></p>' +
                            '<p class="small">' + formatDate(value.air_date) + '</p>' +
                            '<p class="small">' + (overview.length ? '<span class="form-control readonly" readonly>' + overview + '</span>' + (user_comment == 1 ? '&nbsp;<em class="text-muted text-nowrap">&nbsp;&mdash; User comments</em>' : '') + (compareWithToday(value.air_date) ? '<a class="editDescription text-nowrap">&#10000; Edit</a>' : "") : '<em>No description yet</em>') + '</p>' +
                            '<a class="small btn btn-sm ' + (seen_status == 0 ? 'btn-info-outline' : 'btn-info') + ' episodeWatchToggle' + (compareWithToday(value.air_date) ? "" : " disabled") + '">' + (compareWithToday(value.air_date) ? seen_text : "Not aired yet") + '</a>' +
                            '<a style="display: none" class="small btn btn-sm btn-info saveDescription' + (compareWithToday(value.air_date) ? "" : " disabled") + '">Save Description</a>' +
                        '</div>' +
                   '</div>').appendTo("#episodesShower");

                ep.find(".episodeWatchToggle").click(function () {
                    if (!compareWithToday(value.air_date)) return false;
                    if (seen_status == 0) {
                        seen_status = 1;
                        if (!$.isArray(seenEpisodes[id])) seenEpisodes[id] = [];
                        seenEpisodes[id].push(value.id);
                        $(this).addClass("btn-info").removeClass("btn-info-outline").text("Watched");
                    } else {
                        seen_status = 0;
                        seenEpisodes[id] = $.grep(seenEpisodes[id], function (v) {
                            return v != value.id;
                        });
                        $(this).addClass("btn-info-outline").removeClass("btn-info").text("Set as watched");
                    }
                    window.localStorage.setItem("seenEpisodes", JSON.stringify(seenEpisodes));
                });

                ep.find(".editDescription").click(function () {
                    $(this).hide();
                    ep.find(".saveDescription").show();
                    var t = ep.find(".form-control[readonly]");
                    t.replaceWith($('<textarea style="height: ' + (t.height() + 20) + 'px" class="form-control">' + $(t).text() + '</textarea>'));
                });

                ep.find(".saveDescription").click(function () {
                    $(this).hide();
                    var t = ep.find("textarea");

                    if (t.val() == overview) {
                        t.replaceWith('<span class="form-control readonly" readonly>' + t.val() + '</span>');
                        ep.find(".editDescription").show();
                        return false;
                    }

                    var c_over = $.parseJSON(localStorage.getItem("customDescriptions"));
                    c_over = c_over === null ? {} : c_over;
                    c_over[id + "_" + value.id] = t.val();
                    window.localStorage.setItem("customDescriptions", JSON.stringify(c_over));

                    t.replaceWith('<span class="form-control readonly" readonly>' + t.val() + '</span>');
                    ep.find(".editDescription").show();
                });
                var d = $.parseJSON(localStorage.getItem("singleShows"));
                $("#episodesShower h5.episodeTitle").html("<strong>" + d[id].original_name + " <span class='text-info'>" + data.name + "</span></strong>");
            })
            $(".loadingPage").fadeOut(0);
        }).fail(function () {

            if (showEpisodes[id] != undefined && showEpisodes[id][season] != undefined) {
                var data = showEpisodes[id][season];
                $.each(data.episodes, function (index, value) {

                    var seen_status = ($.isEmptyObject(seenEpisodes) || $.inArray(value.id, seenEpisodes[id]) == -1) ? 0 : 1;
                    var seen_text = seen_status == 0 ? "Set as watched" : "Watched";

                    if (!$.isEmptyObject(c_over) && c_over[id + "_" + value.id]) {
                        var overview = c_over[id + "_" + value.id];
                        var user_comment = 1;
                    } else {
                        var overview = value.overview;
                        var user_comment = 0;
                    }

                    var poster = "img/w300-notfound.png";

                    var ep = $('<div id="episode_' + value.id + '" class="container singleEpisode">' +
                            '<img class="col-md-4 col-xs-12 p-x-0" src="' + poster + '" />' +
                            '<div class="col-md-8 col-xs-12">' +
                                '<p class="h6"><strong>' + season + "x" + (value.episode_number.toString().length == 1 ? "0" + value.episode_number + " - " : value.episode_number + " - ") + (value.name.length ? value.name : '<em>TBA</em>') + '</strong></p>' +
                                '<p class="small">' + formatDate(value.air_date) + '</p>' +
                                '<p class="small">' + (overview.length ? '<span class="form-control readonly" readonly>' + overview + '</span>' + (user_comment == 1 ? '&nbsp;<em class="text-muted text-nowrap">&nbsp;&mdash; User comments</em>' : '') + (compareWithToday(value.air_date) ? '<a class="editDescription text-nowrap">&#10000; Edit</a>' : "") : '<em>No description yet</em>') + '</p>' +
                                '<a class="small btn btn-sm ' + (seen_status == 0 ? 'btn-info-outline' : 'btn-info') + ' episodeWatchToggle' + (compareWithToday(value.air_date) ? "" : " disabled") + '">' + (compareWithToday(value.air_date) ? seen_text : "Not aired yet") + '</a>' +
                                '<a style="display: none" class="small btn btn-sm btn-info saveDescription' + (compareWithToday(value.air_date) ? "" : " disabled") + '">Save Description</a>' +
                            '</div>' +
                       '</div>').appendTo("#episodesShower");

                    ep.find(".episodeWatchToggle").click(function () {
                        if (!compareWithToday(value.air_date)) return false;
                        if (seen_status == 0) {
                            seen_status = 1;
                            if (!$.isArray(seenEpisodes[id])) seenEpisodes[id] = [];
                            seenEpisodes[id].push(value.id);
                            $(this).addClass("btn-info").removeClass("btn-info-outline").text("Watched");
                        } else {
                            seen_status = 0;
                            seenEpisodes[id] = $.grep(seenEpisodes[id], function (v) {
                                return v != value.id;
                            });
                            $(this).addClass("btn-info-outline").removeClass("btn-info").text("Set as watched");
                        }
                        window.localStorage.setItem("seenEpisodes", JSON.stringify(seenEpisodes));
                    });

                    ep.find(".editDescription").click(function () {
                        $(this).hide();
                        ep.find(".saveDescription").show();
                        var t = ep.find(".form-control[readonly]");
                        t.replaceWith($('<textarea style="height: ' + (t.height() + 20) + 'px" class="form-control">' + $(t).text() + '</textarea>'));
                    });

                    ep.find(".saveDescription").click(function () {
                        $(this).hide();
                        var t = ep.find("textarea");

                        if (t.val() == overview) {
                            t.replaceWith('<span class="form-control readonly" readonly>' + t.val() + '</span>');
                            ep.find(".editDescription").show();
                            return false;
                        }

                        var c_over = $.parseJSON(localStorage.getItem("customDescriptions"));
                        c_over = c_over === null ? {} : c_over;
                        c_over[id + "_" + value.id] = t.val();
                        window.localStorage.setItem("customDescriptions", JSON.stringify(c_over));

                        t.replaceWith('<span class="form-control readonly" readonly>' + t.val() + '</span>');
                        ep.find(".editDescription").show();
                    });
                    var d = $.parseJSON(localStorage.getItem("singleShows"));
                    $("#episodesShower h5.episodeTitle").html("<strong>" + d[id].original_name + " <span class='text-info'>" + data.name + "</span></strong>");
                })
            } else {
                $(".noInternet").show();
            }
            $(".loadingPage").fadeOut(0);
        });
    }

    /* Utilities functions */

    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function episodesCounter(id) {
        var data = $.parseJSON(localStorage.getItem("singleShows"));
        data = (data === null) ? data : data[id];
        var count = 0;

        $.each(data.seasons, function (index, value) {
            count += value.episode_count;
        });
        return count;
    }

    function compareWithToday(date) {
        var d = new Date(date);
        var t = new Date();
        return (t >= d) ? 1 : 0;
    }

    function getSearchdata(results, query) {
        var data = undefined;
        $.each(results, function (i, v) {
            if (v.query == query) {
                data = v.data;
                return false;
            }
        });

        if (data == undefined && results.length) {
            var custom = { results: [] };
            $.each(results, function (i, result) {
                $.each(result.data.results, function (i, show) {
                    if (show.original_name.toLowerCase().indexOf(query) > -1 && !checkInRes(show, custom.results)) {
                        custom.results.push(show);
                    }
                });
            });

            data = (custom.results.length) ? custom : undefined;
        }
        return data;
    }

    function checkInRes(show, results) {
        var s = false;
        $.each(results, function (i, v) {
            if (v.name == show.name) {
                s = true;
                return false;
            }
        });
        return s;
    }

    function alreadyExists(results, query) {
        var s = false;
        $.each(results, function (i, v) {
            if (v.query == query) {
                s = true;
                return false;
            }
        })
        return s;
    }

    function addRemoveWatchList(id, data, el) {

        var single = (el == undefined);
        var watchlist = $.parseJSON(localStorage.getItem("watchlist"));
        watchlist = watchlist === null ? {} : watchlist;
        var watchlist_status = $.isEmptyObject(watchlist) || watchlist[id] === undefined ? 0 : 1;
        var watchlist_text = watchlist_status == 0 ? "Add to watchlist" : "Remove from watchlist";

        if (!single) {
            if (watchlist_status == 1) {
                $(el).addClass("btn-info").removeClass("btn-info-outline").html("<span class='et-icon'>&#x4d;</span>&nbsp;Watchlist");
            } else {
                $(el).removeClass("btn-info").addClass("btn-info-outline").html("<span class='et-icon'>&#x4c;</span>&nbsp;Watchlist");
            }
        } else {
            $("#watchlistToggle > a").text(watchlist_text);
        }

        $((single) ? "#watchlistToggle > a" : el).click(function (e) {

            var single = (el == undefined);
            e.stopPropagation();

            var watchlist = $.parseJSON(localStorage.getItem("watchlist"));
            watchlist = watchlist === null ? {} : watchlist;
            var watchlist_status = $.isEmptyObject(watchlist) || watchlist[id] === undefined ? 0 : 1;

            if (single) {
                var watchlist_text = watchlist_status == 0 ? "Add to watchlist" : "Remove from watchlist";

                if (watchlist_status == 0) {
                    watchlist_status = 1;
                    watchlist[id] = { id: id, name: data.name, backdrop_path: data.backdrop_path, seasons: data.seasons };
                    $(this).text("Remove from watchlist");
                } else {
                    watchlist_status = 0;
                    watchlist[id] = undefined;
                    $(this).text("Add to watchlist");
                }
            } else {
                if (watchlist_status == 0) {
                    watchlist_status = 1;
                    watchlist[id] = { id: id, name: data.name, backdrop_path: data.backdrop_path, seasons: data.seasons };
                    $(this).addClass("btn-info").removeClass("btn-info-outline").html("<span class='et-icon'>&#x4d;</span>&nbsp;Watchlist");
                } else {
                    watchlist_status = 0;
                    watchlist[id] = undefined;
                    $(this).removeClass("btn-info").addClass("btn-info-outline").html("<span class='et-icon'>&#x4c;</span>&nbsp;Watchlist");
                }
            }
            window.localStorage.setItem("watchlist", JSON.stringify(watchlist));
        });
    }

    function nextEpisodeAiring(season) {
        var d = undefined;

        $.each(season.episodes, function (index, value) {
            if (!compareWithToday(value.air_date)) {
                d = formatDate(value.air_date);
                return false;
            }
        });

        return d;
    }

    function findLastSeason(seasons) {
        var s = seasons[seasons.length - 1].season_number;
        return (s == 0) ? seasons[0].season_number : s;
    }

    function findUnairedEpisodes(season) {
        var count = 0;

        $.each(season.episodes, function (index, value) {
            count += compareWithToday(value.air_date) ? 0 : 1;
        });

        return count;
    }

    function formatDate(d) {
        var o_f = new Date(d);
        var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
        ];
        var suffixes = ["th", "st", "nd", "rd"];
        var date = o_f.getDate();
        var s = (date % 10 > 3) ? 0 : (date % 10);
        s = (Math.floor(date / 10) == 1) ? 0 : s;

        var n_f = date + suffixes[s] + " " + monthNames[o_f.getMonth()] + " " + o_f.getFullYear();        return n_f;
    }

})(jQuery);