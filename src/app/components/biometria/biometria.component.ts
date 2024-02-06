import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiometriaComponent {
  cpf: string = '';
  unicoCamera!: MainView;
  payload: any;

  constructor(private biometriaService: BiometriaService) {
    this.configUnicoWebframe();
    // this.payload = JSON.stringify(
    //   {
    //     nome: 'Exemplo',
    //     idade: 30,
    //     cidade: 'Cidade Exemplo',
    //   },
    //   null,
    //   2
    // );
  }

  alertMessage = '';

  async openCam() {
    if (!this.cpf) {
      this.alertMessage = 'Informe o CPF';
      return;
    }
    try {
      let cameraPromised: CameraOpener =
        await this.unicoCamera.prepareSelfieCamera(
          `/assets/unico.config.json`,
          SelfieCameraTypes.NORMAL
        );

      const callback = {
        on: {
          success: async (obj: SuccessPictureResponse) => {
            const filename = 'data.json';
            let userRegisterData: any = {};

            const data: any = {
              subject: {
                Code: this.cpf,
                Name: 'Washington da Silva Ribeiro',
                // Gender: 'M',
                BirthDate: '1993-08-30',
                Email: 'washington.ribeiro@paneas.com',
                Phone: '84992140775',
              },
              onlySelfie: true,
              imagebase64: obj?.encrypted,
            };
            console.log('data -> ', data);
            this.payload = JSON.stringify(data, null, 2);
            this.biometriaService.processarBiometria(data).subscribe({
              next: (data) => {
                console.log('data -> ', data);
              },
              error: (error) => {
                console.log('error -> ', error);
              },
            });
          },
          error: (error: ErrorPictureResponse) => {
            console.log('ErrorPictureResponse -> ', error);
          },
          support: (error: SupportPictureResponse) => {
            console.log('SupportPictureResponse -> ', error);
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
}
