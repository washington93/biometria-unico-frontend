import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  UnicoCheckBuilder,
  SelfieCameraTypes,
  UnicoThemeBuilder,
  MainView,
  CameraOpener,
  ErrorPictureResponse,
  SuccessPictureResponse,
  SupportPictureResponse,
} from 'unico-webframe';
import { BiometriaService } from './biometria.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biometria.component.html',
  styleUrl: './biometria.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BiometriaComponent implements OnInit {
  unicoCamera!: MainView;
  saveData: boolean = false;
  payload: any;

  logado: boolean = false;
  resultadoBiometria: any;

  processando: boolean = false;

  ngOnInit() {
    let accessToken = sessionStorage.getItem('access_token');
    this.logado = !!accessToken;

    let usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.usuario = usuario;
      this.lembrar = true;
    }

    if (this.logado) {
      this.init();
    }
  }

  biometriasAnteriores: any = [];

  init() {
    this.processando = true;
    this.biometriaService.buscarBiometrias().subscribe({
      next: (data) => {
        console.log('data -> ', data);
        this.biometriasAnteriores = data;
        this.processando = false;
      },
      error: (error) => {
        console.log('error -> ', error);
        this.processando = false;
      },
    });
  }

  constructor(private biometriaService: BiometriaService) {
    this.configUnicoWebframe();
  }

  async openCam() {
    try {
      let cameraPromised: CameraOpener =
        await this.unicoCamera.prepareSelfieCamera(
          `/assets/unico.config.json`,
          SelfieCameraTypes.NORMAL
        );

      const callback = {
        on: {
          success: async (obj: SuccessPictureResponse) => {
            const data: any = {
              onlySelfie: true,
              imagebase64: obj?.encrypted,
            };
            this.processando = true;
            this.biometriaService.processarBiometria(data).subscribe({
              next: (data) => {
                console.log('data -> ', data);
                this.resultadoBiometria = data;
                this.init();
              },
              error: (error) => {
                console.log('error -> ', error);
                this.resultadoBiometria = error;
                alert(error?.error?.detail);
                this.processando = false;
              },
            });
          },
          error: (error: ErrorPictureResponse) => {
            console.log('ErrorPictureResponse -> ', error);
            this.processando = false;
          },
          support: (error: SupportPictureResponse) => {
            console.log('SupportPictureResponse -> ', error);
            this.processando = false;
          },
        },
      };

      cameraPromised.open(callback);
    } catch (error: any) {
      console.log('openCam -> ', error);
      return;
    }
  }

  async configUnicoWebframe() {
    let unicoCameraBuilder = new UnicoCheckBuilder();
    unicoCameraBuilder.setResourceDirectory('/assets');

    const unicoTheme = new UnicoThemeBuilder()
      .setColorSilhouetteSuccess('#e1173f')
      .setColorSilhouetteError('#e1173f')
      .setColorSilhouetteNeutral('#fcfcfc')
      .setBackgroundColor('#e4e4e4')
      .setColorText('#e1173f')
      .setBackgroundColorComponents('#e1173f')
      .setColorTextComponents('#e4e4e4')
      .setBackgroundColorButtons('#e1173f')
      .setColorTextButtons('#e4e4e4')
      .setBackgroundColorBoxMessage('#fff')
      .setColorTextBoxMessage('#000')
      .setHtmlPopupLoading(
        `<div style="position: absolute; top: 45%; right: 50%; transform:
        translate(50%, -50%); z-index: 10; text-align: center;">Carregandooooo...</div>`
      )
      .build();

    unicoCameraBuilder.setTheme(unicoTheme);

    unicoCameraBuilder.setModelsPath('https://localhost:4203/assets');

    this.unicoCamera = unicoCameraBuilder.build();
  }

  copyPayload() {
    navigator.clipboard
      .writeText(this.payload)
      .then(() => {
        console.log('Conteúdo copiado para a área de transferência!');
      })
      .catch((err) => {
        console.error('Falha ao copiar o conteúdo: ', err);
      });
  }

  copyCUrl() {
    const curl = this.criarCurl(this.payload);
    navigator.clipboard
      .writeText(curl)
      .then(() => {
        console.log('Conteúdo copiado para a área de transferência!');
      })
      .catch((err) => {
        console.error('Falha ao copiar o conteúdo: ', err);
      });
  }

  criarCurl(payload: any, baseUrl: string = 'http://127.0.0.1:8000') {
    return `
      curl '${baseUrl}/api/v1/biometria' \
      -H 'sec-ch-ua: "Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"' \
      -H 'Accept: application/json, text/plain, */*' \
      -H 'Content-Type: application/json' \
      -H 'Referer: http://localhost:4200/' \
      -H 'sec-ch-ua-mobile: ?0' \
      -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' \
      -H 'sec-ch-ua-platform: "macOS"' \
      --data-raw '${payload}' \
      --compressed
    `;
  }

  clearMessages() {
    this.mensagemErro = '';
  }

  usuario: string = '';
  senha: string = '';
  mensagemErro: string = '';
  lembrar: boolean = false;

  login() {
    if (!this.usuario) {
      this.mensagemErro = 'Informe o usuário';
      return;
    }
    if (!this.senha) {
      this.mensagemErro = 'Informe a senha';
      return;
    }

    if (this.lembrar) {
      localStorage.setItem('usuario', this.usuario);
    }

    this.processando = true;
    this.biometriaService.login(this.usuario, this.senha).subscribe({
      next: (data) => {
        console.log('data -> ', data);
        let { access_token, token_type } = data;
        sessionStorage.setItem('access_token', `${access_token}`);
        this.logado = true;
        this.processando = false;
        window.location.reload();
      },
      error: (error) => {
        console.log('error -> ', error);
        this.mensagemErro = 'Usuário ou senha inválidos';
        this.processando = false;
      },
    });
  }

  buscarBiometria(id_biometria: string) {
    this.processando = true;
    this.biometriaService.buscarBiometria(id_biometria).subscribe({
      next: (data) => {
        this.init();
      },
      error: (error) => {
        console.log('error -> ', error);
        this.processando = false;
      },
    });
  }

  sair() {
    sessionStorage.removeItem('access_token');
    this.logado = false;
    window.location.reload();
  }
}
