$.getScript(chrome.extension.getURL('scripts/event.js'));
console.log('working');

$('div.ribbon-top').append(
    `<a class="button" style="float:right; margin:10px" href="javascript:store_event()">
        Add event to Google Calendar
    </a>`
);
