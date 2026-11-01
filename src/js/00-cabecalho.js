/* Workday © 2026 Émerson K. Boff. Todos os direitos reservados. Proibida a cópia ou republicação. */
const AUTHOR = 'Émerson K. Boff';
const YEAR = 2026;


// Contas de jogador: cada nome de usuário tem o próprio save (prefixo nas chaves do localStorage).
// A primeira conta criada herda as chaves sem prefixo, então saves de antes das contas continuam valendo.
const WD_ACC = (() => { try { const list = JSON.parse(localStorage.getItem('expediente-usuarios') || '[]'), id = localStorage.getItem('expediente-usuario') || '';
  return { list: Array.isArray(list) ? list : [], cur: (Array.isArray(list) ? list : []).find(a => a.id === id) || null }; } catch (e) { return { list: [], cur: null }; } })();
const WD_NS = 'expediente-' + (WD_ACC.cur && WD_ACC.cur.ns ? WD_ACC.cur.ns + '-' : '');
