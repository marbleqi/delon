---
order: 0
title: 演示
browser: 400
---

基本页脚。

```ts
import { Component } from '@angular/core';

import { GlobalFooterComponent, GlobalFooterLink } from '@delon/abc/global-footer';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'components-global-footer-basic',
  template: `
    <div style="height: 280px;"></div>
    <global-footer [links]="links">
      Copyright<nz-icon nzType="copyright" class="mx-sm" />
      2025
      <a href="//github.com/cipchk" target="_blank" class="mx-sm">卡色</a>出品
    </global-footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  imports: [GlobalFooterComponent, NzIconModule]
})
export class DemoComponent {
  links: GlobalFooterLink[] = [
    {
      title: '帮助',
      href: 'https://ng-alain.com/',
      blankTarget: true
    },
    {
      title: 'Github',
      href: 'https://github.com/ng-alain',
      blankTarget: true
    },
    {
      title: '预览',
      href: 'https://ng-alain.surge.sh/',
      blankTarget: true
    }
  ];
}
```
