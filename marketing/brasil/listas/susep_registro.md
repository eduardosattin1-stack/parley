# SUSEP broker registry (corretores de seguros): access, open data, counts

Research date: 2026-10-08. Prepared for Parley Notes (prospecting Brazilian insurance brokers).

## Method and limits (read first)

- In this environment the egress proxy blocked every direct fetch of `www.gov.br`, `www2.susep.gov.br`, `dados.gov.br`, `fenacor.org.br`, `cqcs.com.br`, `segurosbr.org` and `data.amerigeoss.org`, whether by WebFetch or curl (HTTP 403 / EGRESS_BLOCKED). So **no SUSEP page, panel or dataset was opened directly.**
- Everything below comes from web-search results: indexed snippets and summaries of the pages named. Anything not seen on a SUSEP or gov.br page in those results is marked **UNVERIFIED**. Pages on susep.gov.br or gov.br that showed up only as search-result URLs are listed as "seen in search index".
- **No open-data download was made,** for two reasons. I could not find any downloadable SUSEP open dataset of brokers. And the proxy blocks the SUSEP and dados.gov.br hosts anyway. **`susep_corretoras_por_uf.csv` was therefore NOT produced**, because I did not want to make up aggregates. No personal data (names or CPFs) was downloaded or saved.

## 1. Official ways to look up a broker

| What | URL | Notes |
|---|---|---|
| SUSEP "Pesquisa de corretores" (individual lookup) | https://www2.susep.gov.br/safe/Corretores/pesquisa | Seen in search index and cited by an official gov.br document. Filters: full or partial name, CPF (PF) or CNPJ (PJ), products brokered, and registration status (ativo / suspenso / cancelado). Each result can produce a free certificate (certidão). It is a record-by-record lookup with no bulk export (UNVERIFIED: no export option is mentioned anywhere). |
| SUSEP brokers system home | https://www2.susep.gov.br/safe/Corretores/ | Seen in search index ("Corretores - SUSEP"). Holds the registration, re-registration and lookup functions. |
| gov.br service card "Consultar Corretores Susep" | https://www.gov.br/pt-br/servicos/consultar-corretores-susep | Seen in search index. Free for citizens. Points to the SUSEP lookup page. Contact is corretores@susep.gov.br. |
| "Corretores SUSEP" mobile app (Android) | https://play.google.com/store/apps/details?id=br.gov.susep.corretores | Seen in search index. Official SUSEP app (package `br.gov.susep.corretores`). |
| SUSEP "Painel de Corretores de Seguros" (statistics dashboard, launched Oct 2023) | Linked from the SUSEP "Central de Painéis": https://www.gov.br/susep/pt-br/central-de-conteudos/central-de-paineis | Seen in search index. Per SUSEP's Oct 2023 launch note (republished by Agência Gov: https://agenciagov.ebc.com.br/noticias/202310/susep-lanca-novo-painel-de-corretores) it shows: registrations by period, active registrations split pessoa natural vs jurídica, active registrations by **UF and município**, education level, age band, lines of business, and registration status (ativo/suspenso/cancelado). Direct panel URL (Power BI or similar): **UNVERIFIED / not found.** CSV export: **UNVERIFIED / not found.** |
| Fenacor "Corretores Ativos" page | https://fenacor.org.br/Servicos/CorretoresAtivos | Seen in search index. Contents not seen (blocked). Probably a federation lookup or stats page. UNVERIFIED. |
| "Consultar entidades licenciadas pela SUSEP" | https://www.gov.br/pt-br/servicos/consultar-entidades-licenciadas-pela-susep | Covers insurers and other supervised entities. It explicitly **excludes brokers**, who are found through the broker lookup above. |

## 2. Open data (dados abertos): is there a downloadable broker dataset?

**Finding: none found.** I could not identify any SUSEP open dataset of insurance brokers (PF or PJ) on dados.gov.br or susep.gov.br that can be downloaded in bulk (CSV or API). This is not proof that none exists. Direct catalog access was blocked, so treat the finding as **UNVERIFIED (negative result from search only)**.

