import { HttpClient } from '@angular/common/http';
import { Injectable, inject} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BiometriaService {

  private _http = inject(HttpClient);
  

  processarBiometria(data: any) {
    return this._http.post<any>(
      'http://127.0.0.1:8000/api/v1/biometria',
      data
    );
  }
}
