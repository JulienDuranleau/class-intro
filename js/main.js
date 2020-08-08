const $ = (s, p) => (p || document).querySelector(s)
const log = console.log.bind(console)

const tag_class_name = $('#class-name')
const tag_name = $('#name')
const status = $('#status')
const countdown = $('.countdown', status)

let update_time_interval = null

init()

window.addEventListener('hashchange', function() {
    init()
}, false);

function update_time(t) {
    const t_offset = Math.floor((t.getTime() - Date.now()) / 1000)

    if (t_offset >= 0) {
        status.classList.remove("now")
        const minutes = Math.floor(t_offset / 60)
        const seconds = t_offset % 60
        
        countdown.textContent = minutes > 60
            ? `60+ min`
            : `${minutes}m ${seconds}s`
    } else {
        status.classList.add("now")
    }
}

function init() {
    const [class_name, name, start_time, doodling, doodling_speed] = window.location.hash.substr(1).split("/")

    if (!class_name || !name || !start_time) {
        log("Erreur: Il manque des informations dans l'url (format: index.html#Nom du cours/Sous Titre/00h00/doodles/3000)")
        return
    }

    if (doodling) {
        init_doodling(doodling_speed || null)
    }

    // ================== Titles ===================
    tag_class_name.textContent = decodeURIComponent(class_name)
    tag_name.textContent = decodeURIComponent(name)

    // ================== Time =====================

    const [heure, minutes] = start_time.split("h")
    const t = new Date()
    t.setHours(heure)
    t.setMinutes(minutes)
    t.setSeconds(0)

    clearInterval(update_time_interval)
    update_time_interval = setInterval(() => update_time(t), 1000)
    update_time(t)
}
