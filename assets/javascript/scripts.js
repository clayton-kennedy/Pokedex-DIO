const pokemonsList = document.getElementById('pokemonsList');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search');
const loadMore = document.getElementById('loadMore');
let offset = 0;
const limit = 20;
const baseUrl = 'https://pokeapi.co/api/v2/pokemon/';

let pokemonDetails = [];
fetchPokemons(offset, limit);

function fetchPokemonDetails(pokemonUrl) {
    return fetch(pokemonUrl)
        .then(response => response.json())
        .then(pokemonData => {
            return {
                name: pokemonData.name,
                number: pokemonData.id,
                types: pokemonData.types.map(typeData => typeData.type.name),
                photo: pokemonData.sprites.other.dream_world.front_default,
                photo2: pokemonData.sprites.other['official-artwork'].front_default,
                ability_first: pokemonData.abilities[0].ability.name,
                ability_second: pokemonData.abilities[1] ? pokemonData.abilities[1].ability.name : null,
                height: pokemonData.height,
                weight: pokemonData.weight,
                hp: pokemonData.stats[0].base_stat,
                atk: pokemonData.stats[1].base_stat,
                defense: pokemonData.stats[2].base_stat,
                special_attack: pokemonData.stats[3].base_stat,
                special_defense: pokemonData.stats[4].base_stat,
                speed: pokemonData.stats[5].base_stat
            };
        })
        .catch(error => {
            console.error('Erro ao buscar detalhes do Pokemon:', error);
        });
    }
// ================ CARREGAR MAIS POKEMONS MODIFICANDO O LIMIT ===============
loadMore.addEventListener('click', () => {
    offset += limit;
    fetchPokemons(offset, limit);
});
// ================ MOSTRAR CARD DO POKEMON ===============
function fetchPokemons(offset, limit) {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    fetch(url)
        .then(response => response.json())
        .then(jsonBody => jsonBody.results)
        .then(pokemonList => {
            const promises = pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url));
            Promise.all(promises)
                .then(pokemonDataList => {
                    pokemonDetails = [...pokemonDetails, ...pokemonDataList];
                    console.log('pokemonDetails: ',pokemonDetails);
                    const newHTML = pokemonDataList.map(pokemon => `
                    <li class="pokemon ${pokemon.types[0]}" data-number="${pokemon.number}">
                            <span class="number">#${pokemon.number}</span>
                            <span class="name">${pokemon.name}</span>
                            <div class="detail">
                                <ol class="types">
                                    ${pokemon.types.map(type => `<li class="type ${type}">${type}</li>`).join('')}
                                </ol>
                                <img src="${pokemon.photo2}" alt="Image ${pokemon.name}">
                            </div>
                        </li>
                    `
                    ).join('');
                    pokemonsList.innerHTML += newHTML;
                });
        })
        .catch(error => {
            console.error('Erro ao buscar a lista de Pokemon:', error);
        });
}
// ================ COLETAR DETALHES DO POKEMON PARA O MODAL ===============
pokemonsList.addEventListener('click', (event) => {
    if (event.target.closest('li')) {
        const clickedLi = event.target.closest('li');
        const pokemonNumber = clickedLi.getAttribute('data-number');
        const selectedPokemon = pokemonDetails.find(pokemon => pokemon.number === parseInt(pokemonNumber));

        detailsPokemon(selectedPokemon);
        const modal = document.querySelector('#modal');
        modal.style.display = 'flex';
    }
});
// ================ MOSTRAR DETALHES DO POKEMON NO MODAL ===============
function detailsPokemon(pokemon) {
    const detailsModal = document.getElementById('details');

    detailsModal.style.backgroundColor = '';
    // Adiciona uma classe CSS com base no tipo do Pokémon
    detailsModal.className = 'details-modal ' + pokemon.types[0];

    const detalhesPokemon = `
        <div class="visualPokemon">
        ${pokemon.name}
        <img src="${pokemon.photo}" class="pokemonPhoto-modal" alt="Image ${pokemon.name}">
        <img src="./assets/images/iconX.png" id="fecharModal" alt="Icone fechar modal">
        </div>
        <article class="infos">
        <div class="stats-pokemon">
        <span class="titleSection">Stats</span>
        <ul>
            <li>HP: <span class="hp-pokemon-modal">${pokemon.hp}</span></li>
            <li>Attack: <span class="attack-pokemon-modal">${pokemon.atk}</span></li>
            <li>Defense: <span class="defense-pokemon-modal">${pokemon.defense}</span></li>
            <li>Special-attack: <span class="special-attack-pokemon-modal">${pokemon.special_attack}</span></li>
            <li>Special-defense: <span class="special-defense-pokemon-modal">${pokemon.special_defense}</span></li>
            <li>Speed: <span class="speed-pokemon-modal">${pokemon.speed}</span></li>
        </ul>
    </div>
            <div class="about">
                <span class="titleSection">About</span>
                <ul>
                    <li>Height: <span class="altura-pokemon-modal">${pokemon.height} dm</span></li>
                    <li>Weight: <span class="altura-pokemon-modal">${pokemon.weight} hg</span></li>
                    <li>Skill: <span class="habilidade1-modal">${pokemon.ability_first}</span></li>
                    <li>Skill: <span class="habilidade2-modal">${pokemon.ability_second || 'N/A'}</span></li>
                </ul>
            </div>
            <div class="types-pokemon">
                <span class="titleSection">Types</span>
                <ul>
                    ${pokemon.types.map(type => `<li class="type">${type}</li>`).join('')}
                </ul>
            </div>
        </article>`;
        detailsModal.innerHTML = detalhesPokemon;

        const fecharModal = document.querySelector('#fecharModal');
        fecharModal.addEventListener('click', () => {
        modal.style.display = 'none';
});
}
// ================ BUSCAR POKEMON ===============  
function searchPokemon(pokemonName) {
    const searchUrl = `${baseUrl}${pokemonName.toLowerCase()}`;
    fetchPokemonDetails(searchUrl).then(pokemonData => {
        if (pokemonData) {
            detailsPokemon(pokemonData);
            const modal = document.querySelector('#modal');
            modal.style.display = 'flex';
        } else {
            pokemonsList.innerHTML = 'Nenhum Pokémon encontrado.';
        }
    });
}
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    if (searchTerm) {
        searchPokemon(searchTerm);
    }
});
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


