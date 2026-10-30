# Surf Itapoá

Um painel para acompanhar as condições do mar, o clima e a previsão das
próximas horas em dois picos de Itapoá, Santa Catarina. O layout funciona em
computadores e celulares e identifica as câmeras sem transmissão como
aguardando sinal.

## Executar localmente

```sh
npm install
npm run dev
```

Para validar a versão de produção:

```sh
npm run build
npm run preview
```

## Dados

As condições do tempo e do mar são consultadas no
[Open-Meteo](https://open-meteo.com/) para as coordenadas da região de Itapoá.
Os valores são estimativas e podem variar entre pontos diferentes da praia.

## Câmera da praia

A página tem espaços para as câmeras da Barra do Saí e do Pico do Hotweiller.
Quando as transmissões públicas estiverem prontas, configure a URL de
incorporação de cada uma em `cameras`, no início de `src/App.jsx`. Use links de
incorporação públicos fornecidos pela plataforma da câmera. Não coloque
senhas, links privados ou endereços da rede local no site público. As condições
do mar e do tempo são estimativas da região consultada no Open-Meteo, não uma
leitura direta das câmeras.
