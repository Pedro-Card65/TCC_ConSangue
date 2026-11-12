# Frontend — ConSangue

Frontend em React e SCSS do TCC ConSangue.

## Executar localmente

Na pasta `React`:

```bash
npm install
npm start
```

A aplicação abre em `http://localhost:3000`. Configure `REACT_APP_API_URL` para apontar à API correta.

## Gerar o build

```bash
npm run build
```

O resultado é salvo em `React/build`. O workflow do GitHub Actions confere a compilação; a publicação do frontend ocorre pela Vercel.

As verificações de navegação, autenticação e integração com o banco devem ser feitas separadamente no ambiente apropriado. Nenhum usuário, senha ou registro real deve ser incluído no repositório.
