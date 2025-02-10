import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokeapiService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

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

  // Novo método para buscar todos os Pokémon de um determinado tipo
  getPokemonsByType(type: string): Observable<any[]> {
    return this.http.get<any>(`https://pokeapi.co/api/v2/type/${type}`).pipe(
      mergeMap(response => {
        // O array response.pokemon possui itens no formato { pokemon: { name, url }, slot }
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
}
