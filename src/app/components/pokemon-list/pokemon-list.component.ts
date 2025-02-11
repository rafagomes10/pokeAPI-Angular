import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeapiService } from '../../services/pokeapi.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
})
export class PokemonListComponent implements OnInit {
  // Para exibição (modo filtrado ou paginado)
  filteredPokemons: any[] = [];
  // Para paginação (lista padrão)
  paginatedPokemons: any[] = [];
  limit: number = 20;
  offset: number = 0;

  // Lista de tipos disponíveis
  pokemonTypes: string[] = [
    'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Lista de gerações disponíveis (conforme a PokeAPI)
  pokemonGenerations: string[] = [
    'generation-i', 'generation-ii', 'generation-iii', 'generation-iv',
    'generation-v', 'generation-vi', 'generation-vii', 'generation-viii'
  ];

  // Mapeamento de tipos para cores pastel
  typeColors: { [key: string]: string } = {
    fire: '#FF9A8B',
    water: '#A1C4D7',
    grass: '#B0E57C',
    electric: '#F2E03B',
    ice: '#AEE2F0',
    fighting: '#F5B7B1',
    poison: '#D6A5D6',
    ground: '#F4A300',
    flying: '#A0C4FF',
    psychic: '#D4A5A5',
    bug: '#C2D9B4',
    ghost: '#C6A9D6',
    dragon: '#FFADAD',
    dark: '#6A4C4C',
    steel: '#A3B1C6',
    fairy: '#F2C1D1'
  };

  constructor(private pokeapiService: PokeapiService) { }

  ngOnInit(): void {
    this.loadPaginatedPokemons();
  }

  // Carrega a página padrão (modo sem filtro)
  loadPaginatedPokemons(): void {
    this.pokeapiService.getPokemons(this.limit, this.offset).subscribe((pokemons) => {
      this.paginatedPokemons = pokemons;
      this.filteredPokemons = pokemons;
    });
  }

  nextPage(): void {
    this.offset += this.limit;
    this.loadPaginatedPokemons();
  }

  prevPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.loadPaginatedPokemons();
    }
  }

  // Retorna a cor com base no primeiro tipo do Pokémon
  getTypeColor(types: string[]): string {
    if (!types || types.length === 0) {
      return '#FFF';
    }
    for (let type of types) {
      if (this.typeColors[type]) {
        return this.typeColors[type];
      }
    }
    return '#FFF';
  }

  // Filtro por tipo (utiliza o método existente)
  filterByType(selectedType: string): void {
    if (!selectedType) {
      // Se nenhum tipo for selecionado, volta para a lista padrão paginada
      this.loadPaginatedPokemons();
    } else {
      this.pokeapiService.getPokemonsByType(selectedType).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    }
  }

  // Filtro por geração (utiliza um novo método do serviço)
  filterByGeneration(selectedGeneration: string): void {
    if (!selectedGeneration) {
      // Se nenhum filtro de geração for selecionado, volta para a lista padrão paginada
      this.loadPaginatedPokemons();
    } else {
      this.pokeapiService.getPokemonsByGeneration(selectedGeneration).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    }
  }
}
