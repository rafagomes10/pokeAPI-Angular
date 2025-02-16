import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PokeapiService } from '../../services/pokeapi.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
})
export class PokemonListComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();
  searchTerm: string = '';

  filteredPokemons: any[] = [];
  paginatedPokemons: any[] = [];
  limit: number = 20;
  offset: number = 0;

  selectedType: string = "";
  selectedGeneration: string = "";

  pokemonTypes: string[] = [
    'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  pokemonGenerations: string[] = [
    'generation-i', 'generation-ii', 'generation-iii', 'generation-iv',
    'generation-v', 'generation-vi', 'generation-vii', 'generation-viii'
  ];

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
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  searchPokemon(term: string): void {
    this.searchSubject.next(term);
  }

  private performSearch(term: string): void {
    if (!term || !term.trim()) {
      this.applyFilters();
      return;
    }

    this.pokeapiService.searchPokemonByName(term.trim().toLowerCase()).subscribe({
      next: (pokemons) => {
        this.filteredPokemons = pokemons;
      },
      error: () => {
        this.filteredPokemons = [];
      }
    });
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
      this.loadPaginatedPokemons();
    } else if (this.selectedType && !this.selectedGeneration) {
      this.pokeapiService.getPokemonsByType(this.selectedType).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    } else if (!this.selectedType && this.selectedGeneration) {
      this.pokeapiService.getPokemonsByGeneration(this.selectedGeneration).subscribe((pokemons) => {
        this.filteredPokemons = pokemons;
      });
    } else if (this.selectedType && this.selectedGeneration) {
      forkJoin([
        this.pokeapiService.getPokemonsByType(this.selectedType),
        this.pokeapiService.getPokemonsByGeneration(this.selectedGeneration)
      ]).subscribe(([pokemonsByType, pokemonsByGen]) => {
        const intersection = pokemonsByType.filter(pokemon =>
          pokemonsByGen.some(p => p.name === pokemon.name) || !pokemonsByGen.length
        );
        this.filteredPokemons = intersection;
      });
    }
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}
