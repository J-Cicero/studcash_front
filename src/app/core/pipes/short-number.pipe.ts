import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true
})
export class ShortNumberPipe implements PipeTransform {
  transform(number: number, args?: any): any {
    if (isNaN(number)) return null;
    if (number === null) return null;
    if (number === 0) return '0';
    
    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0;
    
    let key = '';
    const powers = [
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: Math.pow(10, 3) }
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }
    
    return (isNegative ? '-' : '') + abs + key;
  }
}
