export function confirmAction(message) {
  const modal = document.getElementById("confirm-modal");
  const messageEl = document.getElementById("confirm-message");
  const okBtn = document.getElementById("confirm-ok");
  const cancelBtn = document.getElementById("confirm-cancel");

  messageEl.textContent = message;
  modal.classList.remove("d-none");

  return new Promise((resolve) => {
    function cleanup(result) {
      modal.classList.add("d-none");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    }
    function onOk() {
      cleanup(true);
    }
    function onCancel() {
      cleanup(false);
    }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}
