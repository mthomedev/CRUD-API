import { getUsers } from "../api/read.js";

let cachedUsers = [];

export function findUserById(id) {
  return cachedUsers.find((user) => user.id === id) || null;
}

export async function renderUsers(apiUrl) {
  const usersSection = document.getElementById("users");

  try {
    cachedUsers = await getUsers(apiUrl);
  } catch (error) {
    usersSection.innerHTML = `<p class="error">${error.message}</p>`;
    return;
  }

  if (cachedUsers.length === 0) {
    usersSection.innerHTML = `<p class="empty">Nenhum usuário cadastrado.</p>`;
    return;
  }

  usersSection.innerHTML = cachedUsers
    .map(
      (user) => `
        <article class="user-card" id="${user.id}">
          <div class="user-info">
            <strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(String(user.age))} anos</span>
            <span>${escapeHtml(user.email)}</span>
          </div>
          <div class="user-actions">
            <button type="button" data-action="edit">Editar</button>
            <button type="button" data-action="delete">Excluir</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
