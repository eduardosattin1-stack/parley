# Brazilian vertical CRMs as referral or integration partners for Parley Notes

Research date: 2026-10-08. Companion file: `crms.csv` (15 rows: the 5 named vendors in depth plus 10 others).

## How this was researched, and its limits

- **Sources.** All facts come from web-search results. They include snippets of the vendors' own pages (kenlo.com.br, jetimob.com, imobzi.com, segfy.com, quiver.net.br), trade press (Revista Apólice, CQCS, SEGS, Startups, NeoFeed, Baguete, Exame, Forbes), registry aggregators and the Evertec SEC 10-Q.
- **No direct page reads.** The environment's network policy blocked direct page fetches from every vendor domain and most press domains. Vendor wording is therefore quoted as the search engine indexed it, not from a live page load.
- **Search budget.** The session's search budget ran out near the end. Two last checks (Segfy's "iA" landing page and the text of Jetimob's partner page) were not done.
- **Labels.** In the CSV, [site] means the text was seen on the vendor's own domain. [imprensa] means press or a registry. UNVERIFIED means an aggregator, a competitor's comparison page, or my own inference.
- **LinkedIn.** Personal LinkedIn URLs are given only where a search result showed one. That was the case only for Segfy's CEO. Employee counts come from aggregators (Tracxn, RocketReach, FinalScout), not from LinkedIn itself.

## The two segments at a glance

| | Real estate | Insurance brokers |
|---|---|---|
| Market structure | Fragmented. Several independent, founder-led vendors (Jetimob, Imobzi) sit next to one large player (Kenlo) and corporate-owned ones (Vista/Loft, Arbo/Superlógica, CV/Softplan, Hypnobox/Senior). | Heavily consolidated. Quiver, Agger and Infocap all belong to Dimensa, which Evertec (NASDAQ: EVTC) bought in 2026. Segfy is 74.67% owned by Porto Seguro. TEx/TELEPORT belongs to Serasa Experian. |
| AI today | Mostly pre-sale WhatsApp bots (Kenlo LYA, Jetimob Jet.ia SDR) and AI listing descriptions. Imobzi's Arkis takes voice commands. | Mostly AI for quoting (Segfy Foxfy: voice, image or text into a quote) and AI on BI dashboards (Quiver BI). |
| The Parley gap | Nobody among the five covers "30-second voice memo after a visit becomes a structured visit record." Competitor **PipeImob** already markets exactly this ("Pós-visita por Áudio ... 15 segundos de áudio. A visita virou registro no CRM") and shows Kenlo, Vista/Loft, Imoview and C2S without it in its comparison table. | No vendor found offering transcription or a structured summary of the client meeting itself (needs, coverages discussed, objections, next step). |
| Reachability | Good: Jetimob and Imobzi are mid-sized and founder-led. | Hard: every main player sits inside a large group. |

Competitive note: **Hypnobox AI Corretor** (Senior Sistemas, CRM for developers) already takes WhatsApp text or audio commands and logs visits to the client timeline. **Agendor** (a horizontal CRM) offers audio reports. The idea is spreading, so the window for a "plug-in for incumbents" pitch is now.

---

## 1. Jetimob (real estate). Priority 1

**Profile.** Jetimob is an all-in-one CRM, ERP (rentals and finance) and website platform for imobiliárias. It is based in Santa Maria (RS) and the company was registered in 2010. On its "about" page it claims "+10K usuários ativos e +1.5K clientes ativos". The CEO and co-founder is Victorio Venturini. Tracxn shows no outside funding. Tracxn counts 74 employees (Aug 2026), while LinkedIn's band is 11-50. It has a public API (docs.jetimob.com, key per client, depending on plan), webhooks (leads and deals won or lost), Zapier and Make connectors, and an integrations directory.

**Angle.** The CEO has publicly used Parley's exact use case as his example of what AI can already do: a broker sends an audio between appointments, and the AI transcribes it, interprets it and updates the agency's systems (Imobi Report "Modo Avião" podcast, about three months ago). Jetimob's shipped AI (Jet.ia SDR) stops at WhatsApp lead qualification. Parley can deliver his example as a partner integration with no roadmap cost to Jetimob, and help it answer PipeImob's "registro de visita por áudio" comparison.

