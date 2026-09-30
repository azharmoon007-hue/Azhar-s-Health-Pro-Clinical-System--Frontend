import { Routes } from '@angular/router';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./messages-chat/messages-chat.component').then(m => m.MessagesChatComponent)
  }
];
