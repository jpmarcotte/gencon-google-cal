let CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

function createEvent(calendar_id, token, event, cb) {
    $.ajax(CALENDAR_API + '/calendars/' + calendar_id + '/events', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'data': JSON.stringify(event),
        'success': function (response) {
            // console.log('Success!', response);
            cb({'success': true, 'response': response});
        },
        'error': function (response) {
            // console.log('Oops...', response);
            cb({'success': false, 'response': response});
        }
    })
}

function eventAlreadyExists(calendar_id, token, event_id, yes, no) {
    let query_string = $.param({'sharedExtendedProperty': 'gen_con_event_' + event_id + '=1'});
    $.ajax(CALENDAR_API + '/calendars/' + calendar_id + '/events?' + query_string, {
        'method': 'GET',
        'headers': {
            'Authorization': 'Bearer ' + token
        },
        'success': function (response) {
            console.log('Event Already Exists?', response);
            if (response.items.length > 0) {
                yes();
            } else {
                no();
            }
        },
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.store_event) {
        console.log('Storing Event:', request.store_event);
        chrome.identity.getAuthToken({'interactive': false}, function (token) {
            chrome.storage.local.get('calendar_to_use', function (items) {
                if (!items.calendar_to_use) {
                    alert('Please select a calendar by using the extension button.');
                    return false;
                }

                let calendar_id = items.calendar_to_use.id;
                eventAlreadyExists(calendar_id, token, request.store_event.event_id, function () {
                    console.log('Event already exists.');
                    sendResponse({'success': true, 'message': 'Event already exists.'});
                }, function () {
                    createEvent(calendar_id, token, request.store_event.event_details, sendResponse);
                });
            });
        });
    }
    return true;
});