**Proposed offer.**
- Parley pushes a structured visit note (property code, client, likes and dislikes, objections, price reaction, next step) to the lead or deal timeline.
- The listing in jetimob.com/integracoes is mutual.
- Revenue share through the existing partner program.

**First contact.**
1. Apply via https://www.jetimob.com/parceiros. The program already pays partners (agencies, consultancies, site developers) a share of what referred clients spend.
2. In parallel, send a short LinkedIn note to Victorio Venturini quoting his podcast example, with a 60-second demo video in Portuguese.
3. Before the call, check in docs.jetimob.com whether the API can **write** notes or activities to leads. The documentation I saw covers reading listings and receiving leads; whether it can write notes or activities is UNVERIFIED.

**Size signal.** Small to mid-size, independent and founder-led. Likely to answer.

## 2. Imobzi (real estate). Priority 2

**Profile.** Imobzi is a CRM and ERP for imobiliárias and brokers in São Paulo. It dates from 2004 and became a cloud product after a rebuild from 2015 onward. It claims to have "contribuiu para o crescimento de mais de 5 mil imobiliárias". It is run by its founders: CEO Nilson Silva and partner Kezia Batista. Quickfast Inc. became a shareholder in 2024. Headcount is about 50-100 (Tracxn 49, RocketReach 52, Crunchbase 51-100). It has a public REST API with webhooks (developer.imobzi.com, api.imobzi.app/v1) and a long list of third-party integrations.

**Angle.**
- **Precedent.** Imobzi already integrates a third-party AI, **Lais** (an AI pre-attendant on WhatsApp), so an outside AI partner is not new to them.
- **Positioning.** Its own assistant, **Arkis**, answers questions about CRM data, including by voice. Parley should be pitched as the *field capture* that feeds Arkis: Arkis can only answer from data that exists, and visit outcomes are exactly what brokers never type.
- **Distribution.** The Quickfast group also runs the media site **Papo Imobiliário**, which can carry co-marketing.

**First contact.**
1. Ask sales ((11) 4063-4100, or the "Fale conosco" page) for the **"Gerentes de Parcerias"**. The pricing page itself refers to them.
2. Mention the Lais integration as the model and propose a help-center integration article like Lais's.
3. Then message Nilson Silva on LinkedIn.
4. Build a working prototype on the public API first, so the first meeting starts from a demo rather than a slide.

**Size signal.** Mid-size and founder-led. Likely to answer. Risk: Arkis could be extended to dictation.

## 3. Kenlo (real estate). Priority 3 (largest reach, slowest)

**Profile.** Kenlo was inGaia until its 2022 rebrand; the legal entity is reportedly I-Value Tecnologia S.A. (UNVERIFIED). It is based in Campinas (UNVERIFIED) and claims "8.500+ imobiliárias em 950+ cidades" on its current site (an older page says 10 mil). Products: Kenlo Imob (CRM), Kenlo Locação, sites, a property-sharing marketplace, and the LYA AI. The co-CEOs are José Eduardo Andrade Jr. (founder) and Mickael Malka. Jive Investments put in about R$ 95 mi in 2021, and about 234 people are linked to Kenlo on LinkedIn (aggregator count, UNVERIFIED). In 2025 Kenlo ended its 10-year rental-system partnership with Superlógica and migrated customers to its own Locação platform, which drew complaints.

**Angle.**
- **The gap.** LYA (SDR plus Omnichannel) covers the funnel *up to* the visit. Its predecessor LIA scored leads on about 250 variables, including properties visited and time to visit, but nothing captures *what happened at the visit*. A Parley memo after each visit adds the missing post-visit signal to LYA's scoring.
- **Competitive pressure.** A competitor (PipeImob) shows Kenlo without "registro de visita por áudio" in its comparison table.
- **Constraint.** The open API is included only in the top **K²** plan (R$ 1.197/mês). An integration therefore reaches only K² customers, or customers who have an officially approved integration.

**First contact.** Use the official homologation form at https://www.kenlo.com.br/integre-conosco, which invites "produtos ou serviços complementares ao mercado imobiliário". Expect a formal process and a security/LGPD review. A referral deal is less likely than a listed integration, and Kenlo may prefer to build this into LYA itself (it has an in-house AI team and claimed a Google partnership for LIA). Use LinkedIn (company page br.linkedin.com/company/kenlobr) only after the form is submitted.

