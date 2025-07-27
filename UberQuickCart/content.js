function log(...args) {
  console.log("[UberQuickCart DEBUG]", ...args);
}

// Inject Save Cart button
function injectButton() {
  if (document.getElementById("uberquickcart-button")) return;

  const button = document.createElement("button");
  button.textContent = "Save Cart";
  button.id = "uberquickcart-button";
  button.style.position = "fixed";
  button.style.top = "100px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 16px";
  button.style.backgroundColor = "#1f2937";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "6px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

  button.addEventListener("click", scrapeCart);
  document.body.appendChild(button);
  log("Save Cart button injected.");
}

// Scrape cart data
function scrapeCart() {
  const cart = document.querySelector('[data-test="cart"]');
  if (!cart) {
    log("Cart not found.");
    return;
  }

  // --- Get Store Name ---
  let storeName = "Unknown Store";
  const storeHeader = cart.querySelector('[data-test="cart-header"]');
  if (storeHeader) {
    const nameEl = storeHeader.querySelector("a");
    if (nameEl) {
      storeName = nameEl.innerText.trim().split("\n")[0];
      log("Detected Store Name:", storeName);
    }
  }

  // --- Get ONLY the first <ul> inside the cart (actual cart items) ---
  const cartItemList = cart.querySelector("ul"); // This is safe: it's the first UL before "Offers"
  const itemLis = cartItemList?.querySelectorAll(":scope > li") || [];
  const items = [];

  itemLis.forEach((li, index) => {
    // Avoid empty or malformed li
    if (!li || !li.textContent.includes("$")) return;

    // Try to get item name
    const nameEl = li.querySelector(
      'div[class*="bo"][class*="bp"], span[class*="bo"][class*="bp"]'
    );
    const name = nameEl?.textContent.trim();

    // Try to get the first price in this item block
    const priceMatch = li.textContent.match(/\$\d+(?:\.\d{2})?/);
    const price = priceMatch ? priceMatch[0] : null;

    // Ensure the name isn't part of an offer or banner
    if (
      name &&
      price &&
      name.length < 100 &&
      !name.toLowerCase().includes("offer")
    ) {
      items.push({ name, price });
      log(`Found Item ${items.length}: ${name} - ${price}`);
    } else {
      log(`Skipping Item ${index + 1} - Missing name or price`);
    }
  });

  const cartData = {
    store: storeName,
    items,
    timestamp: new Date().toISOString(),
  };

  log("Parsed Cart:", cartData);
  showEditModal(cartData);
}
function showEditModal(cartData) {
  const modal = document.createElement("div");
  modal.id = "uberquickcart-editor";
  modal.style.cssText = `
    position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
    background: white; color: black; padding: 20px; z-index: 99999;
    border: 2px solid #000; border-radius: 8px; max-height: 80%; overflow-y: auto;  pointer-events: auto;
  `;

  modal.innerHTML = `
  <h2 style="margin-top: 0;">🛒 Edit Cart Items</h2>
  <p><strong>Store:</strong> ${cartData.store}</p>
  ${cartData.items
    .map(
      (item, i) => `
    <div style="margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #ddd;">
      <label style="display: block; margin-bottom: 4px;">
        Item ${i + 1} Name:
        <input type="text" 
               data-index="${i}" 
               data-type="name" 
               value="${item.name}" 
               style="width: 100%; padding: 6px; margin-top: 2px; border: 1px solid #ccc; border-radius: 4px; pointer-events: auto;" />
      </label>
      <label style="display: block; margin-top: 8px;">
        Price:
        <input type="text" 
               data-index="${i}" 
               data-type="price" 
               value="${item.price}" 
               style="width: 100%; padding: 6px; margin-top: 2px; border: 1px solid #ccc; border-radius: 4px; pointer-events: auto;" />
      </label>
    </div>
  `
    )
    .join("")}
  <div style="text-align: center; margin-top: 16px;">
    <button id="saveUberQuickCart" style="padding: 8px 12px; margin-right: 10px; background-color: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">✅ Save Preset</button>
    <button id="cancelUberQuickCart" style="padding: 8px 12px; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">❌ Cancel</button>
  </div>
`;
  const style = document.createElement("style");
  style.textContent = `
  #uberquickcart-editor,
  #uberquickcart-editor * {
    pointer-events: auto !important;
    user-select: text !important;
    z-index: 99999 !important;
  }
`;
  document.head.appendChild(style);

  document.body.appendChild(modal);

  document.getElementById("saveUberQuickCart").onclick = () => {
    document
      .querySelectorAll("#uberquickcart-editor input")
      .forEach((input) => {
        const index = Number(input.dataset.index);
        const field = input.dataset.type;
        cartData.items[index][field] = input.value.trim();
      });

    localStorage.setItem(
      "uberquickcart:" + cartData.store,
      JSON.stringify(cartData)
    );
    log("✅ Saved edited preset:", cartData);
    modal.remove();
  };

  document.getElementById("cancelUberQuickCart").onclick = () => {
    log("❌ Edit cancelled.");
    modal.remove();
  };
}

injectButton();
