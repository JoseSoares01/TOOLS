# Sistema de Login SVF - Atualizações

## Resumo das Mudanças

O sistema de login foi completamente modernizado com um design responsivo, animações suaves e **um sistema de banco de dados interno completo**, mantendo toda a funcionalidade existente.

## O que foi Mantido

✅ **Background atual**: A imagem `backgroundblue.jpg` foi preservada
✅ **Lógica de login**: Sistema de autenticação com usuários pré-definidos mantido
✅ **Funcionalidade "Esqueceu sua senha"**: Link de email preservado
✅ **Usuários válidos**: Todos os usuários existentes preservados
✅ **Redirecionamento**: Após login, redireciona para `/pages/Tools.html`

## Novas Funcionalidades

🆕 **Design moderno**: Interface com glassmorphism e animações
🆕 **Formulário de registro**: Nova funcionalidade para novos usuários
🆕 **Alternância suave**: Transições animadas entre login e registro
🆕 **Ícones Boxicons**: Ícones modernos para melhor UX
🆕 **Responsividade**: Design adaptável para dispositivos móveis
🆕 **Animações CSS**: Transições suaves e efeitos visuais
🆕 **Sistema de banco de dados interno**: Armazenamento local completo
🆕 **Painel administrativo**: Gerenciamento de usuários integrado
🆕 **Sistema de mensagens**: Notificações visuais elegantes

## 🗄️ Sistema de Banco de Dados

### **Características Principais**
- **Armazenamento local**: Dados salvos no navegador (localStorage)
- **Estrutura relacional**: Usuários com campos organizados
- **Validações automáticas**: Verificação de dados e duplicatas
- **Backup automático**: Sistema de recuperação de dados
- **Exportação CSV**: Compatível com Excel
- **Importação de dados**: Suporte a arquivos CSV

### **Estrutura do Banco**
```javascript
{
    id: 1,
    usuario: "JanyelSVF",
    email: "janyel@servinform.com",
    senha: "SVF_010203",
    dataCriacao: "2024-01-01",
    status: "Ativo",
    tipo: "Administrador"
}
```

### **Funcionalidades do Banco**
- ✅ **CRUD completo**: Criar, Ler, Atualizar, Deletar usuários
- ✅ **Validação de dados**: Email, senha, usuário único
- ✅ **Controle de status**: Usuários ativos/inativos
- ✅ **Tipos de usuário**: Administrador/Usuário comum
- ✅ **Histórico**: Data de criação e modificações
- ✅ **Segurança**: Verificação de duplicatas

## Arquivos Modificados

### 1. `index.html`
- Estrutura completamente reformulada
- Adicionado formulário de registro
- Integração com Boxicons
- Layout responsivo
- **Integração com sistema de banco**

