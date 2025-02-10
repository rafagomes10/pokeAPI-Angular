import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokeapiService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) { }

  getPokemons(limit: number = 10, offset: number = 0): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?limit=${limit}&offset=${offset}`).pipe(
      mergeMap(response => {
        // Para cada Pokémon da lista, fazemos uma requisição para obter seus detalhes
        const requests = response.results.map((pokemon: any) =>
          this.http.get<any>(pokemon.url).pipe(
            map(detail => {
              const id = pokemon.url.split('/').filter(Boolean).pop(); // Extrai o ID
              const types = detail.types.map((t: any) => t.type.name);   // Extrai os tipos

              return {
                name: pokemon.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: types,
              };
            })
          )
        );

        // Retorna um Observable que emite um array com os resultados de todas as requisições.
        // forkJoin retorna um Observable que emite um array com os resultados de todas as requisições.
        // Fazemos um cast para informar ao TypeScript que o resultado será um Observable<any[]>
        return forkJoin(requests) as Observable<any[]>;
      })
    );
  }
}
