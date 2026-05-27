import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';

export interface AdminColuna {
  chave: string;
  label: string;
  width?: string;
  tipo?: 'texto' | 'data' | 'badge-status' | 'badge-pilar' | 'moeda' | 'flag-destaque';
}

@Component({
  selector: 'app-admin-tabela',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './admin-tabela.component.html',
  styleUrl: './admin-tabela.component.scss',
})
export class AdminTabelaComponent {
  @Input() colunas: AdminColuna[] = [];
  @Input() linhas: Record<string, unknown>[] = [];
  @Input() msgVazia = 'Nenhum item encontrado.';
  @Input() editLink?: (linha: Record<string, unknown>) => unknown[];

  @Output() editar = new EventEmitter<Record<string, unknown>>();
  @Output() excluir = new EventEmitter<string>();

  valor(linha: Record<string, unknown>, chave: string): unknown {
    return linha[chave];
  }

  asDate(v: unknown): Date {
    return v instanceof Date ? v : new Date(v as string);
  }

  asNumber(v: unknown): number {
    return Number(v);
  }

  asString(v: unknown): string {
    return String(v ?? '');
  }
}
