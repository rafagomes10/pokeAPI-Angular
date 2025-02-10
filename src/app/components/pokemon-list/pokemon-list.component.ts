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
  pokemons: any[] = [];
  limit: number = 20;
  offset: number = 0;

  // Mapeamento de tipos de Pokémon para cores pastel
  typeColors: { [key: string]: string } = {
    fire: '#FF9A8B',    // Fogo - Laranja pastel
    water: '#A1C4D7',   // Água - Azul pastel
    grass: '#B0E57C',   // Planta - Verde pastel
    electric: '#F2E03B', // Elétrico - Amarelo pastel
    ice: '#AEE2F0',     // Gelo - Azul claro pastel
    fighting: '#F5B7B1', // Lutador - Rosa claro pastel
    poison: '#D6A5D6',  // Veneno - Roxo pastel
    ground: '#F4A300',  // Terrestre - Amarelo queimado
    flying: '#A0C4FF',  // Voador - Azul claro pastel
    psychic: '#D4A5A5', // Psíquico - Rosa claro pastel
    bug: '#C2D9B4',     // Inseto - Verde suave
    ghost: '#C6A9D6',   // Fantasma - Lilás pastel
    dragon: '#FFADAD',  // Dragão - Vermelho claro pastel
    dark: '#6A4C4C',    // Sombrio - Marrom claro
    steel: '#A3B1C6',   // Metálico - Cinza claro
    fairy: '#F2C1D1'    // Fada - Rosa claro pastel
  };

  constructor(private pokeapiService: PokeapiService) {}

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.pokeapiService.getPokemons(this.limit, this.offset).subscribe((pokemons) => {
      this.pokemons = pokemons;
    });
  }

  nextPage(): void {
    this.offset += this.limit; // Avança para a próxima página
    this.loadPokemons();
  }

  prevPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit; // Volta para a página anterior
      this.loadPokemons();
    }
  }

  // Função para pegar a cor correspondente ao tipo do Pokémon
  getTypeColor(types: string[]): string {
    if (!types || types.length === 0) {
      return '#FFF'; // Branco padrão se não houver tipos
    }
    // Retorna a cor do primeiro tipo encontrado que tenha mapeamento
    for (let type of types) {
      if (this.typeColors[type]) {
        return this.typeColors[type];
      }
    }
    return '#FFF';
  }

}