**Size signal.** Large, VC-backed, mid-migration. Slow, but one deal reaches thousands of agencies.

## 4. Segfy (insurance). Priority 1 in insurance

**Profile.** Segfy is an insurtech in São José dos Pinhais / Curitiba (PR).
- **Products:** Upfy (management plus multicálculo), Multify (pay-per-calculation multicálculo), GoFy (kanban prospecting CRM), Segfy Vende / **Foxfy** (AI quoting from the phone via WhatsApp, with voice, image or text input; launched Oct 2025) and Segfy Mensagem (WhatsApp inbox with AI).
- **Clients:** "+6.000 corretores" on its site. The Oct 2025 Justos announcement says "mais de 5,4 mil corretoras e 11 mil usuários ativos diariamente".
- **Ownership:** Porto Seguro's FIP Porto Ventures has owned 74.67% since Jan 2021. Management stays autonomous, and CEO and founder Marcos Roque Villa keeps a minority stake.
- **Pricing:** published and low (Upfy about R$ 60 per user/month).
- **API:** an integration API to "qualquer sistema CRM e ERP" is offered on request through sales; there is no public developer portal.

**Angle.**
- **The gap.** Segfy's AI starts at the *quote*. Parley captures the *advisory meeting*: the client's situation, assets and risks, coverages discussed, objections and the agreed next step. It turns that into a client-record note, and potentially into **pre-filled Foxfy/HFy quote fields**. "Meeting becomes a draft quote" fits Segfy's product direction.
- **Possible compliance angle (UNVERIFIED, check):** a written record of the advice given may help with SUSEP/CNSP conduct rules for intermediaries (e.g. CNSP Res. 382/2020).
- **Pricing fit.** Low-priced, self-serve products suit an add-on or a bundle.

**First contact.**
1. Send a LinkedIn message to Marcos Roque Villa ((perfil pessoal no LinkedIn)). He posts product news personally.
2. Ask the commercial team for the integration API terms.
3. The Porto Seguro channel ("condição exclusiva para Corretor Porto") is the scale route later, but it adds a corporate layer.
4. Smaller channel partners already resell Segfy (Baeta/Segbox, OnCorretor, Corretor Podcast). They could carry a Parley bundle to brokers.

**Size signal.** Mid-size: 66 employees in 2021 (Latka, UNVERIFIED), corporate-controlled but autonomous. May answer, though deals could need Porto's approval.

## 5. Quiver (Quiver Soluções / Quiver by Dimensa) (insurance). Priority 2 in insurance

**Profile.**
- **Company:** Quiver Desenvolvimento e Tecnologia Ltda, Av. Braz Leme, São Paulo, plus an office in Ponta Grossa (PR). Its history goes back to 1991-92, and it is the 2018 merger of Sistemas Seguros and Virtual.
- **Size:** at the Feb 2024 sale it had about 2.5 thousand clients, 150 employees and more than R$ 45 mi in revenue. Its marketing claims about 4,900 active clients and "36% dos prêmios gerados por corretores" (about R$ 41 bi a year).
- **Ownership:** Dimensa (then TOTVS/B3) bought it for R$ 115 mi in Feb 2024. Dimensa then bought Agger for R$ 260 mi in 2025. Evertec bought Dimensa for R$ 950 mi (closed 30 Apr 2026, per the SEC 10-Q).
- **Products:** Quiver PRO (mid-size and large brokers, includes a CRM), Quiver IN (R$ 99 per user/month), MULT (multicálculo), BI (with an AI assistant) and a white-label mobile app. In Sept 2026 it launched **ONE**, a cloud product combining Quiver and Agger for micro and small brokers.
- **Partnerships:** an alliance with RD Station was announced in Feb 2026 (commercial and content; no technical integration confirmed).
- **Not found:** no public API documentation, and no product called "Quiver Plus" in any source. It may be a plan name used in sales material.

