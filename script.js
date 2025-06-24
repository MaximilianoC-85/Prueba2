const API_BASE_URL = "https://rickandmortyapi.com/api/character/";

// Referencias a los elementos del DOM
const getAllCharactersBtn = document.getElementById('getAllCharacters');
const applyFiltersBtn = document.getElementById('applyFilters');
const nameFilterInput = document.getElementById('nameFilter');
const statusFilterInput = document.getElementById('statusFilter');
const speciesFilterInput = document.getElementById('speciesFilter');
const typeFilterInput = document.getElementById('typeFilter');
const genderFilterInput = document.getElementById('genderFilter');
const resultsDiv = document.getElementById('results');
const errorMessageDiv = document.getElementById('errorMessage');
const errorTextSpan = document.getElementById('errorText');

// Elementos de paginación
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfoSpan = document.getElementById('pageInfo');

// Variables para paginación
let currentPageUrl = API_BASE_URL;
let nextPageUrl = null;
let prevPageUrl = null;
let totalPages = 1;
let currentPageNumber = 1;

// Mapa de traducción
const translationMap = {
    'Alive': 'Vivo', 'Dead': 'Muerto', 'unknown': 'Desconocido',
    'Human': 'Humano', 'Alien': 'Alien', 'Humanoid': 'Humanoide',
    'Poopybutthole': 'Poopybutthole', 'Mythological Creature': 'Criatura Mitológica',
    'Animal': 'Animal', 'Robot': 'Robot', 'Cronenberg': 'Cronenberg',
    'Disease': 'Enfermedad',
    'Male': 'Masculino', 'Female': 'Femenino', 'Genderless': 'Sin Género'
};

/**
 * Traduce un valor.
 * @param {string} value - Valor a traducir.
 * @returns {string} Valor traducido o original.
 */
function translateValue(value) {
    return translationMap[value] || value;
}

/**
 * Muestra un mensaje de error.
 * @param {string} message - Mensaje de error a mostrar.
 */
function displayError(message) {
    errorMessageDiv.style.display = 'flex';
    errorMessageDiv.classList.remove('hidden');
    errorTextSpan.textContent = message;
    resultsDiv.innerHTML = '';
    paginationControls.style.display = 'none';
}

/**
 * Oculta el mensaje de error.
 */
function hideError() {
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.classList.add('hidden');
    errorTextSpan.textContent = '';
}

/**
 * Limpia el área de resultados.
 */
function clearResults() {
    resultsDiv.innerHTML = '';
}

/**
 * Resetea los campos de filtro.
 */
function resetFilterFields() {
    nameFilterInput.value = '';
    statusFilterInput.value = '';
    speciesFilterInput.value = '';
    typeFilterInput.value = '';
    genderFilterInput.value = '';
}

/**
 * Muestra una lista de personajes.
 * @param {Array<Object>} characters - Array de objetos de personajes.
 */
function displayCharacters(characters) {
    hideError();
    clearResults();

    if (!characters || characters.length === 0) {
        resultsDiv.innerHTML = '<p class="text-center text-gray-600 text-lg">No se encontraron personajes.</p>';
        paginationControls.style.display = 'none';
        return;
    }

    paginationControls.style.display = 'flex';

    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.classList.add('character-card');

        characterCard.innerHTML = `
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">${character.name}</h2>
            <img src="${character.image}" alt="${character.name}" class="w-32 h-32 rounded-lg object-cover mb-4 shadow-md">
            <p class="text-gray-600"><strong class="font-medium">Estado:</strong> ${translateValue(character.status)}</p>
            <p class="text-gray-600"><strong class="font-medium">Especie:</strong> ${translateValue(character.species)}</p>
            <p class="text-gray-600"><strong class="font-medium">Tipo:</strong> ${character.type ? translateValue(character.type) : 'N/A'}</p>
            <p class="text-gray-600"><strong class="font-medium">Género:</strong> ${translateValue(character.gender)}</p>
        `;
        resultsDiv.appendChild(characterCard);
    });
}

/**
 * Actualiza los controles de paginación.
 */
function updatePaginationControls() {
    prevPageBtn.disabled = !prevPageUrl;
    nextPageBtn.disabled = !nextPageUrl;

    const urlParams = new URLSearchParams(currentPageUrl.split('?')[1]);
    const page = urlParams.get('page');
    currentPageNumber = page ? parseInt(page) : 1;

    pageInfoSpan.textContent = `Página ${currentPageNumber} de ${totalPages}`;
}

/**
 * Realiza una solicitud a la API de Rick & Morty.
 * @param {string} url - URL de la API.
 */
async function fetchCharacters(url) {
    hideError();
    clearResults();
    paginationControls.style.display = 'none';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.error || 'No se pudo obtener la información.'}`);
        }
        const data = await response.json();

        currentPageUrl = url;
        nextPageUrl = data.info.next;
        prevPageUrl = data.info.prev;
        totalPages = data.info.pages;

        displayCharacters(data.results);
        updatePaginationControls();
    } catch (error) {
        console.error('Error al obtener personajes:', error);
        displayError(`Hubo un problema al cargar los personajes: ${error.message}`);
    }
}

// Event Listeners
getAllCharactersBtn.addEventListener('click', () => {
    resetFilterFields();
    fetchCharacters(API_BASE_URL);
});

applyFiltersBtn.addEventListener('click', () => {
    const params = new URLSearchParams();

    if (nameFilterInput.value) { params.append('name', nameFilterInput.value); }
    if (statusFilterInput.value) { params.append('status', statusFilterInput.value.toLowerCase()); }
    if (speciesFilterInput.value) { params.append('species', speciesFilterInput.value); }
    if (typeFilterInput.value) { params.append('type', typeFilterInput.value); }
    if (genderFilterInput.value) { params.append('gender', genderFilterInput.value.toLowerCase()); }

    const urlWithFilters = `${API_BASE_URL}?${params.toString()}`;
    fetchCharacters(urlWithFilters);
});

prevPageBtn.addEventListener('click', () => {
    if (prevPageUrl) {
        fetchCharacters(prevPageUrl);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (nextPageUrl) {
        fetchCharacters(nextPageUrl);
    }
});

// Carga inicial al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchCharacters(API_BASE_URL);
});
