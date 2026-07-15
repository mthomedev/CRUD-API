import { renderUsers } from "./scripts/dom/render.js";
import {
  enterEditMode,
  exitEditMode,
  getEditingId,
  getOriginalUser,
  getUserFromCard,
  showError,
  hideError,
} from "./scripts/dom/form.js";
import { createUser } from "./scripts/api/create.js";
import { updateUser } from "./scripts/api/update.js";
import { deleteUser } from "./scripts/api/delete.js";

const apiUrl = import.meta.env.VITE_API_URL;

const form = document.getElementById("create-user-form");
const cancelBtn = document.getElementById("cancel-edit");
const usersSection = document.getElementById("users");

usersSection.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.dataset.action === "edit") {
    enterEditMode(getUserFromCard(target));
  }

  if (target.dataset.action === "delete") {
    const user = getUserFromCard(target);
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(apiUrl, user.id);
      if (getEditingId() === user.id) exitEditMode();
      renderUsers(apiUrl);
    } catch (error) {
      showError(error.message);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => renderUsers(apiUrl));
cancelBtn.addEventListener("click", exitEditMode);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const email = document.getElementById("email").value;

  hideError();

  try {
    const editingId = getEditingId();
    const user = { name, age, email };

    if (editingId !== null) {
      const result = await updateUser(
        apiUrl,
        editingId,
        user,
        getOriginalUser(),
      );
      if (result === null) {
        exitEditMode();
        return;
      }
    } else {
      await createUser(apiUrl, user);
    }

    exitEditMode();
    renderUsers(apiUrl);
  } catch (error) {
    showError(error.message);
  }
});
