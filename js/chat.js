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
const quickChips = document.querySelectorAll(".quick-chip");

const STORAGE_KEY = "fpa_chats_v1";
const CURRENT_KEY = "fpa_current_chat_v1";
const USER_ID_KEY = "fpa_user_id_v1";
const STUDENT_PROFILE_KEY = "studentProfile";

// Change this once after deployment
const API_BASE_URL =
    !window.location.hostname || 
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:5000"
        : "https://YOUR-RENDER-APP.onrender.com";

const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

function setAppHeight() {
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${height}px`);
}

setAppHeight();

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setAppHeight);
    window.visualViewport.addEventListener("scroll", setAppHeight);
}

window.addEventListener("resize", setAppHeight);
window.addEventListener("orientationchange", setAppHeight);
window.addEventListener("focusin", setAppHeight);
window.addEventListener("focusout", () => {
    setTimeout(setAppHeight, 60);
});

/* USER ID */
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
    userId = "user_" + Date.now();
    localStorage.setItem(USER_ID_KEY, userId);
}

/* STUDENT PROFILE */
function loadStudentProfile() {
    try {
        const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const studentProfile = loadStudentProfile();

/* STORAGE */
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

/* STATE */
let chats = loadChats();
let currentChatId = getCurrentChatId();

function createChat(title = "New Chat") {
    return {
        id: "chat_" + Date.now() + "_" + Math.random().toString(16).slice(2),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    };
}

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
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function setIcons() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

/* LOADER */
window.addEventListener("load", () => {
    setTimeout(() => {
        if (loader) loader.classList.add("hide");
    }, 500);
});

/* SIDEBAR BEHAVIOR */
function openSidebar() {
    if (isMobile()) {
        document.body.classList.add("sidebar-open");
        document.body.classList.remove("sidebar-collapsed");
    } else {
        document.body.classList.remove("sidebar-collapsed");
    }
}

function closeSidebar() {
    if (isMobile()) {
        document.body.classList.remove("sidebar-open");
    } else {
        document.body.classList.add("sidebar-collapsed");
    }
}

function toggleSidebar() {
    if (isMobile()) {
        document.body.classList.toggle("sidebar-open");
    } else {
        document.body.classList.toggle("sidebar-collapsed");
    }
}

openSidebarBtn.addEventListener("click", toggleSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
backdrop.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeSidebar();
    }
});

/* RENDER */
function renderSidebar() {
    chatList.innerHTML = "";

    const ordered = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

    ordered.forEach(chat => {
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
            if (isMobile()) closeSidebar();
        });

        chatList.appendChild(item);
    });
}

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
    chat.messages.forEach(message => appendMessageToDOM(message, false));
    scrollToBottom(false);
}

function renderAll() {
    renderSidebar();
    renderMessages();
}

/* SCROLL */
function scrollToBottom(smooth = true) {
    if (!chatStage) return;

    requestAnimationFrame(() => {
        chatStage.scrollTo({
            top: chatStage.scrollHeight,
            behavior: smooth ? "smooth" : "auto"
        });
    });
}

/* MESSAGES */
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

/* COMPOSE */
function autoResizeTextarea() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 168) + "px";
}

function getBackendHistory() {
    const chat = getCurrentChat();
    if (!chat) return [];

    return chat.messages.map((m) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: m.text
    }));
}

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text, true);
    input.value = "";
    autoResizeTextarea();

    sendBtn.disabled = true;
    showTyping();

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                message: text,
                history: getBackendHistory().slice(0, -1),
                profile: studentProfile
            })
        });

        const data = await response.json();

        hideTyping();

        if (data.reply) {
            addMessage("bot", data.reply, true);
        } else {
            addMessage("bot", "I could not generate a reply.", true);
        }
    } catch {
        hideTyping();
        addMessage("bot", "Backend connection failed. Check Flask server.", true);
    } finally {
        sendBtn.disabled = false;
    }
}

function createAndSwitchChat() {
    const newChat = createChat("New Chat");
    chats.unshift(newChat);
    currentChatId = newChat.id;
    setCurrentChatId(currentChatId);
    saveChats(chats);

    renderAll();
    input.value = "";
    autoResizeTextarea();
    input.focus({ preventScroll: true });
    scrollToBottom(false);
}

function initSidebarState() {
    if (isMobile()) {
        document.body.classList.remove("sidebar-collapsed");
        document.body.classList.remove("sidebar-open");
    } else {
        document.body.classList.add("sidebar-collapsed");
        document.body.classList.remove("sidebar-open");
    }
}

/* EVENTS */
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

quickChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt") || "";
        input.value = prompt;
        autoResizeTextarea();
        input.focus({ preventScroll: true });
        scrollToBottom(false);
    });
});

window.addEventListener("resize", () => {
    setAppHeight();
    initSidebarState();
});

window.addEventListener("orientationchange", () => {
    setAppHeight();
    initSidebarState();
});

window.addEventListener("beforeunload", () => {
    saveChats(chats);
});

/* INIT */
function init() {
    setIcons();
    initSidebarState();
    renderAll();
    autoResizeTextarea();

    if (!getCurrentChat().messages.length) {
        const greeting = studentProfile && studentProfile.classLevel
            ? `Hi 👋 I’m your school career counsellor. I already have your assessment details for ${studentProfile.classLevel}. Ask me about streams, courses, or career options.`
            : "Hi 👋 I’m your school career counsellor. Let’s find the best path for you after school!";

        addMessage("bot", greeting, true);
    }

    scrollToBottom(false);
}

init();