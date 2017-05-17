function store_event() {
    collect_event_from_page();
}

function collect_event_from_page() {
    const attributes = [
        'Game ID',
        'Title',
        'Description',
        'Short Description',
        'Long Description',
        'Start Date & Time',
        'End Date & Time',
        'Location',
        'Web Address for more information',
        'Tournament',
        'Cost'
    ];

    let event_details = get_attribute_values(attributes);
    event_details.url = document.location.href;
    console.log(event_details);

}

function get_attribute_values(attributes) {
    let attribute_values = {};
    $('div.attr > div.name').each(function (index, element) {
        let attribute = $(element).text().replace(/:$/,'');
        if (attributes.includes(attribute)) {
            attribute_values[attribute] = $(element).next().text().trim().replace(/\n/g,'');
        }
    });
    return attribute_values;
}
