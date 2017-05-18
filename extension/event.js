$.getScript(chrome.extension.getURL('scripts/event.js'));
console.log('working');

$('div.ribbon-top').append(
    `<a class="button" style="float:right; margin:10px" href="javascript:storeEvent()">
        Add event to Google Calendar
    </a>`
);
