const loader = document.getElementById("loader");
const backdrop = document.getElementById("backdrop");
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");
const chatBox = document.getElementById("chatBox");
const chatStage = document.querySelector(".chat-stage");
const emptyState = document.getElementById("emptyState");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearChat");

const STORAGE_KEY = "fpa_chats_v1";
const CURRENT_KEY = "fpa_current_chat_v1";
const USER_ID_KEY = "fpa_user_id_v1";

/* =========================
   USER ID (future-ready)
========================= */
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
    userId = "user_" + Date.now();
    localStorage.setItem(USER_ID_KEY, userId);
}

/* =========================
   STORAGE HELPERS
========================= */
function loadChats() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveChats(chats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function getCurrentChatId() {
    return localStorage.getItem(CURRENT_KEY);
}

function setCurrentChatId(id) {
    localStorage.setItem(CURRENT_KEY, id);
}

/* =========================
   CHAT STATE
========================= */
let chats = loadChats();
let currentChatId = getCurrentChatId();

if (!chats.length) {
    const firstChat = createChat("New Chat");
    chats.push(firstChat);
    saveChats(chats);
    setCurrentChatId(firstChat.id);
    currentChatId = firstChat.id;
}

if (!currentChatId || !chats.some(chat => chat.id === currentChatId)) {
    currentChatId = chats[0].id;
    setCurrentChatId(currentChatId);
}

function createChat(title = "New Chat") {
    return {
        id: "chat_" + Date.now() + "_" + Math.random().toString(16).slice(2),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    };
}

function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
}

function getPreview(chat) {
    if (!chat.messages.length) return "No messages yet";
    const last = chat.messages[chat.messages.length - 1].text.replace(/\s+/g, " ").trim();
    return last.length > 42 ? last.slice(0, 42) + "…" : last;
}

function formatTime(ts) {
    const date = new Date(ts);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/* =========================
   LOADER
========================= */
window.addEventListener("load", () => {
    setTimeout(() => {
        if (loader) loader.classList.add("hide");
    }, 550);
});

/* =========================
   SIDEBAR TOGGLE
========================= */
function openSidebar() {
    document.body.classList.add("sidebar-open");
}

function closeSidebar() {
    document.body.classList.remove("sidebar-open");
}

openSidebarBtn.addEventListener("click", openSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
backdrop.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
});

/* =========================
   CHAT RENDERING
========================= */
function renderSidebar() {
    chatList.innerHTML = "";

    chats
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach(chat => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = `chat-item${chat.id === currentChatId ? " active" : ""}`;

            item.innerHTML = `
                <div class="chat-item-title">${escapeHtml(chat.title)}</div>
                <div class="chat-item-meta">
                    <span class="chat-item-preview">${escapeHtml(getPreview(chat))}</span>
                    <span class="chat-item-time">${formatTime(chat.updatedAt)}</span>
                </div>
            `;

            item.addEventListener("click", () => {
                currentChatId = chat.id;
                setCurrentChatId(currentChatId);
                renderAll();
                if (window.innerWidth <= 900) closeSidebar();
            });

            chatList.appendChild(item);
        });
}

function renderMessages() {
    const chat = getCurrentChat();
    if (!chat) return;

    chatBox.innerHTML = "";

    if (!chat.messages.length) {
        emptyState.style.display = "block";
        scrollToBottom(false);
        return;
    }

    emptyState.style.display = "none";

    chat.messages.forEach(message => {
        appendMessageToDOM(message, false);
    });

    scrollToBottom(false);
}

function renderAll() {
    renderSidebar();
    renderMessages();
}

/* =========================
   SCROLL
========================= */
function scrollToBottom(smooth = true) {
    if (!chatStage) return;

    requestAnimationFrame(() => {
        chatStage.scrollTo({
            top: chatStage.scrollHeight,
            behavior: smooth ? "smooth" : "auto"
        });
    });
}

