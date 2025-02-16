import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

interface Pokemon {
  name: string;
  image: string;
  types: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PokeapiService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) { }

  // Método para paginação (quando nenhum filtro estiver ativo)
  getPokemons(limit: number = 10, offset: number = 0): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?limit=${limit}&offset=${offset}`).pipe(
      mergeMap(response => {
        const requests = response.results.map((pokemon: any) =>
          this.http.get<any>(pokemon.url).pipe(
            map(detail => {
              const id = pokemon.url.split('/').filter(Boolean).pop();
              const types = detail.types.map((t: any) => t.type.name);
              return {
                name: pokemon.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: types
              };
            })
          )
        );
        return forkJoin(requests) as Observable<any[]>;
      })
    );
  }

  // Método para buscar todos os Pokémon de um determinado tipo
  getPokemonsByType(type: string): Observable<any[]> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/type/${type}`).pipe(
      mergeMap(response => {
        // response.pokemon é um array com itens do tipo: { pokemon: { name, url }, slot }
        const requests = response.pokemon.map((p: any) => {
          const pokemonUrl = p.pokemon.url;
          return this.http.get<any>(pokemonUrl).pipe(
            map(detail => {
              const id = pokemonUrl.split('/').filter(Boolean).pop();
              const types = detail.types.map((t: any) => t.type.name);
              return {
                name: p.pokemon.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: types
              };
            })
          );
        });
        return forkJoin(requests) as Observable<any[]>;
      })
    );
  }

  // Método para buscar todos os Pokémon de uma geração
  getPokemonsByGeneration(generation: string): Observable<any[]> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/generation/${generation}`).pipe(
      mergeMap(response => {
        const requests = response.pokemon_species.map((species: any) => {
          const speciesUrl = species.url;
          const id = speciesUrl.split('/').filter(Boolean).pop();
          const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}/`;
          return this.http.get<any>(pokemonUrl).pipe(
            map(detail => {
              const types = detail.types.map((t: any) => t.type.name);
              return {
                name: species.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: types
              };
            })
          );
        });
        return forkJoin(requests) as Observable<any[]>;
      }),
      map(pokemons => {
        // Include Pokémon even if they are not in any generation
        return pokemons.filter(pokemon => pokemon.name);
      })
    );
  }

  searchPokemonByName(searchTerm: string): Observable<Pokemon[]> {
    return this.http.get<any>(`${this.apiUrl}?limit=5000`).pipe(
      mergeMap(response => {
        const requests = response.results.map((pokemon: any) =>
          this.http.get<any>(pokemon.url).pipe(
            map(detail => {
              const id = pokemon.url.split('/').filter(Boolean).pop();
              const types = detail.types.map((t: any) => t.type.name);
              return {
                name: pokemon.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: types
              } as Pokemon; // Ensure the returned object matches the Pokemon interface
            })
          )
        );
        return forkJoin(requests).pipe(
          map((pokemons: any) => pokemons.filter((pokemon: Pokemon) =>
            pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        );
      })
    );
  }
}
