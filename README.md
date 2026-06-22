# Ninho do Papai

Aplicativo familiar privado para chamada ao vivo entre Papai, Vanessa e Ágatha.
Foi feito para rodar pelo navegador, sem gravação, com câmera e microfone sempre
dependendo da permissão explícita de cada pessoa.

## Stack

- Next.js + TypeScript + Tailwind CSS
- LiveKit para vídeo e áudio WebRTC
- Sessão por cookie assinado
- Deploy pensado para Vercel

## Configuração

Copie `.env.example` para `.env.local` e preencha:

```env
FAMILY_PIN=um-pin-familiar
SESSION_SECRET=uma-frase-longa-aleatoria
LIVEKIT_URL=wss://seu-projeto.livekit.cloud
LIVEKIT_API_KEY=sua-api-key
LIVEKIT_API_SECRET=seu-api-secret
```

`PAPAI_PIN` e `VANESSA_PIN` são opcionais. Se ficarem vazios, os dois usam
`FAMILY_PIN`.

Em desenvolvimento, se `FAMILY_PIN` não existir, o app aceita `0426`. Em
produção, configure o PIN no Vercel.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` ou `http://localhost:3000/agatha`.

## Deploy no Vercel

1. Suba a pasta `ninho-do-papai` para um repositório.
2. Importe no Vercel.
3. Configure as variáveis de ambiente do `.env.example`.
4. Faça o deploy.

## Uso

- O Papai entra como `Papai`, permite câmera/microfone e deixa a chamada aberta.
- Vanessa entra como `Vanessa`, permite câmera/microfone se quiser aparecer.
- O link familiar pode ser `/agatha`, por exemplo `https://ninhodopapai.com/agatha`.
- A chamada é ao vivo. Não há gravação no app.
- Para ficar por horas no notebook, deixe o navegador aberto e evite suspensão
  do Windows. O botão "Manter acordado" ajuda quando o navegador permite.

## Observações

O LiveKit é necessário porque o Vercel não mantém um servidor WebSocket/Socket.IO
próprio para uma chamada WebRTC confiável por horas. O app no Vercel gera tokens
seguros e o LiveKit cuida da mídia em tempo real.
