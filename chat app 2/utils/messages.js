const moment = require('moment');
function formatMessages(username, text, type = 'text') {
    return {
        username,
        text,
        time: moment().format('h:mm a'),
        type
    }
};



module.exports = formatMessages;