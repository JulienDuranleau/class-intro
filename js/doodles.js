// Based on Google's Quick Draw sketch data
// https://github.com/googlecreativelab/quickdraw-dataset

const DEFAULT_NEW_DRAWING_INTERVAL = 2000
const DRAW_SPEED = 100 //ms
const SCALE = 0.3
const EXTRA_EMPTY_SPACE = 150
const DRAWING_FILES = 'airplane,bycicle,calculator,camera,cat,computer,crayon,dragon,eye,guitar,headphones,map,paint-can,paintbrush,television'.split(',')

const canvas = document.createElement("canvas")
canvas.style.position = "absolute"
canvas.style.top = "0px"
canvas.style.left = "0px"
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext("2d")

function init_doodling(new_doodles_speed = null) {
    new_doodles_speed = new_doodles_speed || DEFAULT_NEW_DRAWING_INTERVAL
    load_drawings(DRAWING_FILES).then(drawings => {
        setInterval(() => start_new_random_drawing(drawings), new_doodles_speed)
        setInterval(() => ctx.clearRect(0,0,canvas.width,canvas.height), new_doodles_speed * 200)
    })

    window.addEventListener('resize', (e) => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx.clearRect(0,0,canvas.width,canvas.height)
    })

    document.body.appendChild(canvas)
}

function load_drawings(files) {
    const promises = files.map(file_name => {
        return fetch(`drawings/${file_name}.ndjson`)
            .then(resp => resp.text())
            .then(data => data.split("\n"))
    })

    return Promise.all(promises).then(data => data.flat())
}

function start_new_random_drawing(drawings) {
    const drawing = JSON.parse(drawings[Math.floor(Math.random() * drawings.length)]).drawing

    const pos = get_random_drawing_pos()    
    run_draw_queue(drawing.slice(), pos)
}

function get_random_drawing_pos() {
    const tag = document.querySelector(".centered")

    const content_bouding_box = tag.getBoundingClientRect()
    const clear_box = {
        x: content_bouding_box.x - EXTRA_EMPTY_SPACE,
        y: content_bouding_box.y - EXTRA_EMPTY_SPACE,
        width: content_bouding_box.width + EXTRA_EMPTY_SPACE * 2,
        height: content_bouding_box.height + EXTRA_EMPTY_SPACE * 2,
    }

    const pos = {
        x: -50 + Math.floor(Math.random() * canvas.width),
        y: -50 + Math.floor(Math.random() * canvas.height),
    }

    if (
        (pos.x > clear_box.x && 
        pos.x < clear_box.x + clear_box.width) && 
        (pos.y > clear_box.y &&
        pos.y < clear_box.y + clear_box.height)
    ) {
        return get_random_drawing_pos()
    } else {
        return pos
    }
}

function run_draw_queue(queue, pos) {
    if (queue.length === 0) return

    ctx.strokeStyle = "#999"
    ctx.lineWidth = 2;

    const stroke = queue[0]
    const n_points = stroke[0].length

    for (let i = 1; i < n_points; i++) {
        setTimeout(() => {
            ctx.beginPath()
            ctx.moveTo(pos.x + stroke[0][i - 1] * SCALE, pos.y + stroke[1][i - 1] * SCALE)
            ctx.lineTo(pos.x + stroke[0][i] * SCALE, pos.y + stroke[1][i] * SCALE)
            ctx.stroke()

            if (i == n_points - 1) {
                queue.shift()
                run_draw_queue(queue, pos)
            }
        }, DRAW_SPEED * i)
    }
}