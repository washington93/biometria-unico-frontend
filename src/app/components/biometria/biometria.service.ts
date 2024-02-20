import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// const baseurl = 'http://127.0.0.1:8000';
const baseurl = 'https://washingtonsr.ngrok.app/backend';

@Injectable({
  providedIn: 'root',
})
export class BiometriaService {
  private _http = inject(HttpClient);

  processarBiometria(data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
    });

    return this._http.post<any>(`${baseurl}/api/v1/biometria`, data, {
      headers: headers,
    });
  }

  buscarBiometrias() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
    });

    return this._http.get<any>(`${baseurl}/api/v1/biometria/all`, {
      headers: headers,
    });
  }

  buscarBiometria(id_biometria: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
    });

    return this._http.get<any>(`${baseurl}/api/v1/biometria/${id_biometria}`, {
      headers: headers,
    });
  }

  login(usuario: string, senha: string): Observable<any> {
    const body = `grant_type=&username=${encodeURIComponent(
      usuario
    )}&password=${encodeURIComponent(senha)}&scope=&client_id=&client_secret=`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this._http.post<any>(`${baseurl}/api/v1/login/access-token`, body, {
      headers: headers,
    });
  }
}
