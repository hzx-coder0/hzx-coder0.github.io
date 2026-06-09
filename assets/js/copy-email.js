(function () {
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("Copy command failed"));
        }
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest(".author__copy-email");
    if (!trigger) return;

    event.preventDefault();
    var email = trigger.getAttribute("data-copy-email");
    var status = trigger.querySelector(".author__copy-status");

    copyText(email)
      .then(function () {
        trigger.setAttribute("title", "Copied");
        if (status) {
          status.textContent = "Copied";
          window.setTimeout(function () {
            status.textContent = "";
          }, 1600);
        }
      })
      .catch(function (error) {
        trigger.setAttribute("title", error.message);
        if (status) {
          status.textContent = "Copy failed";
        }
      });
  });
})();
