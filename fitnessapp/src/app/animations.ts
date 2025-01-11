import { 
    trigger, 
    transition, 
    style, 
    animate, 
    query, 
    group 
  } from '@angular/animations';
  
  export const fadeAnimation = trigger('fadeAnimation', [
      transition('* => *', [
          query(':enter, :leave', [
              style({
                  position: 'absolute',
                  width: '100%',
                  opacity: 0,
              }),
          ], { optional: true }),
          query(':enter', [
              style({ opacity: 0 })
          ], { optional: true }),
          group([
              query(':leave', [
                  animate('300ms ease-out', style({ opacity: 0 }))
              ], { optional: true }),
              query(':enter', [
                  animate('300ms ease-in', style({ opacity: 1 }))
              ], { optional: true })
          ])
      ])
  ]);
  
  export const slideAnimation = trigger('slideAnimation', [
      transition(':increment', [
          style({ position: 'relative' }),
          query(':enter, :leave', [
              style({
                  position: 'absolute',
                  top: 0,
                  width: '100%',
              })
          ], { optional: true }),
          query(':enter', [
              style({ left: '100%' })
          ], { optional: true }),
          group([
              query(':leave', [
                  animate('300ms ease-out', style({ left: '-100%' }))
              ], { optional: true }),
              query(':enter', [
                  animate('300ms ease-out', style({ left: '0%' }))
              ], { optional: true })
          ])
      ]),
      transition(':decrement', [
          style({ position: 'relative' }),
          query(':enter, :leave', [
              style({
                  position: 'absolute',
                  top: 0,
                  width: '100%',
              })
          ], { optional: true }),
          query(':enter', [
              style({ left: '-100%' })
          ], { optional: true }),
          group([
              query(':leave', [
                  animate('300ms ease-out', style({ left: '100%' }))
              ], { optional: true }),
              query(':enter', [
                  animate('300ms ease-out', style({ left: '0%' }))
              ], { optional: true })
          ])
      ])
  ]);
  
  export const fadeInOut = trigger('fadeInOut', [
      transition(':enter', [
          style({ opacity: 0 }),
          animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
          animate('300ms ease-out', style({ opacity: 0 }))
      ])
  ]);
  
  export const slideUpDown = trigger('slideUpDown', [
      transition(':enter', [
          style({ transform: 'translateY(20px)', opacity: 0 }),
          animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
          animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
  ]);