**Angle.** Fernando Rodrigues, director of Evertec's insurance unit, said at the ONE launch that the main pain of small brokers is "inserir dados duplicados em softwares isolados". Parley removes the most manual input of all, typing up the client meeting. ONE is new, self-serve and aimed at teams of up to 7 people, which fits a Parley add-on. **Corretor Online** (corretor-online.com.br) appears to be a Quiver-hosted portal (its page title is "Quiver - Sistema para Corretora de Seguros"; UNVERIFIED).

**First contact.** Write to Fernando Rodrigues on LinkedIn (co-founder, Quiver CEO since 2019, now running the insurance unit). Reference the ONE launch and his quote. Fall back to the Quiver commercial channel. Expect corporate procurement, security and LGPD review, and a long cycle, since Evertec is US-listed.

**Size signal.** Large corporate. Slow. A referral deal is unlikely before an integration exists.

---

## Others (brief)

**Real estate**
- **Vista / Loft CRM** (Florianópolis). Loft bought Vista on 18 Mar 2022, when it had about 2,000 agencies and 20,000 users. It sits inside a unicorn and is hard to reach.
- **Imoview** (Universal Software, founded 1991). Strong in rentals. A reviewer asks for an API, so there is probably no open one. Data is scarce.
- **Arbo CRM** (Londrina). It has been a Superlógica subsidiary since Nov 2021. Superlógica, which has Warburg Pincus investment and an OpenAI development partnership (Nov 2024), is a large competitor to Kenlo.
- **CV CRM** (Construtor de Vendas, founded in Aracaju; bought by Softplan/Sienge in 2021; 360 clients then). It serves developers (incorporadoras), where the fit is weaker.
- **Hypnobox** (Senior Sistemas, 2024). It already has an "AI Corretor" that takes audio commands over WhatsApp, so it is a competitor rather than a target.
- **PipeImob.** A direct Parley competitor inside a CRM, and useful as proof of demand in pitches.
- **Not researched:** Smart Imob and "Union" (only a thin listing for Univen by Union Softwares appeared).

**Insurance**
- **Agger** (Aggilizador multicálculo plus Gestor; Rio Claro, UNVERIFIED). It claims about a third of Brazilian brokers. It bought Infocap and is now inside Dimensa/Evertec, combined with Quiver in ONE.
- **Infocap** (Novo Hamburgo; 3,000 brokerages and 10,000 users in Jan 2024). Now inside the same group.
- **TEx / TELEPORT** (Serasa Experian since 2024; 22 insurers on the multicálculo). Corporate.
- **Segbox / Baeta / Insurtalks.** Not a CRM. It is a broker-marketing company and media outlet that resells Segfy, so it is a possible distribution channel.

## Cross-cutting points for the pitch

1. **Lead with the post-visit or post-meeting record**, not with "AI notes". Every vendor already markets AI for the pre-sale stage, and none covers the conversation after the visit.
2. **Show it in Portuguese.** Use a Brazilian broker's real 30-second memo, the structured output, and the record appearing in the vendor's CRM timeline through their API.
3. **Prepare for LGPD questions:**
   - Where are audio and transcripts stored (EU hosting will be asked about)?
   - How long are they retained?
   - How is consent obtained from the client being recorded?
   - Is there a Data Processing Agreement (DPA)?

   Insurance meetings may include health data for life insurance, which is sensitive data under LGPD.
4. **Commercial model by vendor.**
   - **Jetimob:** a partner program with revenue share already exists, so plug into it.
   - **Imobzi and Segfy:** propose a revenue share per seat, or a bundled SKU.
   - **Kenlo and Quiver:** propose a listed integration first; commercial terms come later.

## Key sources (all accessed via search on 2026-10-08)

- Kenlo:
  - https://www.kenlo.com.br/produtos/imob
  - https://www.kenlo.com.br/integre-conosco
  - https://www.kenlo.com.br/lya
  - https://www.kenlo.com.br/lya/omnichannel
  - https://pt.wikipedia.org/wiki/Kenlo
  - https://neofeed.com.br/blog/home/kenlo-reforca-imobiliarias-locais-e-derruba-teoria-dos-grandes-players-digitais/
  - https://startups.com.br/noticias/kenlo-investe-r-50-mi-para-levar-digitalizacao-as-imobiliarias
  - https://blog.superlogica.com/imprensa/releases/fim-da-parceria-com-a-kenlo-faq-atualizado/
  - https://blog.kenlo.com.br/kenlo-lanca-lia-primeira-ia-do-mercado
