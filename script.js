let products = [];
let cart = [];

//selecionando os elementos html
const selectors = {
    products: document.querySelector(".products"),
    cartBtn: document.querySelector(".cart-btn"),
    cartQty: document.querySelector(".cart-qty"),
    cartClose: document.querySelector(".cart-close"),
    cart: document.querySelector(".cart"),
    cartOverlay: document.querySelector(".cart-overlay"),
    cartClear: document.querySelector(".cart-clear"),
    cartBody: document.querySelector(".cart-body"),
    cartTotal: document.querySelector(".cart-total"),
  };

//adicionando eventos
  const setupListeners = () => {
    document.addEventListener("DOMContentLoaded", initStore);
  
    selectors.products.addEventListener("click", addToCart);
    selectors.cartBtn.addEventListener("click", showCart);
    selectors.cartOverlay.addEventListener("click", hideCart);
    selectors.cartClose.addEventListener("click", hideCart);
    selectors.cartBody.addEventListener("click", updateCart);
    selectors.cartClear.addEventListener("click", clearCart);
  };

//iniciando a loja
  const initStore = () => {
    loadCart();
    loadProducts("https://fakestoreapi.com/products")
      .then(renderProducts)
      .finally(renderCart);
  };

//mostrar e esconder carrinho
  const showCart = () => {
    selectors.cart.classList.add("show");
    selectors.cartOverlay.classList.add("show");
  };
  
  const hideCart = () => {
    selectors.cart.classList.remove("show");
    selectors.cartOverlay.classList.remove("show");
  };

//limpar carrinho
  const clearCart = () => {
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
    setTimeout(hideCart, 500);
  };

//adicionar no carrinho
  const addToCart = (e) => {
    if (e.target.hasAttribute("data-id")) {
      const id = parseInt(e.target.dataset.id);
      const inCart = cart.find((x) => x.id === id);
  
      if (inCart) {
        alert("Item is already in cart.");
        return;
      }
  
      cart.push({ id, qty: 1 });
      saveCart();
      renderProducts();
      renderCart();
      showCart();
    }
  };

//remover do carrinho
  const removeFromCart = (id) => {
    cart = cart.filter((x) => x.id !== id);
  
    cart.length === 0 && setTimeout(hideCart, 500);
    renderProducts();
  };

//aumentar quantidade
  const increaseQty = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    item.qty++;
  };

//diminuir quantidade
  const decreaseQty = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    item.qty--;
    if (item.qty === 0) removeFromCart(id);
  };

//atualizar carrinho
  const updateCart = (e) => {
    if (e.target.hasAttribute("data-btn")) {
      const cartItem = e.target.closest(".cart-item");
      const id = parseInt(cartItem.dataset.id);
      const btn = e.target.dataset.btn;
  
      btn === "incr" && increaseQty(id);
      btn === "decr" && decreaseQty(id);
  
      saveCart();
      renderCart();
    }
  };

//salvar carrinho no local storage
  const saveCart = () => {
    localStorage.setItem("online-store", JSON.stringify(cart));
  };
  
  const loadCart = () => {
    cart = JSON.parse(localStorage.getItem("online-store")) || [];
  };

// renderizar carrinho
  const renderCart = () => {
    const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);
    selectors.cartQty.textContent = cartQty;
    selectors.cartQty.classList.toggle("visible", cartQty);
  
    selectors.cartTotal.textContent = calculateTotal().format();
  
    if (cart.length === 0) {
      selectors.cartBody.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
      return;
    }
  
    selectors.cartBody.innerHTML = cart.map(({ id, qty }) => {
      const product = products.find((x) => x.id === id);
      const { title, image, price } = product;
      const amount = price * qty;
      return `
        <div class="cart-item" data-id="${id}">
          <img src="${image}" alt="${title}" />
          <div class="cart-item-detail">
            <h3>${title}</h3>
            <h5>${price.format()}</h5>
            <div class="cart-item-amount">
              <i class="bi bi-dash-lg" data-btn="decr"></i>
              <span class="qty">${qty}</span>
              <i class="bi bi-plus-lg" data-btn="incr"></i>
              <span class="cart-item-price">${amount.format()}</span>
            </div>
          </div>
        </div>`;
    }).join("");
  };

// carregar e renderizar produtos
  const renderProducts = () => {
    selectors.products.innerHTML = products.map((product) => {
      const { id, title, image, price } = product;
      const inCart = cart.find((x) => x.id === id);
      const disabled = inCart ? "disabled" : "";
      const text = inCart ? "Added in Cart" : "Add to Cart";
  
      return `
      <div class="product">
        <img src="${image}" alt="${title}" />
        <h3>${title}</h3>
        <h5>${price.format()}</h5>
        <button ${disabled} data-id=${id}>${text}</button>
      </div>`;
    }).join("");
  };

//carregar produtos da api
  const loadProducts = async (apiURL) => {
    try {
      const response = await fetch(apiURL);
      if (!response.ok) throw new Error(`http error! status=${response.status}`);
      products = await response.json();
      console.log(products);
    } catch (error) {
      console.error("fetch error:", error);
    }
  };

//função para calcular o total
  const calculateTotal = () => {
    return cart.map(({ id, qty }) => {
      const { price } = products.find((x) => x.id === id);
      return qty * price;
    }).reduce((sum, number) => sum + number, 0);
  };

//formatar preços
Number.prototype.format = function () {
    return this.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

//inicializar os eventos
setupListeners();