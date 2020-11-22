const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const fetch = require('node-fetch')
const color = require('./lib/color')
const { spawn, exec } = require('child_process')
const nhentai = require('nhentai-js')
const { API } = require('nhentai-api')
const { lyrics, creative, nsfwcomputer, sleep} = require('./lib/Funciones')
const { admin, help, snk, info, donate, convertidores, sugerencias, otros, ttsall, multiverso, historias, stickers } = require('./lib/help')
const { stdout } = require('process')
const nsfw_ = JSON.parse(fs.readFileSync('./lib/NSFW.json'))
const welkom = JSON.parse(fs.readFileSync('./lib/Bienvenida.json'))
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg')

moment.tz.setDefault('Spain/Madrid').locale('es')

module.exports = Configuración = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList,warn } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('/')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }

        const mess = {
            wait: '[ *BOT* ] espera un momento...',
            error: {
                St: '[ *X* ] Envía una imagen con el mensaje */Sticker* o etiqueta la imagen que se ha enviado',
                Ki: '[ *X* ] ¡El bot no puede expulsar un administrador de grupo!',
                Ad: '[ *X* ] Ese miembro no se puede agregar, tal vez sea debido a sus ajustes',
                Iv: '[ *X* ] ¡El enlace que ha enviado no es válido!'
            }
        }

        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = ["34692864524@c.us","573219795387@c.us"] // replace with your whatsapp number
        const isOwner = sender.id === ownerNumber
        const isBlocked = blockNumber.includes(sender.id)
        const isNsfw = isGroupMsg ? nsfw_.includes(chat.id) : false
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('/')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mCOMANDO\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('/')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mCOMANDO\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        if (!isGroupMsg && !command.startsWith('/')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMENSAJE\x1b[1;37m]', time, color(body), 'from', color(pushname))
        if (isGroupMsg && !command.startsWith('/')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMENSAJE\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {
        case '/sticker':
        case '/stiker':
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (args.length === 2) {
                const url = args[1]
                if (url.match(isUrl)) {
                    await client.sendStickerfromUrl(from, url, { method: 'get' })
                        .catch(err => console.log('Excepción detectada: ', err))
                } else {
                    client.reply(from, mess.error.Iv, id)
                }
            } else {
                    client.reply(from, mess.error.St, id)
            }
            break
        case '/stickergif':
        case '/stikergif':
        case '/sgif':
            if (isMedia) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    const mediaData = await decryptMedia(message, uaOverride)
                    client.reply(from, '[ *BOT* ] espera un momento...', id)
                    const filename = `./media/mp44.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/giff.gif --fps=30 --scale=340:340`, async function (error, stdout, stderr) {
                        const gif = await fs.readFileSync('./media/giff.gif', { encoding: "base64" })
                        await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                    })
                } else (
                    client.reply(from, '[ *X* ]  Envía un video con */sgif* ¡máx 15 segundos videos / 10 segundos gifs!', id)
                )
            }
            break
	case '/stickernobg':
	    if (isMedia) {
                try {
                    var mediaData = await decryptMedia(message, uaOverride)
                    var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    var base64img = imageBase64
                    var outFile = './media/img/noBg.png'
					//Para la clave API, lo obtuve en remove.bg
                var result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'g52wfArBdT6kyqfZAEopGo2c', size: 'auto', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                } catch(err) {
                    console.log(err)
                }
            }
            break
        case '/tts':
            if (args.length === 1) return client.reply(from, 'Envia el comando */tts [es, en, ja, es-us] [texto]*, por ejemplo: */tts es hola*')
            const ttsen = require('node-gtts')('en')
            const ttsfr = require('node-gtts')('fr')
            const ttsit = require('node-gtts')('it')
			const ttsjap = require('node-gtts')('ja')
            const ttspt = require('node-gtts')('pt')
            const ttsru = require('node-gtts')('ru')
            const ttses = require('node-gtts')('es')
            const dataText = body.slice(8)
            if (dataText === '') return client.reply(from, '¿Y el texto?', id)
            if (dataText.length > 500) return client.reply(from, '¡El texto es demasiado largo!', id)
            var dataBhs = body.slice(5, 7)
			if (dataBhs == 'en') {
                ttsen.save('./media/tts/resEn.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resEn.mp3', id)
                })
            } else if (dataBhs == 'fr') {
                ttsfr.save('./media/tts/resFr.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resFr.mp3', id)
                })
            } else if (dataBhs == 'it') {
                ttsit.save('./media/tts/resIt.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resIt.mp3', id)
                })
            } else if (dataBhs == 'pt') {
                ttspt.save('./media/tts/resPt.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resPt.mp3', id)
                })
            } else if (dataBhs == 'ja') {
                ttsjap.save('./media/tts/resJa.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resJa.mp3', id)
                })
            } else if (dataBhs == 'ru') {
                ttsru.save('./media/tts/resRu.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resRu.mp3', id)
                })
            } else if (dataBhs == 'es') {
                ttses.save('./media/tts/resEs.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resEs.mp3', id)
                })
            } else {
                client.reply(from, 'Ingrese el comando /ttsall para ver todos los idiomas disponibles.', id)
            }
            break
        case '/nsfw':
            if (!isGroupMsg) return client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            if (!isGroupAdmins) return client.reply(from, '¡Este comando solo puede ser utilizado por el grupo de administradores!', id)
            if (args.length === 1) return client.reply(from, '¡Debes escribir enable o disable!', id)
            if (args[1].toLowerCase() === 'enable') {
                nsfw_.push(chat.id)
                fs.writeFileSync('./lib/NSFW.json', JSON.stringify(nsfw_))
                client.reply(from, '¡El comando NSWF se activó en este grupo! Para ver el menu escribe */nsfwMenu*', id)
            } else if (args[1].toLowerCase() === 'disable') {
                nsfw_.splice(chat.id, 1)
                fs.writeFileSync('./lib/NSFW.json', JSON.stringify(nsfw_))
                client.reply(from, '¡El comando NSFW se desactivó en este grupo!', id)
            } else {
                client.reply(from, '¡Debes escribir enable o disable!', id)
            }
            break
        case '/welcome':
            if (!isGroupMsg) return client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            if (!isGroupAdmins) return client.reply(from, '¡Este comando solo puede ser utilizado por el grupo de administradores!', id)
            if (args.length === 1) return client.reply(from, '¡Seleccione enable o disable!', id)
            if (args[1].toLowerCase() === 'enable') {
                welkom.push(chat.id)
                fs.writeFileSync('./lib/Bienvenida.json', JSON.stringify(welkom))
                client.reply(from, '¡La función de bienvenida se ha activado en este grupo!', id)
            } else if (args[1].toLowerCase() === 'disable') {
                welkom.splice(chat.id, 1)
                fs.writeFileSync('./lib/Bienvenida.json', JSON.stringify(welkom))
                client.reply(from, '¡La función de bienvenida se ha desactivado en este grupo!', id)
            } else {
                client.reply(from, '¡Seleccione enable o disable!', id)
            }
            break
        case '/nsfwmenu':
            if (!isNsfw) return
            client.reply(from, '╒──────────────────╕\n           *WhatsAppBot 3.0*\n╘──────────────────╛\n\n*Advertencia:* _Al activar el comando has activado el modo +18_\n*1.* ```/randomHentai```\n*2.* ```/randomNsfwNeko```', id)
            break
        case '/scananime':
            if (isMedia && type === 'image' || quotedMsg && quotedMsg.type === 'image') {
                if (isMedia) {
                    var mediaData = await decryptMedia(message, uaOverride)
                } else {
                    var mediaData = await decryptMedia(quotedMsg, uaOverride)
                }
                const fetch = require('node-fetch')
                const imgBS4 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                client.reply(from, '[ *BOT* ] Buscando información...', id)
                fetch('https://trace.moe/api/search', {
                    method: 'POST',
                    body: JSON.stringify({ image: imgBS4 }),
                    headers: { "Content-Type": "application/json" }
                })
                .then(respon => respon.json())
                .then(resolt => {
                	if (resolt.docs && resolt.docs.length <= 0) {
                		client.reply(from, 'Lo siento, no puedo reconocer este anime, captura una escena del anime para mejor resultado.', id)
                	}
                    const { is_adult, title, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = resolt.docs[0]
                    teks = ''
                    if (similarity < 0.92) {
                    	teks = '*Información del anime*:\n\n'
                    }
                    teks += `➸ *Título japonés*: ${title}\n➸ *Título Inglés*: ${title_english}\n`
                    teks += `➸ *Contenido +18*: ${is_adult}\n`
                    teks += `➸ *Episodio*: ${episode.toString()}\n`
                    teks += `➸ *Similar en un* : ${(similarity * 100).toFixed(1)}%\n`
                    var video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`;
                    client.sendFileFromUrl(from, video, 'nimek.mp4', teks, id).catch(() => {
                        client.reply(from, teks, id)
                    })
                })
                .catch(() => {
                    client.reply(from, '¡Error! ', id)
                })
            } else {
                client.sendFile(from, './media/img/Scananime.jpg', 'Scananime.jpg', 'Aquí hay un ejemplo, ¡gracias!', id)
            }
            break
		case '/invitación':
        case '/invitacion':
		case '/invitation':
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando solo se puede usar cuando el bot se convierte en administrador', id)
            if (isGroupMsg) {
                const inviteLink = await client.getGroupInviteLink(groupId);
                client.sendLinkWithAutoPreview(from, inviteLink, `\nLink de invitacion de *${name}*`)
            } else {
            	client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            }
            break
        case '/say':
            if (!isOwner) return client.reply(from, '¡Este comando solo se puede usar por el creador del bot!', id)
            let msg = body.slice(4)
            const chatz = await client.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) await client.sendText(ids, `[ᴍᴇɴsᴀᴊᴇ ᴅᴇʟ ᴄʀᴇᴀᴅᴏʀ]\n${msg}\n\nAtt. TheCapiitanDR`)
            }
            client.reply(from, 'El mensaje se envio a todos', id)
            break
        case '/warns':
            if (!isOwner) return client.reply(from, '¡Este comando solo se puede usar por el soporte del bot!', id)
            let warn = body.slice(4)
            const warns = await client.getAllChatIds()
            for (let ids of warns) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) await client.sendText(ids, `*[ᴍᴇɴsᴀᴊᴇ ᴅᴇʟ sᴏᴘᴏʀᴛᴇ ᴅᴇʟ ʙᴏᴛ​​​​​]*\n\n${warn}\n\nAtt. Soporte de Ayuda`)
            }
            client.reply(from, 'Se envio el mensaje a todos', id)
            break
        case '/adminlist':
            if (!isGroupMsg) return client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            let mimin = '*[ʟɪsᴛᴀ ᴅᴇ ᴀᴅᴍɪɴs​​​​​]*\n'
            for (let admon of groupAdmins) {
                mimin += `➸ @${admon.replace(/@c.us/g, '')}\n` 
            }
            await sleep(2000)
            await client.sendTextWithMentions(from, mimin)
            break
        case '/Ownergroup':
            if (!isGroupMsg) return client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            const Owner_ = chat.groupMetadata.owner
            await client.sendTextWithMentions(from, `Owner Group : @${Owner_}`)
            break
        case '/mentionall':
            if (!isGroupMsg) return client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando solo puede ser utilizado por administradores de grupo', id)
            const groupMem = await client.getGroupMembers(groupId)
            let hehe = '╔══[ AVISO A TODOS ]══\n'
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '╠➥'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '╚═〘 AVISO A TODOS 〙'
            await sleep(2000)
            await client.sendTextWithMentions(from, hehe)
            break
        case '/banall':
            if (!isGroupMsg) return client.reply(from, '¡Este comando solo se puede usar en grupos!', id)
            const isGroupOwner = sender.id === chat.groupMetadata.owner
            if (!isGroupOwner) return client.reply(from, 'Este comando solo puede ser utilizado por el creador del grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando solo se puede usar cuando el bot se convierte en administrador', id)
            const allMem = await client.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) {
                    console.log('Todos los miembros han sido eliminados, excepto los administradores')
                } else {
                    await client.removeParticipant(groupId, allMem[i].id)
                }
            }
            client.reply(from, 'Se han eliminado a todos los miembros', id)
            break
        case '/leaveall':
            if (!isOwner) return client.reply(from, 'Este comando solo puede ser utilizado por el creador del bot', id)
            const allChats = await client.getAllChatIds()
            const allGroups = await client.getAllGroups()
            for (let gclist of allGroups) {
                await client.sendText(gclist.contact.id, `Saliendo de todos los grupos\nActualmente quedan: ${allChats.length}`)
                await client.leaveGroup(gclist.contact.id)
            }
            client.reply(from, 'El bot ha abandonado todos los grupos', id)
            break
        case '/clearall':
            if (!isOwner) return client.reply(from, 'Este comando solo puede ser utilizado por el creador del bot', id)
            const allChatz = await client.getAllChats()
            for (let dchat of allChatz) {
                await client.deleteChat(dchat.id)
            }
            client.reply(from, '¡Se borro todo el chat!', id)
            break
        case '/add':
            const orang = args[1]
            if (!isGroupMsg) return client.reply(from, 'Esta función solo se puede utilizar en grupos', id)
            if (args.length === 1) return client.reply(from, 'Para utilizar esta función, envía el comando */add 628xxxxx* con el prefijo y numero juntos sin el signo "+"', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando solo puede ser utilizado por  los administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando solo se puede usar cuando el bot se convierte en administrador', id)
            try {
                await client.addParticipant(from,`${orang}@c.us`)
            } catch {
                client.reply(from, mess.error.Ad, id)
            }
            break
        case '/creative':
            arg = body.trim().split('|')
            if (arg.length >= 4) {
                client.reply(from, mess.wait, id)
                const quotes = arg[1]
                const author = arg[2]
                const theme = arg[3]
                await creative(quotes, author, theme).then(amsu => {
                    client.sendFile(from, amsu, 'quotesmaker.jpg','Aqui lo tienes...').catch(() => {
                       client.reply(from, mess.error.Qm, id)
                    })
                })
            } else {
                client.reply(from, 'Usa: \n!creative |texto|Marga de agua|fonddo\n\nEx :\n!creative |Mi historia|bicit|random', id)
            }
            break
        case '/ban':
            if (!isGroupMsg) return client.reply(from, 'Esta función solo se puede utilizar en grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando solo puede ser utilizado por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando solo se puede usar cuando el bot se convierte en administrador', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este comando, envíe */ban* @miembro', id)
            await client.sendText(from, `╒━━━━━ [ *ʙᴀɴᴇᴀᴅᴏ* ] ━━━━━╕\n\n*Nombre:* ${mentionedJidList.join('\n')}\n\n╘━━━━━ [ *ʙᴀɴᴇᴀᴅᴏ* ] ━━━━━╛`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id)
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case '/leave':
            if (!isGroupMsg) return client.reply(from, 'Este comando solo se puede usar en grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando solo puede ser utilizado por administradores de grupo', id)
            await client.sendText(from,'*Adios a todos👋🏻*').then(() => client.leaveGroup(groupId))
            break
        case '/op':
            if (!isGroupMsg) return client.reply(from, 'Esta función solo se puede utilizar en grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Esta función solo puede ser utilizada por los administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Esta función solo se puede utilizar cuando el bot es un administrador', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Para utilizar esta función, envíe el comando */op @miembro*', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'Este comando solo se puede usar en un usuario a la vez.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'El usuario ya es administrador.', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `╒━━━ [ *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ* ] ━━━╕\n\n*Nombre:* @${mentionedJidList[0]} \n*Ahora es administrador*\n\n╘━━━ [ *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ* ] ━━━╛`)
            break
        case '/deop':
            if (!isGroupMsg) return client.reply(from, 'Esta función solo se puede utilizar en grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Esta función solo puede ser utilizada por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Esta función solo se puede utilizar cuando el bot es un administrador', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Para utilizar esta función, envíe un comando */deop @tagadmin*', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'Este comando solo se puede usar en un persona a la vez.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'El usuario no es un administrador.', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `╒━━━ [ *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ* ] ━━━╕\n\n*Nombre:* @${mentionedJidList[0]} \n*Ahora ya no es administrador*\n\n╘━━━ [ *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ* ] ━━━╛`)
            break
        case '/joindisable':
            if (args.length === 1) return client.reply(from, 'Enviar comando */join* grupo de enlaces\n\nEjemplo:\n/join https://chat.whatsapp.com/jajajajajajjajaa', id)
            const link = body.slice(6)
            const tGr = await client.getAllGroups()
            const minMem = 100
            const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
            const check = await client.inviteInfo(link)
            if (!isLink) return client.reply(from, '¿Es esto un enlace?', id)
            if (tGr.length > 50) return client.reply(from, '¡Lo siento, el número de grupos es máximo!', id)
            if (check.size < minMem) return client.reply(from, 'Los grupos que no tengan los 25 miembros, no podran ingresar al bot', id)
            if (check.status === 200) {
                await client.joinGroupViaLink(link).then(() => client.reply(from, 'Estoy entrando...\n*NOTA:* _No olvides colocar administrador._'))
            } else {
                client.reply(from, 'Enlace de grupo no válido (Puede que el bot haya sido eliminado anteriormente)', id)
            }
            break
        case '/delete':
            if (!isGroupMsg) return client.reply(from, 'Esta función solo se puede utilizar en grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Esta función solo puede ser utilizada por administradores de grupo', id)
            if (!quotedMsg) return client.reply(from, '¡¡Error !!, envía el comando */delete [MensajeDelBot]*', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, '¡¡Error !!, ¡los bots no pueden borrar los chats de otros miembros!', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case '/lyrics':
            if (args.length == 1) return client.reply(from, 'Envia el comando */lyrics* por ejemplo: */lyrics I like it*', id)
            const lagu = body.slice(7)
            const lirik = await lyrics(lagu)
            client.reply(from, lirik, id)
            break
        case '/listblock':
            let hih = `╒━━━ [ *ʙʟᴏǫᴜᴇᴀᴅᴏs* ] ━━━╕\n\nTotal : ${blockNumber.length}\n`
            for (let i of blockNumber) {
                hih += `➸ @${i.replace(/@c.us/g,'')}\n`
            }
            client.sendTextWithMentions(from, hih, id)
            break
        case '/randomhentai':
            if (isGroupMsg) {
                if (!isNsfw) return client.reply(from, 'El comando NSFW no esta activado en el grupo.', id)
                const hentai = await nsfwcomputer('hentai')
                if (hentai.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                client.sendFileFromUrl(from, hentai, `Hentai${ext}`, '¡Aqui tienes 7u7!', id)
                break
            } else {
                const hentai = await nsfwcomputer('hentai')
                if (hentai.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                client.sendFileFromUrl(from, hentai, `Hentai${ext}`, '¡Aqui tienes 7u7!', id)
            }
        case '/randomnsfwneko':
            if (isGroupMsg) {
                if (!isNsfw) return client.reply(from, 'El comando NSFW no esta activado en el grupo.', id)
                const nsfwneko = await randomNimek('nsfw')
                if (nsfwneko.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                client.sendFileFromUrl(from, nsfwneko, `nsfwNeko${ext}`, '¡Aqui tienes 7u7!', id)
            } else {
                const nsfwneko = await nsfwcomputer('nsfw')
                if (nsfwneko.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                client.sendFileFromUrl(from, nsfwneko, `nsfwNeko${ext}`, '¡Aqui tienes 7u7!', id)
            }
            break
        case '/meme':
            const response = await axios.get('https://meme-api.herokuapp.com/gimme/MemesEnEspanol');
            const { postlink, title, subreddit, url, nsfw, spoiler } = response.data
            await client.sendFileFromUrl(from, `${url}`, 'meme.jpg', `${title}`)
            break
        case '/admin':
            client.sendText(from, admin)
            break
        case '/help':
            client.sendText(from, help)
            break
        case '/info':
            client.sendLinkWithAutoPreview(from, '╭━━━━━━━━━━━━━━━━━━╮\n            *Información del bot*\n╰━━━━━━━━━━━━━━━━━━╯\n', info)
            break
        case '/snk':
            client.reply(from, snk, id)
            break
        case '/otros':
            client.reply(from, otros, id)
            break
        case '/sugerencias':
            client.reply(from, sugerencias, id)
            break
        case '/convertidores':
            client.reply(from, convertidores, id)
            break
        case '/ttsall':
            client.reply(from, ttsall, id)
            break
        case '/multiverso':
            client.reply(from, multiverso, id)
            break
		case '/historia':
            client.reply(from, historias, id)
            break
		case '/stickers':
            client.reply(from, stickers, id)
            break
        }
	} catch (err) {
        console.log(color('[ERROR]', 'red'), err)
        //client.kill().then(a => console.log(a))
	}

}