What does exist:
- **SUSEP on dados.gov.br.** The organisation page lists about 11 datasets, e.g. "Consulta de Produtos" (https://dados.gov.br/dados/conjuntos-dados/consulta-de-produtos), which covers insurance, pension and capitalisation products, published as CSV/HTML/JSON under CC-BY. Its technical-area contact emails are cores.rj@susep.gov.br and comom.rj@susep.gov.br. None of the dataset titles seen concern brokers. The organisation URL is https://dados.gov.br/dados/organizacoes/visualizar/superintendencia-de-seguros-privados-susep (blocked here).
- **SUSEP Plano de Dados Abertos (PDA).** Versions exist for 2024–2026 (approved 13-12-2023) and 2025–2026 (version of 25-04-2025):
  - https://www.gov.br/susep/pt-br/arquivos/arquivos-licitacoes-contratos/pda_susep_2024_2026_aprovado_em_13-12-2023.pdf
  - https://www.gov.br/susep/pt-br/arquivos/arquivos-licitacoes-contratos/pda_susep_2025_2026_versao_de_25-04-2025.pdf
  - Older landing page: http://www.susep.gov.br/menu/acesso-a-informacao/plano-de-dados-abertos-1

  Whether the broker register is scheduled for opening under either plan: **UNVERIFIED** (PDFs not readable here). Recommended next step: read the dataset inventory annex in the 2025–2026 PDA.
- **SES (Sistema de Estatísticas da SUSEP).** https://www2.susep.gov.br/menuestatistica/SES/principal.aspx publishes market statistics from insurers, with a full base updated weekly. It holds **no broker-level data**.
- **June 2024 SUSEP release** of auto, rural and comprehensive insurance microdata (https://www.gov.br/susep/pt-br/central-de-conteudos/noticias/2024/junho/susep-disponibiliza-base-de-dados-sobre-seguros-de-automovel-rural-e-compreensivo). This is policy data, not brokers.
- **Third-party mirror.** SegurosBR (https://www.segurosbr.org/categoria/dados/corretores-ativos/) posts daily "Estatísticas do cadastro de corretores de seguros SUSEP" bulletins. Its method and any download format are UNVERIFIED (site blocked here).

Practical implication for prospecting: SUSEP does not appear to offer a bulk list of corretoras with contact data. Workable routes are:
- the Painel for **counts by UF/município**;
- the individual lookup to **verify** a prospect's status;
- the Receita Federal CNPJ open data (CNAE 6622-3/00 "Corretores e agentes de seguros, de planos de previdência complementar e de saúde") for firm-level lists. That last route is a suggestion and was not verified in this session.

Update frequency of the Painel: irregular. Fenacor/CQCS reported in May 2025 that the panel "voltou a ser atualizado" after 45 days without updates (https://www.fenacor.org.br/noticias/susep-volta-a-divulgar-dados-sobre-corretores). In 2026 trade press quotes refreshed figures roughly monthly or more often (UNVERIFIED cadence).

## 3. How many registered brokers? (latest figures)

All figures below are **SUSEP data as reported by trade press**. None were read on the SUSEP panel itself, so all are **UNVERIFIED on primary source**.

**Most recent clearly dated figure (SUSEP data of 22 Sep 2026)**, reported by CQCS on 24 Sep 2026 ("Susep registrou 3,1 mil Corretores em 90 dias", https://cqcs.com.br/noticia/susep-registrou-31-mil-corretores-em-90-dias/):

| Status | Count |
|---|---|
| **Active (total)** | **151,568** |
| of which pessoas físicas (PF) | 86,256 |
| of which empresas corretoras (PJ) | 65,312 |
| Suspended | 15,914 |
| Cancelled | 834 |

Same reporting: about 34 new registrations per day over the prior 3 months; about 63.8% of brokers have higher education.

2026 time series (same sources: CQCS, Segs, Revista Apólice, Sincor-SP reposts):

| SUSEP data date | Active total | PF | PJ | Suspended | Source |
|---|---|---|---|---|---|
| Jan 2026 | 149,031 | – | – | 9,665 | CQCS (search summary) |
| 6 Feb 2026 | 150,004 ("record") | – | – | – | https://cqcs.com.br/noticia/numero-de-corretores-de-seguros-ativos-atinge-marca-historica/ |
| late Feb 2026 | 150,608 | 84,630 | 65,978 | – | https://cqcs.com.br/noticia/numero-de-corretoras-ativas-no-pais-deve-bater-recorde-historico/ |
| 2 Apr 2026 | 151,601 | 84,987 | 66,614 | 9,798 | CQCS / Segs (search summary) |
| 9 Jun 2026 | 152,118 | 84,766 | 67,352 | 11,159 | https://cqcs.com.br/noticia/susep-suspendeu-quase-5-mil-corretores-de-seguros-em-2026/ |
| 22 Jul 2026 | 149,166 | 85,005 | 64,161 | 15,837 | https://cqcs.com.br/noticia/mercado-alcanca-marca-inedita-de-85-mil-corretores-pessoas-fisicas/ |
| **22 Sep 2026** | **151,568** | **86,256** | **65,312** | **15,914** | https://cqcs.com.br/noticia/susep-registrou-31-mil-corretores-em-90-dias/ |

Fenacor's own institutional figure (2026 election news) is "more than 152 thousand active brokers: 85 thousand PF and 67 thousand companies" (UNVERIFIED wording).

**Conflicting, larger figures (do not mix with the above):**
- CQCS, 3 Aug 2026: "supera 165 mil registros" (165,225), citing the Painel (https://cqcs.com.br/noticia/numero-de-corretores-de-seguros-cresce-no-brasil-e-supera-165-mil-registros/).
- Avantar blog / Segs: 166,027 "registros ativos" on 24 Jul 2026 (88,505 PF / 77,522 PJ).
- A CQCS item dated about 7 Oct 2026, "Mercado perto de atingir a marca de 170 mil Corretores de Seguros" (https://cqcs.com.br/noticia/mercado-perto-de-atingir-a-marca-de-170-mil-corretores-de-seguros/): 169,171 total registros, including about 15.8k suspended and about 0.8k cancelled, so about 152.5k active. Only a search summary of this item was seen; low confidence.

Interpretation (mine, UNVERIFIED): the 165–170k numbers are close to active + suspended + cancelled. For example, 22 Jul: 149,166 + 15,837 + about 838 ≈ 165.8k. They therefore look like **total registrations**, not active brokers. For market sizing use about **151–152k active (≈86k PF, ≈65k PJ)**.

## 4. Counts by UF

Published only via the Painel (not accessible here). Figures seen in press, all statuses "ativos" with PF and PJ combined (UNVERIFIED):

| UF | Active brokers | Data date | Source |
|---|---|---|---|
| SP | 63,731 | ~7 Oct 2026 | CQCS (search summary, low confidence) |
| SP | 63,376 | 22 Sep 2026 | CQCS 24-Sep-2026 |
| RJ | 15,503 | ~7 Oct 2026 | CQCS (search summary) |
| RJ | 15,419 | 22 Sep 2026 | CQCS 24-Sep-2026 |
| MG | 13,822 | ~7 Oct 2026 | CQCS (search summary); Segs had 13,805 in Jun 2026 |
| PR | 11,260 | ~7 Oct 2026 | CQCS (search summary) |
| RS | 8,961 | ~7 Oct 2026 | CQCS (search summary) |

The other 22 UFs were not found. CQCS/Segs also reported that about 61% of brokers are concentrated in three states (SP, RJ, MG): https://cqcs.com.br/noticia/susep-61-dos-corretores-estao-concentrados-em-apenas-tres-estados/ (date UNVERIFIED).

No PJ-only by-UF breakdown, and no by-UF × situação breakdown, was found. Hence no `susep_corretoras_por_uf.csv`.

## 5. Suggested next steps (need open network access)

1. Open the Painel de Corretores from the Central de Painéis. Check for a "exportar dados" option. If Power BI, use "Exportar dados" on the UF × tipo de pessoa visual. Record UF × PF/PJ × situação.
2. Read the 2025–2026 PDA inventory for any "Cadastro de Corretores" dataset and its scheduled opening date.
3. If a firm list is needed: Receita Federal "Dados Abertos CNPJ" monthly dump, filtered on CNAE 6622-3/00 and situação cadastral ativa. Those are company records (PJ). Partner (sócio) names are personal data and should be dropped.
4. Ask SUSEP via Fala.BR / LAI (Lei de Acesso à Informação) for an aggregated table (UF × PF/PJ × situação). Aggregates are not personal data and are usually released.
