const tools = {
    "massgravel": "https://github.com/massgravel/Microsoft-Activation-Scripts",
    "install-runtimes": "https://github.com/BEF172/Install-Runtimes",
    "sophia": "https://github.com/Sophia-Community/SophiApp",
    "winscript": "https://github.com/flick9000/winscript",
    "winhance": "https://github.com/memstechtips/Winhance",
    "christitus": "https://github.com/ChrisTitusTech/winutil",
    "thisiswin11": "https://github.com/builtbybel/ThisIsWin11",
    "bleachbit": "https://github.com/bleachbit/bleachbit",
    "bcuninstaller": "https://github.com/BCUninstaller/Bulk-Crap-Uninstaller",
    "snappy": "https://github.com/gtumanyan/SDI",
    "legacyupdate": "https://legacyupdate.net/",
    "intel": "https://www.intel.com/content/www/us/en/download-center/home.html",
    "nvidia": "https://www.nvidia.com/Download/index.aspx",
    "amd": "https://www.amd.com/en/support",
    "frankendriver": "https://github.com/arutar/FrankenDriver",
    "nvidia-patcher": "https://github.com/dartraiden/NVIDIA-patcher",
    "nvcleanstall": "https://github.com/NVCleanstall/NVCleanstall",
    "windirstat": "https://github.com/windirstat/windirstat",
    "crystaldiskinfo": "https://github.com/hiyohiyo/CrystalDiskInfo",
    "occt": "https://www.ocbase.com/",
    "librehardwaremonitor": "https://github.com/LibreHardwareMonitor/LibreHardwareMonitor",
    "xstat": "https://github.com/Inside4ndroid/XStat-Hardware-Monitoring",
    "winfan": "https://github.com/ivxnszn/Winfan",
    "cpu-z": "https://www.cpuid.com/softwares/cpu-z.html",
    "cpuz": "https://www.cpuid.com/softwares/cpu-z.html",
    "gpu-z": "https://www.techpowerup.com/gpuz/",
    "gpuz": "https://www.techpowerup.com/gpuz/",
    "sysinternals": "https://learn.microsoft.com/en-us/sysinternals/downloads/",
    "parkcontrol": "https://bitsum.com/parkcontrol/",
    "islc": "https://www.wagnardsoft.com/forums/viewtopic.php?t=12009",
    "unigetui": "https://github.com/marticliment/UniGetUI",
    "hirens": "https://www.hirensbootcd.org/",
    "medicat": "https://github.com/mon5termatt/medicat_installer",
    "ventoy": "https://github.com/ventoy/Ventoy",
    "rufus": "https://github.com/pbatard/rufus",
    "uupdump": "https://uupdump.net/",
    "uup": "https://uupdump.net/"
};

const commands = ["music", "add", "play", "pause", "stop", "next", "prev", "shuffle", "loop", "queue", "clear", "cls", "volume", "help"];

let queue = [];
let currentIndex = -1;
let isPlaying = false;
let shuffleOn = false;
let loopOn = false;

function waitForPlayer(callback) {
    if (window._ytPlayerReady) {
        callback();
        return;
    }
    print("Cargando YouTube...", "info-text");
    window._onPlayerReadyCallback = callback;
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
    if (window.player && window._ytPlayerReady) {
        try {
            var dur = window.player.getDuration();
            var cur = window.player.getCurrentTime();
            if (dur > 0) {
                var slider = document.getElementById("seekSlider");
                var ct = document.getElementById("currentTime");
                var durEl = document.getElementById("duration");
                if (slider && !slider.dragging) {
                    slider.value = (cur / dur) * 100;
                }
                if (ct) ct.textContent = formatTime(cur);
                if (durEl) durEl.textContent = formatTime(dur);
            }
        } catch(e) {}
    }
    if (isPlaying) requestAnimationFrame(updateProgress);
}

function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
}

(function() {
    var slider = document.getElementById("seekSlider");
    if (!slider) return;
    slider.dragging = false;
    slider.addEventListener("input", function() {
        slider.dragging = true;
    });
    slider.addEventListener("change", function() {
        var p = window.player;
        if (!p || !window._ytPlayerReady) { slider.dragging = false; return; }
        var dur = p.getDuration();
        if (dur > 0) {
            p.seekTo((slider.value / 100) * dur, true);
        }
        slider.dragging = false;
    });
})();

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

function fetchTitle(videoId) {
    return new Promise(function(resolve) {
        fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId + "&format=json")
            .then(function(r) { return r.json(); })
            .then(function(data) { resolve(data.title || videoId); })
            .catch(function() { resolve(videoId); });
    });
}

