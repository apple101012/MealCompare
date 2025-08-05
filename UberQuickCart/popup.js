function log(...args) {
  console.log("[UberQuickCart DEBUG]", ...args);
}

function loadCarts() {
  chrome.storage.local.get(null, (data) => {
    log("📦 Loaded carts from storage:", data);

    const container = document.getElementById("cartList");
    container.innerHTML = "";

    Object.keys(data).forEach((key) => {
      if (!key.startsWith("uberquickcart:") || key === "uberquickcart-last")
        return;

      const cart = data[key];
      const div = document.createElement("div");
      div.style =
        "margin-bottom: 12px; padding: 10px; border: 1px solid #ccc; border-radius: 6px;";

      div.innerHTML = `
        <strong>${cart.store}</strong><br/>
        ${cart.items
          .map(
            (item, i) => `
            <input data-store="${cart.store}" data-index="${i}" data-type="name" value="${item.name}" style="width: 48%; margin: 2px 1%" />
            <input data-store="${cart.store}" data-index="${i}" data-type="price" value="${item.price}" style="width: 48%; margin: 2px 1%" />
          `
          )
          .join("")}
        <br/>
        <button class="save-btn" data-store="${
          cart.store
        }">💾 Save Changes</button>
        <button class="delete-btn" data-store="${cart.store}">🗑️ Delete</button>
      `;
      container.appendChild(div);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCarts();

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("save-btn")) {
      const store = e.target.dataset.store;
      log("💾 Saving changes for:", store);

      chrome.storage.local.get("uberquickcart:" + store, (data) => {
        const key = "uberquickcart:" + store;
        const cart = data[key];
        if (!cart) return log("❌ Cart not found for:", store);

        const inputs = document.querySelectorAll(
          `input[data-store="${store}"]`
        );
        inputs.forEach((input) => {
          const index = Number(input.dataset.index);
          const field = input.dataset.type;
          cart.items[index][field] = input.value;
        });

        chrome.storage.local.set({ [key]: cart }, () => {
          log("✅ Saved updated cart for", store, cart);
          loadCarts(); // Refresh to show changes
        });
      });
    }

    if (e.target.classList.contains("delete-btn")) {
      const store = e.target.dataset.store;
      const key = "uberquickcart:" + store;
      chrome.storage.local.remove(key, () => {
        log("🗑️ Deleted cart for", store);
        loadCarts();
      });
    }
  });
});
