const { create, Client } = require('@open-wa/wa-automate')
const Bienvenida = require('./lib/Bienvenida')
const Configuración = require('./Configuración')
const Opciones = require('./Opciones')

const start = async (client = new Client()) => {
        console.log('[BOT] se ha iniciado correctamente.')
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 1000) {
                    client.cutMsgCache()
                }
            })
            Configuración(client, message)
        }))
		
        client.onGlobalParicipantsChanged((async (heuh) => {
            await Bienvenida(client, heuh)
            }))

        client.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 25) { 
            	client.sendText(chat.id, `Hola, actualmente tienes ${totalMem} miembros, si desea invitar al bot, el número mínimo es de 25 miembros`).then(() => client.leaveGroup(chat.id)).then(() => client.deleteChat(chat.id))
            } else {
                client.sendText(chat.groupMetadata.id, `╒──────────────────╕\n            *WhatsAppBot*\n╘──────────────────╛\n\nHola a todos, gracias por invitarme a: \n\n*${chat.contact.name}*\nRecuerden colocar administrador al bot (NOTA: El soporte eliminara aquellos grupos en el que el bo tenga administrador)\nSi quieres ver los comandos por favor usa el comando: */help*\n\n_Espero ser de ayuda en tu grupo :)_`)
            }
        }))

        /*client.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) client.sendSeen(to)
        }))*/

        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, '╒──────────────────╕\n            *WhatsAppBot*\n╘──────────────────╛\n\n*Lo siento no esta permitido llamar al bot*\n_Tu número esta estara en la lista de bloqueados. Si desea apelar para el desbloqueo entre al siguiente link y envie la solicitud_\n\n*Link:* Tulink.com')
            .then(() => client.contactBlock(call.peerJid))
        }))
    }

create('BarBar', opciones(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))