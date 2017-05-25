$.getScript(chrome.extension.getURL('scripts/event.js'));
console.log('working');

$('div.ribbon-top').append(
    `<a class="button" style="float:right; margin:10px" href="javascript:storeEvent('`+ chrome.runtime.id +`\')">
        Add event to Google Calendar
    </a>`
);

document.addEventListener('Store_Event', function(e){
    console.log('About to send event', e);
    chrome.runtime.sendMessage({'store_event': e.detail});
});
