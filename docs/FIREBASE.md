# Publicar no Firebase Hosting

O site e o app são arquivos estáticos (sem build), então o Firebase Hosting serve a pasta do projeto do jeito que ela está. O `firebase.json` já está pronto na raiz: publica tudo menos `docs/` e o `README.md`, e libera câmera, microfone e localização só para o próprio site.

## Passo a passo (uma vez)

1. Crie um projeto em <https://console.firebase.google.com> (o plano gratuito Spark basta para o Hosting).
2. Instale a ferramenta de linha de comando (precisa do Node.js):

   ```bash
   npm install -g firebase-tools
   ```

3. Entre com a sua conta Google e ligue a pasta ao projeto:

   ```bash
   firebase login
   firebase use --add
   ```

   O segundo comando cria o arquivo `.firebaserc` com o id do seu projeto.

## Publicar (sempre que mudar algo)

```bash
firebase deploy --only hosting
```

O endereço fica `https://<id-do-projeto>.web.app`. O roteiro guiado abre em `https://<id-do-projeto>.web.app/app.html?roteiro=1`.

Para testar antes, sem publicar: `firebase hosting:channel:deploy teste` cria um link temporário de 7 dias.

## O que o Firebase ainda não faz aqui

Hoje as contas (Lucas, Ana, Carlos, profissionais) conversam **no mesmo navegador** (`localStorage` e `BroadcastChannel`). Para aparelhos diferentes conversarem de verdade, o próximo passo é:

- **Firebase Authentication** para cada pessoa entrar na própria conta;
- **Cloud Firestore** guardando os eventos (`emitir()` em `js/nucleo.js` já gera um evento por ação, então basta gravar cada evento numa coleção da família e ouvir as novas entradas com `onSnapshot`);
- **Regras de segurança** que deixem cada conta ler só o que as permissões dela permitem (a mesma tabela de `PERMISSOES` em `js/dados.js`);
- **Cloud Messaging** para o SOS chegar como notificação no celular e no relógio.

Dados de saúde são sensíveis pela LGPD: antes de guardar dados reais, veja [`ETICA-E-PRIVACIDADE.md`](ETICA-E-PRIVACIDADE.md).
