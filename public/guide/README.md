# Imagens do bonequinho guia

As 9 variantes do guia já estão nesta pasta, com fundo transparente
e otimizadas (geradas por `scripts/convert-guide.mjs`):

- `guia-acenando.png` — usada na introdução
- `guia-surpreso.png` — usada no oráculo de verdades
- `guia-engracado.png` — usada nos motivos
- `guia-apaixonado.png` — usada no quiz
- `guia-apontando.png` — usada no relatório técnico
- `guia-orgulhoso.png` — usada na galeria
- `guia-pensando.png` — usada no cofre (antes da senha)
- `guia-presente.png` — usada no cofre (depois de acertar)
- `guia-triste.png` — usada no capítulo difícil (período separados)
- `guia-comemorando.png` — reserva (use onde quiser!)

E os bonecos especiais:

- `mo-sozinha.png` — ela, usada no relatório técnico ("amostra nº 01")
- `mo-e-eu.png` — o casal, cena final no rodapé do site

Para trocar a arte: substitua o arquivo mantendo o nome, ou rode
`node scripts/convert-guide.mjs <pasta-com-os-png>` para reprocessar.
Para trocar a variante usada numa seção, mude a prop `variant` do
componente `<GuideBubble />` na seção correspondente.
