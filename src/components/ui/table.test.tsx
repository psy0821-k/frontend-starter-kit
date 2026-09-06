// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

afterEach(() => {
  cleanup();
});

describe('Table', () => {
  it('should render a table element wrapped in a horizontally scrollable container when Table is rendered', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>내용</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByTestId('table');
    expect(table).toHaveAttribute('data-slot', 'table');
    expect(table.tagName).toBe('TABLE');

    const container = table.parentElement;
    expect(container).toHaveAttribute('data-slot', 'table-container');
    expect(container?.className).toContain('overflow-x-auto');
  });

  it('should render thead/tbody/tr/th/td with correct data-slot attributes when each sub-component is used', () => {
    render(
      <Table>
        <TableHeader data-testid="thead">
          <TableRow data-testid="row">
            <TableHead data-testid="th">헤더</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="tbody">
          <TableRow>
            <TableCell data-testid="td">내용</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const thead = screen.getByTestId('thead');
    expect(thead.tagName).toBe('THEAD');
    expect(thead).toHaveAttribute('data-slot', 'table-header');

    const tbody = screen.getByTestId('tbody');
    expect(tbody.tagName).toBe('TBODY');
    expect(tbody).toHaveAttribute('data-slot', 'table-body');

    const row = screen.getByTestId('row');
    expect(row.tagName).toBe('TR');
    expect(row).toHaveAttribute('data-slot', 'table-row');

    const th = screen.getByTestId('th');
    expect(th.tagName).toBe('TH');
    expect(th).toHaveAttribute('data-slot', 'table-head');

    const td = screen.getByTestId('td');
    expect(td.tagName).toBe('TD');
    expect(td).toHaveAttribute('data-slot', 'table-cell');
  });

  it('should apply scope="col" by default when TableHead is rendered without explicit scope', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="th">헤더</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    expect(screen.getByTestId('th')).toHaveAttribute('scope', 'col');
  });

  it('should render visually-hidden caption text when TableCaption is used', () => {
    render(
      <Table>
        <TableCaption data-testid="caption">표 설명</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>내용</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const caption = screen.getByTestId('caption');
    expect(caption).toHaveTextContent('표 설명');
    expect(caption.className).toContain('sr-only');
  });
});
