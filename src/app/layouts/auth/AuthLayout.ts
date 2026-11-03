import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'auth-layout',
  imports: [NgOptimizedImage],
  template: `
    <main>
      <section class="scene" aria-label="LSR Librería, punto de venta">
        <img ngSrc="/images/bookstore.svg" alt="" fill priority sizes="70vw" />
        <div class="shade"></div>
        <p class="brand">LSR <span>LIBRERÍA</span></p>
        <div class="intro">
          <p class="eyebrow">CADA LIBRO, UNA NUEVA HISTORIA</p>
          <h2>Tu librería.<br />Un mundo de posibilidades.</h2>
          <p>Ventas, inventario y lectores, en un mismo lugar.</p>
        </div>
        <p class="caption">El siguiente capítulo comienza aquí.</p>
      </section>
      <section class="panel" aria-label="Acceso a tu cuenta">
        <p class="mobile-brand">LSR · LIBRERÍA</p>
        <div class="content"><ng-content select="[authContent]" /></div>
        <p class="footer">LSR Store · Gestión para tu librería</p>
      </section>
    </main>
  `,
  styleUrl: './AuthLayout.css',
})
export class AuthLayout {}
