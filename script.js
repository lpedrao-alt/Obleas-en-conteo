const form = document.querySelector("#purchase-form");
const priceInput = document.querySelector("#price");
const quantityInput = document.querySelector("#quantity");
const errorMessage = document.querySelector("#error-message");
const totalAmount = document.querySelector("#total-amount");
const equation = document.querySelector("#equation");
const purchaseList = document.querySelector("#purchase-list");
const clearButton = document.querySelector("#clear-button");
const newButton = document.querySelector("#new-button");

let purchases = [];
let editingId = null;
let nextId = 1;

const money = (value) => "$" + new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0
}).format(value);

function showError(message) {
  errorMessage.textContent = message;
}

function calculateTotal(price, quantity) {
  return price * quantity;
}

function renderPurchases() {
  if (purchases.length === 0) {
    purchaseList.innerHTML = '<tr class="empty-row"><td colspan="5">Todavía no tienes compras. ¡Agrega la primera! ♡</td></tr>';
    return;
  }

  purchaseList.innerHTML = purchases.map((purchase, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${purchase.quantity}</td>
      <td>${money(purchase.price)}</td>
      <td>${money(calculateTotal(purchase.price, purchase.quantity))}</td>
      <td>
        <button class="action-button edit-button" type="button" data-action="edit" data-id="${purchase.id}" aria-label="Editar compra ${index + 1}" title="Editar">✎</button>
        <button class="action-button delete-button" type="button" data-action="delete" data-id="${purchase.id}" aria-label="Eliminar compra ${index + 1}" title="Eliminar">▤</button>
      </td>
    </tr>
  `).join("");
}

function updateTotal(price, quantity) {
  const total = calculateTotal(price, quantity);
  totalAmount.textContent = money(total);
  equation.textContent = `${quantity} × ${money(price)} = ${money(total)}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const price = Number(priceInput.value);
  const quantity = Number(quantityInput.value);

  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    showError("Escribe un precio válido, mayor que cero y sin decimales.");
    priceInput.focus();
    return;
  }
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    showError("La cantidad debe ser un número entero mayor que cero.");
    quantityInput.focus();
    return;
  }

  showError("");
  if (editingId !== null) {
    purchases = purchases.map((item) => item.id === editingId ? { ...item, price, quantity } : item);
    editingId = null;
    document.querySelector(".calculate-button").innerHTML = "<span>▦</span> Calcular total <i>✧</i>";
  } else {
    purchases.push({ id: nextId++, price, quantity });
  }

  updateTotal(price, quantity);
  renderPurchases();
  form.reset();
  priceInput.focus();
});

purchaseList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const purchase = purchases.find((item) => item.id === id);
  if (!purchase) return;

  if (button.dataset.action === "edit") {
    editingId = id;
    priceInput.value = purchase.price;
    quantityInput.value = purchase.quantity;
    document.querySelector(".calculate-button").innerHTML = "<span>✓</span> Guardar cambios <i>✧</i>";
    showError("Edita los datos y presiona «Guardar cambios».");
    document.querySelector("#calculadora").scrollIntoView({ behavior: "smooth", block: "center" });
    priceInput.focus({ preventScroll: true });
  } else if (button.dataset.action === "delete") {
    purchases = purchases.filter((item) => item.id !== id);
    if (editingId === id) {
      editingId = null;
      form.reset();
      document.querySelector(".calculate-button").innerHTML = "<span>▦</span> Calcular total <i>✧</i>";
      showError("");
    }
    renderPurchases();
    if (purchases.length === 0) {
      totalAmount.textContent = "$0";
      equation.textContent = "Ingresa los datos de tu compra";
    } else {
      const total = purchases.reduce((sum, item) => sum + calculateTotal(item.price, item.quantity), 0);
      totalAmount.textContent = money(total);
      equation.textContent = `Total de ${purchases.length} ${purchases.length === 1 ? "compra" : "compras"}: ${money(total)}`;
    }
  }
});

clearButton.addEventListener("click", () => {
  if (purchases.length === 0) {
    showError("Tu lista ya está vacía. ¡Agrega una compra!");
    return;
  }
  if (!confirm("¿Quieres borrar todas las compras de la lista?")) return;
  purchases = [];
  editingId = null;
  form.reset();
  showError("");
  totalAmount.textContent = "$0";
  equation.textContent = "Ingresa los datos de tu compra";
  document.querySelector(".calculate-button").innerHTML = "<span>▦</span> Calcular total <i>✧</i>";
  renderPurchases();
});

newButton.addEventListener("click", () => {
  editingId = null;
  form.reset();
  showError("");
  document.querySelector(".calculate-button").innerHTML = "<span>▦</span> Calcular total <i>✧</i>";
  document.querySelector("#calculadora").scrollIntoView({ behavior: "smooth", block: "center" });
  priceInput.focus({ preventScroll: true });
});

renderPurchases();
