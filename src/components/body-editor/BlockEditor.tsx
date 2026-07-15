import React from 'react';
import ParagraphBlock from './blocks/ParagraphBlock';
import LongQuoteBlock from './blocks/LongQuoteBlock';
import FigureBlock from './blocks/FigureBlock';
import TableBlock from './blocks/TableBlock';
import FrameBlock from './blocks/FrameBlock';
import CodeListingBlock from './blocks/CodeListingBlock';
import ChartBlock from './blocks/ChartBlock';
import EquationBlock from './blocks/EquationBlock';
import ListBlock from './blocks/ListBlock';

export default function BlockEditor({ value, onChange }: any) {
  const handleChangeType = (e: any) => {
    const type = e.target.value;
    const base: any = { type };
    if (type === 'PARAGRAPH') base.content = [];
    else if (type === 'DIRECT_LONG_QUOTE') { base.text = ''; base.mode = 'PARENTHETICAL'; base.source = { authors: [], year: '', page: '' }; }
    else if (type === 'FIGURE') base.figure = { image: { sourceType: 'URL' } };
    else if (type === 'TABLE' || type === 'FRAME') base.table = { columns: [], rows: [] };
    else if (type === 'CODE_LISTING') base.codeListing = { language: '', code: '' };
    else if (type === 'CHART') base.chart = { image: { sourceType: 'URL' } };
    else if (type === 'EQUATION') base.equation = { text: '' };
    else if (type === 'ORDERED_LIST' || type === 'UNORDERED_LIST') base.list = { type: type === 'ORDERED_LIST' ? 'ORDERED' : 'UNORDERED', items: [] };
    
    onChange(base);
  };

  return (
    <div className="border border-[var(--color-border-soft)] p-3 my-2 rounded bg-white shadow-sm">
      <div className="mb-2">
        <select value={value.type || 'PARAGRAPH'} onChange={handleChangeType} className="border p-1 text-xs rounded">
          <option value="PARAGRAPH">Parágrafo</option>
          <option value="DIRECT_LONG_QUOTE">Citação Longa</option>
          <option value="FIGURE">Figura</option>
          <option value="TABLE">Tabela</option>
          <option value="FRAME">Quadro</option>
          <option value="CODE_LISTING">Código</option>
          <option value="CHART">Gráfico</option>
          <option value="EQUATION">Equação</option>
          <option value="ORDERED_LIST">Lista Ordenada</option>
          <option value="UNORDERED_LIST">Lista Não-Ordenada</option>
        </select>
      </div>
      
      {value.type === 'PARAGRAPH' && <ParagraphBlock value={value} onChange={onChange} />}
      {value.type === 'DIRECT_LONG_QUOTE' && <LongQuoteBlock value={value} onChange={onChange} />}
      {value.type === 'FIGURE' && <FigureBlock value={value} onChange={onChange} />}
      {value.type === 'TABLE' && <TableBlock value={value} onChange={onChange} />}
      {value.type === 'FRAME' && <FrameBlock value={value} onChange={onChange} />}
      {value.type === 'CODE_LISTING' && <CodeListingBlock value={value} onChange={onChange} />}
      {value.type === 'CHART' && <ChartBlock value={value} onChange={onChange} />}
      {value.type === 'EQUATION' && <EquationBlock value={value} onChange={onChange} />}
      {(value.type === 'ORDERED_LIST' || value.type === 'UNORDERED_LIST') && <ListBlock value={value} onChange={onChange} />}
    </div>
  );
}
