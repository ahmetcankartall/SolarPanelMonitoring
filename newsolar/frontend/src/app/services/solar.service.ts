import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

interface ApiResponse {
  feeds: Array<{
    created_at: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    field6: string;
    field7: string;
    field8: string;
  }>;
}

export interface SolarData {
  created_at: string;
  anlikGucUretimi: number;
  panelSicakligi: number;
  panelVerimi: number;
  gunesIsinimi: number;
  akuSarjDurumu: number;
  akuGucDegisimi: number;
  anlikEnerjiTuketimi: number;
  sebekeyeVerilenEnerji: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolarService {
  private apiUrl = 'http://localhost:3000/solar-data';

  constructor(private http: HttpClient) { }

  getSolarData(): Observable<SolarData[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => {
        if (!response.feeds || response.feeds.length === 0) {
          return [];
        }

        return response.feeds.map(feed => ({
          created_at: feed.created_at,
          anlikGucUretimi: this.parseNumber(feed.field1),
          panelSicakligi: this.parseNumber(feed.field2),
          panelVerimi: this.parseNumber(feed.field3),
          gunesIsinimi: this.parseNumber(feed.field4),
          akuSarjDurumu: this.parseNumber(feed.field5),
          akuGucDegisimi: this.parseNumber(feed.field6),
          anlikEnerjiTuketimi: this.parseNumber(feed.field7),
          sebekeyeVerilenEnerji: this.parseNumber(feed.field8)
        }));
      })
    );
  }

  private parseNumber(value: string): number {
    if (!value) return 0;
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }
}
