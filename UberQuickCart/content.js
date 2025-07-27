function log(...args) {
  console.log("[UberQuickCart DEBUG]", ...args);
}

function injectButton() {
  if (document.getElementById("uberquickcart-button")) return;

  const button = document.createElement("button");
  button.textContent = "Save Cart";
  button.id = "uberquickcart-button";
  Object.assign(button.style, {
    position: "fixed",
    top: "100px",
    right: "20px",
    zIndex: "9999",
    padding: "10px 16px",
    backgroundColor: "#1f2937",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  });

  button.addEventListener("click", scrapeCart);
  document.body.appendChild(button);
  log("Save Cart button injected.");
}

function scrapeCart() {
  const cart = document.querySelector('[data-test="cart"]');
  if (!cart) return log("Cart not found.");

  let storeName = "Unknown Store";
  const storeHeader = cart.querySelector('[data-test="cart-header"]');
  const nameEl = storeHeader?.querySelector("a");
  if (nameEl) {
    storeName = nameEl.innerText.trim().split("\n")[0];
    log("Detected Store Name:", storeName);
  }

  const cartItemList = cart.querySelector("ul");
  const itemLis = cartItemList?.querySelectorAll(":scope > li") || [];
  const items = [];

  itemLis.forEach((li, index) => {
    if (!li || !li.textContent.includes("$")) return;

    const nameEl = li.querySelector(
      'div[class*="bo"][class*="bp"], span[class*="bo"][class*="bp"]'
    );
    const name = nameEl?.textContent.trim();
    const priceMatch = li.textContent.match(/\$\d+(?:\.\d{2})?/);
    const price = priceMatch ? priceMatch[0] : null;

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
  chrome.storage.local.set(
    {
      ["uberquickcart:" + cartData.store]: cartData,
      ["uberquickcart-last"]: cartData,
    },
    () => {
      log("✅ Saved cart to storage for popup:", cartData);
      alert("Cart saved! Open the extension popup to edit.");
    }
  );
}

injectButton();
