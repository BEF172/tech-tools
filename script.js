const tools = {
    "massgravel": "https://github.com/massgravel/Microsoft-Activation-Scripts",
    "install-runtimes": "https://github.com/BEF172/Install-Runtimes",
    "sophia": "https://github.com/Sophia-Community/SophiApp",
    "winscript": "https://github.com/flick9000/winscript",
    "winhance": "https://github.com/memstechtips/Winhance",
    "christitus": "https://github.com/ChrisTitusTech/winutil",
    "thisiswin11": "https://github.com/builtbybel/ThisIsWin11",
    "bleachbit": "https://www.bleachbit.org/",
    "bcuninstaller": "https://www.kcsoftwares.com/?q=bcuninstaller",
    "snappy": "https://sdi-tool.org/",
    "windirstat": "https://windirstat.net/",
    "wiztree": "https://diskanalyzer.com/",
    "crystaldiskinfo": "https://crystalmark.info/en/software/crystaldiskinfo/",
    "occt": "https://www.ocbase.com/",
    "sysinternals": "https://learn.microsoft.com/en-us/sysinternals/downloads/",
    "parkcontrol": "https://bitsum.com/parkcontrol/",
    "islc": "https://www.wagnardsoft.com/forums/viewtopic.php?t=12009",
    "unigetui": "https://marticliment.com/unigetui/"
};

const commands = ["music", "add", "play", "pause", "stop", "next", "prev", "shuffle", "loop", "queue", "clear", "volume", "help"];

let queue = [];
let currentIndex = -1;
let isPlaying = false;
let shuffleOn = false;
let loopOn = false;
let player = null;
let playerReady = false;

function createPlayer(callback) {
    if (player && playerReady) {
        callback();
        return;
    }
    if (!ytAPIReady) {
        print("Cargando API de YouTube...", "info-text");
        var check = setInterval(function() {
            if (ytAPIReady) {
                clearInterval(check);
                doCreatePlayer(callback);
            }
        }, 100);
        return;
    }
    doCreatePlayer(callback);
}

function doCreatePlayer(callback) {
    player = new YT.Player("ytPlayer", {
        height: "225",
        width: "400",
        playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1
        },
        events: {
            onReady: function() {
                playerReady = true;
                callback();
            },
            onStateChange: function(event) {
                if (typeof window.onYTStateChange === "function") {
                    window.onYTStateChange(event);
                }
            }
        }
    });
}

window.onYTStateChange = function(event) {
    if (event.data === YT.PlayerState.ENDED) {
        if (loopOn) {
            player.seekTo(0);
            player.playVideo();
        } else {
            playNext();
        }
    }
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById("playBtn").textContent = "⏸";
        updateProgress();
    }
    if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById("playBtn").textContent = "▶";
    }
};

function updateProgress() {
    if (player && playerReady) {
        try {
            const dur = player.getDuration();
            if (dur > 0) {
                const pct = (player.getCurrentTime() / dur) * 100;
                document.getElementById("progress").style.width = pct + "%";
            }
        } catch(e) {}
    }
    if (isPlaying) requestAnimationFrame(updateProgress);
}

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function scrollToBottom() {
    const c = document.getElementById("console");
    c.scrollTop = c.scrollHeight;
}

function print(text, cls = "") {
    const out = document.getElementById("output");
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.textContent = text;
    out.appendChild(p);
    scrollToBottom();
}

function playVideoById(id, title) {
    createPlayer(function() {
        player.loadVideoById(id);
        document.getElementById("ytPlayerWrapper").style.display = "block";
        document.getElementById("playerUI").style.display = "block";
        document.getElementById("trackTitle").textContent = title || id;
        print("▶ Reproduciendo: " + (title || id), "success-text");
    });
}

