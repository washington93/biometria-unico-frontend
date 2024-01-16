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

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn" (click)="openCam()">Abrir Câmera</button>
  `,
  styleUrl: './biometria.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiometriaComponent {
  unicoCamera!: MainView;

  constructor() {
    this.configUnicoWebframe();
  }

  async openCam() {
    const identification = '41979561850';

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
                Code: userRegisterData?.cpf_cnpj,
                Name: userRegisterData?.name,
                // Gender: 'M',
                BirthDate: userRegisterData?.birth_date,
                Email: userRegisterData?.email,
                Phone: userRegisterData?.cel,
              },
              onlySelfie: true,
              imagebase64: obj?.encrypted,
            };
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
      console.log("openCam -> ", error);
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
}
