// my-lib.module.ts
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgPathaveedhiService } from './ng-pathaveedhi.service';

@NgModule({
  imports: [CommonModule],
  providers: [], // Add providers if needed
})
export class MyLibModule {
  static forRoot(config: any): ModuleWithProviders<MyLibModule> {
    return {
      ngModule: MyLibModule,
      providers: [
        NgPathaveedhiService,
        { provide: 'MY_PATHAVEEDHI_CONFIG', useValue: config },
      ],
    };
  }
}
