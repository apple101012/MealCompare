function log(...args) {
  console.log("[UberQuickCart DEBUG]", ...args);
}

function sanitize(str) {
  return str.replace(/[^\w\s\-]/g, "_");
}

function loadSavedCarts() {
  log("🔁 Loading saved carts...");
  chrome.storage.local.get(null, (data) => {
    const container = document.getElementById("cartList");
    container.innerHTML = "";

    const keys = Object.keys(data).filter(
      (k) => k.startsWith("uberquickcart:") && k !== "uberquickcart-last"
    );

    log("📦 Found keys:", keys);

    if (keys.length === 0) {
      container.innerHTML = "<p>No saved carts found.</p>";
      return;
    }

    keys.forEach((key) => {
      const cart = data[key];
      log(`📋 Rendering cart for store: ${cart.store}`, cart);

      const safeStore = sanitize(cart.store);

      const block = document.createElement("div");
      block.className = "cart-block";

      const title = document.createElement("div");
      title.className = "cart-title";
      title.textContent = cart.store;
      block.appendChild(title);

      cart.items.forEach((item, i) => {
        const row = document.createElement("div");
        row.className = "cart-item-input";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = item.name;
        nameInput.className = `item-name-${safeStore}`;
        nameInput.dataset.index = i;

        const priceInput = document.createElement("input");
        priceInput.type = "text";
        priceInput.value = item.price;
        priceInput.className = `item-price-${safeStore}`;
        priceInput.dataset.index = i;

        row.appendChild(nameInput);
        row.appendChild(priceInput);
        block.appendChild(row);
      });

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "💾 Save Changes";
      saveBtn.className = "save-btn";
      saveBtn.onclick = () => saveEditedCart(cart.store);
      block.appendChild(saveBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = () => deleteCart(cart.store);
      block.appendChild(deleteBtn);

      container.appendChild(block);
    });

    log("✅ Finished rendering all saved carts.");
  });
}

function saveEditedCart(store) {
  const safeStore = sanitize(store);
  log(`💾 Saving changes for: ${store}`);

  const nameInputs = document.querySelectorAll(`.item-name-${safeStore}`);
  const priceInputs = document.querySelectorAll(`.item-price-${safeStore}`);

  if (nameInputs.length !== priceInputs.length) {
    log("❌ Mismatch in input lengths!", { nameInputs, priceInputs });
    return;
  }

  const newItems = Array.from(nameInputs).map((input, i) => ({
    name: input.value.trim(),
    price: priceInputs[i].value.trim(),
  }));

  const newCart = {
    store,
    items: newItems,
    timestamp: new Date().toISOString(),
  };

  log("📝 New cart data:", newCart);

  chrome.storage.local.set({ ["uberquickcart:" + store]: newCart }, () => {
    log(`✅ Saved updated cart for ${store}`, newCart);
    alert(`Cart for "${store}" updated!`);
    loadSavedCarts();
  });
}

function deleteCart(store) {
  log(`🗑️ Deleting cart for store: ${store}`);
  chrome.storage.local.remove("uberquickcart:" + store, () => {
    log(`✅ Deleted cart for ${store}`);
    loadSavedCarts();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  log("📥 Popup loaded.");
  loadSavedCarts();
});