function playVideoById(id, title) {
    waitForPlayer(function() {
        player.loadVideoById(id);
        document.getElementById("playerUI").style.display = "block";
        if (title && title !== id) {
            document.getElementById("trackTitle").textContent = title;
            print("▶ Reproduciendo: " + title, "success-text");
        } else {
            document.getElementById("trackTitle").textContent = "Cargando...";
            fetchTitle(id).then(function(realTitle) {
                document.getElementById("trackTitle").textContent = realTitle;
                var track = queue[currentIndex];
                if (track) track.title = realTitle;
                updateQueue();
            });
            print("▶ Reproduciendo: " + id, "success-text");
        }
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
    queue.push({ id: id, title: title || id });
    print("Agregado a la cola: " + (title || id), "info-text");
    if (!title || title === id) {
        fetchTitle(id).then(function(realTitle) {
            queue[queue.length - 1].title = realTitle;
            updateQueue();
        });
    }
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
        print("  clear / cls       - Limpia la pantalla");
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
                fetchTitle(videoId).then(function(title) {
                    playVideoById(videoId, title);
                });
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
                fetchTitle(videoId).then(function(title) {
                    addToQueue(videoId, title);
                });
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
        } else if (player && window._ytPlayerReady) {
            player.playVideo();
        }
    }
    else if (command === "pause") {
        if (player && window._ytPlayerReady) player.pauseVideo();
    }
    else if (command === "stop") {
        if (player && window._ytPlayerReady) player.stopVideo();
        isPlaying = false;
        document.getElementById("playBtn").textContent = "▶";
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
    else if (command === "clear" || command === "cls") {
        document.getElementById("output").innerHTML = "";
    }
    else if (command === "volume") {
        const vol = parseInt(args);
        if (!isNaN(vol) && vol >= 0 && vol <= 100) {
            if (player && window._ytPlayerReady) player.setVolume(vol);
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
    if (!player || !window._ytPlayerReady) return;
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
    if (player && window._ytPlayerReady) player.setVolume(e.target.value);
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

// YouTube IFrame API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            disablekb: 1,
        },
        events: {
            onReady: function() {
                window._ytPlayerReady = true;
                player.setVolume(100);
                console.log("YouTube Player Ready");
                if (window._onPlayerReadyCallback) window._onPlayerReadyCallback();
            },
            onStateChange: function(event) {
                if (typeof window.onYTStateChange === "function") {
                    window.onYTStateChange(event);
                }
            }
        }
    });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// Taskbar clock
function updateClock() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var d = now.getDate();
    var mo = now.getMonth() + 1;
    var y = now.getFullYear();
    var period = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    document.getElementById('taskbarClock').innerHTML =
        (h12 < 10 ? '0' : '') + h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + period + '<br>' +
        (d < 10 ? '0' : '') + d + '/' + (mo < 10 ? '0' : '') + mo + '/' + y;
}
updateClock();
setInterval(updateClock, 10000);

// Draggable + Resizable window (desktop only)
(function() {
    if (window.innerWidth <= 600) return;
    var win = document.querySelector('.powershellcontainer');
    var titleBar = document.querySelector('.title-bar');
    var isDragging = false, isResizing = false;
    var startX, startY, startLeft, startTop, startW, startH;
    var resizeDir = '';

    titleBar.addEventListener('mousedown', function(e) {
        if (e.target.closest('.win-btn')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        var rect = win.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        win.style.transform = 'none';
        win.style.left = startLeft + 'px';
        win.style.top = startTop + 'px';
        win.style.borderRadius = '8px 8px 0 0';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            win.style.left = (startLeft + e.clientX - startX) + 'px';
            win.style.top = (startTop + e.clientY - startY) + 'px';
        }
        if (isResizing) {
            if (resizeDir.includes('e')) win.style.width = Math.max(400, startW + e.clientX - startX) + 'px';
            if (resizeDir.includes('s')) win.style.height = Math.max(300, startH + e.clientY - startY) + 'px';
            if (resizeDir.includes('w')) {
                var newW = Math.max(400, startW - e.clientX + startX);
                win.style.width = newW + 'px';
                win.style.left = (startLeft + startW - newW) + 'px';
            }
            if (resizeDir.includes('n')) {
                var newH = Math.max(300, startH - e.clientY + startY);
                win.style.height = newH + 'px';
                win.style.top = (startTop + startH - newH) + 'px';
            }
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        isResizing = false;
        resizeDir = '';
    });

    var handles = ['n','s','e','w','ne','nw','se','sw'];
    handles.forEach(function(dir) {
        var h = document.createElement('div');
        h.className = 'resize-handle resize-' + dir;
        h.setAttribute('data-dir', dir);
        win.appendChild(h);
    });

    win.querySelectorAll('.resize-handle').forEach(function(h) {
        h.addEventListener('mousedown', function(e) {
            isResizing = true;
            resizeDir = h.getAttribute('data-dir');
            startX = e.clientX;
            startY = e.clientY;
            var rect = win.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            startW = rect.width;
            startH = rect.height;
            e.preventDefault();
            e.stopPropagation();
        });
    });
})();
