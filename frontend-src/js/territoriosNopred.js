
// document.addEventListener('keydown', function init(event){
//     if (event.keyCode === 13) {

//     }
// })


////////////////////////////////////////////////////////////////////////////////////


const nTerritorio = document.getElementById('territorio').innerHTML.trim()
console.log("Territorio ", nTerritorio)

const cantidad = document.getElementById('cantidad').innerText
console.log("Se muestran: " + cantidad)

for (i=0; i<cantidad; i++) {
    let dropDown = "dropdownMenuButton" + i
    // alert(i)
    const menu = document.getElementById(dropDown)
    const estado1 = menu.innerHTML.trim()

    start(estado1, menu, i)
}

function start(estado1, menu, i) {

    //console.log("estado " + estado1 + ", indice " + i)
    if (estado1 == "No predicado") {
        menu.style.backgroundColor = 'green';
        menu.style.borderColor = 'green';
    } else if (estado1 == "No llamar") {
        menu.style.backgroundColor = 'darkred';
        menu.style.borderColor = 'darkred';
    } else if (estado1 == "Revisita") {
        menu.style.backgroundColor = '#f20ecc';
        menu.style.borderColor = '#f20ecc';
    } else if (estado1 == "No abonado en serv") {
        menu.style.backgroundColor = 'black';
        menu.style.borderColor = 'black';
    } else if (estado1 == "No contestó") {
        menu.style.backgroundColor = 'blue';
        menu.style.borderColor = 'blue';
    } else {
        alert('No se pudo leer el estado' + i)
    }


    if (estado1 == "No predicado") {
        let cardF = "cardFecha" + i
        let cardFecha = document.getElementById(cardF)
        cardFecha.style.display = 'none'

    } else {
        let fechaUltnX = "fechaUlt" + i
        let fechaUlt;
        try {
            fechaUlt = document.getElementById(fechaUltnX).innerText;
        } catch (e) {
            fechaUlt = "";
        }
        // console.log(fechaUlt)
        if (fechaUlt != "") {
            let fechan = "fecha" + i
            let fecha = document.getElementById(fechan)
            let inyectFechan = "inyectFecha" + i
            let inyectFecha = document.getElementById(inyectFechan)
            let cardF = "cardFecha" + i
            let cardFecha = document.getElementById(cardF)
            fecha.innerText = "Se llamó el: ";
            fecha = new Date(parseInt(fechaUlt))
            //console.log("fechaUlt " + fecha)
            mes = parseInt(fecha.getMonth()) + 1
            inyectFecha.innerText = fecha.getFullYear() + " - " + mes + " - " + fecha.getDate()
            cardFecha.style.display = 'block'
        }
    }

}


///////////////////////////////////////////////////////////////////////////////////////////

//const socket = io();    // establece la conexión y el servidor responde con io.on('connection', () => {...}

// io('https://midominio.com)

for (i = 0; i < cantidad; i++) {
    let nopredicadoX = "nopredicado" + i
    const nopredicado = document.getElementById(nopredicadoX);
    enviar(i, nopredicado, nTerritorio);
}

for (i = 0; i < cantidad; i++) {
    let revisitaX = "revisita" + i
    const revisita = document.getElementById(revisitaX);
    enviar(i, revisita, nTerritorio);
}

for (i = 0; i < cantidad; i++) {
    let noabonadoX = "noabonado" + i
    const noabonado = document.getElementById(noabonadoX);
    enviar(i, noabonado, nTerritorio);
}

for (i = 0; i < cantidad; i++) {
    let nollamarX = "nollamar" + i
    const nollamar = document.getElementById(nollamarX);
    enviar(i, nollamar, nTerritorio);
}

for (i = 0; i < cantidad; i++) {
    let nocontestoX = "nocontesto" + i
    const nocontesto = document.getElementById(nocontestoX);
    enviar(i, nocontesto, nTerritorio);
}


function enviar(i, stateButton, territorio) {
    stateButton.addEventListener('click', function () {
        socket.emit('estado:nuevo', {
            inner_id: stateButton.name,
            estado: stateButton.value.trim(),
            index: i,
            territorio: territorio
        });
    })
}



socket.on('estado:nuevo', function (data) {
    // console.log(data)
    if (data.territorio == nTerritorio) {
        let dropdownMenuButton = "dropdownMenuButton" + data.index
        const button = document.getElementById(dropdownMenuButton)
        // alert("Estado a enviar " +data.estado)
        start(data.estado, button, data.index);
        button.innerText = data.estado;
        document.getElementById('cantidad').click();
        ponerFecha(data.estado, data.index);
    }
})


function ponerFecha(estado, i) {

    if (estado != "No predicado") {
        let cardF = "cardFecha" + i
        let cardFecha = document.getElementById(cardF)
        cardFecha.style.display = 'block'

        let texto = "fecha" + i
        document.getElementById(texto).innerText = "Se llamó el: ";

        let fecha = new Date(new Date().getTime())
        let mes = parseInt(fecha.getMonth()) + 1

        let inyectFechan = "inyectFecha" + i
        let inyectFecha = document.getElementById(inyectFechan)
        inyectFecha.innerText = fecha.getFullYear() + " - " + mes + " - " + fecha.getDate()

    } else {
        let cardF = "cardFecha" + i
        let cardFecha = document.getElementById(cardF)
        cardFecha.style.display = 'none'
    }


}


//                      textarea


for (i = 0; i < cantidad; i++) {
    let textareaX = "textarea" + i;
    const textarea = document.getElementById(textareaX);
    let taBtnX = "taBtn" + i;
    const taBtn = document.getElementById(taBtnX);
    enviar2(i, textarea, taBtn, nTerritorio);
}

function enviar2(i, textarea, taBtn, territorio) {
    taBtn.addEventListener('click', function () {
        socket.emit('observaciones:nuevo', {
            inner_id: textarea.name,
            observaciones: textarea.value.trim(),
            index: i,
            territorio: territorio
        });
    })
}


//                     listen socket

socket.on('observaciones:nuevo', function (data) {
    console.log(data)
    if (data.territorio == nTerritorio) {
        let textareaX = "textarea" + data.index
        document.getElementById(textareaX).value = data.observaciones;
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////




//fetch('https://ipapi.co/json')
//.then(res => {
//    const json=res.json();
//    console.log(json) 
//    return json
//}).then(json => {
//    console.log(json.ip);
//    socket.emit('verificar:log', {ip:json.ip});
//})
    
//socket.on('verificar:log', function (data) {
//    console.log(data)
//    document.getElementById('volver').click();
//});
