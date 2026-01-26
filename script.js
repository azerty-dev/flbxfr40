// =======================
// CONFIGURATION
// =======================
const SHEET_URL = "https://opensheet.elk.sh/1fXCA15-mababl5f3QZWs3QstLkgiQzH0OUi6fGXZbsc/Feuille1";

let data = [];

// =======================
// Filtres
// =======================
const minSlider = document.getElementById("minPrice");
const maxSlider = document.getElementById("maxPrice");
const minValue = document.getElementById("minPriceValue");
const maxValue = document.getElementById("maxPriceValue");
const checkboxes = document.querySelectorAll(".dropdown-content input");
const noResult = document.getElementById("noResult");

minValue.textContent = minSlider.value;
maxValue.textContent = maxSlider.value;

minSlider.addEventListener("input", filter);
maxSlider.addEventListener("input", filter);
checkboxes.forEach(cb => cb.addEventListener("change", filter));

// =======================
// CHARGEMENT OpenSheet JSON
// =======================
fetch(SHEET_URL)
  .then(res => res.json())
  .then(json => {
    data = json; // OpenSheet fournit un tableau d'objets directement
    afficherObjets();
    filter();
  })
  .catch(err => console.error("Erreur chargement OpenSheet :", err));

// =======================
// AFFICHAGE CARDS
// =======================
function afficherObjets() {
  const container = document.querySelector(".container");
  container.innerHTML = "";

  data.forEach(objet => {
    const prix = parseFloat(objet.u_price);
    const total = parseInt(objet.for_sale);
    const sold = parseInt(objet.sold);
    const restant = total - sold;
    const estFini = restant <= 0;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.price = prix;
    card.dataset.category = objet.cat;


    card.innerHTML = `
      <img src="assets/${objet.image}" alt="${objet.name}" onerror="this.src='assets/\FLBX-Logo_Fribourg_petit.png'">
      <h2>${objet.name}</h2>
      <p>Catégorie : ${objet.cat}</p>
      <p><strong>${prix} CHF</strong></p>
      <p>
        Financé : ${sold} / ${total}<br>
        <strong>Restant : ${Math.max(0, restant)}</strong>
      </p>
      <button ${estFini ? "disabled" : ""} 
        onclick="donner('${objet.name}', ${prix})">
        ${estFini ? "Déjà financé ✅" : "Financer"}
      </button>
    `;

    if (estFini) card.style.opacity = "0.6";

    container.appendChild(card);
  });
}

// =======================
// FILTRAGE
// =======================
function filter() {
  const min = parseInt(minSlider.value);
  const max = parseInt(maxSlider.value);
  minValue.textContent = min;
  maxValue.textContent = max;

  const selectedCategories = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  let visibleCount = 0;

  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    const category = card.dataset.category;

    const priceOK = price >= min && price <= max;
    const categoryOK = selectedCategories.includes(category);

    if (priceOK && categoryOK) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  noResult.style.display = visibleCount === 0 ? "block" : "none";
}

// =======================
// MODAL DON
// =======================
function donner(objet, prix) {
  document.getElementById("objetNom").textContent = objet;
//   document.getElementById("objetNom2").textContent = objet;
  document.getElementById("montant").textContent = prix;
  document.getElementById("modal").style.display = "block";
}

function fermerModal() {
  document.getElementById("modal").style.display = "none";
}


// =======================
// BTN DROPDOWN
// =======================
document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const dropdown = btn.nextElementSibling; // dropdown-content
    dropdown.classList.toggle("show");
  });
});

// Fermer le menu si on clique ailleurs
window.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-content").forEach(menu => {
    if (!menu.contains(e.target) && !menu.previousElementSibling.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});
