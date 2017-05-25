chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.store_event) {
        console.log('Storing Event:', request.store_event);
        chrome.identity.getAuthToken({'interactive': false}, function(token) {
            chrome.storage.local.get('calendar_to_use', function (items) {
                if (!items.calendar_to_use) {
                    alert('Please select a calendar by using the extension button.');
                    return false;
                }

                var calendar_id = items.calendar_to_use.id;
                $.ajax('https://www.googleapis.com/calendar/v3/calendars/' + calendar_id + '/events', {
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    'data': JSON.stringify(request.store_event),
                    'success': function (response) {
                        console.log('Success!', response);
                    },
                    'error': function (response) {
                        console.log('Oops...', response);
                    }
                })
            });
        });
    }
});