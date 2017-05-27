$.getScript(chrome.extension.getURL('scripts/event.js'));
console.log('working');

$('div.ribbon-top').append(
    `<a class="button" id="add_event_button" style="float:right; margin:10px" href="javascript:storeEvent()">
        Add event to Google Calendar
    </a>`
);

document.addEventListener('Store_Event', function(e){
    console.log('About to send event', e);
    chrome.runtime.sendMessage({'store_event': e.detail}, function(response){
        console.log('Event Sent', response);
        let start_color, end_color, button_text;
        if (response.success) {
            start_color = 'LightGreen';
            end_color = 'Green';
            button_text = response.message ? response.message : 'Event created successfully.';
        } else {
            start_color = 'LightCoral';
            end_color = 'Red';
            button_text = response.message ? response.message : 'There was a problem creating the event.';
        }
        $('a#add_event_button')
            .css('background-image', 'linear-gradient('+start_color+','+end_color+')')
            .text(button_text);

    });
});
