const APP_ID= "de6b5c3082ab43cb98f8a79e2c525252"
const TOKEN= "007eJxTYGgSXGf8IfaD7aXXfcIT1dbxyaxZfjI5uTQxJtrnmUhI22sFhpRUsyTTZGMDC6PEJBPj5CRLizSLRHPLVKNkUyMQ9BGRS2sIZGR40HCJlZEBAkF8FobcxMw8BgYAL7Iexg=="
const CHANNEL="main"
const client= AgoraRTC.createClient({mode:'rtc',codec:'vp8'});

let localTracks= [];
let remoteUsers= {};

let joinAndDisplayLocalStream = async()=>{

    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    let UID = await client.join(APP_ID, CHANNEL,TOKEN,null);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    console.log('---------localTracks-------',localTracks);

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

const handleUserLeft = async(user)=>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove();
}

const leaveAndRemoveLocalStream = async()=>{
    for(let i=0; i < localTracks.length; i++){
        console.log('----localTracks[i]----',localTracks[i]);
        localTracks[i].stop();
        localTracks[i].close();
    }

    await client.leave();
    document.getElementById('join-btn').style.display= 'block';
    document.getElementById('stream-controls').style.display= 'none';
    document.getElementById('video-streams').style.display= '';
}

const toggleMic = async (e) =>{
    console.log('---------toggleMic localTracks[0]-------',localTracks[0]);
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText= 'Mic on'
        e.target.style.backgroundColor= 'cadetblue'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText= "Mic off"
        e.target.style.backgroundColor= '#EE4B2B'
    }
}

const toggleCamera = async (e) =>{
    console.log('---------toggleCamera localTracks[1]-------',localTracks[1]);
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText= 'Camera on'
        e.target.style.backgroundColor= 'cadetblue'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText= "Camera off"
        e.target.style.backgroundColor= '#EE4B2B'
    }
}




document.getElementById('join-btn').addEventListener('click', joinStream);
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
