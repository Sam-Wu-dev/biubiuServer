let ws = new WebSocket('ws://localhost:8080')

ws.onopen = () => {
    console.log('open connection woohoo')
}

ws.onclose = () => {
    console.log('close connection')
}

//接收 Server 發送的訊息
ws.onmessage = event => {
    var ctx = document.getElementById('canvas').getContext('2d');
    var img = new Image();
    img.src = event.data;
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
    }
}