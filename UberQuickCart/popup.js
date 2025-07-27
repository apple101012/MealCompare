document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cart-items");

  chrome.storage.local.get(["uberquickcart-last"], (result) => {
    const cartData = result["uberquickcart-last"];
    if (!cartData) {
      container.innerText = "No cart saved yet.";
      return;
    }

    container.innerHTML = cartData.items
      .map(
        (item, i) => `
      <div class="item-block">
        <label>Item ${i + 1} Name:</label>
        <textarea data-index="${i}" data-type="name">${item.name}</textarea>
        <label>Price:</label>
        <input type="text" data-index="${i}" data-type="price" value="${
          item.price
        }" />
      </div>
    `
      )
      .join("");

    document.getElementById("save").onclick = () => {
      document.querySelectorAll("[data-index]").forEach((input) => {
        const index = +input.dataset.index;
        const type = input.dataset.type;
        cartData.items[index][type] = input.value.trim();
      });

      chrome.storage.local.set(
        {
          ["uberquickcart:" + cartData.store]: cartData,
          ["uberquickcart-last"]: cartData,
        },
        () => {
          alert("✅ Changes saved!");
        }
      );
    };
  });
});
