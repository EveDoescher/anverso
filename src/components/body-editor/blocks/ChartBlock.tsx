import React from 'react';
import FigureBlock from './FigureBlock';

export default function ChartBlock({ value, onChange }: any) {
  const figVal = { ...value, figure: value.chart };
  const handleChange = (newVal: any) => {
    onChange({ ...newVal, chart: newVal.figure, figure: undefined, type: 'CHART' });
  };
  return <FigureBlock value={figVal} onChange={handleChange} />;
}
