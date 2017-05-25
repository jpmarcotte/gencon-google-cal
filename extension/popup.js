var CALENDAR_API = "https://www.googleapis.com/calendar/v3";
var PATH_CALENDAR_LIST = "/users/me/calendarList";
var calendar_to_use = null;
var valid_calendars = [];
chrome.storage.local.get('calendar_to_use', function (items) {
    window.calendar_to_use = items.calendar_to_use;
    $("button#load_calendars").removeAttr('disabled');
});

$(document).ready(function () {
    $("button#load_calendars").click(function () {
        console.log("Loading Calendars");

        chrome.identity.getAuthToken({"interactive": true}, function (token) {
            console.log("Auth Token Received");

            $.ajax(CALENDAR_API + PATH_CALENDAR_LIST, {
                'method': 'GET',
                'headers': {
                    'Authorization': 'Bearer ' + token
                },
                success: function (response) {
                    console.log(response);
                    var calendars = response.items;
                    for (var i = 0; i < calendars.length; i++) {
                        var calendar = calendars[i];
                        // console.log(calendar);
                        if (calendar.accessRole === 'owner' || calendar.accessRole === 'writer') {
                            valid_calendars[calendar.id] = calendar;
                        }
                    }
                    renderCalendarDropdown(valid_calendars);
                }
            })
        });
    });
});

function renderCalendarDropdown(calendar_list) {
    console.log(calendar_list);
    var select = $('<select>');
    select.append('<option value="">Choose a calendar</option>')
    for (var id in calendar_list) {
        var calendar = calendar_list[id];
        var option = $('<option>');
        option.attr('value', id).text(calendar.summary);
        if (calendar_to_use && calendar_to_use.id === calendar.id) {
            option.attr('selected', true);
        }
        console.log(option);
        select.append(option);
    }
    select.change(function () {
        var id = $(this).val();
        if (id) {
            console.log("Setting Calendar to " + id);
            chrome.storage.local.set({'calendar_to_use': calendar_list[id]});
        } else {
            chrome.storage.local.remove('calendar_to_use');
        }
    });
    $('div#calendars').html(select);
}
