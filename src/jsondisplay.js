let es = null;
let running = false;

(function loadBackground() {
  const img = new Image();
  img.src = "imgs/bg.png";

  img.onload = () => {
    document.body.style.backgroundImage = `url(${img.src})`;
  };

  img.onerror = () => {
    document.body.style.background = "#000";
  };
})();

function highlight(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      if (/^"/.test(m) && /:$/.test(m)) return `<span class="jk">${m}</span>`;
        if (/^"/.test(m)) return `<span class="js">${m}</span>`;
          if (/true|false/.test(m)) return `<span class="jb">${m}</span>`;
          if (/null/.test(m)) return `<span class="jz">${m}</span>`;
          return `<span class="jn">${m}</span>`;
        }
        );
}

async function showJson(raw) {
  const el = document.getElementById('json-content');
  el.classList.remove('placeholder');

  try {
    const parsed = JSON.parse(raw);

    //if (window.processStats) {
      //const processed = window.processStats(parsed);
      //el.innerHTML = highlight(processed);
    //} else {
      el.innerHTML = highlight(parsed);
    //}
  } catch {
    el.textContent = raw;
  }
}

function setBtn(state) {
  const btn = document.getElementById('connect-btn');
  btn.className = state;
  btn.textContent =
    state === 'active' ? 'Restart' :
    state === 'error'  ? 'Retry' :
    'Connect';
}

async function listen() {
  const port = document.getElementById('port-input').value || 2145;

  if (es) {
    es.close();
    es = null;
  }

  while (true) {
    await new Promise((resolve) => {
      es = new EventSource(`http://localhost:${port}`);
      setBtn('active');
      es.onmessage = async (e) => {
        es.close();
        showJson(e.data);
        const jsonStats = JSON.parse(e.data);
        await fetchAndWrite(jsonStats);
        resolve();
      };
      es.onerror = () => {
        es.close();
        setBtn('error');
      };
    });
  }
}

function toggle() {
  if (running) {
    running = false;
    if (es) es.close();
    setBtn('');
  } else {
    running = true;
    listen();
  }
}
