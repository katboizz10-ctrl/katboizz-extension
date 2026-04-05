(function (Scratch) {
  'use strict';

  class miniwindow {
  getInfo() {
    return {
      id: 'Miniwindow',
      name: 'Mini window',
      blocks: [
        { opcode: 'open', blockType: Scratch.BlockType.COMMAND, text: 'Open Window' },
        { opcode: 'close', blockType: Scratch.BlockType.COMMAND, text: 'Close Window' },
        {
          opcode: 'replacetextwindow',
          blockType: Scratch.BlockType.COMMAND,
          text: 'change Text window content [TEXT]',
          arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'i love Turbowarp' } }
        },
        {
          opcode: 'changename',
          blockType: Scratch.BlockType.COMMAND,
          text: 'rename Window Name [NAME]',
          arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello' } }
        },
        {
          opcode: 'changecolor',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Change Window Color [COLOR]',
          arguments: { COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#333333' } }
        },
        {
          opcode: 'Opacity',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Change Window Opacity [OPACITY]',
          arguments: { OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.75 } }
        },
        {
          opcode: 'createbutton',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Create Button [BUTTONTEXT]',
          arguments: { BUTTONTEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Button' } }
        },
        {
          opcode:'changecolorheader',
          blockType: Scratch.BlockType.COMMAND,
          text: 'change color header window [COLOR]',
          arguments: { COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#444444' } }
        },
        {
          opcode:'changecolortext',
          blockType: Scratch.BlockType.COMMAND,
          text: 'change color text [COLOR]',
          arguments: { COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#ffffff' } }
        }
      ]
    };
  }

  open() {
    if (document.getElementById('window')) return;

    const win = document.createElement('div');
    win.id = 'window';
    win.style.cssText = `
      position: fixed;
      top: 80px;
      left: 80px;
      width: 320px;
      height: 220px;
      background: rgba(30,30,30,0.75);
      backdrop-filter: blur(6px);
      color: white;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      z-index: 500;
      font-family: sans-serif;
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.id = 'header';
    header.textContent = 'Window';
    header.style.cssText = `
      height: 28px;
      background: rgba(50,50,50,0.8);
      cursor: move;
      padding: 6px;
      user-select: none;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
      float:right;
      background:#ff4444;
      color:white;
      border:none;
      border-radius:6px;
      padding:4px 8px;
      cursor:pointer;
    `;
    closeBtn.onclick = () => win.remove();
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.id = 'content';
    content.innerHTML = 'hello world!';
    content.style.cssText = `
      padding:8px;
      height: calc(100% - 28px);
      overflow: auto;
    `;

    // Resize handle
    const resize = document.createElement('div');
    resize.style.cssText = `
      position:absolute;
      right:0;
      bottom:0;
      width:14px;
      height:14px;
      cursor:nwse-resize;
      background:rgba(255,255,255,0.4);
    `;

    win.append(header, content, resize);
    document.body.appendChild(win);

    // Drag
    let dx, dy, dragging = false;
    header.addEventListener('mousedown', e => {
      dragging = true;
      dx = e.clientX - win.offsetLeft;
      dy = e.clientY - win.offsetTop;
    });

    // Resize
    let resizing = false, rw, rh, rx, ry;
    resize.addEventListener('mousedown', e => {
      e.stopPropagation();
      resizing = true;
      rw = win.offsetWidth;
      rh = win.offsetHeight;
      rx = e.clientX;
      ry = e.clientY;
    });

    document.addEventListener('mousemove', e => {
      if (dragging) {
        win.style.left = e.clientX - dx + 'px';
        win.style.top = e.clientY - dy + 'px';
      }
      if (resizing) {
        win.style.width = rw + (e.clientX - rx) + 'px';
        win.style.height = rh + (e.clientY - ry) + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
      resizing = false;
    });
  }

  close() { document.getElementById('window')?.remove(); }

  replacetextwindow(args) {
  const content = document.getElementById('content');
  if (content)
    content.innerHTML = args.TEXT;
  }

  changename(args) {
    document.getElementById('header').childNodes[0].textContent = args.NAME;
  }

  changecolor(args) {
    const win = document.getElementById('window');
    if (win) win.style.background = args.COLOR;
  }

  Opacity(args) {
    const win = document.getElementById('window');
    if (win) win.style.opacity = args.OPACITY;
  }

  createbutton(args) {
    const content = document.getElementById('content');
    if (!content) return;
    const btn = document.createElement('button');
    btn.textContent = args.BUTTONTEXT;
    btn.style.margin = '6px';
    content.appendChild(btn);
  }

  changecolorheader(args) {
    const h = document.getElementById('header');
    if (h) h.style.background = args.COLOR;
  }

  changecolortext(args) {
    const win = document.getElementById('window');
    if (win) win.style.color = args.COLOR;
  }
}

Scratch.extensions.register(new miniwindow());

})(Scratch);