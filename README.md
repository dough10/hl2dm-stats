# hl2dm-stats

A logparser and stats calculator for HL2DM game servers. As seen running at <https://hl2dm.dough10.me> Parses logs to generate player stats and stores the data in system memory for fast page response times.

Requires Sourcemod and Superlogs Sourcemod plugin for weapon accuacy stat tracking (weapon stats accuacy is still questionable but better then nothing)

## Install

1. clone repo `git clone https://github.com/dough10/hl2dm-stats.git`
2. cd into directory `cd hl2dm-stats`
3. install modules `npm install`
4. configure config.json to fit your filesystem `nano config.json`
5. run app `node api.js`

## UI

avaliable from <https://github.com/dough10/hl2dm-stats-ui>

## Documentation

- [api-doc.md](api-doc.md)
  - [modules&#x2F;auth&#x2F;auth-doc.md](modules&#x2F;auth&#x2F;auth-doc.md)
  - [modules&#x2F;data-model&#x2F;data-model-doc.md](modules&#x2F;data-model&#x2F;data-model-doc.md)
  - [modules&#x2F;Timer&#x2F;Timer-doc.md](modules&#x2F;Timer&#x2F;Timer-doc.md)
  - [modules&#x2F;cacheDemos&#x2F;cacheDemos-doc.md](modules&#x2F;cacheDemos&#x2F;cacheDemos-doc.md)
