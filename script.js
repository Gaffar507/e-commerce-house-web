var client = contentful.createClient({
    space: '#',
    accessToken: '#'
});

// variables declaration

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const closeOverlay = document.querySelector('.close-overlay');

// cart
let cart = [];
let buttonDOM = [];

// getting the products
class Products {
    async getProducts() {
        try {
            // let data = await client.getEntries({
            //     content_type: 'houseListing'
            // });

            let result = await fetch('products.json');
            let data = await result.json();

            let products = data.items;
            products = products.map((product) => {
                const { id } = product.sys;
                const { title, price } = product.fields;
                const image = product.fields.image.fields.file.url;
                return { id, title, price, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}
// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach((product) => {
            result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->
            `;
            productsDOM.innerHTML = result;
        });
    }
    getBackButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonDOM = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id);
            if (inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
            }

            button.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                // have to complete these statements

                // get product from products
                let cartProduct = { ...Storage.getStorage(id), amount: 1 };
                // add product to the cart
                cart = [...cart, cartProduct];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCart(cartProduct);
                // show the cart
                this.showCart();
            });
        });
    }

    setCartValues(cartItem) {
        let totalItem = 0;
        let totalPrice = 0;

        cartItem.map((item) => {
            totalPrice += item.price * item.amount;
            totalItem += item.amount;
        });
        cartItems.innerHTML = totalItem;
        cartTotal.innerHTML = parseFloat(totalPrice.toFixed(2));
    }

    addCart(cart) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${cart.image} alt="product">
        <div>
            <h4>${cart.title}</h4>
            <h5>$${cart.amount}</h5>
            <span class="remove-item" data-id=${cart.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${cart.id}></i>
                <p class="item-amount">${cart.amount}</p>
            <i class="fas fa-chevron-down" data-id=${cart.id}></i>
        </div>`;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.closeCart);
        closeOverlay.addEventListener('click', this.closeCart);
    }

    populateCart(cart) {
        cart.forEach((item) => this.addCart(item));
    }

    closeCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    // cart logic starts
    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener('click', () => this.clearCart());

        // remove cart
        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                this.removeAll(id);
                cartContent.removeChild(event.target.parentElement.parentElement);
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let up = event.target;
                let id = up.dataset.id;
                let totalItem = cart.find((item) => item.id === id);
                totalItem.amount = totalItem.amount + 1;
                up.nextElementSibling.innerText = totalItem.amount;
                this.setCartValues(cart);
                Storage.saveCart(cart);
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let down = event.target;
                let id = down.dataset.id;
                let totalItem = cart.find((item) => item.id === id);
                totalItem.amount = totalItem.amount - 1;
                if (totalItem.amount > 0) {
                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    down.previousElementSibling.innerText = totalItem.amount;
                } else {
                    cartContent.removeChild(down.parentElement.parentElement);
                    this.removeAll(id);
                }
            }
        });
    }
    clearCart() {
        let cartItems = cart.map((id) => id.id);
        cartItems.forEach((id) => this.removeAll(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.closeCart();
    }
    removeAll(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.singleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to cart`;
    }

    singleButton(id) {
        return buttonDOM.find((button) => button.dataset.id === id);
    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getStorage(id) {
        let products = JSON.parse(localStorage.getItem('products')) ? JSON.parse(localStorage.getItem('products')) : [];
        return products.find((product) => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.setupAPP();
    const products = new Products();
    products
        .getProducts()
        .then((product) => {
            ui.displayProducts(product);
            Storage.saveProducts(product);
        })
        .then(() => {
            ui.getBackButtons();
            ui.cartLogic();
        });
});
