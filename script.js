// 1. 在文件最开头定义版本号
const VERSION = "v1.2.0";

// 2. 在页面加载完成后注入版本号
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('appVersion').innerText = VERSION;
    
    // 同时在控制台打印一个酷炫的 Logo (可选)
    console.log(
        `%c BinHexConverter %c ${VERSION} %c`,
        "background:#007bff; padding: 1px; border-radius: 3px 0 0 3px; color: #fff",
        "background:#35495e; padding: 1px; border-radius: 0 3px 3px 0; color: #fff",
        "background:transparent"
    );
});

// ... 原有的代码保持不变 ...

let currentFile = null; // Store the currently loaded file object

// ================= File Loading Logic =================

// 1. Listen for changes on the native file input
document.getElementById('fileInput').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        setFile(this.files[0]);
    }
});

// 2. Drag and drop functionality
const dropZone = document.getElementById('dropZone');

// Prevent default behaviors (prevents browser from opening the file directly)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Toggle styles
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

// Handle drop release
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        setFile(files[0]);
    }
}

// Unified file setting and UI update
function setFile(file) {
    currentFile = file;
    document.getElementById("fileName").innerText = "Selected: " + file.name;
    // Clear input to ensure the same file can trigger change event again
    document.getElementById('fileInput').value = ''; 
}

// ================= BIN -> HEX =================
async function binToHex() {
    if (!currentFile) {
        alert("Please select a file first (Click button or Drag & Drop)");
        return;
    }

    try {
        const buffer = await currentFile.arrayBuffer();
        let data = new Uint8Array(buffer);

        // Auto trim tail padding
        const lineSize = 16;
        let tailByte = null;
        let tailCount = 0;
        for (let i = data.length - 1; i >= 0; i--) {
            const b = data[i];
            if (b === 0xFF || b === 0x00) {
                if (tailByte === null) tailByte = b;
                if (b === tailByte) tailCount++;
                else break;
            } else break;
        }
        if (tailCount >= lineSize) {
            const linesToRemove = Math.floor(tailCount / lineSize);
            data = data.slice(0, data.length - linesToRemove * lineSize);
        }

        const hex = makeIntelHex(data);
        download(hex, currentFile.name.replace(/\.[^/.]+$/, "") + ".hex", "text/plain");
    } catch (err) {
        alert("Failed to read file: " + err.message);
    }
}

function makeIntelHex(data) {
    const lineSize = 16;
    let baseAddr = parseInt(document.getElementById("baseAddr").value || "0", 16) >>> 0;
    let addr = baseAddr & 0xFFFF;
    let high = baseAddr >>> 16;
    let out = "";

    out += makeExtAddrRecord(high);

    for (let i = 0; i < data.length; i += lineSize) {
        if (addr + lineSize > 0x10000) {
            high++;
            addr = 0;
            out += makeExtAddrRecord(high);
        }
        const chunk = data.slice(i, i + lineSize);
        const len = chunk.length;
        let sum = len + (addr >> 8) + (addr & 0xFF);
        let line = ":" + toHex(len,2) + toHex(addr,4) + "00";
        chunk.forEach(b => { line += toHex(b,2); sum += b; });
        const checksum = ((~sum + 1) & 0xFF);
        line += toHex(checksum,2);
        out += line + "\n";
        addr += len;
    }
    out += ":00000001FF\n";
    return out;
}

function makeExtAddrRecord(high16) {
    const b1 = (high16 >> 8) & 0xFF;
    const b2 = high16 & 0xFF;
    const sum = 2 + 0 + 0 + 4 + b1 + b2;
    const checksum = ((~sum + 1) & 0xFF);
    return ":02000004" + toHex(b1,2) + toHex(b2,2) + toHex(checksum,2) + "\n";
}

// ================= HEX -> BIN =================
async function hexToBin() {
    if (!currentFile) {
        alert("Please select a file first (Click button or Drag & Drop)");
        return;
    }

    try {
        const text = await currentFile.text();
        const bin = parseIntelHex(text);
        if (bin && bin.length > 0) {
            download(bin, currentFile.name.replace(/\.[^/.]+$/, "") + ".bin", "application/octet-stream");
        }
    } catch (err) {
        alert("Failed to read file: " + err.message);
    }
}

function parseIntelHex(text) {
    const lines = text.trim().split(/\r?\n/);
    let extAddr = 0;
    let mem = new Map();
    let minAddr = Number.MAX_SAFE_INTEGER;
    let maxAddr = 0;

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        const line = lines[lineNo].trim();
        if (!line) continue;
        if (line[0] !== ":") {
            alert(`Format error on line ${lineNo+1} (Missing colon)`);
            return null;
        }

        const len  = parseInt(line.substr(1,2),16);
        const addr = parseInt(line.substr(3,4),16);
        const type = parseInt(line.substr(7,2),16);
        const dataStart = 9;
        const dataEnd   = dataStart + len * 2;
        const checksum  = parseInt(line.substr(dataEnd,2),16);

        let sum = 0;
        for (let i = 1; i < dataEnd; i += 2) sum += parseInt(line.substr(i,2),16);
        sum &= 0xFF;
        const calc = ((~sum + 1) & 0xFF);

        if (calc !== checksum) {
            alert(`HEX Checksum Error!\n\nLine: ${lineNo+1}\nFile Checksum: 0x${toHex(checksum, 2)}\nExpected Checksum: 0x${toHex(calc, 2)}\n\nRaw Line Content:\n${line}`);
            return null;
        }

        if (type === 0x00) {
            const base = (extAddr << 16) | addr;
            for (let i = 0; i < len; i++) {
                const val = parseInt(line.substr(dataStart + i*2,2),16);
                const abs = base + i;
                mem.set(abs, val);
                if (abs < minAddr) minAddr = abs;
                if (abs > maxAddr) maxAddr = abs;
            }
        } else if (type === 0x04) {
            extAddr = parseInt(line.substr(9,4),16);
        } else if (type === 0x01) break;
    }

    if (mem.size === 0) {
        alert("No valid data records found in HEX file.");
        return null;
    }

    const size = maxAddr - minAddr + 1;
    const out  = new Uint8Array(size);
    out.fill(0xFF);
    for (const [addr, val] of mem) out[addr - minAddr] = val;
    return out;
}

// ================= Common Utility Functions =================
function toHex(v, n) { return v.toString(16).toUpperCase().padStart(n,'0'); }

function download(data, filename, type) {
    const blob = new Blob([data], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

