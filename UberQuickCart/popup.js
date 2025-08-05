function log(...args) {
  console.log("[UberQuickCart DEBUG]", ...args);
}

document.addEventListener("DOMContentLoaded", () => {
  const presetList = document.getElementById("presetList");
  const lastCartContainer = document.getElementById("lastCartContainer");

  // Load all presets from chrome.storage
  chrome.storage.local.get(null, (data) => {
    const keys = Object.keys(data).filter((key) =>
      key.startsWith("uberquickcart:")
    );

    // Display last saved cart
    const last = data["uberquickcart-last"];
    if (last) {
      renderCart(last, lastCartContainer);
    }

    // List presets (excluding "uberquickcart-last")
    keys
      .filter((k) => k !== "uberquickcart-last")
      .forEach((key) => {
        const preset = data[key];
        const li = document.createElement("li");
        li.className = "preset-item";

        const name = document.createElement("span");
        name.className = "preset-name";
        name.textContent = preset.store;

        const loadBtn = document.createElement("button");
        loadBtn.textContent = "✏️";
        loadBtn.title = "Edit";
        loadBtn.onclick = () => {
          renderCart(preset, lastCartContainer);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        deleteBtn.title = "Delete";
        deleteBtn.onclick = () => {
          chrome.storage.local.remove(key, () => {
            li.remove();
            log("Deleted preset:", key);
          });
        };

        li.appendChild(name);
        li.appendChild(loadBtn);
        li.appendChild(deleteBtn);
        presetList.appendChild(li);
      });
  });

  // Save current cart being edited
  document.getElementById("saveChangesBtn").addEventListener("click", () => {
    const store = document.getElementById("cartStore").textContent;
    const items = [];

    document.querySelectorAll(".cart-item").forEach((row) => {
      const name = row.querySelector('[data-type="name"]').value.trim();
      const price = row.querySelector('[data-type="price"]').value.trim();
      if (name && price) items.push({ name, price });
    });

    const updated = {
      store,
      items,
      timestamp: new Date().toISOString(),
    };

    chrome.storage.local.set(
      {
        ["uberquickcart:" + store]: updated,
        ["uberquickcart-last"]: updated,
      },
      () => {
        log("✅ Saved edited cart:", updated);
        alert("Changes saved!");
      }
    );
  });
});

function renderCart(cartData, container) {
  container.innerHTML = `
    <p><strong id="cartStore">${cartData.store}</strong></p>
    <div id="editableCartItems"></div>
    <button id="saveChangesBtn" style="margin-top: 12px;">💾 Save Changes</button>
  `;

  const itemContainer = document.getElementById("editableCartItems");

  cartData.items.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <input type="text" value="${item.name}" data-index="${i}" data-type="name" />
      <input type="text" value="${item.price}" data-index="${i}" data-type="price" />
    `;

    itemContainer.appendChild(div);
  });
}
