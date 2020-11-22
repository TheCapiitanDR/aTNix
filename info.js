exports.info = async function() {
   
    while(true) {

        await client.setMyStatus('GRACIAS POR USAR EL BOT');
        await Sleep(60000)
        await client.setMyStatus('ACTUALMENTE ACTIVO');
        await Sleep(60000)
        await client.setMyStatus('SI NECESITAS AYUDA, VE AL ENLACE DEL SOPORTE DE AYUDA');
        await Sleep(60000)
    }

}

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