function playNext() {
    if (queue.length === 0) return;
    if (shuffleOn) {
        currentIndex = Math.floor(Math.random() * queue.length);
    } else {
        currentIndex++;
        if (currentIndex >= queue.length) {
            if (loopOn) {
                currentIndex = 0;
            } else {
                isPlaying = false;
                document.getElementById("playBtn").textContent = "▶";
                return;
            }
        }
    }
    const track = queue[currentIndex];
    playVideoById(track.id, track.title);
    updateQueue();
}

function playPrev() {
    if (queue.length === 0) return;
    currentIndex -= 2;
    if (currentIndex < -1) currentIndex = -1;
    playNext();
}

function addToQueue(id, title) {
    queue.push({ id, title: title || id });
    print("Agregado a la cola: " + (title || id), "info-text");
    updateQueue();
}

function updateQueue() {
    const section = document.getElementById("queueSection");
    const list = document.getElementById("queueList");
    if (queue.length === 0) {
        section.style.display = "none";
        return;
    }
    section.style.display = "block";
    list.innerHTML = "";
    queue.forEach((t, i) => {
        const div = document.createElement("div");
        div.className = "queue-item" + (i === currentIndex ? " active" : "");
        div.textContent = (i + 1) + ". " + t.title;
        div.addEventListener("click", () => {
            currentIndex = i - 1;
            playNext();
        });
        list.appendChild(div);
    });
}

