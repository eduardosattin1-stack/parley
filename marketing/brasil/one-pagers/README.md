# One-pagers

Um layout, um bloco de idioma por língua, um PDF A4 por profissão.

```
npm install          # só o Playwright
npx playwright install chromium
node build.mjs                       # pt-BR, as duas profissões, PDFs em ../
node build.mjs --lang en --out out-en  # o bloco em inglês, para conferir o layout com os originais
node build.mjs --only estate --png   # uma profissão, com prévia PNG ao lado do PDF
```

- `blocks/<lang>.json` guarda todo o texto. Traduzir é escrever um bloco novo; o `build.mjs` não muda.
- Os rótulos da nota de exemplo (Necessidades, Orçamento, Objeções, Tarefas, Opções consideradas, Questões em aberto, essencial, desejável, Visita de imóvel, Cotação de seguro) são os mesmos do app em pt-BR, para o PDF mostrar o que o app entrega de fato.
- `R$ 780.000` nunca quebra entre o símbolo e o número: o gerador põe um espaço inseparável depois de `R$`, `US$` e `EUR`.
- Se o texto de um bloco ficar comprido demais e encostar no rodapé, o build falha em vez de gerar uma página cortada.
- Fontes: Playfair Display, Lora e Space Grotesk, todas SIL OFL (licenças em `fonts/`). Ficam embutidas no HTML, então o build funciona sem internet.

O layout foi refeito a partir dos PDFs em inglês de 7 de outubro de 2026, com posições de linha conferidas contra o original a menos de 2 px.
