import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
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
  // Lista para o modo paginado (quando nenhum filtro está ativo)
  paginatedPokemons: any[] = [];
  limit: number = 20;
  offset: number = 0;

  // Valores dos filtros selecionados
  selectedType: string = "";
  selectedGeneration: string = "";

  // Lista de tipos para o select
  pokemonTypes: string[] = [
    'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Lista de gerações para o select (conforme a PokeAPI)
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

      // Limpa os filtros selecionados
      this.selectedType = "";
      this.selectedGeneration = "";
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

  // Atualiza o filtro de tipo e aplica os filtros
  filterByType(selectedType: string): void {
    this.selectedType = selectedType;
    this.applyFilters();
  }

  // Atualiza o filtro de geração e aplica os filtros
  filterByGeneration(selectedGeneration: string): void {
    this.selectedGeneration = selectedGeneration;
    this.applyFilters();
  }

  // Aplica os filtros (tipo e geração) combinados
  applyFilters(): void {
    if (!this.selectedType && !this.selectedGeneration) {
      // Sem filtros, carrega a lista paginada
      this.loadPaginatedPokemons();
    } else if (this.selectedType && !this.selectedGeneration) {
      // Apenas filtro de tipo
      this.pokeapiService.getPokemonsByType(this.selectedType).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    } else if (!this.selectedType && this.selectedGeneration) {
      // Apenas filtro de geração
      this.pokeapiService.getPokemonsByGeneration(this.selectedGeneration).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    } else if (this.selectedType && this.selectedGeneration) {
      // Ambos os filtros aplicados: faz a interseção dos resultados
      forkJoin([
        this.pokeapiService.getPokemonsByType(this.selectedType),
        this.pokeapiService.getPokemonsByGeneration(this.selectedGeneration)
      ]).subscribe(([pokemonsByType, pokemonsByGen]) => {
        // Realiza a interseção comparando pelo nome
        const intersection = pokemonsByType.filter(pokemon =>
          pokemonsByGen.some(p => p.name === pokemon.name)
        );
        this.filteredPokemons = intersection;
      });
    }
  }
}
