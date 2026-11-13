import municipiosPorUf from './municipios.json';

test('base local de municípios cobre todos os estados brasileiros', () => {
  expect(Object.keys(municipiosPorUf)).toHaveLength(27);
  expect(municipiosPorUf.SP).toContain('São Paulo');
  expect(municipiosPorUf.RJ).toContain('Rio de Janeiro');
  expect(municipiosPorUf.DF).toContain('Brasília');
  const total = Object.values(municipiosPorUf).reduce((soma, cidades) => soma + cidades.length, 0);
  expect(total).toBeGreaterThan(5500);
});

test('todos os estados têm municípios únicos e nomes não vazios', () => {
  Object.values(municipiosPorUf).forEach(cidades => {
    expect(cidades.length).toBeGreaterThan(0);
    expect(new Set(cidades).size).toBe(cidades.length);
    expect(cidades.every(nome => typeof nome === 'string' && nome.trim())).toBe(true);
  });
});
