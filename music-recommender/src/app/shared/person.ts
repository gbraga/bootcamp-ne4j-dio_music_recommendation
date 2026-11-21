const FLAGS: Record<string, string> = {
  Brasileira: '🇧🇷',
  Americana: '🇺🇸',
  Britânica: '🇬🇧',
  'Porto-riquenha': '🇵🇷',
  Colombiana: '🇨🇴',
  Espanhola: '🇪🇸',
  Argentina: '🇦🇷',
  Portuguesa: '🇵🇹',
  Japonesa: '🇯🇵',
  Francesa: '🇫🇷',
  Mexicana: '🇲🇽',
  Italiana: '🇮🇹',
  Alemã: '🇩🇪',
  Canadense: '🇨🇦',
};

export const flagOf = (nationality: string | null) => (nationality && FLAGS[nationality]) || '🌐';

export const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
