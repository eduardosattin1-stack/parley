# Listas

Levantadas em 8 de outubro de 2026. **Leia antes de usar:** o ambiente em que a pesquisa rodou bloqueou o acesso direto a gov.br, susep.gov.br, cofeci.gov.br, aos sites dos CRECIs e Sincors e aos sites dos CRMs. Quase tudo veio de trechos de busca, e cada valor diz de onde veio: `[site]` ou `[snippet-primário]` quando o trecho era do domínio oficial, `(não confirmado)` ou `UNVERIFIED` quando não era. Confira o contato antes do primeiro envio.

Só há contatos institucionais. Nenhuma lista traz corretor pessoa física: o repositório é público, e a LGPD pede cuidado com dado pessoal raspado de cadastro.

| Arquivo | O que tem | Confiança |
|---|---|---|
| `crms.csv`, `crms_notas.md` | Kenlo, Jetimob, Imobzi, Segfy, Quiver e mais dez; API, programa de parceiros, rota de contato, se já têm IA de notas | Boa nos fatos de empresa; preços e cargos em parte UNVERIFIED |
| `sincors.csv` | Os 27 Sincors (AC e RR cobertos por Sincors vizinhos) e a Fenacor | Baixa: contatos do diretório da Fenacor, parte antigo |
| `ens_eventos.csv`, `ens_eventos.md` | Cursos da ENS e eventos de corretores de seguros até meados de 2027 | Média |
| `susep_registro.md` | Como consultar o cadastro da SUSEP e o que existe de dado aberto | Média |
| `crecis.csv`, `crecis_numeros.md` | Os 27 CRECIs com a página de consulta de cada um; corretores e imobiliárias ativos por UF | Boa nos números (soma confere com o COFECI); média nos contatos |
| `entidades_imobiliarias.csv` | Secovis, sindicatos, associações e eventos do setor imobiliário | Baixa: quase tudo UNVERIFIED |

## O que as listas dizem

- **O tamanho.** 151.568 corretores de seguros ativos (86.256 pessoas físicas e 65.312 corretoras), segundo dado da SUSEP de 22 de setembro de 2026 publicado pelo CQCS. No imobiliário, 600.560 corretores e 79.725 imobiliárias ativos no fim de 2024 (relatório de gestão do COFECI), e o COFECI já fala em mais de 700 mil inscritos em 2026.
- **Nenhum cadastro vira lista pronta.** A SUSEP não publica os corretores em dado aberto; o painel dela mostra totais por UF e município. Entre os CRECIs, só o de São Paulo tem uma lista navegável por cidade; uns doze permitem busca por cidade e bairro; nenhum tem download ou API. A lista de escritórios sai mais rápido do Google Maps e do Instagram por cidade do que dos conselhos.
- **Nenhum dos cinco CRMs faz a nota da visita ou da reunião.** A IA deles é pré-venda e cotação: Kenlo (LYA) e Jetimob (Jet.ia) qualificam lead no WhatsApp, Imobzi responde comando de voz sobre o CRM, Segfy (Foxfy) monta cotação, Quiver só tem assistente de BI.
- **Mas um concorrente já vende exatamente isto.** O PipeImob anuncia "Pós-visita por Áudio: 15 segundos de áudio, a visita virou registro no CRM" e se compara com Kenlo, Vista/Loft e Imoview, que não têm. Isso ajuda no pitch para os CRMs (o concorrente deles já tem) e pesa contra o Parley com a imobiliária que usa PipeImob.
- **O seguro está quase todo consolidado.** Quiver, Agger e Infocap são da Evertec; a Segfy é 74,67% da Porto Seguro; TEx/Teleport é da Serasa Experian. Ciclo corporativo, não e-mail respondido pelo fundador. No imobiliário ainda há fornecedores independentes.

## Ordem sugerida para os CRMs

1. **Jetimob** (Santa Maria, RS; fundador no comando; cerca de 74 pessoas). O CEO usou em podcast o mesmo caso de uso como exemplo do que a IA já faz. Tem API pública, webhooks e programa de parceiros com divisão de receita. Rota: página de parceiros e, em paralelo, LinkedIn do CEO citando o podcast.
2. **Imobzi** (São Paulo; 50 a 100 pessoas). API REST pública e precedente de IA de terceiro integrada (Lais). Rota: comercial, pedindo o gerente de parcerias.
3. **Kenlo** (8.500+ imobiliárias). Grande e mais lento; API aberta só no plano mais caro. Rota: formulário de homologação "Integre conosco".
4. **Segfy** (5,4 mil corretoras; controle da Porto Seguro, gestão autônoma). Ângulo: a reunião vira nota e pré-preenche a cotação. API só via comercial.
5. **Quiver** (Evertec). Entrada pelo produto ONE, lançado em setembro de 2026 para corretoras pequenas, cuja dor declarada é redigitar dado em sistemas separados.
