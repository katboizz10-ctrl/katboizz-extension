(function (Scratch) {
  'use strict';

function shutdownOS() {
  if (!OS.desktop) return;

  
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:absolute;left:0;top:0;width:100%;height:100%;' +
    'background:#0a1f44;display:flex;justify-content:center;' +
    'align-items:center;color:white;font-size:48px;opacity:1;' +
    'transition: background 5s, opacity 5s;';

  overlay.textContent = 'Shutting down… 🪟';
  OS.desktop.appendChild(overlay);

  
  overlay.animate([
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration: 5000,
    easing: 'ease-in-out',
    fill: 'forwards'
  });

  
  setTimeout(() => {
    overlay.style.background = 'black';
    OS.desktop.style.transition = 'opacity 5s';
    OS.desktop.style.opacity = '0';
  }, 0);

  
  setTimeout(() => {
    if (OS.desktop) {
      OS.desktop.remove();
      OS.desktop = null;
      OS.taskbar = null;
      OS.startMenu = null;
      OS.windows = {};
      OS.z = 100;
    }
  }, 5000);
}



/* ================= CORE ================= */
const OS = {
  desktop: null,
  taskbar: null,
  startMenu: null,
  windows: {},
  z: 100
};

function getStage() {
  const canvas = document.querySelector('canvas');
  return canvas ? canvas.parentElement : document.body;
}

/* ================= BOOT ================= */
function bootOS() {
  if (OS.desktop) return;

  const stage = getStage();

  const boot = document.createElement('div');
 boot.style.cssText =
  'position:absolute;left:0;top:0;width:100%;height:100%;' +
  'background:#0a1f44;color:white;display:flex;' +
  'flex-direction:column;justify-content:center;align-items:center;' +
  'font-family:Segoe UI,sans-serif;z-index:9999;';


  boot.innerHTML = `
    <div style="font-size:48px">🪟</div>
    <div style="margin-top:10px">Windows 11</div>
    <div style="width:160px;height:6px;background:#1c3d6e;
      border-radius:4px;overflow:hidden;margin-top:14px">
      <div id="bar" style="width:0;height:100%;
        background:#4da3ff;transition:1.2s"></div>
    </div>
  `;

  stage.appendChild(boot);
  setTimeout(() => boot.querySelector('#bar').style.width = '100%', 50);

  setTimeout(() => {
    boot.remove();
    createDesktop();
  }, 1400);
}

/* ================= DESKTOP ================= */
function createDesktop() {
  const stage = getStage();

  const desktop = document.createElement('div');
  desktop.style.cssText =
  'position:absolute;left:0;top:0;width:100%;height:100%;' +
  'background:linear-gradient(135deg,#2b6cff,#6bb7ff);' +
  'font-family:Segoe UI,sans-serif;overflow:hidden;';


  stage.appendChild(desktop);

  const taskbar = document.createElement('div');
  taskbar.style.cssText =
    'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);' +
    'height:42px;background:rgba(30,30,30,.9);border-radius:14px;' +
    'display:flex;align-items:center;gap:6px;padding:6px 10px;';

  desktop.appendChild(taskbar);

  const startBtn = document.createElement('button');
  startBtn.textContent = '🪟';
  startBtn.style.cssText =
    'font-size:18px;background:none;border:none;color:white;' +
    'cursor:pointer;padding:6px 10px;border-radius:8px;';
  taskbar.appendChild(startBtn);

  OS.desktop = desktop;
  OS.taskbar = taskbar;

  createStartMenu(startBtn);
  createIcon('notepad', 'Notepad', 40, 40);
  createIcon('about', 'About', 40, 120);
}

/* ================= START MENU ================= */
function createStartMenu(startBtn) {
  const apps = [
    { id: 'notepad', name: 'Notepad', icon: '📝' },
    { id: 'about', name: 'About', icon: 'ℹ️' }
  ];

  const menu = document.createElement('div');
  menu.style.cssText =
    'position:absolute;bottom:60px;left:50%;transform:translateX(-50%) scale(.95);' +
    'width:300px;background:#1e1e1e;color:white;' +
    'border-radius:16px;padding:12px;display:none;' +
    'box-shadow:0 20px 40px rgba(0,0,0,.6);' +
    'transition:.15s;opacity:0;';

  OS.desktop.appendChild(menu);
  OS.startMenu = menu;

  const search = document.createElement('input');
  search.placeholder = 'Search apps';
  search.style.cssText =
    'width:100%;padding:8px 10px;border-radius:10px;' +
    'border:none;outline:none;background:#2a2a2a;color:white;';
  menu.appendChild(search);

  const grid = document.createElement('div');
  grid.style.cssText =
    'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;';
  menu.appendChild(grid);

  function render(q = '') {
    grid.innerHTML = '';
    apps
      .filter(a => a.name.toLowerCase().includes(q.toLowerCase()))
      .forEach(a => {
        const d = document.createElement('div');
        d.style.cssText =
          'text-align:center;padding:6px;border-radius:10px;' +
          'cursor:pointer;font-size:12px;';
        d.innerHTML =
          `<div style="font-size:20px">${a.icon}</div>${a.name}`;
        d.onmouseenter = () => d.style.background = '#333';
        d.onmouseleave = () => d.style.background = 'transparent';
        d.onclick = () => {
          openApp(a.id);
          hide();
        };
        grid.appendChild(d);
      });
  }

  render();
  search.oninput = () => render(search.value);

  function show() {
    menu.style.display = 'block';
    search.value = '';
    render();
    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'translateX(-50%) scale(1)';
      search.focus();
    });
  }

  function hide() {
    menu.style.opacity = '0';
    menu.style.transform = 'translateX(-50%) scale(.95)';
    setTimeout(() => menu.style.display = 'none', 150);
  }

  startBtn.onclick = e => {
    e.stopPropagation();
    menu.style.display === 'none' ? show() : hide();
  };

  document.addEventListener('mousedown', e => {
    if (!menu.contains(e.target) && e.target !== startBtn) hide();
  });
}