function handleCommand(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    print("PS C:\\Users\\Administrator> " + trimmed);

    const parts = trimmed.match(/^(\S+)\s*(.*)?$/);
    const command = parts ? parts[1].toLowerCase() : "";
    const args = parts ? (parts[2] || "").trim() : "";

    const toolVal = command.replace(/[\s-_]/g, "");
    if (tools[toolVal]) {
        window.open(tools[toolVal], "_blank");
        return;
    }

    if (command === "help") {
        print("Comandos disponibles:", "info-text");
        print('  music "url"       - Reproduce un video de YouTube');
        print('  add "url"         - Agrega a la cola de reproducción');
        print("  play              - Reanuda la reproducción");
        print("  pause             - Pausa la reproducción");
        print("  stop              - Detiene la reproducción");
        print("  next              - Siguiente canción");
        print("  prev              - Canción anterior");
        print("  shuffle           - Activa/desactiva aleatorio");
        print("  loop              - Activa/desactiva repetir");
        print("  queue             - Muestra la cola de reproducción");
        print("  clear             - Limpia la pantalla");
        print("  volume [0-100]    - Ajusta el volumen");
        print("  help              - Muestra esta ayuda");
    }
    else if (command === "music") {
        const urlMatch = args.match(/https?:\/\/[^\s"]+/);
        if (urlMatch) {
            const videoId = extractVideoId(urlMatch[0]);
            if (videoId) {
                queue = [];
                currentIndex = -1;
                playVideoById(videoId, videoId);
            } else {
                print("URL no válida de YouTube.", "error-text");
            }
        } else {
            print('Uso: music "https://youtube.com/watch?v=..."', "info-text");
        }
    }
    else if (command === "add") {
        const urlMatch = args.match(/https?:\/\/[^\s"]+/);
        if (urlMatch) {
            const videoId = extractVideoId(urlMatch[0]);
            if (videoId) {
                addToQueue(videoId, videoId);
            } else {
                print("URL no válida de YouTube.", "error-text");
            }
        } else {
            print('Uso: add "https://youtube.com/watch?v=..."', "info-text");
        }
    }
    else if (command === "play") {
        if (queue.length > 0 && currentIndex === -1) {
            playNext();
        } else if (player && playerReady) {
            player.playVideo();
        }
    }
    else if (command === "pause") {
        if (player && playerReady) player.pauseVideo();
    }
    else if (command === "stop") {
        if (player && playerReady) player.stopVideo();
        isPlaying = false;
        document.getElementById("playBtn").textContent = "▶";
        document.getElementById("ytPlayerWrapper").style.display = "none";
        document.getElementById("playerUI").style.display = "none";
    }
    else if (command === "next") {
        playNext();
    }
    else if (command === "prev") {
        playPrev();
    }
    else if (command === "shuffle") {
        shuffleOn = !shuffleOn;
        document.getElementById("shuffleBtn").classList.toggle("active", shuffleOn);
        print("Shuffle: " + (shuffleOn ? "ON" : "OFF"), "info-text");
    }
    else if (command === "loop") {
        loopOn = !loopOn;
        document.getElementById("loopBtn").classList.toggle("active", loopOn);
        print("Loop: " + (loopOn ? "ON" : "OFF"), "info-text");
    }
    else if (command === "queue") {
        if (queue.length === 0) {
            print("La cola está vacía.", "info-text");
        } else {
            queue.forEach((t, i) => {
                const prefix = i === currentIndex ? "▶ " : "  ";
                print(prefix + (i + 1) + ". " + t.title);
            });
        }
    }
    else if (command === "clear") {
        document.getElementById("output").innerHTML = "";
    }
    else if (command === "volume") {
        const vol = parseInt(args);
        if (!isNaN(vol) && vol >= 0 && vol <= 100) {
            if (player && playerReady) player.setVolume(vol);
            document.getElementById("volumeSlider").value = vol;
            print("Volumen: " + vol + "%", "info-text");
        } else {
            print("Uso: volume [0-100]", "info-text");
        }
    }
    else {
        print("Comando no reconocido: " + command, "error-text");
    }
}

// Controls
document.getElementById("playBtn").addEventListener("click", () => {
    if (!player || !playerReady) return;
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
});

document.getElementById("nextBtn").addEventListener("click", playNext);
document.getElementById("prevBtn").addEventListener("click", playPrev);

document.getElementById("shuffleBtn").addEventListener("click", () => {
    shuffleOn = !shuffleOn;
    document.getElementById("shuffleBtn").classList.toggle("active", shuffleOn);
});

document.getElementById("loopBtn").addEventListener("click", () => {
    loopOn = !loopOn;
    document.getElementById("loopBtn").classList.toggle("active", loopOn);
});

document.getElementById("volumeSlider").addEventListener("input", (e) => {
    if (player && playerReady) player.setVolume(e.target.value);
});

// Input autocomplete
const input = document.getElementById("cmdInput");
const ac = document.getElementById("autocomplete");
let selected = -1;

function showMatches(query) {
    ac.innerHTML = "";
    selected = -1;
    if (!query) { ac.style.display = "none"; return; }
    const allOptions = [...Object.keys(tools), ...commands];
    const matches = allOptions.filter(k => k.includes(query.toLowerCase()));
    if (matches.length === 0) { ac.style.display = "none"; return; }
    matches.slice(0, 10).forEach((m) => {
        const div = document.createElement("div");
        div.className = "ac-item";
        div.textContent = m;
        div.addEventListener("click", () => {
            if (tools[m]) {
                window.open(tools[m], "_blank");
                input.value = "";
            } else {
                input.value = m + " ";
            }
            ac.style.display = "none";
            input.focus();
        });
        ac.appendChild(div);
    });
    ac.style.display = "block";
}

input.addEventListener("input", () => {
    const val = input.value.split(" ")[0];
    showMatches(val);
});

input.addEventListener("keydown", function(e) {
    const items = ac.querySelectorAll(".ac-item");
    if (e.key === "ArrowDown") {
        e.preventDefault();
        selected = Math.min(selected + 1, items.length - 1);
        items.forEach((el, i) => el.classList.toggle("active", i === selected));
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selected = Math.max(selected - 1, 0);
        items.forEach((el, i) => el.classList.toggle("active", i === selected));
    } else if (e.key === "Enter") {
        if (selected >= 0 && items[selected]) {
            items[selected].click();
        } else {
            handleCommand(this.value);
            this.value = "";
            ac.style.display = "none";
        }
    } else if (e.key === "Escape") {
        ac.style.display = "none";
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".input-wrapper")) ac.style.display = "none";
});
