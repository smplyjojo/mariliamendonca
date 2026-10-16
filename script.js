const STORAGE_KEY = "marilia-fan-messages";

const form = document.querySelector("#fan-form");
const nameInput = document.querySelector("#fan-name");
const songInput = document.querySelector("#fan-song");
const messageInput = document.querySelector("#fan-message");
const characterCount = document.querySelector("#character-count");
const formStatus = document.querySelector("#form-status");
const messageList = document.querySelector("#message-list");
const messageCount = document.querySelector("#message-count");
const emptyState = document.querySelector("#empty-state");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

function readMessages() {
  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (!savedMessages) return [];

    const parsedMessages = JSON.parse(savedMessages);
    if (!Array.isArray(parsedMessages)) {
      throw new Error("O conteúdo salvo para o mural não é uma lista.");
    }
    return parsedMessages;
  } catch (error) {
    console.error("Não foi possível carregar os recados do mural.", error);
    formStatus.textContent = "Não foi possível carregar os recados salvos neste navegador.";
    return [];
  }
}

function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar o recado do mural.", error);
    formStatus.textContent = "Não foi possível salvar seu recado. Verifique as configurações de armazenamento do navegador.";
    return false;
  }
}

function renderMessages() {
  const messages = readMessages();
  messageList.replaceChildren();
  emptyState.hidden = messages.length > 0;
  messageCount.textContent = `${messages.length} ${messages.length === 1 ? "recado" : "recados"}`;

  messages.forEach((message) => {
    const card = document.createElement("article");
    card.className = "fan-message";

    const heading = document.createElement("h4");
    heading.textContent = message.name;
    const text = document.createElement("p");
    text.textContent = message.message;
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-message";
    deleteButton.type = "button";
    deleteButton.textContent = "Excluir";
    deleteButton.setAttribute("aria-label", `Excluir recado de ${message.name}`);
    deleteButton.addEventListener("click", () => {
      const remainingMessages = readMessages().filter((item) => item.id !== message.id);
      if (saveMessages(remainingMessages)) {
        formStatus.textContent = "Recado removido do mural.";
        renderMessages();
      }
    });

    card.append(heading, text);
    if (message.song) {
      const song = document.createElement("p");
      song.className = "favorite-song";
      song.textContent = `♫ Música favorita: ${message.song}`;
      card.append(song);
    }
    card.append(deleteButton);
    messageList.append(card);
  });
}

messageInput.addEventListener("input", () => {
  characterCount.textContent = `${messageInput.value.length} / 400`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const newMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: nameInput.value.trim(),
    song: songInput.value.trim(),
    message: messageInput.value.trim(),
  };

  if (!newMessage.name || !newMessage.message) {
    formStatus.textContent = "Preencha seu nome e sua mensagem para publicar.";
    return;
  }

  const messages = readMessages();
  if (!saveMessages([newMessage, ...messages])) return;

  form.reset();
  characterCount.textContent = "0 / 400";
  formStatus.textContent = "Seu recado foi adicionado ao mural. Obrigado por compartilhar!";
  renderMessages();
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  mainNav.classList.toggle("is-open", !isExpanded);
});

mainNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
  }
});

renderMessages();
