const date_map = {
    'Wednesday': '2022-08-03',
    'Thursday': '2022-08-04',
    'Friday': '2022-08-05',
    'Saturday': '2022-08-06',
    'Sunday': '2022-08-07'
};

const time_zone = 'America/Indiana/Indianapolis';
const short_time_zone = 'EDT';

const date_re = /^(\w+), +(\d+):(\d\d) ([AP])M (\w+)$/;
const cost_re = /^\$(\d+).(\d\d)$/;

function storeEvent() {
    let event_details = collectEventFromPage();
    let expanded_details = expandEventDetails(event_details);
    let event_id = expanded_details['Game ID'];
    let event = convertEvent(expanded_details);
    console.log('Collected Event', event);
    document.dispatchEvent(new CustomEvent('Store_Event', {
        'detail': {
            'event_details': event,
            'event_id' : event_id
        }
    }));
}

function collectEventFromPage() {
    const attributes = {
        'Game ID': 'text',
        'Title': 'text',
        'Description': 'text',
        'Short Description': 'text',
        'Long Description': 'text',
        'Start Date & Time': 'text',
        'End Date & Time': 'text',
        'Location': 'text',
        'Web Address for more information': 'link',
        'Tournament': 'text',
        'Cost': 'text'
    };

    let event_details = getAttributeValues(attributes);
    event_details['URL'] = document.location.href;

    return event_details;
}

function getAttributeValues(desired_attributes) {
    let attribute_values = {};
    $('div.attr > div.name').each(function (index, element) {
        let attribute = $(element).text().trim().replace(/:$/, '').replace(/\s+/g, ' ');
        // console.log("Found " + attribute);
        if (desired_attributes[attribute]) {
            if (desired_attributes[attribute] === 'text') {
                attribute_values[attribute] = $(element).next().text().trim().replace(/\n/g, '');
            } else if (desired_attributes[attribute] === 'link') {
                let link = $(element).next().find('a').attr('href');
                if (link !== 'http://') {
                    // Gen Con uses only the scheme for empty links
                    attribute_values[attribute] = link;
                }
            }
        }
    });
    return attribute_values;
}

function convertEvent(event_details) {
    let event = {
        'summary': generateEventSummary(event_details),
        'location': event_details['Location'],
        'description': generateEventDescription(event_details),
        'start': {
            'dateTime': generateDateTime(event_details['Start Date & Time']).toISOString(),
            'timeZone': time_zone
        },
        'end': {
            'dateTime': generateDateTime(event_details['End Date & Time']).toISOString(),
            'timeZone': time_zone
        },
        'extendedProperties': {
            'shared': {}
        }
    }
    event['extendedProperties']['shared']['gen_con_event_'+event_details['Game ID']] = 1;

    return event;
}

function expandEventDetails(event_details) {
    event_details['Short Timeframe'] = generateShortTimeframe(
        event_details['Start Date & Time'], event_details['End Date & Time']
    );

    event_details['Short Cost'] = generateShortCost(event_details['Cost']);

    event_details['Is Tournament'] = isTournament(event_details['Tournament']);

    return event_details;
}

function generateShortTimeframe(start, end) {
    console.log(date_re, start, end);
    let [, , start_hour, start_minute, start_ampm, start_tz] = date_re.exec(start);
    let [, , end_hour, end_minute, end_ampm, end_tz] = date_re.exec(end);
    start_ampm = start_ampm.toLowerCase();
    end_ampm = end_ampm.toLowerCase();

    let start_part = '';
    if (start_hour === '12' && start_minute === '00') {
        if (start_ampm === 'a') {
            start_part = 'M';
        } else if (start_ampm === 'p') {
            start_part = 'N';
        }
    } else if (start_part === '' && start_minute === '00') {
        start_part = start_hour;
    } else {
        start_part = start_hour + start_minute;
    }

    let end_part = '';
    if (end_hour === '12' && end_minute === '00') {
        if (end_ampm === 'a') {
            end_part = 'M';
        } else if (end_ampm === 'p') {
            end_part = 'N';
        }
    } else if (end_part === '' && end_minute === '00') {
        end_part = end_hour + end_ampm;
    } else {
        end_part = end_hour + end_minute + end_ampm;
    }

    if (start_part !== 'M' && start_part !== 'N' && start_ampm !== end_ampm) {
        start_part += start_ampm;
    }

    return start_part + '-' + end_part;
}

function generateShortCost(cost) {
    [, dollars, cents] = cost_re.exec(cost);
    if (dollars === '0' && cents === '00') {
        return 'FREE';
    }
    return (cents === '00') ? '$' + dollars : cost;
}

function isTournament(tournament) {
    return (tournament.substr(0, 3) === 'Yes');
}

function generateEventSummary(event_details) {
    return [
        event_details['Short Timeframe'],
        event_details['Title'],
        '(' + event_details['Game ID'] + ')'
    ].join(' ');
}

function generateEventDescription(event_details) {
    // Generate web links
    let web_links = [event_details['URL']];
    if (event_details['Web Address for more information']) {
        web_links.push(event_details['Web Address for more information']);
    }

    // Start with web links
    let description_parts = [web_links.join("\n")];

    // Add Descriptions
    if (event_details['Short Description']) {
        description_parts.push(event_details['Short Description']);
    }
    if (event_details['Description']) {
        description_parts.push(event_details['Description']);
    }
    if (event_details['Long Description']) {
        description_parts.push(event_details['Long Description']);
    }

    // Add cost/tournament info
    if (event_details['Is Tournament']) {
        description_parts.push(event_details['Short Cost'] + ' Tournament');
    } else {
        description_parts.push(event_details['Short Cost']);
    }

    return description_parts.join("\n\n");
}

function generateDateTime(time) {
    let [, day_of_week, hour, minute, ampm, tz] = date_re.exec(time);
    let date = date_map[day_of_week];
    return new Date(date + ' ' + hour + ':' + minute + ' ' + ampm + 'M' + ' ' + tz);
}
