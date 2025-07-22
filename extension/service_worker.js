const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
    
function createEvent(calendar_id, token, event, cb) {
    fetch(CALENDAR_API + '/calendars/' + calendar_id + '/events', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'body': JSON.stringify(event),
    }).then( (response) => {
        // console.log('Success!', response);
        cb({'success': true, 'response': response});
    }).catch( (response) => {
        // console.log('Oops...', response);
        cb({'success': false, 'response': response});
    });
}

async function eventAlreadyExists(calendar_id, token, event_id, yes, no) {
    let query_string = new URLSearchParams({'sharedExtendedProperty': 'gen_con_event_' + event_id + '=1'});
    const response = await fetch(CALENDAR_API + '/calendars/' + calendar_id + '/events?' + query_string, {
        'method': 'GET',
        'headers': {
            'Authorization': 'Bearer ' + token
        },
    });

    const data = await response.json();
    console.log('Event Already Exists?', data);

    if (data.items.length > 0) {
        yes();
    } else {
        no();
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.store_event) {
        console.log('Storing Event:', request.store_event);
        chrome.identity.getAuthToken({'interactive': false}, (token) => {
            chrome.storage.local.get('calendar_to_use', (items) => {
                if (!items.calendar_to_use) {
                    alert('Please select a calendar by using the extension button.');
                    return false;
                }

                let calendar_id = items.calendar_to_use.id;
                eventAlreadyExists(calendar_id, token, request.store_event.event_id, () => {
                    console.log('Event already exists.');
                    sendResponse({'success': true, 'message': 'Event already exists.'});
                }, () => {
                    createEvent(calendar_id, token, request.store_event.event_details, sendResponse);
                });
            });
        });
    }
    return true;
});

