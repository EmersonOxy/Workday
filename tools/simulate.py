"""Simulação de progressão do WORKDAY (Monte Carlo) para comparar o balanceamento atual com uma proposta.

Reproduz as regras do código (src/js/02-mecanica.js, 19-pontuacao.js, 20-arquivos.js, 21-tarefas.js, 22-eventos.js,
23-laco.js, 14-fim-do-dia.js) num modelo de jogador com tempo de reação, precisão e velocidade nas tarefas.
É um modelo, não o jogo: serve para comparar ordens de grandeza e ritmos, não para prever pontuações exatas.

Uso: python3 tools/simulate.py            (tabelas para os perfis casual/regular/experiente)
     python3 tools/simulate.py --runs 200
"""
import random, statistics, sys

DAY_SECONDS, LEVEL_SECONDS, MAX_TASKS = 240, 30, 5   # expediente de 240 s (nível escalado por 150 s, como no jogo)
UNLOCK = {'button': 2, 'email': 3, 'type': 4, 'call': 5, 'printer': 6, 'video': 8}
TASK = {  # prazo base (s), pontos base, tempo de execução relativo
    'button': (7, 15, .6), 'email': (11, 25, 1.0), 'type': (9, 20, 1.3), 'call': (9, 30, 1.2), 'printer': (8.5, 20, 1.1), 'video': (8, 25, 1.4)}
RANK_DAYS = [1, 1, 2, 3, 5, 7, 10]
DECOR = [60, 80, 120, 200, 350, 600]

PROFILES = {  # reação por arquivo (s), precisão base, tempo por tarefa (s), sucesso em eventos
    'casual':     dict(react=1.25, acc=.88, task=3.6, event=.72),
    'regular':    dict(react=.85,  acc=.93, task=2.6, event=.86),
    'experiente': dict(react=.55,  acc=.97, task=1.9, event=.95),
}

CURRENT = dict(
    name='atual',
    ranks=[0, 300, 1000, 2500, 5000, 9000, 15000],
    level_pts=lambda L: L,                      # pontos = base × nível × multiplicador
    mult_cap=5, combo_step=5,
    day_bonus=lambda d: 100 * d,                # bônus de pontos no fim do dia
    pay=lambda dayScore, d, rank: round(dayScore / 10) + 30 * d,
)
PROPOSED = dict(
    name='proposta',
    ranks=[0, 1200, 4000, 9500, 19000, 34000, 56000],
    level_pts=lambda L: 1 + min(L - 1, 16) * .12,  # nível pesa pouco e satura: o dia 8 vale ~2,8× o dia 1, não 15×
    mult_cap=3, combo_step=10,                     # combo recompensa constância, sem multiplicar 5×
    day_bonus=lambda d: 60,                     # bônus fixo, não cresce com o dia
    pay=lambda dayScore, d, rank: [40, 50, 62, 76, 92, 110, 130][rank] + min(30, round(dayScore / 80)),  # salário do cargo + desempenho com teto
)


