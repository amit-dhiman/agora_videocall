const APP_ID= "de6b5c3082ab43cb98f8a79e2c525252"
const TOKEN= "007eJxTYGgSXGf8IfaD7aXXfcIT1dbxyaxZfjI5uTQxJtrnmUhI22sFhpRUsyTTZGMDC6PEJBPj5CRLizSLRHPLVKNkUyMQ9BGRS2sIZGR40HCJlZEBAkF8FobcxMw8BgYAL7Iexg=="
const CHANNEL="main"
const client= AgoraRTC.createClient({mode:'rtc',codec:'vp8'});

let localTracks= [];
let remoteUsers= {};

let joinAndDisplayLocalStream = async()=>{

    client.on('user-published', handleUserJoined);

    let UID = await client.join(APP_ID, CHANNEL,TOKEN,null);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    
    let player = `<div class="video-container" id="user-container-${UID}">
    <div class="video-player" id="user-${UID}"></div>
    </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)
    
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0],localTracks[1]])
}

let joinStream = async ()=>{
    await joinAndDisplayLocalStream();
    document.getElementById('join-btn').style.display= 'none'
    document.getElementById('stream-controls').style.display= 'flex'
}

let handleUserJoined = async (user, mediaType)=>{
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video'){
        let player= document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove();
        }

        player= `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
            </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

        user.videoTrack.play(`user-${user.uid}`)
    }   
    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