- Jetimob:
  - https://www.jetimob.com/integracoes
  - https://www.jetimob.com/parceiros
  - https://www.jetimob.com/recursos/webhooks
  - https://jetimob.docs.apiary.io/
  - https://www.jetimob.com/blog/jet-ia-sdr/
  - https://imobireport.com.br/imobiliario/ceo-de-tecnologia-do-imobiliario-defende-que-inteligencia-operacional-antecede-adocao-da-ia/
  - https://www.econodata.com.br/consulta-empresa/12544265000130-jetimob-ltda
  - https://tracxn.com/d/companies/jetimob/__16pZjmJ3LW5UwRTd7EGFWG6Rnl2P-LlfDSvFpHRkAdM
- Imobzi:
  - https://developer.imobzi.com/
  - https://help.imobzi.com/pt-br/category/integracoes-automacoes-6ks9w6/
  - https://help.imobzi.com/pt-br/article/como-realizar-a-integracao-com-a-ia-lais-12u1xb4/
  - https://www.imobzi.com/planos-para-imobiliarias-e-corretores/
  - https://www.papoimobiliario.com/ceo-da-imobzi-fala-sobre-o-futuro-da-transformacao-digital-no-setor-imobiliario/
  - https://monitorcnpj.com.br/cnpj/07427146000167/
- Segfy:
  - https://www.segfy.com/solucoes-upfy/
  - https://www.segfy.com/solucoes-multify/
  - https://multicalculo.segfy.com/multicalculo-sistema-para-corretora-de-seguros
  - https://lp.segfy.com/porto
  - https://revistaapolice.com.br/?p=125670 (Justos partnership and Foxfy, Oct 2025)
  - https://forbes.com.br/forbes-tech/2021/03/porto-seguro-adquire-quase-75-da-startup-segfy/
  - https://cqcs.com.br/noticia/porto-seguro-anuncia-aquisicao-da-segfy-tecnologia-s-a/
- Quiver, Dimensa and Evertec:
  - https://www.quiver.net.br/dimensa/
  - https://finsidersbrasil.com.br/negocios-em-fintechs/dimensa-religa-maquina-de-aquisicoes-e-compra-quiver-por-r-115-milhoes/
  - https://revistaapolice.com.br/2026/09/quiver-e-agger-se-unem-em-nova-plataforma-da-dimensa/
  - https://www.segs.com.br/seguros/455247-dimensa-empresa-da-evertec-lanca-o-one-plataforma-em-nuvem-para-gestao-e-cotacao-de-seguros-em-pequenas-e-medias-corretoras
  - https://www.segs.com.br/seguros/440734-quiver-by-dimensa-e-rd-station-unem-forcas-para-profissionalizar-a-gestao-de-corretoras-em-2026
  - https://ir.evertecinc.com/news/news-details/2026/EVERTEC-to-Acquire-Dimensa-for-R950-Million/default.aspx
  - https://www.sec.gov/Archives/edgar/data/0001559865/000155986526000047/evtc-20260630.htm
  - https://monitorcnpj.com.br/cnpj/03004894000186/
  - https://revistaapolice.com.br/2019/09/fernando-rodrigues-assume-como-ceo-da-quiver-solucoes/
- Others:
  - https://startupi.com.br/2022/03/loft-adquire-plataforma-para-gestao-imobiliaria-de-santa-catarina/
  - https://neofeed.com.br/negocios/superlogica-e-arbo-se-juntam-para-fazer-frente-a-quinto-andar-e-loft/
  - https://www.baguete.com.br/noticias/softplan-compra-construtor-de-vendas
  - https://documentacao.senior.com.br/hypnobox/manual-do-usuario/crm/ai-corretor/ai-corretor/
  - https://pipeimob.com.br/crm
  - https://exame.com/invest/mercados/dimensa-compra-a-agger-por-r260-milhoes-e-reforca-posicao-no-setor-de-seguros/
  - https://revistaapolice.com.br/2024/01/focada-em-expandir-sua-receita-agger-adquire-infocap
  - https://monitormercantil.com.br/tres-perguntas-agger-e-a-plataforma-de-multicalculo-de-seguros/
