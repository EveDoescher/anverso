import React from 'react';
import { Plus, Trash2, Columns, Rows } from 'lucide-react';

export default function TableBlock({ value, onChange }: any) {
  const table = value.table || { columns: [{ title: 'Coluna 1' }, { title: 'Coluna 2' }], rows: [{ cells: [{ content: '' }, { content: '' }] }] };

  const addColumn = () => {
    const newColumns = [...(table.columns || []), { title: `Coluna ${(table.columns?.length || 0) + 1}` }];
    const newRows = (table.rows || []).map((row: any) => ({
      cells: [...(row.cells || []), { content: '' }]
    }));
    // If no rows exist, create at least one empty row
    if (newRows.length === 0) {
      newRows.push({ cells: newColumns.map(() => ({ content: '' })) });
    }
    onChange({ ...value, table: { ...table, columns: newColumns, rows: newRows } });
  };

  const removeColumn = (colIdx: number) => {
    if (!table.columns || table.columns.length <= 1) return;
    const newColumns = table.columns.filter((_: any, idx: number) => idx !== colIdx);
    const newRows = (table.rows || []).map((row: any) => ({
      cells: (row.cells || []).filter((_: any, idx: number) => idx !== colIdx)
    }));
    onChange({ ...value, table: { ...table, columns: newColumns, rows: newRows } });
  };

  const addRow = () => {
    const colsCount = table.columns?.length || 1;
    const newCells = Array(colsCount).fill({ content: '' });
    const newRows = [...(table.rows || []), { cells: newCells }];
    onChange({ ...value, table: { ...table, rows: newRows } });
  };

  const removeRow = (rowIdx: number) => {
    if (!table.rows || table.rows.length <= 1) return;
    const newRows = table.rows.filter((_: any, idx: number) => idx !== rowIdx);
    onChange({ ...value, table: { ...table, rows: newRows } });
  };

  const updateColumnTitle = (colIdx: number, title: string) => {
    const newColumns = [...(table.columns || [])];
    newColumns[colIdx] = { ...newColumns[colIdx], title };
    onChange({ ...value, table: { ...table, columns: newColumns } });
  };

  const updateCellContent = (rowIdx: number, colIdx: number, content: string) => {
    const newRows = [...(table.rows || [])];
    const newCells = [...(newRows[rowIdx].cells || [])];
    newCells[colIdx] = { ...newCells[colIdx], content };
    newRows[rowIdx] = { ...newRows[rowIdx], cells: newCells };
    onChange({ ...value, table: { ...table, rows: newRows } });
  };

  const cols = table.columns || [];
  const rows = table.rows || [];

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Título/Legenda da Tabela</label>
          <input 
            type="text" 
            className="w-full border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 text-sm rounded-lg outline-none transition-shadow" 
            placeholder="Ex: Tabela 1 - Comparativo de Resultados" 
            value={table.caption || ''} 
            onChange={e => onChange({...value, table: {...table, caption: e.target.value}})} 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Fonte (Opcional)</label>
          <input 
            type="text" 
            className="w-full border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 text-sm rounded-lg outline-none transition-shadow" 
            placeholder="Ex: O Autor (2024)" 
            value={table.source || ''} 
            onChange={e => onChange({...value, table: {...table, source: e.target.value}})} 
          />
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-slate-800">Dados da Tabela</label>
          <div className="flex gap-2">
            <button type="button" onClick={addColumn} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-medium transition-colors">
              <Columns className="w-3.5 h-3.5" /> Adicionar Coluna
            </button>
            <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-md font-medium transition-colors">
              <Rows className="w-3.5 h-3.5" /> Adicionar Linha
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50">
                {cols.map((col: any, colIdx: number) => (
                  <th key={`th-${colIdx}`} className="border-b border-r border-slate-200 p-2 font-medium text-slate-700 align-top relative group min-w-[150px]">
                    <input 
                      type="text" 
                      className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-indigo-400 pb-1"
                      value={col.title || ''}
                      placeholder={`Coluna ${colIdx + 1}`}
                      onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                    />
                    {cols.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeColumn(colIdx)} 
                        className="absolute right-2 top-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded shadow-sm border border-slate-200"
                        title="Remover Coluna"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </th>
                ))}
                <th className="border-b border-slate-200 w-12 bg-slate-50"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, rowIdx: number) => (
                <tr key={`tr-${rowIdx}`} className="hover:bg-slate-50/50 group">
                  {cols.map((_: any, colIdx: number) => (
                    <td key={`td-${rowIdx}-${colIdx}`} className="border-b border-r border-slate-200 p-2">
                      <input 
                        type="text" 
                        className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
                        value={row.cells?.[colIdx]?.content || ''}
                        placeholder="Valor..."
                        onChange={(e) => updateCellContent(rowIdx, colIdx, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border-b border-slate-200 p-2 text-center align-middle">
                    {rows.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeRow(rowIdx)} 
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover Linha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
