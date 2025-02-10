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
  // Lista que será exibida (filtrada ou paginada)
  filteredPokemons: any[] = [];
  // Guarda a lista da página quando nenhum filtro estiver ativo
  paginatedPokemons: any[] = [];
  limit: number = 20;
  offset: number = 0;

  // Lista de tipos para o select
  pokemonTypes: string[] = [
    'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Mapeamento de cores para os tipos
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

  constructor(private pokeapiService: PokeapiService) {}

  ngOnInit(): void {
    this.loadPaginatedPokemons();
  }

  // Carrega a página padrão de Pokémon
  loadPaginatedPokemons(): void {
    this.pokeapiService.getPokemons(this.limit, this.offset).subscribe((pokemons) => {
      this.paginatedPokemons = pokemons;
      // Se nenhum filtro estiver ativo, exibimos os dados paginados
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

  // Filtra os Pokémon com base no tipo selecionado
  // Se nenhum tipo for selecionado, volta para a lista paginada
  filterByType(selectedType: string): void {
    if (!selectedType) {
      this.loadPaginatedPokemons();
    } else {
      this.pokeapiService.getPokemonsByType(selectedType).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    }
  }
}
