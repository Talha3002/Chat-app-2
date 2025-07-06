const socket = io();
let chatform = document.getElementById('chat-form');
let chatHeight = document.querySelector('.chat-messages');
let roomName = document.getElementById('room-name');
let userList = document.getElementById('users');
const mic_btn = document.querySelector('#mic');
const playback = document.querySelector('.playback');

socket.on('message', message => {
    console.log(message);
    if(message.type==='text'){
        OutputMessage(message);
    }
    if(message.type==='audio'){
        socket.off('message',message)
        const blob = new Blob([data.audio], { type: "audio/webm" });
        const audioURL = window.URL.createObjectURL(blob);
        OutputAudio(audioURL,data.username,data.time); 
    }
    scrolltobottom();
});

socket.on('voiceMessage', (data) => {
    console.log("Voice Message Received:", data);
    const blob = new Blob([data.audio], { type: "audio/webm" });
    const audioURL = window.URL.createObjectURL(blob);
    OutputAudio(audioURL,data.username,data.time); 
});

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

console.log(username, room);

socket.emit('joinroom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
    OutputRoomName(room);
    OutputUsers(users);
});

chatform.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function OutputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}


function OutputAudio(audioURL,username,time) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${username} <span>${time}</span></p>
                     <audio class="playback" controls src="${audioURL}"></audio>`;
    document.querySelector('.chat-messages').appendChild(div);
    scrolltobottom();
}

function OutputRoomName(room) {
    roomName.innerText = room;
}

function OutputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

function scrolltobottom() {
    chatHeight.scrollTop = chatHeight.scrollHeight;
}



let can_record = false;
let is_recording = false;

let recorder = null;
let chunks = [];

mic_btn.addEventListener("click", ToggleMic);

function setupAudio() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(setupStream)
            .catch(err => {
                console.error('Failed to setup audio stream', err);
            });
    }
}

setupAudio();

function setupStream(stream) {
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    };
    recorder.onstop = e => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        chunks = [];
        const reader = new FileReader();
        
        reader.onloadend = () => {
            const arrayBuffer = reader.result;
            socket.emit('voiceMessage', arrayBuffer);
        };
        
        reader.readAsArrayBuffer(blob);
    };
    can_record = true;
}

function ToggleMic() {
    if (!can_record) return;

    if (is_recording) {
        recorder.stop();
        mic_btn.innerHTML = '<i class="fa-solid fa-microphone" id="icon"></i>';
        mic_btn.classList.remove("is-recording");
    } else {
        recorder.start();
        mic_btn.innerHTML = '<i class="fa-solid fa-stop" id="icon"></i>';
        mic_btn.classList.add("is-recording");
    }

    is_recording = !is_recording;
}
