# rotalize-app
O Rotalize é um aplicativo mobile desenvolvido como Trabalho de Conclusão de Curso para auxiliar empresas na organização e otimização de rotas de entrega. Este repositório contém exclusivamente o front-end do aplicativo, desenvolvido integralmente em React Native + Expo.

📍 Rotalize – Aplicativo de Otimização de Rotas

Front-end desenvolvido por: Fabiane Pereira Muniz Ribeiro
Tecnologias: React Native · Expo Router · TypeScript · Axios · SecureStore

📘 Sobre o Projeto

O Rotalize é um aplicativo mobile desenvolvido como Trabalho de Conclusão de Curso para auxiliar empresas na organização e otimização de rotas de entrega.
Este repositório contém exclusivamente o front-end do aplicativo, desenvolvido integralmente em React Native + Expo.

A interface foi construída para oferecer uma experiência fluida e acessível, com fluxos completos de:
Login
Cadastro
Recuperação de senha
Gerenciamento de usuários
Cadastro e listagem de veículos
Criação e gerenciamento de rotas
Perfis com permissões diferentes (Admin, Manager, User)

📂 Tecnologias Utilizadas
Front-end
React Native (Expo)
TypeScript
Expo Router (file-based routing)
Figma
Integrações
Consumo de API REST
Autenticação JWT

🧩 Arquitetura do Front-end
O front-end foi estruturado seguindo boas práticas de organização e escalabilidade:
src/


🔐 Autenticação
Implementação do fluxo completo de autenticação:
Login com validação
Armazenamento seguro do token via SecureStore
Interceptadores Axios para incluir token nas requisições
Rotas protegidas com Expo Router
Redirecionamento automático baseado no perfil de usuário
Perfis incluídos:
Admin · Manager · User

🛣️ Navegação (Expo Router)
A navegação foi construída utilizando file-based routing, separando áreas conforme o tipo de usuário:

app/
├── (auth)/         → login, cadastro, recuperação de senha
├── (admin)/        → usuários, veículos, estatísticas
├── (manager)/      → rotas, veículos, vinculo de equipe
└── (user)/         → rotas, status de rotas, veículos, detalhes do usuário

Cada perfil acessa apenas as telas permitidas.

💡 Funcionalidades Implementadas
Front-end completo do aplicativo
Mais de 20 telas desenvolvidas
Navegação avançada com expo-router (pilhas, abas e nested layouts)
Formulários com validação
Consumo real de API REST
Fluxos de CRUD (usuários, veículos, rotas)
Filtros, ordenações e listagens
Controle de permissões por perfil
Armazenamento seguro de autenticação
Design responsivo
Paleta de cores, tipografia e componentes padronizados com Figma

📸 Prints das Telas

As imagens oficiais estão presentes no TCC.

🎥 Demonstração completa do app:
➡️ https://youtu.be/seu_video

⚠️ Sobre o Back-end
O back-end utilizado foi desenvolvido para fins acadêmicos em outro módulo do projeto.
Por não ser de minha autoria e por questões de privacidade, não está incluído neste repositório.

🚀 Como Rodar o Projeto
# Clone o repositório
git clone https://github.com/seu-user/rotalize.git

# Acesse a pasta
cd rotalize

# Instale as dependências
npm install

# Execute o projeto
npx expo start

✨ Sobre Mim

Olá! Eu sou a Fabiane Muniz 👋
Atuo na área de tecnologia com foco em desenvolvimento front-end e mobile, suporte técnico e análise de dados.
Sou estudante de Análise e Desenvolvimento de Sistemas e apaixonada por criar interfaces funcionais e bonitas, sempre focadas na experiência do usuário.

Atualmente estudo e desenvolvo:
React Native (Expo)
JavaScript / TypeScript
PHP
Python
Java
SQL (MySQL e PostgreSQL)
HTML & CSS

📌 Busco oportunidades como Desenvolvedora Júnior.
📌 Adoro aprender, testar e criar projetos completos.
📌 Estou montando meu GitHub para mostrar minha evolução como dev.