/* ================= ICON ================= */
function createIcon(id, name, x, y) {
  const icon = document.createElement('div');
  icon.style.cssText =
    `position:absolute;left:${x}px;top:${y}px;width:72px;` +
    'text-align:center;color:white;cursor:pointer;user-select:none;';
  icon.innerHTML = `📄<br>${name}`;

  let c = 0;
  icon.onclick = () => {
    c++;
    setTimeout(() => c = 0, 300);
    if (c === 2) openApp(id);
  };

  OS.desktop.appendChild(icon);
}

/* ================= WINDOW ================= */
function openApp(id) {
  if (OS.windows[id]) {
    OS.windows[id].style.display = 'block';
    OS.windows[id].style.zIndex = ++OS.z;
    return;
  }

  let title = id;
  let html = '';

  if (id === 'notepad') {
    title = 'Notepad';
    html = '<textarea style="width:100%;height:100%;border:none;outline:none;"></textarea>';
  }

  if (id === 'about') {
    title = 'About';
    html = '<b>Windows 11 Fake OS</b><br>TurboWarp';
  }

  const win = document.createElement('div');
  win.style.cssText =
    'position:absolute;left:120px;top:80px;width:280px;height:180px;' +
    'background:white;border-radius:14px;overflow:hidden;' +
    'box-shadow:0 8px 20px rgba(0,0,0,.4);z-index:' + (++OS.z);

  const bar = document.createElement('div');
  bar.style.cssText =
    'height:32px;background:#f2f2f2;padding:6px;' +
    'cursor:move;font-weight:600;display:flex;align-items:center;justify-content:space-between;';
  bar.textContent = title;

  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'cursor:pointer;padding:0 6px;';
  bar.appendChild(closeBtn);

  const content = document.createElement('div');
  content.style.cssText = 'height:calc(100% - 32px);padding:8px;';
  content.innerHTML = html;

  const resize = document.createElement('div');
  resize.style.cssText =
    'position:absolute;right:0;bottom:0;width:14px;height:14px;' +
    'cursor:nwse-resize;';

  win.append(bar, content, resize);
  OS.desktop.appendChild(win);

  // ===== Drag logic =====
  let drag = false, dx = 0, dy = 0;

  bar.onmousedown = e => {
    drag = true;
    dx = e.clientX - win.offsetLeft;
    dy = e.clientY - win.offsetTop;
    win.style.zIndex = ++OS.z;
  };

  document.addEventListener('mousemove', e => {
    if (drag) {
      win.style.left = e.clientX - dx + 'px';
      win.style.top = e.clientY - dy + 'px';
    }
  });

  document.addEventListener('mouseup', () => drag = false);

  // ===== Resize logic =====
  resize.onmousedown = e => {
    e.stopPropagation();
    const rw = win.offsetWidth;
    const rh = win.offsetHeight;
    const rx = e.clientX;
    const ry = e.clientY;

    document.onmousemove = ev => {
      win.style.width = rw + (ev.clientX - rx) + 'px';
      win.style.height = rh + (ev.clientY - ry) + 'px';
    };

    document.onmouseup = () => document.onmousemove = null;
  };

  // ===== Close button =====
  closeBtn.onclick = () => {
    win.style.display = 'none';
  };

  OS.windows[id] = win;
}


/* ================= EXTENSION ================= */
class Windows11OS {
  getInfo() {
    return {
      id: 'windows11',
      name: 'Windows 11 OS',
      blocks: [
        {
          opcode: 'boot',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Boot Windows 11'
        },
        
        {  
          opcode: 'shutdown',
          blockType: Scratch.BlockType.COMMAND,
          text: 'shut down os'
        }
      ]
    };
  }
  boot() {
    bootOS();
  }

  shutdown(){
    shutdownOS();
  }
}

Scratch.extensions.register(new Windows11OS());

})(Scratch);