def career(cfg, prof, rng, max_days=40):
    score, wallet, rank, perks, stress = 0, 0, 0, 0, 0.0
    out = dict(rank_day={}, wallet_by_day=[], score_by_day=[], decor_done=None, end_day=None, perk_day={})
    spent = 0
    for d in range(1, max_days + 1):
        t, combo, dayScore = 0.0, 0, 0
        tasks, next_task, next_event = [], 3.0, 12.0
        file_t = prof['react'] + .3
        busy = 0.0
        while t < DAY_SECONDS:
            dt = .1; t += dt
            L = cfg.get('level', lambda d, t: 1 + (d - 1) * 2 + int(t // LEVEL_SECONDS))(d, t)
            mult = min(cfg['mult_cap'], 1 + combo // cfg['combo_step'])

            def ok(base):
                nonlocal score, dayScore, combo, stress
                p = round(base * cfg['level_pts'](L) * min(cfg['mult_cap'], 1 + combo // cfg['combo_step']))
                score += p; dayScore += p; combo += 1; stress = max(0, stress - 2)

            def bad(s):
                nonlocal combo, stress
                combo = 0; stress = min(100, stress + s)

            stress = max(0, stress - .8 * dt)
            # tarefas chegam, vencem ou são resolvidas
            deb = cfg.get('debut')
            unl = (lambda k: d >= deb[k]) if deb else (lambda k: L >= UNLOCK[k])
            mx = cfg['max_tasks'](d) if deb else MAX_TASKS
            if (L >= 2) if not deb else True:
                next_task -= dt
                if next_task <= 0:
                    avail = [k for k in UNLOCK if unl(k) and not (k in ('type', 'call', 'video') and any(x[0] == k for x in tasks))]
                    if avail and len(tasks) < mx:
                        k = rng.choice(avail); speed = cfg['ttl'](d) if deb else max(.55, 1 - max(0, L - UNLOCK[k]) * .07)
                        tasks.append([k, TASK[k][0] * speed, 0.0])
                    next_task = (cfg['task_gap'](d) if deb else max(1.4, 6.5 - L * .55)) * rng.uniform(.7, 1.3)
                for x in tasks: x[2] += dt
                for x in [x for x in tasks if x[2] >= x[1]]: tasks.remove(x); bad(12)
            # eventos (chefe, travamento, vírus, troca de setores)
            if (L >= 3) if not deb else d >= deb['boss']:
                next_event -= dt
                if next_event <= 0:
                    if rng.random() < prof['event']: ok(20)
                    else: bad(rng.choice([30, 12, 15, 10]))
                    busy += prof['task'] * .8
                    next_event = ((22 - 9 * PRESS(d)) * 1.25 if deb else max(7, 20 - L)) * rng.uniform(.7, 1.3)
            # atenção do jogador: tarefa mais urgente primeiro, senão o arquivo
            if busy > 0: busy -= dt; continue
            if tasks:
                x = min(tasks, key=lambda x: x[1] - x[2]); tasks.remove(x)
                busy = prof['task'] * TASK[x[0]][2]
                if x[0] == 'email' and rng.random() > .92: bad(10)
                else: ok(TASK[x[0]][1])
                continue
            file_t -= dt
            if file_t <= 0:
                kind = 'dead' if (d >= deb['dead'] if deb else L >= 4) and rng.random() < .15 else 'urgent' if (d >= deb['urgent'] if deb else L >= 3) and rng.random() < .2 else 'normal'
                acc = max(.6, prof['acc'] - .004 * L)
                if rng.random() < acc: ok(20 if kind == 'urgent' else 12 if kind == 'dead' else 10)
                else: bad(26 if kind == 'urgent' else 12 if kind == 'dead' else 14)
                file_t = prof['react'] + .3 + 450 / ((55 + 14 * L) * 6)
            if stress >= 100:
                out['end_day'] = d; return out
        score += cfg['day_bonus'](d); dayScore += cfg['day_bonus'](d)
        wallet += cfg['pay'](dayScore, d, rank)
        decor = cfg.get('decor', DECOR)
        # regra do jogo (23-laco.js): pontos DO DIA ≥ diferença entre limiares, dia mínimo do cargo, uma promoção por dia
        nx = rank + 1
        if nx < len(cfg['ranks']) and dayScore >= cfg['ranks'][nx] - cfg['ranks'][nx - 1] and d >= cfg.get('rank_days', RANK_DAYS)[nx]:
            rank = nx; out['rank_day'][rank] = d
        # compra enfeites em ordem de preço quando dá (jogador "colecionador")
        while spent < len(decor) and wallet >= decor[spent]:
            wallet -= decor[spent]; spent += 1
        if spent == len(decor) and out['decor_done'] is None: out['decor_done'] = d
        out['wallet_by_day'].append(wallet); out['score_by_day'].append(score)
        stress = max(0, stress - 30)                  # noite de sono
    out['end_day'] = None
    return out


def summarize(cfg, runs):
    print(f"\n=== {cfg['name']} ===")
    names = ['Estagiário', 'Assistente', 'Analista', 'Coordenador', 'Gerente', 'Diretor', 'CEO']
    for pname, prof in PROFILES.items():
        rng = random.Random(42)
        res = [career(cfg, prof, rng) for _ in range(runs)]
        ends = [r['end_day'] for r in res if r['end_day']]
        med = lambda xs: statistics.median(xs) if xs else None
        line = f"{pname:11s} burnout em {len(ends) / runs:4.0%} das carreiras (mediana dia {med(ends) or '—'}) | "
        line += ' '.join(f"{names[k][:5]}:d{med([r['rank_day'][k] for r in res if k in r['rank_day']]) or '—'}" for k in range(1, 7))
        dd = [r['decor_done'] for r in res if r['decor_done']]
        line += f" | todos enfeites: d{med(dd) or '—'}"
        w5 = [r['wallet_by_day'][4] for r in res if len(r['wallet_by_day']) > 4]
        line += f" | saldo após dia 5: R$ {med(w5) if w5 else '—'}"
        print(line)


STANDARD = dict(
    name='padrão (aplicado)',
    level=lambda d, t: 1 + int((d - 1) * 1.5) + int(t // 40),    # mecânicas entram aos poucos nos primeiros dias
    ranks=[0, 900, 2700, 5300, 8900, 13300, 18500],   # diferenças: 900 · 1800 · 2600 · 3600 · 4400 · 5200 pontos num dia
    rank_days=[1, 1, 3, 5, 8, 11, 14],
    level_pts=lambda L: 1 + min(L - 1, 18) * .2,
    mult_cap=4, combo_step=8,
    day_bonus=lambda d: 80,
    pay=lambda dayScore, d, rank: [42, 54, 68, 84, 102, 122, 145][rank] + min(35, round(dayScore / 70)),
    decor=[90, 120, 220, 380, 650, 1200],
)

# Carreira de 25 dias (aplicada): uma novidade por dia (PROG em 02-mecanica.js), pendências simultâneas por faixa de dias,
# combo ×3, bônus de nível limitado e metas de promoção pelos pontos do dia.
PRESS = lambda d: min(1, max(0, (d - 1) / 24))
CAREER25 = dict(
    name='carreira de 25 dias (aplicada)',
    debut={'button': 1, 'email': 6, 'call': 8, 'printer': 10, 'type': 11, 'video': 18, 'urgent': 3, 'dead': 4, 'boss': 5},
    max_tasks=lambda d: 1 if d <= 5 else 2 if d <= 10 else 3 if d <= 15 else 4 if d <= 20 else 5,
    task_gap=lambda d: (7.5 - 4.0 * PRESS(d)) * 1.25, ttl=lambda d: 1.15 - .35 * PRESS(d),
    level=lambda d, t: min(12, 1 + int((d - 1) * .35) + int(t * 150 / 240 // 50)),
    ranks=[0, 2800, 6300, 10300, 14700, 19400, 24300],   # metas do dia (240 s): 2800 · 3500 · 4000 · 4400 · 4700 · 4900
    rank_days=[1, 3, 7, 11, 16, 21, 25],
    level_pts=lambda L: 1 + min(L - 1, 8) * .1,
    mult_cap=3, combo_step=8,
    day_bonus=lambda d: 60,
    pay=lambda dayScore, d, rank: [40, 52, 66, 82, 100, 120, 145][rank] + min(30, round(dayScore / 90)),
    decor=[90, 120, 220, 380, 650, 1200],
)

def day_scores(cfg, runs=200):
    rng = random.Random(7)
    for pname, prof in PROFILES.items():
        res = [career(cfg, prof, rng, max_days=30) for _ in range(runs)]
        by = [statistics.median([r['score_by_day'][i] - (r['score_by_day'][i - 1] if i else 0) for r in res if len(r['score_by_day']) > i]) for i in (0, 4, 9, 14, 19, 24)]
        print(f"  pontos do dia ({pname}): d1 {by[0]:.0f} · d5 {by[1]:.0f} · d10 {by[2]:.0f} · d15 {by[3]:.0f} · d20 {by[4]:.0f} · d25 {by[5]:.0f}")

if __name__ == '__main__':
    runs = int(sys.argv[sys.argv.index('--runs') + 1]) if '--runs' in sys.argv else 400
    if '--all' in sys.argv: summarize(CURRENT, runs); summarize(PROPOSED, runs); summarize(STANDARD, runs)
    summarize(CAREER25, runs); day_scores(CAREER25)
