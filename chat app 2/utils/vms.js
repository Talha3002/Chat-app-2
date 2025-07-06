const moment = require('moment');
function formatVMs(username,arrayBuffer) {
    return {
        username,
        audio:arrayBuffer,
        time: moment().format('h:mm a'),
        type:'audio'
    }
};

module.exports = formatVMs;