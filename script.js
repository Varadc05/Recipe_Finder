const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const recipesDiv = document.getElementById("recipes");
const categoryFilter = document.getElementById("categoryFilter");
const areaFilter = document.getElementById("areaFilter");
const modal = document.getElementById("recipeModal");
const modalBody = document.getElementById("modalBody");
const closeModal = modal.querySelector(".close");

// Fetch and show recipes
searchBtn.addEventListener("click", () => fetchRecipes(searchInput.value));

searchInput.addEventListener("input", () => {
  const query = searchInput.value;
  if(query.length > 2) fetchRecipes(query);
});

// Fetch categories & areas
fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
  .then(res => res.json())
  .then(data => populateDropdown(categoryFilter, data.meals, 'strCategory'));

fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
  .then(res => res.json())
  .then(data => populateDropdown(areaFilter, data.meals, 'strArea'));

function populateDropdown(dropdown, items, key) {
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item[key];
    option.textContent = item[key];
    dropdown.appendChild(option);
  });
}

categoryFilter.addEventListener("change", () => filterRecipes());
areaFilter.addEventListener("change", () => filterRecipes());

let currentRecipes = [];

function fetchRecipes(query) {
  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
    .then(res => res.json())
    .then(data => {
      currentRecipes = data.meals || [];
      showRecipes(currentRecipes);
    });
}

function showRecipes(meals) {
  recipesDiv.innerHTML = "";
  if (!meals.length) {
    recipesDiv.innerHTML = "<p>No recipes found</p>";
    return;
  }

  meals.forEach(meal => {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe");
    recipeDiv.innerHTML = `
      <img src="${meal.strMealThumb}">
      <h3>${meal.strMeal}</h3>
      <p>${meal.strArea}</p>
    `;
    recipeDiv.addEventListener("click", () => showRecipeModal(meal));
    recipesDiv.appendChild(recipeDiv);
  });
}

// Modal
function showRecipeModal(meal) {
  modalBody.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}">
    <h3>Ingredients:</h3>
    <ul>${getIngredientsList(meal).map(i => `<li>${i}</li>`).join('')}</ul>
    <h3>Instructions:</h3>
    <p>${meal.strInstructions}</p>
    ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a>` : ''}
  `;
  modal.style.display = "block";
}

closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target == modal) modal.style.display = "none"; }

function getIngredientsList(meal) {
  const ingredients = [];
  for(let i=1; i<=20; i++) {
    if(meal[`strIngredient${i}`]) ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
  }
  return ingredients;
}

// Filter
function filterRecipes() {
  const category = categoryFilter.value;
  const area = areaFilter.value;

  const filtered = currentRecipes.filter(r => {
    return (category ? r.strCategory === category : true) &&
           (area ? r.strArea === area : true);
  });

  showRecipes(filtered);
}