/* =========================
   MESSAGE DOM
========================= */
function appendMessageToDOM(message, animate = true) {
    const wrap = document.createElement("div");
    const visualRole = message.role === "assistant" ? "bot" : message.role;
    wrap.className = `message ${visualRole}`;

    const meta = document.createElement("div");
    meta.className = "message-meta";
    meta.textContent = visualRole === "user" ? "You" : "FuturePath AI";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = escapeHtml(message.text);

    wrap.appendChild(meta);
    wrap.appendChild(bubble);

    if (animate) {
        wrap.style.animation = "none";
        requestAnimationFrame(() => {
            wrap.style.animation = "";
        });
    }

    chatBox.appendChild(wrap);
    emptyState.style.display = "none";
    scrollToBottom(true);
}

function addMessage(role, text, save = true) {
    const chat = getCurrentChat();
    if (!chat) return;

    const message = {
        role,
        text,
        time: Date.now()
    };

    chat.messages.push(message);
    chat.updatedAt = Date.now();

    if (save) {
        if (role === "user" && (chat.title === "New Chat" || !chat.title)) {
            chat.title = text.replace(/\s+/g, " ").trim().slice(0, 28) || "New Chat";
        }
        saveChats(chats);
    }

    appendMessageToDOM(message, true);
    renderSidebar();
}

/* =========================
   TYPING INDICATOR
========================= */
let typingNode = null;

function showTyping() {
    if (typingNode) return;

    typingNode = document.createElement("div");
    typingNode.className = "message bot";
    typingNode.innerHTML = `
        <div class="message-meta">FuturePath AI</div>
        <div class="bubble">
            <div class="typing" aria-label="Typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatBox.appendChild(typingNode);
    emptyState.style.display = "none";
    scrollToBottom(true);
}

function hideTyping() {
    if (typingNode) {
        typingNode.remove();
        typingNode = null;
    }
}

/* =========================
   SEND MESSAGE
========================= */
function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text, true);
    input.value = "";
    autoResizeTextarea();

    sendBtn.disabled = true;
    showTyping();

    setTimeout(() => {
        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                message: text,
                history: getCurrentChat().messages
                    .slice(0, -1)
                    .filter(m => m.role === "user" || m.role === "bot" || m.role === "assistant")
                    .map(m => ({
                        role: m.role === "bot" ? "assistant" : m.role,
                        content: m.text
                    }))
            })
        })
        .then(res => res.json())
        .then(data => {
            hideTyping();

            if (data.reply) {
                addMessage("bot", data.reply, true);
            } else {
                addMessage("bot", "I could not generate a reply.", true);
            }

            sendBtn.disabled = false;
        })
        .catch(() => {
            hideTyping();
            addMessage("bot", "Backend connection failed. Check Flask server.", true);
            sendBtn.disabled = false;
        });
    }, 500);
}

/* =========================
   CHAT ACTIONS
========================= */
function createAndSwitchChat() {
    const newChat = createChat("New Chat");
    chats.unshift(newChat);
    currentChatId = newChat.id;
    setCurrentChatId(currentChatId);
    saveChats(chats);

    renderAll();
    input.value = "";
    autoResizeTextarea();
    closeSidebar();
    input.focus();
}

/* =========================
   TEXTAREA AUTO-RESIZE
========================= */
function autoResizeTextarea() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 160) + "px";
}

/* =========================
   EVENTS
========================= */
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("input", autoResizeTextarea);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

newChatBtn.addEventListener("click", createAndSwitchChat);

clearBtn.addEventListener("click", () => {
    const chat = getCurrentChat();
    if (!chat) return;

    chat.messages = [];
    chat.updatedAt = Date.now();
    chat.title = "New Chat";
    saveChats(chats);

    chatBox.innerHTML = "";
    emptyState.style.display = "block";
    renderSidebar();
    input.value = "";
    autoResizeTextarea();
    scrollToBottom(false);
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        document.body.classList.remove("sidebar-open");
    }
});

/* =========================
   INITIAL SETUP
========================= */
function init() {
    renderAll();
    emptyState.style.display = getCurrentChat().messages.length ? "none" : "block";
    autoResizeTextarea();

    if (!getCurrentChat().messages.length) {
        addMessage("bot", "Hi 👋 I’m your career assistant. Let’s find your ideal career path!", true);
    }

    scrollToBottom(false);
}

init();