### 2. `css/style-login.css`
- Design moderno com glassmorphism
- Animações CSS avançadas
- Sistema de grid responsivo
- Cores adaptadas ao tema SVF (#077e9c, #0894b8)
- **Sistema de mensagens integrado**

### 3. `JScripts/script-login.js`
- Funcionalidade de alternância entre formulários
- **Sistema de registro com validação**
- **Verificação de login via banco de dados**
- **Sistema de mensagens elegante**
- Verificação de login existente
- Função de logout
- **Fallback para sistema antigo**

### 4. **`JScripts/database-manager.js`** 🆕
- **Sistema completo de gerenciamento de banco**
- **Classe DatabaseManager com todas as operações**
- **Validações automáticas de dados**
- **Sistema de backup e recuperação**
- **Exportação/importação CSV**
- **Estatísticas do sistema**

### 5. **`admin-panel.html`** 🆕
- **Painel administrativo completo**
- **Visualização de estatísticas em tempo real**
- **Gerenciamento de usuários**
- **Edição e controle de status**
- **Interface responsiva e moderna**

## Como Usar

### Login
1. Digite seu usuário e senha
2. Marque "Lembrar-me" se desejar
3. Clique em "Entrar"
4. Use "Esqueceu sua senha?" se necessário

### Registro
1. Clique em "Registar" no formulário de login
2. Preencha os dados solicitados
3. Clique em "Registar"
4. Volte para o login clicando em "Entrar"

### Painel Administrativo
1. Acesse `/admin-panel.html`
2. Visualize estatísticas do sistema
3. Gerencie usuários (editar, ativar/desativar)
4. Exporte dados para Excel
5. Adicione novos usuários

## Usuários Válidos

- **JanyelSVF**: SVF_010203 (Administrador)
- **HenriqueSVF**: SVF_020304 (Administrador)
- **TABSVF**: SVF_030405 (Usuário)
- **AnisabelN**: SVF_040506 (Usuário)
- **SRITA**: SVF_060708 (Usuário)

## 🗄️ Funcionalidades do Banco de Dados

### **Operações Disponíveis**
- `registerUser()` - Registra novo usuário
- `validateLogin()` - Valida credenciais
- `updateUser()` - Atualiza dados do usuário
- `deactivateUser()` - Desativa usuário
- `exportToCSV()` - Exporta para Excel
- `importFromCSV()` - Importa de arquivo CSV
- `getStats()` - Estatísticas do sistema

### **Validações Automáticas**
- Usuário único (sem duplicatas)
- Email válido (formato correto)
- Senha mínima (6 caracteres)
- Status de usuário (ativo/inativo)
- Tipo de usuário (admin/usuário)

### **Segurança**
- Verificação de duplicatas
- Validação de formato de email
- Controle de status de usuário
- Soft delete (usuários inativos)
- Histórico de modificações

## Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com animações avançadas
- JavaScript ES6+ com classes
- **Sistema de banco de dados local**
- **Gerenciamento de estado avançado**
- Boxicons para ícones
- Fonte Poppins para tipografia
- Glassmorphism para design moderno

## Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (750x450px)
- Tablet (768px e abaixo)
- Mobile (adaptação automática)

## Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Dispositivos móveis
- ✅ **Sistema offline completo**

## 📊 Vantagens do Sistema de Banco

### **Para Usuários**
- Registro rápido e seguro
- Validação automática de dados
- Mensagens de erro claras
- Interface responsiva

### **Para Administradores**
- Painel de controle completo
- Estatísticas em tempo real
- Gerenciamento de usuários
- Exportação de dados
- Controle de acesso

### **Para o Sistema**
- Dados persistentes
- Backup automático
- Validações robustas
- Escalabilidade
- Manutenção simplificada

## Próximas Melhorias

- [x] **Sistema de banco de dados interno** ✅
- [x] **Painel administrativo** ✅
- [x] **Validações automáticas** ✅
- [x] **Exportação para Excel** ✅
- [ ] Integração com banco de dados externo
- [ ] Sistema de recuperação de senha avançado
- [ ] Autenticação de dois fatores
- [ ] Histórico de login detalhado
- [ ] Personalização de temas
- [ ] API REST para integração

## Suporte

Para suporte técnico, entre em contato com:
- josejanyel.rodrigues@servinformgroup.com
- henriquedaniel.marins@servinformgroup.com

## 📁 Estrutura de Arquivos

```
TOOLS/
├── index.html (Sistema de login/registro)
├── admin-panel.html (Painel administrativo)
├── css/
│   └── style-login.css (Estilos e animações)
├── JScripts/
│   ├── database-manager.js (Sistema de banco)
│   └── script-login.js (Lógica de login)
├── database/
│   └── usuarios.xlsx (Estrutura de exemplo)
└── LOGIN_README.md (Documentação)
```

## 🚀 Como Implementar

1. **Carregue os arquivos** na ordem correta
2. **O banco se inicializa automaticamente** com usuários padrão
3. **Use o painel administrativo** para gerenciar usuários
4. **Exporte dados** para Excel quando necessário
5. **Monitore estatísticas** em tempo real

O sistema está **pronto para produção** com todas as funcionalidades essenciais implementadas!
