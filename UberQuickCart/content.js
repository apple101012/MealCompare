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

  // --- Get Cart Items from Cart's <ul> list ---
  const itemLis = cart.querySelectorAll("ul > li");
  const items = [];

  itemLis.forEach((li, index) => {
    // Try to get item name: Look for a <div> or <span> with recognizable class and readable name
    const nameEl = li.querySelector(
      'div[class*="bo"][class*="bp"], span[class*="bo"][class*="bp"]'
    );
    const name = nameEl?.textContent.trim();

    // Try to get the first valid price: match $xx.xx
    const priceMatch = li.textContent.match(/\$\d+(?:\.\d{2})?/);
    const price = priceMatch ? priceMatch[0] : null;

    // Filter out promo banners or empty lines
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
  localStorage.setItem("uberquickcart:" + storeName, JSON.stringify(cartData));
  log("Saved preset:", storeName);
}

injectButton();
